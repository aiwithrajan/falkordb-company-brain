from typing import Any, Dict, List, Optional
import os
from backend.graph_db import db

def resolve_entities(question: str) -> Dict[str, Any]:
    """
    Scans query text to resolve key entity IDs in Nexora Cloud.
    Deterministic entity resolution fallback with fuzzy keyword matching.
    """
    q = question.lower()
    entities = {
        "services": [],
        "people": [],
        "topics": []
    }

    service_map = {
        "payment": "svc_payments",
        "payments": "svc_payments",
        "identity": "svc_identity",
        "auth": "svc_identity",
        "billing": "svc_billing",
        "checkout": "svc_checkout",
        "ledger": "svc_ledger",
        "notification": "svc_notification"
    }

    for keyword, svc_id in service_map.items():
        if keyword in q and svc_id not in entities["services"]:
            entities["services"].append(svc_id)

    if not entities["services"]:
        # default to payments if context implies transactional flow
        entities["services"].append("svc_payments")

    if "auth" in q or "token" in q or "protocol" in q:
        entities["topics"].append("auth_protocol")

    return entities

def get_ownership(service_id: str) -> Dict[str, Any]:
    """
    Finds which team and person owns/maintains the given service.
    """
    query = """
        MATCH (s:Service {id: $service_id})
        OPTIONAL MATCH (t:Team)-[:OWNS]->(s)
        OPTIONAL MATCH (p:Person)-[:OWNS]->(s)
        RETURN s.id as service_id, s.name as service_name, s.tier as tier, s.criticality as criticality,
               t.name as team_name, t.department as department,
               p.name as owner_person, p.role as owner_role, p.email as owner_email
    """
    res = db.query(query, {"service_id": service_id})
    if not res.result_set:
        return {"error": f"Service {service_id} not found"}

    row = res.result_set[0]
    return {
        "service_id": row[0],
        "service_name": row[1],
        "tier": row[2],
        "criticality": row[3],
        "team_name": row[4] or "Unassigned Team",
        "department": row[5] or "Engineering",
        "owner_person": row[6] or "No single individual owner",
        "owner_role": row[7] or "N/A",
        "owner_email": row[8] or "N/A"
    }

def trace_dependencies(service_id: str, max_depth: int = 5) -> Dict[str, Any]:
    """
    Finds upstream dependencies (services that target service depends on)
    and downstream blast radius (services that depend on target service).
    """
    # Upstream: target -> depends_on -> upstream
    upstream_query = f"""
        MATCH path = (root:Service {{id: $service_id}})-[:DEPENDS_ON*1..{max_depth}]->(upstream:Service)
        RETURN path, upstream.id as id, upstream.name as name
    """
    up_res = db.query(upstream_query, {"service_id": service_id})

    # Downstream: downstream -> depends_on -> target
    downstream_query = f"""
        MATCH path = (downstream:Service)-[:DEPENDS_ON*1..{max_depth}]->(root:Service {{id: $service_id}})
        RETURN path, downstream.id as id, downstream.name as name, downstream.criticality as criticality
    """
    down_res = db.query(downstream_query, {"service_id": service_id})

    upstream_services = []
    downstream_services = []
    all_subgraph_results = []

    for r in up_res.result_set:
        all_subgraph_results.append([r[0]])
        upstream_services.append({"id": r[1], "name": r[2]})

    for r in down_res.result_set:
        all_subgraph_results.append([r[0]])
        downstream_services.append({"id": r[1], "name": r[2], "criticality": r[3]})

    # Also capture target service itself
    target_res = db.query("MATCH (s:Service {id: $service_id}) RETURN s", {"service_id": service_id})
    for r in target_res.result_set:
        all_subgraph_results.append([r[0]])

    subgraph = db.extract_subgraph(all_subgraph_results)

    return {
        "target_service": service_id,
        "upstream_dependencies": upstream_services,
        "downstream_impact_blast_radius": downstream_services,
        "subgraph": subgraph
    }

def find_related_incidents(service_id: str) -> List[Dict[str, Any]]:
    """
    Finds historical incidents affecting the service.
    """
    query = """
        MATCH (i:Incident)-[:AFFECTS]->(s:Service {id: $service_id})
        OPTIONAL MATCH (p:Person)-[w:WORKED_ON]->(i)
        RETURN i.id, i.severity, i.status, i.occurred_at, i.summary,
               p.name as responder, w.role as responder_role
        ORDER BY i.occurred_at DESC
    """
    res = db.query(query, {"service_id": service_id})
    incidents = {}
    for r in res.result_set:
        inc_id = r[0]
        if inc_id not in incidents:
            incidents[inc_id] = {
                "id": inc_id,
                "severity": r[1],
                "status": r[2],
                "occurred_at": r[3],
                "summary": r[4],
                "responders": []
            }
        if r[5]:
            incidents[inc_id]["responders"].append({"name": r[5], "role": r[6]})
    return list(incidents.values())

