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

## 5. Flagship Superpowers & Demo Scenarios

OrgMind provides 4 distinct enterprise capabilities powered by FalkorDB:

### 🚨 1. P0 Incident Commander (Firefighting Mode)
* **What it does**: When an outage strikes (e.g. `payments-svc 500 auth cascade`), FalkorDB traverses 5 hops of the dependency graph to compute the **blast radius** (`checkout-web [P0]`, `billing-svc [P1]`).
* **Historical Precedents**: Matches past post-mortem **INC-8812** with root cause (HMAC token desync).
* **Automated Squad Dispatch**: Mobilizes the previous incident commander (`Elena Rostova`) and domain SME (`Sarah Jenkins`) with 1-click Slack dispatch copy.

### ⚖️ 2. AI Staff Architect (Fire Prevention Mode)
* **What it does**: Acts as an automated CI/CD architectural gate. When a pull request (e.g. PR #318) attempts to revert authentication to symmetric HMAC keys, FalkorDB blocks the merge.
* **ADR Compliance**: Cites approved **ADR-042** (mandating asymmetric RS256 token rotation) and flags that reverting revives the vulnerability that caused outage INC-8812.
* **1-Click Review**: Generates formatted markdown for GitHub PR review comments.

### 🧠 3. Living Institutional Memory & Stale Claim Healing
* **Contradiction Detection**: Detects conflicting claims between stale architecture docs (RFC-102 with `AUTH-V1`) and approved decisions (ADR-042 with `AUTH-V2`).
* **1-Click Graph Healing**: User clicks **"Approve Correction"** to deterministically mutate FalkorDB: marks `clm_auth_v1` as `superseded` and creates `[:SUPERSEDED_BY]` audit edge.

### 📥 4. Bring Your Own Architecture (Custom Ingestion)
* **Enterprise Customization**: Ingest any company's microservices, teams, and policies via structured JSON spec (`/api/ingest/json`) or plain English architecture notes (`/api/ingest/text`).

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
1. Verifies/starts FalkorDB in Docker (`port 6379` and FalkorDB Browser on `port 3000`).
2. Populates FalkorDB with the initial Nexora Cloud company graph.
3. Launches the FastAPI backend on `http://localhost:8001`.
4. Launches the Vite React frontend console on `http://localhost:5173`.

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
   uvicorn backend.main:app --port 8001 --reload
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

---

## 8. Suggested 3-Minute Demo Video Walkthrough

1. **Minute 0:00 – 0:45: The Problem & Live FalkorDB Graph**
   - Introduce OrgMind for Track 3 (Company Brain).
   - Point to the live interactive canvas on the right showing Nexora Cloud's 6 microservices, teams, people, ADRs, and incidents in FalkorDB.
   - Show FalkorDB Browser at `http://localhost:3000`.

2. **Minute 0:45 – 1:30: Superpower 1 — P0 Incident Commander**
   - Click **"P0 Incident Commander"** on the left.
   - Show how FalkorDB traverses dependencies to flag downstream impact on `checkout-web` and `billing-svc`.
   - Show historical match to `INC-8812` and automated on-call squad dispatch. Click **"Copy Slack Dispatch"**.

3. **Minute 1:30 – 2:15: Superpower 2 — AI Staff Architect PR Drift Gate**
   - Click **"AI Staff Architect Guard"**.
   - Show PR #318 blocked due to ADR-042 violation (preventing recurrence of INC-8812).
   - Click **"View ADR-042"** to show document evidence with auditable provenance.

4. **Minute 2:15 – 3:00: 1-Click Knowledge Healing & Custom Company Ingestion**
   - Click **"1-Click Approve Correction"** to see FalkorDB update `active` claim to `superseded` in real-time.
   - Click **"📥 Ingest Company Data"** to demonstrate custom topology ingestion into FalkorDB.
   - Conclude: Why FalkorDB graph traversal beats vector search for institutional memory.

