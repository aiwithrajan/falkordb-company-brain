import pytest
from backend.seed_data import seed_nexora_company
from backend.tools import (
    get_ownership,
    trace_dependencies,
    find_related_incidents,
    find_claim_conflicts,
    find_relevant_experts,
    apply_knowledge_correction
)
from backend.agent import agent

@pytest.fixture(autouse=True)
def setup_fresh_graph():
    """Ensure clean initial graph state before tests."""
    seed_nexora_company()

def test_ownership_lookup():
    ownership = get_ownership("svc_payments")
    assert ownership["service_name"] == "Payments Service"
    assert ownership["team_name"] == "Monetization & Billing"
    assert ownership["owner_person"] == "Sarah Kim"

def test_dependency_traversal():
    deps = trace_dependencies("svc_payments", max_depth=5)
    upstream_ids = [s["id"] for s in deps["upstream_dependencies"]]
    downstream_ids = [s["id"] for s in deps["downstream_impact_blast_radius"]]
    
    assert "svc_identity" in upstream_ids
    assert "svc_billing" in downstream_ids
    assert "svc_checkout" in downstream_ids

def test_incident_correlation():
    incidents = find_related_incidents("svc_payments")
    assert len(incidents) >= 1
    assert incidents[0]["id"] == "inc_8812"
    assert incidents[0]["severity"] == "P0"

def test_conflict_detection_and_resolution_lifecycle():
    # 1. Before correction: Active conflict exists between AUTH-V1 and AUTH-V2
    conflicts_before = find_claim_conflicts("svc_payments", "auth_protocol")
    assert conflicts_before["has_conflict"] is True
    assert len(conflicts_before["conflicts"]) > 0

    # 2. Apply human-in-the-loop correction
    correction = apply_knowledge_correction("clm_auth_v1", reviewed_by="Alex Chen (VP Eng)")
    assert correction["success"] is True

    # 3. After correction: Active conflict is resolved, preserved as historical evidence
    conflicts_after = find_claim_conflicts("svc_payments", "auth_protocol")
    assert conflicts_after["has_conflict"] is False
    assert len(conflicts_after["historical_resolutions"]) > 0

def test_expert_discovery_ranking():
    experts = find_relevant_experts("svc_payments")
    assert len(experts) > 0
    top_expert = experts[0]
    assert top_expert["name"] == "Sarah Kim"
    assert top_expert["confidence_score"] >= 9

def test_end_to_end_agent_investigation():
    result = agent.investigate("Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.")
    assert result["target_service"] == "svc_payments"
    assert "Payments Service" in result["answer"]
    assert "CRITICAL POLICY CONFLICT DETECTED" in result["answer"]
    assert result["pending_correction"] is not None
    assert len(result["subgraph"]["nodes"]) >= 8

def test_incident_commander_and_architect_modes():
    # 1. Incident Commander Mode
    inc_res = agent.investigate("P0 Alert: payments-svc 500 cascade. Trace blast radius and mobilize responders.", mode="incident")
    assert inc_res["mode"] == "incident"
    assert "INCIDENT WAR-ROOM DISPATCH" in inc_res["answer"]
    assert len(inc_res["subgraph"]["nodes"]) > 0

    # 2. Staff Architect Mode
    arch_res = agent.investigate("Review PR #318: Revert Payments auth to symmetric HMAC keys.", mode="architect")
    assert arch_res["mode"] == "architect"
    assert "PR BLOCKED BY ARCHITECTURAL DRIFT GUARD" in arch_res["answer"]
    assert len(arch_res["subgraph"]["nodes"]) > 0

def test_custom_company_ingestion_and_subgraph_integrity():
    from backend.ingestion import ingest_structured_company
    custom_spec = {
        "company_name": "TestFlight Systems",
        "teams": [{"id": "t_flight", "name": "Avionics Team"}],
        "people": [{"id": "p_pilot", "name": "Captain Rogers", "role": "Chief Test Pilot"}],
        "services": [
            {"id": "svc_navigation", "name": "Navigation Core", "tier": 1, "criticality": "P0"},
            {"id": "svc_telemetry", "name": "Telemetry Dispatch", "tier": 1, "criticality": "P0"}
        ],
        "dependencies": [
            {"from": "svc_telemetry", "to": "svc_navigation", "protocol": "gRPC"}
        ]
    }
    ingest_res = ingest_structured_company(custom_spec)
    assert ingest_res["success"] is True

    # Test edge-node key consistency in extract_subgraph
    from backend.graph_db import db
    overview_sub = db.query("MATCH (s:Service) OPTIONAL MATCH (s)-[r:DEPENDS_ON]->(s2:Service) RETURN s, r, s2")
    sub = db.extract_subgraph([[r[0], r[1], r[2]] for r in overview_sub.result_set])
    node_ids = {n["id"] for n in sub["nodes"]}
    for edge in sub["edges"]:
        assert edge["source"] in node_ids, f"Edge source {edge['source']} not found in node IDs"
        assert edge["target"] in node_ids, f"Edge target {edge['target']} not found in node IDs"

    # Test agent investigation on newly ingested company
    res = agent.investigate("P0 Alert: navigation failure cascade", mode="incident")
    assert res["target_service"] == "svc_navigation"
    assert len(res["subgraph"]["nodes"]) > 0

