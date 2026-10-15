from typing import Any, Dict, List, Optional
from backend.tools import (
    resolve_entities,
    get_ownership,
    trace_dependencies,
    find_related_incidents,
    find_claim_conflicts,
    find_relevant_experts,
    apply_knowledge_correction
)
from backend.graph_db import db

class OrgMindAgent:
    def __init__(self):
        pass

    def investigate(self, question: str) -> Dict[str, Any]:
        """
        Executes a deterministic, multi-tool investigation workflow across FalkorDB.
        Returns a structured evidence packet, synthesized answer, tool execution trace,
        and an aggregated subgraph for interactive visualization.
        """
        tool_traces = []

        # Step 1: Entity Resolution
        entities = resolve_entities(question)
        tool_traces.append({
            "tool": "resolve_entities",
            "input": question,
            "output": entities,
            "explanation": f"Resolved target entities: {entities['services']}"
        })

        target_service = entities["services"][0] if entities["services"] else "svc_payments"

        # Step 2: Ownership Lookup
        ownership = get_ownership(target_service)
        tool_traces.append({
            "tool": "get_ownership",
            "input": {"service_id": target_service},
            "output": ownership,
            "explanation": f"Ownership resolved to {ownership.get('team_name')} (Lead: {ownership.get('owner_person')})"
        })

        # Step 3: Multi-Hop Dependency & Blast Radius Tracing
        dep_data = trace_dependencies(target_service, max_depth=5)
        tool_traces.append({
            "tool": "trace_dependencies",
            "input": {"service_id": target_service, "max_depth": 5},
            "output": {
                "upstream": dep_data["upstream_dependencies"],
                "downstream": dep_data["downstream_impact_blast_radius"]
            },
            "explanation": f"Found {len(dep_data['upstream_dependencies'])} upstream dependencies and {len(dep_data['downstream_impact_blast_radius'])} downstream services in blast radius"
        })

        # Step 4: Incident History
        incidents = find_related_incidents(target_service)
        tool_traces.append({
            "tool": "find_related_incidents",
            "input": {"service_id": target_service},
            "output": incidents,
            "explanation": f"Retrieved {len(incidents)} historical incidents"
        })

        # Step 5: Claim & Policy Conflict Detection
        conflict_data = find_claim_conflicts(target_service, "auth_protocol")
        tool_traces.append({
            "tool": "find_claim_conflicts",
            "input": {"service_id": target_service, "predicate": "auth_protocol"},
            "output": {
                "has_conflict": conflict_data["has_conflict"],
                "conflict_count": len(conflict_data.get("conflicts", []))
            },
            "explanation": "Active policy conflict detected!" if conflict_data["has_conflict"] else "No active policy conflicts"
        })

        # Step 6: Expert Ranking
        experts = find_relevant_experts(target_service)
        tool_traces.append({
            "tool": "find_relevant_experts",
            "input": {"service_id": target_service},
            "output": experts,
            "explanation": f"Top domain expert identified: {experts[0]['name'] if experts else 'None'}"
        })

        # Step 7: Build Aggregated Subgraph for UI Canvas
        # Merge nodes & edges from dependencies and conflicts
        subgraph_nodes = {}
        subgraph_edges = []
        edge_signatures = set()

        for sub in [dep_data.get("subgraph", {}), conflict_data.get("subgraph", {})]:
            for node in sub.get("nodes", []):
                subgraph_nodes[node["id"]] = node
            for edge in sub.get("edges", []):
                sig = f"{edge['source']}-{edge['relation']}->{edge['target']}"
                if sig not in edge_signatures:
                    edge_signatures.add(sig)
                    subgraph_edges.append(edge)

        # Ensure ownership person and team are present in the subgraph
        owner_sub = db.query("""
            MATCH (t:Team)-[:OWNS]->(s:Service {id: $service_id})
            OPTIONAL MATCH (p:Person)-[:OWNS]->(s)
            RETURN t, s, p
        """, {"service_id": target_service})
        extra_sub = db.extract_subgraph([[r[0], r[1], r[2]] for r in owner_sub.result_set])
        for node in extra_sub.get("nodes", []):
            subgraph_nodes[node["id"]] = node
        for edge in extra_sub.get("edges", []):
            sig = f"{edge['source']}-{edge['relation']}->{edge['target']}"
            if sig not in edge_signatures:
                edge_signatures.add(sig)
                subgraph_edges.append(edge)

        for idx, edge in enumerate(subgraph_edges):
            edge["id"] = f"edge_{idx}"

        aggregated_subgraph = {
            "nodes": list(subgraph_nodes.values()),
            "edges": subgraph_edges
        }

        # Step 8: Synthesize Structured Evidence-Backed Response
        answer = self._generate_structured_answer(
            target_service=target_service,
            ownership=ownership,
            dep_data=dep_data,
            incidents=incidents,
            conflict_data=conflict_data,
            experts=experts
        )

        return {
            "question": question,
            "target_service": target_service,
            "answer": answer,
            "tool_traces": tool_traces,
            "subgraph": aggregated_subgraph,
            "ownership": ownership,
            "dependencies": dep_data,
            "incidents": incidents,
            "conflict_data": conflict_data,
            "experts": experts,
            "pending_correction": {
                "claim_id": "clm_auth_v1",
                "stale_value": "AUTH-V1 (HMAC symmetric shared key)",
                "approved_value": "AUTH-V2 (RS256 asymmetric token rotation)",
                "source_doc_a": "DOC-RFC-102",
                "source_doc_b": "DOC-DEC-042 (ADR-042)",
                "recommended_action": "Mark clm_auth_v1 as SUPERSEDED to align graph with approved ADR-042."
            } if conflict_data["has_conflict"] else None
        }

    def _generate_structured_answer(
        self,
        target_service: str,
        ownership: Dict[str, Any],
        dep_data: Dict[str, Any],
        incidents: List[Dict[str, Any]],
        conflict_data: Dict[str, Any],
        experts: List[Dict[str, Any]]
    ) -> str:
        svc_name = ownership.get("service_name", target_service)
        team_name = ownership.get("team_name", "Unknown Team")
        owner_person = ownership.get("owner_person", "Unknown Lead")

        downstream_names = [f"`{s['name']}` ({s.get('criticality', 'P1')})" for s in dep_data["downstream_impact_blast_radius"]]
        downstream_str = ", ".join(downstream_names) if downstream_names else "None"

        upstream_names = [f"`{s['name']}`" for s in dep_data["upstream_dependencies"]]
        upstream_str = ", ".join(upstream_names) if upstream_names else "None"

        incident_str = ""
        if incidents:
            inc = incidents[0]
            incident_str = f"Prior incident **{inc['id']}** ({inc['severity']}) occurred on `{inc['occurred_at']}`: *\"{inc['summary']}\"*."

        conflict_str = ""
        if conflict_data.get("has_conflict"):
            c = conflict_data["conflicts"][0]
            ca = c["claim_a"]
            cb = c["claim_b"]
            conflict_str = (
                f"\n\n> ⚠️ **CRITICAL POLICY CONFLICT DETECTED**\n"
                f"> - **Stale Claim ({ca['id']})**: `{ca['value']}` (Referenced in *{ca['source_doc']}*, dated {ca['valid_from']}, Status: `{ca['status']}`)\n"
                f"> - **Approved Decision ({cb['id']})**: `{cb['value']}` (Mandated in *{cb['source_doc']}*, dated {cb['valid_from']}, Status: `{cb['status']}`)\n"
                f"> \n"
                f"> **Risk Assessment**: If Identity Service changes its authentication without migrating `{svc_name}`, downstream services ({downstream_str}) will cascade into authentication timeouts similar to INC-8812."
            )
        elif conflict_data.get("historical_resolutions"):
            hr = conflict_data["historical_resolutions"][0]
            conflict_str = (
                f"\n\n> ✅ **POLICY COMPLIANCE VERIFIED (HISTORICAL CONFLICT RESOLVED)**\n"
                f"> - **Current Approved Standard**: `AUTH-V2 (RS256 asymmetric token rotation)` (Mandated in ADR-042, Status: `approved`)\n"
                f"> - **Superseded Legacy Claim**: `AUTH-V1` has been marked `superseded` with audit history preserved.\n"
                f"> - **Readiness**: `{svc_name}` is aligned with enterprise cryptographic standards."
            )

        top_expert = experts[0] if experts else None
        expert_str = f"**{top_expert['name']}** ({top_expert['role']}) — based on {', '.join(top_expert['evidence'])}" if top_expert else "Unassigned"

        answer = (
            f"### Investigation Report: {svc_name}\n\n"
            f"**1. Ownership & Governance**\n"
            f"- Accountable Team: **{team_name}** ({ownership.get('department', 'Engineering')})\n"
            f"- Tech Lead / SME: **{owner_person}** ({ownership.get('owner_role', 'Lead')})\n\n"
            f"**2. Multi-Hop Dependency & Blast Radius**\n"
            f"- Upstream Core Dependencies: {upstream_str}\n"
            f"- **Downstream Impact Blast Radius**: {downstream_str}. A breaking change or authentication failure in `{svc_name}` directly disrupts these services.\n\n"
            f"**3. Historical Precedents & Incidents**\n"
            f"- {incident_str}\n"
            f"{conflict_str}\n\n"
            f"**4. Recommended Reviewer & SME**\n"
            f"- Recommended Approval Lead: {expert_str}\n"
        )
        return answer

agent = OrgMindAgent()
