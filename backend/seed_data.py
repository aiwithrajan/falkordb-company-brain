from backend.graph_db import db

def seed_nexora_company():
    """
    Populates FalkorDB with the canonical Nexora Cloud company knowledge graph.
    Matches the OrgMind Track-3 blueprint scenario.
    """
    print("Dropping prior graph data...")
    db.delete_graph()

    print("Seeding Company and Teams...")
    db.query("""
        CREATE (:Company {id: 'comp_nexora', name: 'Nexora Cloud', industry: 'Cloud Infrastructure & SaaS'})
        
        CREATE (:Team {id: 'team_platform', name: 'Core Platform', department: 'Engineering'})
        CREATE (:Team {id: 'team_monetization', name: 'Monetization & Billing', department: 'Product Engineering'})
        CREATE (:Team {id: 'team_infra', name: 'Cloud Infrastructure & SRE', department: 'Operations'})
        CREATE (:Team {id: 'team_sec', name: 'Security & Compliance', department: 'Security'})
    """)

    print("Seeding People and Team Memberships...")
    db.query("""
        MATCH (tp:Team {id: 'team_platform'}), (tm:Team {id: 'team_monetization'}), 
              (ti:Team {id: 'team_infra'}), (ts:Team {id: 'team_sec'})
              
        CREATE (alex:Person {id: 'usr_alex', name: 'Alex Chen', role: 'VP of Engineering', email: 'alex.chen@nexora.io', active_status: true})
        CREATE (marcus:Person {id: 'usr_marcus', name: 'Marcus Vance', role: 'Principal Architect', email: 'marcus.vance@nexora.io', active_status: true})
        CREATE (elena:Person {id: 'usr_elena', name: 'Elena Rostova', role: 'Staff Tech Lead', email: 'elena.rostova@nexora.io', active_status: true})
        CREATE (sarah:Person {id: 'usr_sarah', name: 'Sarah Kim', role: 'Senior Staff Engineer', email: 'sarah.kim@nexora.io', active_status: true})
        CREATE (david:Person {id: 'usr_david', name: 'David Kumar', role: 'Principal SRE', email: 'david.kumar@nexora.io', active_status: true})
        CREATE (priya:Person {id: 'usr_priya', name: 'Priya Patel', role: 'Senior Security Architect', email: 'priya.patel@nexora.io', active_status: true})
        
        CREATE (alex)-[:MEMBER_OF]->(tp)
        CREATE (marcus)-[:MEMBER_OF]->(tp)
        CREATE (elena)-[:MEMBER_OF]->(tp)
        CREATE (sarah)-[:MEMBER_OF]->(tm)
        CREATE (david)-[:MEMBER_OF]->(ti)
        CREATE (priya)-[:MEMBER_OF]->(ts)
        
        CREATE (marcus)-[:REPORTS_TO]->(alex)
        CREATE (elena)-[:REPORTS_TO]->(marcus)
        CREATE (sarah)-[:REPORTS_TO]->(alex)
    """)

    print("Seeding Microservices and Ownership...")
    db.query("""
        MATCH (tp:Team {id: 'team_platform'}), (tm:Team {id: 'team_monetization'}),
              (sarah:Person {id: 'usr_sarah'}), (elena:Person {id: 'usr_elena'})
              
        CREATE (ident:Service {id: 'svc_identity', name: 'Identity Service', tier: 1, criticality: 'P0', status: 'healthy', repository_url: 'github.com/nexora/identity-svc'})
        CREATE (pay:Service {id: 'svc_payments', name: 'Payments Service', tier: 1, criticality: 'P0', status: 'healthy', repository_url: 'github.com/nexora/payments-svc'})
        CREATE (bill:Service {id: 'svc_billing', name: 'Billing Service', tier: 1, criticality: 'P1', status: 'healthy', repository_url: 'github.com/nexora/billing-svc'})
        CREATE (chk:Service {id: 'svc_checkout', name: 'Checkout Web App', tier: 1, criticality: 'P0', status: 'healthy', repository_url: 'github.com/nexora/checkout-web'})
        CREATE (ledg:Service {id: 'svc_ledger', name: 'Financial Ledger', tier: 1, criticality: 'P0', status: 'healthy', repository_url: 'github.com/nexora/ledger-svc'})
        CREATE (notif:Service {id: 'svc_notification', name: 'Notification Service', tier: 2, criticality: 'P2', status: 'healthy', repository_url: 'github.com/nexora/notification-svc'})
        
        CREATE (tp)-[:OWNS]->(ident)
        CREATE (tm)-[:OWNS]->(pay)
        CREATE (tm)-[:OWNS]->(bill)
        CREATE (tm)-[:OWNS]->(chk)
        CREATE (tm)-[:OWNS]->(ledg)
        CREATE (tp)-[:OWNS]->(notif)
        
        CREATE (sarah)-[:OWNS]->(pay)
        CREATE (elena)-[:OWNS]->(ident)
    """)

    print("Seeding Service Dependency Chains (Edges: DEPENDS_ON)...")
    db.query("""
        MATCH (ident:Service {id: 'svc_identity'}), 
              (pay:Service {id: 'svc_payments'}), 
              (bill:Service {id: 'svc_billing'}),
              (chk:Service {id: 'svc_checkout'}),
              (ledg:Service {id: 'svc_ledger'}),
              (notif:Service {id: 'svc_notification'})
              
        CREATE (pay)-[:DEPENDS_ON {protocol: 'gRPC', latency_budget_ms: 120}]->(ident)
        CREATE (bill)-[:DEPENDS_ON {protocol: 'REST', retry_policy: 'exponential'}]->(pay)
        CREATE (chk)-[:DEPENDS_ON {protocol: 'GraphQL'}]->(pay)
        CREATE (pay)-[:DEPENDS_ON {protocol: 'gRPC'}]->(ledg)
        CREATE (bill)-[:DEPENDS_ON {protocol: 'EventBridge'}]->(notif)
    """)

    print("Seeding Policies, Decisions, Documents, and Incidents...")
    db.query("""
        MATCH (ident:Service {id: 'svc_identity'}), (pay:Service {id: 'svc_payments'}),
              (alex:Person {id: 'usr_alex'}), (marcus:Person {id: 'usr_marcus'}), 
              (elena:Person {id: 'usr_elena'}), (sarah:Person {id: 'usr_sarah'}), (david:Person {id: 'usr_david'})

        CREATE (pol1:Policy {id: 'pol_auth', name: 'SEC-POL-001 Cryptographic & Auth Standards', policy_type: 'Security', status: 'active'})
        CREATE (dec42:Decision {id: 'dec_042', title: 'ADR-042: Mandate AUTH-V2 Asymmetric Tokens', status: 'approved', created_at: '2026-09-15', approved_by: 'Alex Chen'})
        
        CREATE (doc_rfc:Document {id: 'doc_rfc102', title: 'RFC-102: Payments Architecture Overview', source_type: 'Markdown', source_uri: 'synthetic_data/DOC-RFC-102.md', created_at: '2024-03-10'})
        CREATE (doc_adr:Document {id: 'doc_adr042', title: 'ADR-042: Auth-V2 Decision Record', source_type: 'Markdown', source_uri: 'synthetic_data/DOC-DEC-042.md', created_at: '2026-09-15'})
        CREATE (doc_inc:Document {id: 'doc_inc8812', title: 'Incident INC-8812 Post-Mortem', source_type: 'Markdown', source_uri: 'synthetic_data/DOC-INC-8812.md', created_at: '2026-08-20'})

        CREATE (inc8812:Incident {id: 'inc_8812', severity: 'P0', status: 'resolved', occurred_at: '2026-08-20', resolved_at: '2026-08-20', summary: 'Payments authentication failure cascade during key rotation'})

        CREATE (dec42)-[:GOVERNS]->(pol1)
        CREATE (dec42)-[:CHANGES]->(pay)
        CREATE (marcus)-[:AUTHORED]->(dec42)
        CREATE (alex)-[:APPROVED]->(dec42)

        CREATE (inc8812)-[:AFFECTS]->(pay)
        CREATE (elena)-[:WORKED_ON {role: 'Incident Commander'}]->(inc8812)
        CREATE (sarah)-[:WORKED_ON {role: 'Payments SME'}]->(inc8812)
        CREATE (david)-[:WORKED_ON {role: 'SRE On-Call'}]->(inc8812)
        CREATE (inc8812)-[:PROMPTED_DECISION]->(dec42)
    """)

    print("Seeding First-Class Claim Nodes and Conflict Edges...")
    db.query("""
        MATCH (pay:Service {id: 'svc_payments'}),
              (doc_rfc:Document {id: 'doc_rfc102'}),
              (doc_adr:Document {id: 'doc_adr042'})

        CREATE (clm1:Claim {
            id: 'clm_auth_v1',
            subject_id: 'svc_payments',
            predicate: 'auth_protocol',
            object_value: 'AUTH-V1 (HMAC symmetric shared key)',
            valid_from: '2024-03-10',
            valid_to: 'indefinite',
            recorded_at: '2024-03-10',
            status: 'active',
            confidence: 0.95
        })

        CREATE (clm2:Claim {
            id: 'clm_auth_v2',
            subject_id: 'svc_payments',
            predicate: 'auth_protocol',
            object_value: 'AUTH-V2 (RS256 asymmetric token rotation)',
            valid_from: '2026-09-15',
            valid_to: 'indefinite',
            recorded_at: '2026-09-15',
            status: 'approved',
            confidence: 0.99
        })

        CREATE (doc_rfc)-[:SUPPORTS]->(clm1)
        CREATE (doc_adr)-[:SUPPORTS]->(clm2)

        CREATE (clm1)-[:ABOUT]->(pay)
        CREATE (clm2)-[:ABOUT]->(pay)

        CREATE (clm1)-[:CONFLICTS_WITH {reason: 'Incompatible cryptographic protocol versions for Payments auth'}]->(clm2)
    """)

    print("Nexora Cloud Knowledge Graph successfully seeded!")

if __name__ == "__main__":
    seed_nexora_company()
