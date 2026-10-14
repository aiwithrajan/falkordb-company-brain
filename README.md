# OrgMind: A Living Graph of the Entire Company
> **FalkorDB Graph Hacks (October 15–18, 2026)**  
> **Track 3: Company Brain**  
> *"Ask the company, not just its documents."*

[![FalkorDB](https://img.shields.io/badge/Graph_Database-FalkorDB-6366f1?style=flat&logo=redis)](https://www.falkordb.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-Passing_6%2F6-emerald.svg)](tests/)

---

## 1. Executive Summary

Enterprise knowledge is scattered across documents, PRs, Slack discussions, architecture decision records (ADRs), and incident post-mortems. When critical decisions must be made, standard Vector RAG fails: it retrieves isolated text chunks without understanding **ownership, multi-hop dependencies, chronological precedence, or conflicting policy mandates**.

**OrgMind** solves this by modeling the enterprise as a **living, queryable Knowledge Graph in FalkorDB**. It connects:
- **Teams & People** (Accountability, reporting, on-call history)
- **Microservices & Infrastructure** (Multi-hop `DEPENDS_ON` topology)
- **Decisions & Policies** (ADRs with approval provenance)
- **First-Class Claims** (Temporal validity, source links, and `[:CONFLICTS_WITH]` edges)
- **Incidents** (Post-mortems, root-cause PRs, and participating responders)

---

## 2. Why FalkorDB is Indispensable (FalkorDB vs. Vector RAG)

| Query / Capability | Naive Vector RAG | OrgMind on FalkorDB |
| :--- | :--- | :--- |
| **"What happens if Identity authentication changes?"** | Retrieves text mentioning "Identity" and "Auth". Misses indirect downstream blast radius (`Billing -> Payments -> Identity`). | Runs multi-hop Cypher traversal (`<-[:DEPENDS_ON*1..5]-`) identifying exact P0/P1 services in the blast radius. |
| **"Which auth protocol does Payments use?"** | Retrieves RFC-102 (`AUTH-V1`) and ADR-042 (`AUTH-V2`) and hallucinates or averages them together. | Detects explicit `[:CONFLICTS_WITH]` edge between claims, checks validity dates & approval states, and flags the conflict. |
| **"Who has real experience to approve this?"** | Matches keywords to random authors from 3 years ago. | Computes expert confidence by joining direct service ownership, incident response commander history, and ADR authorship. |
| **"Can the agent correct enterprise knowledge?"** | Cannot mutate state; vector indices remain contradictory. | Executes deterministic Cypher mutations: updates claim status to `superseded` and creates `[:SUPERSEDED_BY]` audit edge. |

---

## 3. The Graph Data Model

OrgMind models knowledge as a typed property graph in FalkorDB:

```
(:Person)-[:MEMBER_OF]->(:Team)
(:Team)-[:OWNS]->(:Service)
(:Person)-[:OWNS]->(:Service)
(:Service)-[:DEPENDS_ON]->(:Service)
(:Incident)-[:AFFECTS]->(:Service)
(:Person)-[:WORKED_ON]->(:Incident)
(:Decision)-[:GOVERNS]->(:Policy)
(:Decision)-[:CHANGES]->(:Service)
(:Document)-[:SUPPORTS]->(:Claim)
(:Claim)-[:ABOUT]->(:Service)
(:Claim)-[:CONFLICTS_WITH]->(:Claim)
(:Claim)-[:SUPERSEDED_BY]->(:Claim)
```

### The First-Class `Claim` Node
Instead of treating properties as static values, claims that require provenance or conflict detection are modeled as first-class nodes:
* `id`: Unique identifier (e.g., `clm_auth_v1`)
* `subject_id`: Target entity (e.g., `svc_payments`)
* `predicate`: Dimension being claimed (e.g., `auth_protocol`)
* `object_value`: Value stated (e.g., `AUTH-V1`)
* `status`: `active` | `approved` | `superseded`
* `valid_from` & `valid_to`: Temporal validity window
* `confidence`: Extraction confidence score

---

## 4. Core Cypher Query Suite

### A. Multi-Hop Downstream Blast Radius
```cypher
MATCH path = (root:Service {id: $service_id})<-[:DEPENDS_ON*1..5]-(dependent:Service)
RETURN root.name AS root, dependent.name AS dependent, dependent.criticality AS criticality
```

### B. Conflicting Claims Detection
```cypher
MATCH (a:Claim)-[:ABOUT]->(s:Service {id: $service_id}),
      (b:Claim)-[:ABOUT]->(s)
WHERE a.predicate = b.predicate AND a.id <> b.id
OPTIONAL MATCH (d1:Document)-[:SUPPORTS]->(a)
OPTIONAL MATCH (d2:Document)-[:SUPPORTS]->(b)
OPTIONAL MATCH (a)-[cf:CONFLICTS_WITH]->(b)
RETURN a, b, d1, d2, cf, s
```

### C. Expert & SME Discovery (Ownership + Incident Experience + ADRs)
```cypher
MATCH (p:Person)-[:OWNS]->(s:Service {id: $service_id})
RETURN p.id AS id, p.name AS name, p.role AS role, p.email AS email, 'Direct Service Owner' AS reason, 5 AS weight
UNION
MATCH (p:Person)-[w:WORKED_ON]->(i:Incident)-[:AFFECTS]->(s:Service {id: $service_id})
RETURN p.id AS id, p.name AS name, p.role AS role, p.email AS email, ('Incident Responder (' + w.role + ')') AS reason, 4 AS weight
UNION
MATCH (p:Person)-[:AUTHORED]->(d:Decision)-[:CHANGES]->(s:Service {id: $service_id})
RETURN p.id AS id, p.name AS name, p.role AS role, p.email AS email, ('Author of ' + d.id) AS reason, 4 AS weight
```

### D. Human-in-the-Loop Knowledge Correction
```cypher
MATCH (stale:Claim {id: $claim_id})
SET stale.status = 'superseded',
    stale.valid_to = '2026-09-15',
    stale.reviewed_by = $reviewed_by,
    stale.reviewed_at = '2026-10-14T16:00:00Z'
WITH stale
MATCH (stale)-[cf:CONFLICTS_WITH]->(approved:Claim)
DELETE cf
CREATE (stale)-[:SUPERSEDED_BY {reason: 'Superseded via human approval'}]->(approved)
RETURN stale
```

---

## 5. End-to-End Demo Scenario: Nexora Cloud

The included synthetic company dataset (`Nexora Cloud`) powers a complete 3-minute demo:

1. **Ask**: *"Explain how Payments works, who owns it, and what could be affected if Identity authentication changes."*
2. **Resolve**: Agent traverses FalkorDB:
   - Identifies owner: **Monetization & Billing** (`Sarah Kim`)
   - Computes Blast Radius: `Billing Service` (P1) and `Checkout Web App` (P0) depend on `Payments Service`
   - Uncovers Incident **INC-8812**: P0 outage where legacy token expiration failed
   - Detects **Policy Conflict**: RFC-102 references legacy `AUTH-V1`, while approved ADR-042 mandates `AUTH-V2`
   - Recommends Subject Matter Expert: **Sarah Kim** (Score 9, Service Owner + Incident SME)
3. **Correct**: User clicks **"Approve Correction & Update Graph"**.
4. **Mutate**: FalkorDB updates `clm_auth_v1` to `superseded` and creates `[:SUPERSEDED_BY]` edge.
5. **Re-Run**: Query immediately updates to: *"Policy Compliance Verified: AUTH-V2 approved, historical audit preserved."*

---

## 6. Quickstart & Local Setup

### Prerequisites
- Docker & Docker Compose
- Python 3.9+
- Node.js 20+

### Option A: One-Command Start (Recommended)
```bash
./start.sh
```
This automatically:
1. Verifies/starts FalkorDB in Docker (`port 6379` and Browser on `port 3000`).
2. Populates FalkorDB with the Nexora Cloud company graph.
3. Launches the FastAPI backend on `http://localhost:8000`.
4. Launches the Vite React frontend on `http://localhost:5173`.

### Option B: Manual Setup

1. **Start FalkorDB**:
   ```bash
   docker compose up -d
   ```
2. **Setup Backend**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt
   python3 backend/seed_data.py
   uvicorn backend.main:app --port 8000 --reload
   ```
3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 7. Automated Acceptance Tests

To verify that all Hackathon Track-3 acceptance criteria pass deterministically:

```bash
PYTHONPATH=. ./venv/bin/pytest tests/test_queries.py -v
```

All 6 test suites verify:
- Service ownership resolution
- Multi-hop downstream blast radius reachability
- Incident history correlation
- Conflicting claim detection & state transition lifecycle
- Degree-weighted expert scoring
- End-to-end agent investigation outputs
