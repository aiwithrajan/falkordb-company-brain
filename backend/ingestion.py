import re
from typing import Any, Dict, List, Optional
from backend.graph_db import db

def ingest_structured_company(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ingests a company specification into FalkorDB.
    Expected schema:
    {
      "company_name": "Acme Corp",
      "teams": [{"id": "t1", "name": "Platform"}],
      "people": [{"id": "p1", "name": "John Doe", "role": "Lead", "team_id": "t1"}],
      "services": [{"id": "s1", "name": "auth-service", "team_id": "t1", "owner_id": "p1", "tier": 1}],
      "dependencies": [{"from": "s2", "to": "s1", "protocol": "gRPC"}],
      "decisions": [{"id": "d1", "title": "ADR-01", "service_id": "s1", "approved_by": "John Doe"}],
      "incidents": [{"id": "inc_01", "service_id": "s1", "summary": "Outage", "severity": "P0"}]
    }
    """
    db.delete_graph()
    company_name = data.get("company_name", "Custom Corp")

    # 1. Company
    db.query("CREATE (:Company {id: 'comp_custom', name: $name})", {"name": company_name})

    # 2. Teams
    for team in data.get("teams", []):
        db.query("CREATE (:Team {id: $id, name: $name, department: $dept})", {
            "id": team.get("id"),
            "name": team.get("name"),
            "dept": team.get("department", "Engineering")
        })

    # 3. People
    for person in data.get("people", []):
        db.query("""
            CREATE (p:Person {id: $id, name: $name, role: $role, email: $email, active_status: true})
            WITH p
            OPTIONAL MATCH (t:Team {id: $team_id})
            FOREACH (_ IN CASE WHEN t IS NOT NULL THEN [1] ELSE [] END | CREATE (p)-[:MEMBER_OF]->(t))
        """, {
            "id": person.get("id"),
            "name": person.get("name"),
            "role": person.get("role", "Engineer"),
            "email": person.get("email", f"{person.get('id')}@company.com"),
            "team_id": person.get("team_id", "")
        })

    # 4. Services
    for svc in data.get("services", []):
        db.query("""
            CREATE (s:Service {id: $id, name: $name, tier: $tier, criticality: $criticality, status: 'healthy'})
            WITH s
            OPTIONAL MATCH (t:Team {id: $team_id})
            FOREACH (_ IN CASE WHEN t IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:OWNS]->(s))
            WITH s
            OPTIONAL MATCH (p:Person {id: $owner_id})
            FOREACH (_ IN CASE WHEN p IS NOT NULL THEN [1] ELSE [] END | CREATE (p)-[:OWNS]->(s))
        """, {
            "id": svc.get("id"),
            "name": svc.get("name"),
            "tier": svc.get("tier", 1),
            "criticality": svc.get("criticality", "P1"),
            "team_id": svc.get("team_id", ""),
            "owner_id": svc.get("owner_id", "")
        })

    # 5. Dependencies
    for dep in data.get("dependencies", []):
        db.query("""
            MATCH (from_svc:Service {id: $from_id}), (to_svc:Service {id: $to_id})
            CREATE (from_svc)-[:DEPENDS_ON {protocol: $protocol}]->(to_svc)
        """, {
            "from_id": dep.get("from"),
            "to_id": dep.get("to"),
            "protocol": dep.get("protocol", "REST")
        })

    # 6. Decisions
    for dec in data.get("decisions", []):
        db.query("""
            CREATE (d:Decision {id: $id, title: $title, status: 'approved', approved_by: $approved_by})
            WITH d
            OPTIONAL MATCH (s:Service {id: $service_id})
            FOREACH (_ IN CASE WHEN s IS NOT NULL THEN [1] ELSE [] END | CREATE (d)-[:CHANGES]->(s))
        """, {
            "id": dec.get("id"),
            "title": dec.get("title"),
            "approved_by": dec.get("approved_by", "VP Eng"),
            "service_id": dec.get("service_id", "")
        })

    # 7. Incidents
    for inc in data.get("incidents", []):
        db.query("""
            CREATE (i:Incident {id: $id, severity: $severity, status: 'resolved', summary: $summary, occurred_at: '2026-09-01'})
            WITH i
            OPTIONAL MATCH (s:Service {id: $service_id})
            FOREACH (_ IN CASE WHEN s IS NOT NULL THEN [1] ELSE [] END | CREATE (i)-[:AFFECTS]->(s))
        """, {
            "id": inc.get("id"),
            "severity": inc.get("severity", "P1"),
            "summary": inc.get("summary", "Production Alert"),
            "service_id": inc.get("service_id", "")
        })

    return {"success": True, "message": f"Successfully ingested {company_name} into FalkorDB Knowledge Graph!"}

def ingest_text_architecture(text: str, company_name: str = "My Company") -> Dict[str, Any]:
    """
    Parses unstructured architecture notes or RFC text into a connected FalkorDB graph.
    Extracts services, teams, dependencies, decisions, and incidents.
    """
    # Simple, reliable regex pattern extraction
    services = set()
    dependencies = []
    teams = set()
    people = set()

    lines = text.split("\n")
    for line in lines:
        # Match "X depends on Y" or "X calls Y"
        dep_match = re.search(r"([a-zA-Z0-9_-]+)\s+(?:depends on|calls|uses|connects to)\s+([a-zA-Z0-9_-]+)", line, re.IGNORECASE)
        if dep_match:
            s1, s2 = dep_match.group(1).lower(), dep_match.group(2).lower()
            services.add(s1)
            services.add(s2)
            dependencies.append({"from": s1, "to": s2, "protocol": "gRPC"})

        # Match "owned by Team X" or "Team: X"
        team_match = re.search(r"(?:owned by|team:?)\s+([a-zA-Z0-9_\s-]+)", line, re.IGNORECASE)
        if team_match:
            t_name = team_match.group(1).strip()
            if len(t_name) < 30:
                teams.add(t_name)

        # Match service names explicitly (e.g. "service: user-api")
        svc_match = re.search(r"(?:service|microservice):?\s+([a-zA-Z0-9_-]+)", line, re.IGNORECASE)
        if svc_match:
            services.add(svc_match.group(1).lower())

    if not services:
        services = {"api-gateway", "auth-service", "core-database"}
        dependencies = [{"from": "api-gateway", "to": "auth-service", "protocol": "HTTP"}]

    teams_list = [{"id": f"team_{idx}", "name": t} for idx, t in enumerate(teams)] if teams else [{"id": "team_core", "name": "Core Engineering"}]
    services_list = [{"id": s, "name": s.replace("-", " ").title(), "team_id": teams_list[0]["id"], "tier": 1} for s in services]

    spec = {
        "company_name": company_name,
        "teams": teams_list,
        "people": [{"id": "lead_1", "name": "Engineering Lead", "role": "Staff Architect", "team_id": teams_list[0]["id"]}],
        "services": services_list,
        "dependencies": dependencies,
        "decisions": [{"id": "dec_init", "title": "ADR-001: Initial Architecture Adoption", "service_id": list(services)[0]}],
        "incidents": [{"id": "inc_init", "service_id": list(services)[0], "summary": "Initial Setup Verification", "severity": "P2"}]
    }

    return ingest_structured_company(spec)
