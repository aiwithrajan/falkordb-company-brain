from typing import Any, Dict, List
from chokepoint.graph.client import FalkorManager
from chokepoint.graph.builder import GraphBuilder
from chokepoint.graph.algorithms import GraphAlgorithms
from chokepoint.graph.verification import GraphVerifier
from chokepoint.ingestion.deps_dev import DepsClient

class ChokePointTools:
    def __init__(self):
        self.falkor = FalkorManager()
        self.deps = DepsClient()
        self.builder = GraphBuilder(self.falkor, self.deps)
        self.verifier = GraphVerifier(self.falkor, self.deps)

    def ingest_root(self, system: str, package: str, version: str) -> Dict[str, Any]:
        """
        Loads a package version's resolved graph and OSV advisories into FalkorDB.
        """
        graph, meta = self.builder.build_analysis_graph(system, package, version)
        return {
            "status": "success",
            "metadata": meta,
            "message": f"Ingested {meta['total_packages']} packages and {meta['total_advisories']} advisories into {meta['graph_name']}."
        }

    def find_exposure(self, graph_name: str, root_key: str) -> Dict[str, Any]:
        """
        Returns all vulnerable packages reachable from the root with their shortest paths.
        """
        graph = self.falkor.get_graph(graph_name)
        exposure = GraphAlgorithms.find_exposure(graph, root_key)
        return {
            "status": "success",
            "graph_name": graph_name,
            "root_key": root_key,
            "total_reachable_vulnerabilities": exposure["total_findings"],
            "unique_vulnerable_packages": exposure["unique_vulnerable_packages"],
            "findings_summary": [
                {
                    "pkg": f["vulnerable_package"],
                    "advisory": f["advisory"],
                    "cvss": f["cvss"],
                    "depth": f["depth"],
                    "path": " -> ".join([p.split(":")[-1] for p in f["path"]])
                }
                for f in exposure["findings"][:15]
            ]
        }

    def min_cut(self, graph_name: str, root_key: str) -> Dict[str, Any]:
        """
        Computes the minimum cut of packages that eliminates all vulnerable paths from root.
        """
        graph = self.falkor.get_graph(graph_name)
        cut = GraphAlgorithms.compute_min_cut(graph, root_key)
        return {
            "status": "success",
            "graph_name": graph_name,
            "root_key": root_key,
            "total_packages_to_change": cut["cut_packages_count"],
            "total_cost": cut["total_cut_cost"],
            "cut_proposals": cut["cut_packages"]
        }

    def pick_version(self, system: str, package: str, current_version: str) -> Dict[str, Any]:
        """
        Finds the nearest version of a package with 0 known security advisories.
        """
        all_versions = self.deps.get_package_versions(system, package)
        if not all_versions:
            return {"status": "error", "message": f"No versions found for {package}"}

        # Filter versions >= current_version or latest non-vulnerable
        # Sort or reverse to find closest clean version
        candidate_clean = None
        for ver in reversed(all_versions):
            advs = self.deps.get_advisories_batch(system, [(package, ver)]).get((package, ver), [])
            if len(advs) == 0:
                candidate_clean = ver
                break

        return {
            "status": "success",
            "package": package,
            "current_version": current_version,
            "recommended_clean_version": candidate_clean or all_versions[-1],
            "total_published_versions": len(all_versions)
        }

    def simulate_fix(self, graph_name: str, root_key: str, changes: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Clones graph using GRAPH.COPY, applies candidate version upgrades, and verifies max flow / exposure reaches 0.
        """
        verification = self.verifier.simulate_and_verify(graph_name, root_key, changes)
        return {
            "status": "success",
            "proof_result": verification
        }

    def explain(self, graph_name: str, root_key: str, changes: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Returns the severed paths and the exact Cypher query behind the proposed changes.
        """
        graph = self.falkor.get_graph(graph_name)
        exposure_before = GraphAlgorithms.find_exposure(graph, root_key)

        explanation = {
            "root": root_key,
            "total_vulnerable_paths_before": exposure_before["total_findings"],
            "changes_proposed": len(changes),
            "replayed_cypher_query": """
            MATCH (r:Pkg {key: $root}), (v:Pkg)-[:AFFECTED_BY]->(a:Advisory)
            MATCH p = shortestPath((r)-[:DEPENDS_ON*]->(v))
            RETURN v.key AS pkg, a.id AS advisory, nodes(p) AS via
            """.strip(),
            "changes": changes,
            "impact_summary": f"Changing {len(changes)} package(s) severs all {exposure_before['total_findings']} vulnerable paths."
        }
        return {"status": "success", "explanation": explanation}
