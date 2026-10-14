from typing import Any, Dict, List, Set, Tuple
from falkordb import Graph

from chokepoint.ingestion.deps_dev import DepsClient
from chokepoint.graph.client import FalkorManager

class GraphBuilder:
    def __init__(self, falkor_manager: FalkorManager, deps_client: DepsClient):
        self.falkor = falkor_manager
        self.deps = deps_client

    @staticmethod
    def format_key(system: str, name: str, version: str) -> str:
        return f"{system.lower()}:{name}@{version}"

    def build_analysis_graph(self, system: str, package: str, version: str, graph_name: str = None) -> Tuple[Graph, Dict[str, Any]]:
        """
        Builds the complete dependency and flow graph for a root package version inside FalkorDB.
        """
        system_lower = system.lower()
        root_key = self.format_key(system_lower, package, version)
        if graph_name is None:
            graph_name = f"analysis:{system_lower}:{package}:{version}"

        # Delete existing graph if re-running
        self.falkor.delete_graph(graph_name)
        graph = self.falkor.get_graph(graph_name)

        # 1. Fetch resolved dependency graph from deps.dev
        raw_deps = self.deps.get_dependencies(system_lower, package, version)
        nodes_raw = raw_deps.get("nodes", [])
        edges_raw = raw_deps.get("edges", [])

        # 2. Collect all (pkg, ver) pairs for batch advisory lookup
        pkg_vers = []
        node_map = {} # index -> node data
        for idx, n in enumerate(nodes_raw):
            vk = n.get("versionKey", {})
            name = vk.get("name")
            ver = vk.get("version")
            if name and ver:
                pkg_vers.append((name, ver))
                node_map[idx] = {
                    "key": self.format_key(system_lower, name, ver),
                    "name": name,
                    "version": ver,
                    "relation": n.get("relation", "INDIRECT")
                }

        # 3. Batch fetch advisories from OSV
        advisories_by_pkg = self.deps.get_advisories_batch(system_lower, pkg_vers)

        # 4. Create indexes in FalkorDB
        try:
            graph.query("CREATE INDEX FOR (p:Pkg) ON (p.key)")
            graph.query("CREATE INDEX FOR (pin:PkgIn) ON (pin.key)")
            graph.query("CREATE INDEX FOR (pout:PkgOut) ON (pout.key)")
            graph.query("CREATE INDEX FOR (a:Advisory) ON (a.id)")
        except Exception:
            pass

        # 5. Insert SuperSink node for algo.maxFlow
        graph.query("CREATE (:SuperSink {id: '__SINK__'})")

        # 6. Insert Pkg, PkgIn, PkgOut nodes
        vulnerable_keys: Set[str] = set()
        advisories_inserted: Set[str] = set()

        for idx, n_info in node_map.items():
            key = n_info["key"]
            name = n_info["name"]
            ver = n_info["version"]
            relation = n_info["relation"]
            
            vulns = advisories_by_pkg.get((name, ver), [])
            is_vuln = len(vulns) > 0
            if is_vuln:
                vulnerable_keys.add(key)

            is_root = (key == root_key)
            if is_root:
                cost = 999999.0 # Root cannot be cut
            elif relation == "DIRECT":
                cost = 1.0 # Direct bump cost
            else:
                cost = 2.0 # Transitive override cost

            # Insert standard Pkg node
            graph.query(
                "CREATE (:Pkg {key: $key, name: $name, version: $version, relation: $relation, vulnerable: $vulnerable, cost: $cost, is_root: $is_root})",
                {"key": key, "name": name, "version": ver, "relation": relation, "vulnerable": is_vuln, "cost": cost, "is_root": is_root}
            )

            # Insert Flow nodes (PkgIn, PkgOut)
            graph.query(
                "CREATE (:PkgIn {key: $key, name: $name, version: $version})",
                {"key": key, "name": name, "version": ver}
            )
            graph.query(
                "CREATE (:PkgOut {key: $key, name: $name, version: $version, vulnerable: $vulnerable})",
                {"key": key, "name": name, "version": ver, "vulnerable": is_vuln}
            )

            # Insert SELF edge between PkgIn and PkgOut using single relation type :FLOW
            graph.query(
                """
                MATCH (pin:PkgIn {key: $key}), (pout:PkgOut {key: $key})
                CREATE (pin)-[:FLOW {capacity: $cost, cost: $cost, role: 'self', key: $key, name: $name, version: $version, relation: $relation}]->(pout)
                """,
                {"key": key, "cost": cost, "name": name, "version": ver, "relation": relation}
            )

            # If vulnerable, connect PkgOut to SuperSink
            if is_vuln:
                graph.query(
                    """
                    MATCH (pout:PkgOut {key: $key}), (s:SuperSink {id: '__SINK__'})
                    CREATE (pout)-[:FLOW {capacity: 999999.0, role: 'sink_dep'}]->(s)
                    """,
                    {"key": key}
                )

            # Insert Advisories and AFFECTED_BY edges
            for v in vulns:
                v_id = v["id"]
                if v_id not in advisories_inserted:
                    graph.query(
                        "MERGE (a:Advisory {id: $id, summary: $summary, cvss3: $cvss3})",
                        {"id": v_id, "summary": v.get("summary", ""), "cvss3": float(v.get("cvss3", 7.5))}
                    )
                    advisories_inserted.add(v_id)

                graph.query(
                    """
                    MATCH (p:Pkg {key: $key}), (a:Advisory {id: $aid})
                    CREATE (p)-[:AFFECTED_BY]->(a)
                    """,
                    {"key": key, "aid": v_id}
                )

        # 7. Insert Dependency edges (DEPENDS_ON for standard graph, FLOW for flow graph)
        for e in edges_raw:
            from_idx = e.get("fromNode")
            to_idx = e.get("toNode")
            if from_idx in node_map and to_idx in node_map:
                from_key = node_map[from_idx]["key"]
                to_key = node_map[to_idx]["key"]
                req = e.get("requirement", "")

                # Standard DEPENDS_ON edge
                graph.query(
                    """
                    MATCH (p1:Pkg {key: $from_key}), (p2:Pkg {key: $to_key})
                    CREATE (p1)-[:DEPENDS_ON {requirement: $req}]->(p2)
                    """,
                    {"from_key": from_key, "to_key": to_key, "req": req}
                )

                # Flow edge from from_PkgOut to to_PkgIn with large capacity
                graph.query(
                    """
                    MATCH (pout:PkgOut {key: $from_key}), (pin:PkgIn {key: $to_key})
                    CREATE (pout)-[:FLOW {capacity: 999999.0, role: 'dep'}]->(pin)
                    """,
                    {"from_key": from_key, "to_key": to_key}
                )

        metadata = {
            "graph_name": graph_name,
            "root_key": root_key,
            "total_packages": len(node_map),
            "vulnerable_packages": len(vulnerable_keys),
            "total_advisories": len(advisories_inserted),
            "total_edges": len(edges_raw)
        }
        return graph, metadata