def find_claim_conflicts(service_id: str, predicate: str = "auth_protocol") -> Dict[str, Any]:
    """
    Detects contradictory claims for the same service and predicate,
    retrieving source documents and approval states.
    """
    query = """
        MATCH (c1:Claim)-[:ABOUT]->(s:Service {id: $service_id}),
              (c2:Claim)-[:ABOUT]->(s)
        WHERE c1.predicate = $predicate AND c2.predicate = $predicate AND c1.id <> c2.id
        OPTIONAL MATCH (d1:Document)-[:SUPPORTS]->(c1)
        OPTIONAL MATCH (d2:Document)-[:SUPPORTS]->(c2)
        OPTIONAL MATCH (c1)-[cf:CONFLICTS_WITH]->(c2)
        RETURN c1, c2, d1, d2, cf, s
    """
    res = db.query(query, {"service_id": service_id, "predicate": predicate})
    
    if not res.result_set:
        # Check if single claim exists
        single = db.query("MATCH (c:Claim)-[:ABOUT]->(s:Service {id: $service_id}) RETURN c", {"service_id": service_id})
        return {"has_conflict": False, "claims": [r[0].properties for r in single.result_set]}

    active_conflicts = []
    historical_resolutions = []
    subgraph_rows = []

    for r in res.result_set:
        c1, c2, d1, d2, cf, s = r[0], r[1], r[2], r[3], r[4], r[5]
        subgraph_rows.append([c1, c2, d1, d2, s])
        if cf:
            subgraph_rows.append([cf])

        c1_status = c1.properties.get("status")
        c2_status = c2.properties.get("status")

        conflict_entry = {
            "claim_a": {
                "id": c1.properties.get("id"),
                "value": c1.properties.get("object_value"),
                "status": c1_status,
                "valid_from": c1.properties.get("valid_from"),
                "source_doc": d1.properties.get("title") if d1 else "Unknown Document",
                "source_uri": d1.properties.get("source_uri") if d1 else None
            },
            "claim_b": {
                "id": c2.properties.get("id"),
                "value": c2.properties.get("object_value"),
                "status": c2_status,
                "valid_from": c2.properties.get("valid_from"),
                "source_doc": d2.properties.get("title") if d2 else "Unknown Document",
                "source_uri": d2.properties.get("source_uri") if d2 else None
            },
            "conflict_reason": cf.properties.get("reason") if cf else "Mismatched values for same predicate"
        }

        # An active conflict requires both claims to be currently active/approved
        if c1_status != "superseded" and c2_status != "superseded":
            active_conflicts.append(conflict_entry)
        else:
            historical_resolutions.append(conflict_entry)

    subgraph = db.extract_subgraph(subgraph_rows)
    return {
        "has_conflict": len(active_conflicts) > 0,
        "conflicts": active_conflicts,
        "historical_resolutions": historical_resolutions,
        "subgraph": subgraph
    }

def find_relevant_experts(service_id: str, topic: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Calculates expertise by combining:
    1. Direct service ownership (weight: 5)
    2. Incident response history (weight: 4)
    3. Authoring/approving architectural decisions (weight: 4)
    """
    query = """
        MATCH (p:Person)-[:OWNS]->(s:Service {id: $service_id})
        RETURN p.id as id, p.name as name, p.role as role, p.email as email, 'Direct Service Owner' as reason, 5 as weight
        UNION
        MATCH (p:Person)-[w:WORKED_ON]->(i:Incident)-[:AFFECTS]->(s:Service {id: $service_id})
        RETURN p.id as id, p.name as name, p.role as role, p.email as email, ('Incident Responder (' + w.role + ')') as reason, 4 as weight
        UNION
        MATCH (p:Person)-[:AUTHORED]->(d:Decision)-[:CHANGES]->(s:Service {id: $service_id})
        RETURN p.id as id, p.name as name, p.role as role, p.email as email, ('Author of ' + d.id) as reason, 4 as weight
    """
    res = db.query(query, {"service_id": service_id})
    experts_map: Dict[str, Dict[str, Any]] = {}

    for r in res.result_set:
        pid, name, role, email, reason, weight = r[0], r[1], r[2], r[3], r[4], r[5]
        if pid not in experts_map:
            experts_map[pid] = {
                "person_id": pid,
                "name": name,
                "role": role,
                "email": email,
                "evidence": [],
                "confidence_score": 0
            }
        experts_map[pid]["evidence"].append(reason)
        experts_map[pid]["confidence_score"] += int(weight)

    sorted_experts = sorted(experts_map.values(), key=lambda x: x["confidence_score"], reverse=True)
    return sorted_experts[:5]

def get_source_evidence(source_uri: str) -> str:
    """
    Reads markdown file content from synthetic document store.
    """
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, source_uri)
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return f.read()
    return f"Source content for {source_uri} not found on disk."

def apply_knowledge_correction(claim_id: str, reviewed_by: str = "Engineering Lead") -> Dict[str, Any]:
    """
    Human-approved knowledge correction:
    Marks the stale/conflicting claim as 'superseded', retains historical audit,
    and returns updated claim state.
    """
    # 1. Update stale claim
    query = """
        MATCH (stale:Claim {id: $claim_id})
        SET stale.status = 'superseded',
            stale.valid_to = '2026-09-15',
            stale.superseded_by = 'clm_auth_v2',
            stale.reviewed_by = $reviewed_by,
            stale.reviewed_at = '2026-10-14T16:00:00Z'
        RETURN stale
    """
    res = db.query(query, {"claim_id": claim_id, "reviewed_by": reviewed_by})
    if not res.result_set:
        return {"success": False, "error": f"Claim {claim_id} not found"}

    # 2. Re-link conflict edge as superseded edge
    db.query("""
        MATCH (c1:Claim {id: $claim_id})-[cf:CONFLICTS_WITH]->(c2:Claim)
        DELETE cf
        CREATE (c1)-[:SUPERSEDED_BY {reason: 'Superseded by ADR-042 via human review'}]->(c2)
    """, {"claim_id": claim_id})

    return {
        "success": True,
        "message": f"Claim {claim_id} has been marked as SUPERSEDED. Historical audit preserved.",
        "claim_id": claim_id,
        "new_status": "superseded",
        "reviewed_by": reviewed_by
    }
