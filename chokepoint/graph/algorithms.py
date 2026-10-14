from typing import Any, Dict, List, Optional
from falkordb import Graph

class GraphAlgorithms:
    @staticmethod
    def find_exposure(graph: Graph, root_key: str) -> Dict[str, Any]:
        """
        Finds all vulnerable packages reachable from the root, their paths, and advisories.
        """
        findings = []
        unique_vulnerable_pkgs = set()
        unique_advisories = set()

        # 1. Transitive vulnerable paths
        query = """
        MATCH (r:Pkg {key: $root}), (v:Pkg)-[:AFFECTED_BY]->(a:Advisory)
        MATCH p = (r)-[:DEPENDS_ON*1..8]->(v)
        RETURN v.key, v.name, v.version, a.id, a.cvss3, a.summary, length(p), p
        ORDER BY a.cvss3 DESC, length(p) ASC
        """
        try:
            res = graph.query(query, {"root": root_key})
            seen_finding_keys = set()
            for row in res.result_set:
                pkg_key = row[0]
                adv_id = row[3]
                finding_sig = (pkg_key, adv_id)
                if finding_sig in seen_finding_keys:
                    continue
                seen_finding_keys.add(finding_sig)

                unique_vulnerable_pkgs.add(pkg_key)
                unique_advisories.add(adv_id)

                path_obj = row[7]
                try:
                    path_keys = [n.properties.get("key") for n in path_obj.nodes()]
                except Exception:
                    path_keys = [root_key, pkg_key]

                findings.append({
                    "vulnerable_package": pkg_key,
                    "name": row[1],
                    "version": row[2],
                    "advisory": adv_id,
                    "cvss": float(row[4] or 7.5),
                    "summary": row[5],
                    "path": path_keys,
                    "depth": row[6]
                })
        except Exception as e:
            print(f"Error querying transitive exposure: {e}")

        # 2. Direct root vulnerabilities (depth 0)
        direct_query = """
        MATCH (r:Pkg {key: $root})-[:AFFECTED_BY]->(a:Advisory)
        RETURN r.key, r.name, r.version, a.id, a.cvss3, a.summary
        """
        try:
            d_res = graph.query(direct_query, {"root": root_key})
            for row in d_res.result_set:
                pkg_key = row[0]
                adv_id = row[3]
                unique_vulnerable_pkgs.add(pkg_key)
                unique_advisories.add(adv_id)
                findings.append({
                    "vulnerable_package": pkg_key,
                    "name": row[1],
                    "version": row[2],
                    "advisory": adv_id,
                    "cvss": float(row[4] or 7.5),
                    "summary": row[5],
                    "path": [pkg_key],
                    "depth": 0
                })
        except Exception:
            pass

        return {
            "total_findings": len(findings),
            "unique_vulnerable_packages_count": len(unique_vulnerable_pkgs),
            "unique_advisories_count": len(unique_advisories),
            "unique_vulnerable_packages": sorted(list(unique_vulnerable_pkgs)),
            "findings": findings
        }

    @staticmethod
    def run_falkor_max_flow(graph: Graph, root_key: str) -> Optional[Dict[str, Any]]:
        """
        Runs algo.maxFlow on the dual-node flow network in FalkorDB with single FLOW relationship type.
        """
        query = """
        MATCH (s:PkgIn {key: $root})
        MATCH (t:SuperSink {id: '__SINK__'})
        CALL algo.maxFlow({
          sourceNodes: [s],
          targetNodes: [t],
          relationshipTypes: ['FLOW'],
          capacityProperty: 'capacity'
        })
        YIELD edges, edgeFlows, maxFlow
        RETURN maxFlow, edges, edgeFlows
        """
        try:
            res = graph.query(query, {"root": root_key})
            if res.result_set:
                row = res.result_set[0]
                return {
                    "max_flow": row[0],
                    "edges": row[1],
                    "edge_flows": row[2]
                }
        except Exception as e:
            print(f"algo.maxFlow error: {e}")
        return None

    @classmethod
    def compute_min_cut(cls, graph: Graph, root_key: str) -> Dict[str, Any]:
        """
        Computes the minimum cut of packages to sever every path from root to vulnerable packages
        using FalkorDB's native algo.maxFlow.
        """
        flow_res = cls.run_falkor_max_flow(graph, root_key)
        cut_packages = []
        seen_cut_keys = set()
        total_cost = 0.0

        if flow_res and flow_res["edges"]:
            edges = flow_res["edges"]
            flows = flow_res["edge_flows"]
            for e, f in zip(edges, flows):
                props = getattr(e, "properties", {})
                role = props.get("role")
                cap = float(props.get("capacity", 0.0))
                # If it's a self edge and flow meets or exceeds capacity, this edge is in the minimum cut!
                if role == "self" and f >= cap and cap < 900000.0:
                    cand_key = props.get("key")
                    if cand_key and cand_key != root_key and cand_key not in seen_cut_keys:
                        seen_cut_keys.add(cand_key)
                        cost = float(props.get("cost", 1.0))
                        total_cost += cost
                        cut_packages.append({
                            "package_key": cand_key,
                            "name": props.get("name"),
                            "current_version": props.get("version"),
                            "relation": props.get("relation"),
                            "cost": cost,
                            "paths_severed_count": int(f)
                        })

        # Fallback if algo.maxFlow returned 0 packages or not available:
        # Check direct dependencies that lead to vulnerabilities
        if not cut_packages:
            direct_dep_query = """
            MATCH (r:Pkg {key: $root})-[:DEPENDS_ON]->(d:Pkg)
            MATCH p = (d)-[:DEPENDS_ON*0..6]->(v:Pkg)-[:AFFECTED_BY]->(:Advisory)
            RETURN d.key AS key, d.name AS name, d.version AS version, d.relation AS relation, count(p) AS paths
            ORDER BY paths DESC
            """
            try:
                res = graph.query(direct_dep_query, {"root": root_key})
                for row in res.result_set:
                    cand_key = row[0]
                    if cand_key not in seen_cut_keys:
                        seen_cut_keys.add(cand_key)
                        cost = 1.0
                        total_cost += cost
                        cut_packages.append({
                            "package_key": cand_key,
                            "name": row[1],
                            "current_version": row[2],
                            "relation": row[3],
                            "cost": cost,
                            "paths_severed_count": row[4]
                        })
            except Exception as e:
                print(f"Fallback cut query error: {e}")

        return {
            "root_key": root_key,
            "max_flow_info": flow_res,
            "cut_packages": cut_packages,
            "cut_packages_count": len(cut_packages),
            "total_cut_cost": total_cost,
            "blocked_keys": list(seen_cut_keys)
        }
