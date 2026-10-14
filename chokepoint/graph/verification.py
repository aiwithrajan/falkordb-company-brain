from typing import Any, Dict, List
import uuid
from falkordb import Graph

from chokepoint.graph.client import FalkorManager
from chokepoint.graph.algorithms import GraphAlgorithms
from chokepoint.ingestion.deps_dev import DepsClient

class GraphVerifier:
    def __init__(self, falkor_manager: FalkorManager, deps_client: DepsClient):
        self.falkor = falkor_manager
        self.deps = deps_client

    def simulate_and_verify(
        self,
        source_graph_name: str,
        root_key: str,
        changes: List[Dict[str, str]] # [{'name': 'body-parser', 'old_version': '1.18.2', 'new_version': '1.19.0'}]
    ) -> Dict[str, Any]:
        """
        Clones the analysis graph using GRAPH.COPY into a scratch graph,
        applies the candidate package upgrades, and verifies whether all vulnerable paths are severed.
        """
        scratch_id = uuid.uuid4().hex[:6]
        scratch_graph_name = f"scratch:{source_graph_name.replace(':', '_')}:{scratch_id}"

        # 1. GRAPH.COPY clone
        scratch_graph = self.falkor.copy_graph(source_graph_name, scratch_graph_name)

        applied_changes = []
        for change in changes:
            pkg_name = change["name"]
            old_ver = change["old_version"]
            new_ver = change["new_version"]
            system = "npm"
            old_key = f"{system}:{pkg_name}@{old_ver}"
            new_key = f"{system}:{pkg_name}@{new_ver}"

            # Check if new version has advisories
            advs = self.deps.get_advisories_batch(system, [(pkg_name, new_ver)]).get((pkg_name, new_ver), [])
            new_is_vuln = len(advs) > 0

            # 1. Create clean replacement node
            scratch_graph.query(f'CREATE (:Pkg {{key: "{new_key}", name: "{pkg_name}", version: "{new_ver}", vulnerable: {str(new_is_vuln).lower()}}})')

            # 2. Re-wire incoming edges from parents to the new replacement node
            parent_res = scratch_graph.query(f'MATCH (old:Pkg {{key: "{old_key}"}})<-[:DEPENDS_ON]-(parent:Pkg) RETURN parent.key')
            for p_row in parent_res.result_set:
                p_key = p_row[0]
                scratch_graph.query(f'MATCH (parent:Pkg {{key: "{p_key}"}}), (new_node:Pkg {{key: "{new_key}"}}) CREATE (parent)-[:DEPENDS_ON]->(new_node)')

            # 3. Sever all incoming and outgoing edges of old package
            scratch_graph.query(f'MATCH (old:Pkg {{key: "{old_key}"}})<-[d:DEPENDS_ON]-(parent:Pkg) DELETE d')
            scratch_graph.query(f'MATCH (old:Pkg {{key: "{old_key}"}})-[d:DEPENDS_ON]->(target:Pkg) DELETE d')
            scratch_graph.query(f'MATCH (old:Pkg {{key: "{old_key}"}})-[a:AFFECTED_BY]->(adv:Advisory) DELETE a')

            applied_changes.append({
                "package": pkg_name,
                "from_version": old_ver,
                "to_version": new_ver,
                "is_new_version_clean": not new_is_vuln
            })

        # 4. Re-run transitive path check on scratch graph
        q_transitive = f'MATCH (r:Pkg {{key: "{root_key}"}}), (v:Pkg)-[:AFFECTED_BY]->(a:Advisory) MATCH p = (r)-[:DEPENDS_ON*1..8]->(v) RETURN count(p)'
        rem_res = scratch_graph.query(q_transitive)
        remaining_transitive_paths = rem_res.result_set[0][0] if rem_res.result_set else 0

        # Check direct root advisories
        q_direct = f'MATCH (r:Pkg {{key: "{root_key}"}})-[:AFFECTED_BY]->(a:Advisory) RETURN count(a)'
        dir_res = scratch_graph.query(q_direct)
        direct_root_advisories = dir_res.result_set[0][0] if dir_res.result_set else 0

        is_transitive_clean = (remaining_transitive_paths == 0)

        result = {
            "scratch_graph_name": scratch_graph_name,
            "applied_changes": applied_changes,
            "remaining_transitive_paths": remaining_transitive_paths,
            "direct_root_advisories": direct_root_advisories,
            "is_clean": is_transitive_clean,
            "proof": f"All transitive vulnerable paths successfully severed to 0 (Transitive paths remaining: {remaining_transitive_paths})" if is_transitive_clean else f"{remaining_transitive_paths} paths still remain"
        }

        # Clean up scratch graph
        try:
            self.falkor.delete_graph(scratch_graph_name)
        except Exception:
            pass
            pass

        return result
