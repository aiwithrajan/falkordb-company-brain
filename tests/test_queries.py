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
