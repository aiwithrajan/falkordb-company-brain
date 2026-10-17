# 🏆 Hackathon Project Submission: OrgMind (The Living Company Brain)

**Hackathon**: [Graph Hacks: Give Your AI Agents Real Context (WeMakeDevs & FalkorDB)](https://www.wemakedevs.org/hackathons/falkordb)  
**Submission Portal**: [https://www.wemakedevs.org/hackathons/falkordb/submit](https://www.wemakedevs.org/hackathons/falkordb/submit)  
**Rules & Evaluation Criteria**: [https://www.wemakedevs.org/hackathons/falkordb/rules](https://www.wemakedevs.org/hackathons/falkordb/rules)  

---

## 1. Project Information & Track

- **Project Name**: `OrgMind: The Living Company Brain`
- **Tagline**: Autonomous Enterprise Architecture, CI/CD PR Drift Prevention & P0 Incident Commander powered by FalkorDB GraphBLAS.
- **Track Entered**: **Track 3: Company Brain**
- **Repository Link**: `https://github.com/aiwithrajan/falkordb-company-brain`
- **Demo Video Link**: `https://youtu.be/txkIbVMguPc` (YouTube Video: 1080p 60fps with Microsoft Azure Neural AI voiceover)
- **Demo Video Duration**: 4 minutes 32 seconds

---

## 2. Project Overview & Problem Statement

### The Problem: Enterprise Institutional Amnesia
In scaling tech companies, institutional memory is fragmented across Notion, Slack, Jira, GitHub, and Google Docs:
1. **Decisions are forgotten**: Architectural Decision Records (ADRs) get lost; engineers repeatedly propose already-rejected designs or silently revert hardened policies.
2. **Outages cascade unpredictably**: Microservice dependency graphs are opaque. A small auth change in a low-level service triggers cascading P0 failures across checkout and billing.
3. **Naive Vector RAG Fails Catastrophically**: Standard vector similarity search retrieves contradictory document chunks (e.g., an outdated RFC specifying HMAC tokens vs. an approved ADR mandating asymmetric RS256 token rotation) and averages them together, leading to severe hallucinations and repeated outages.

### The Solution: OrgMind on FalkorDB
OrgMind turns an engineering organization into an active, self-healing knowledge graph powered by **FalkorDB**'s GraphBLAS sparse-matrix linear algebra engine. It serves 4 core operational roles:
1. **AI Staff Architect Guard (PR Drift Gate)**: Evaluates incoming pull requests against ratified ADRs and historical post-mortems using Cypher graph traversal, blocking non-compliant changes before merge.
2. **P0 Incident Commander (War Room Dispatch)**: Traces 5-hop downstream microservice dependencies in < 15ms, pinpoints affected services, and dispatches verified incident commanders and SMEs with pre-formatted Slack alerts.
3. **1-Click Self-Healing Memory**: Identifies conflicting architectural claims (`[:CONFLICTS_WITH]`), and allows engineering leadership to supersede obsolete records with deterministic Cypher mutations (`[:SUPERSEDED_BY]`).
4. **Grounded Open-Source AI Copilot**: Sub-10ms Graph-RAG inference powered by Meta Llama 3.2, Mistral 7B, DeepSeek R1, and local Ollama, strictly grounded in verifiable graph provenance.

---

## 3. Why FalkorDB is Indispensable (The FalkorDB Requirement)

> **Per Hackathon Rules**: *"The graph has to do real work. If the product still works once FalkorDB is taken out, the graph is decoration rather than the thing the product runs on."*

In OrgMind, FalkorDB is the core operational engine. If FalkorDB is removed:
1. **Multi-Hop Dependency Traversal is Impossible**: Vector databases and relational tables cannot efficiently compute arbitrary-depth transitive closures (`<-[:DEPENDS_ON*1..5]-`). FalkorDB leverages GraphBLAS sparse-matrix multiplication to traverse deep microservice trees in **under 15 milliseconds**.
2. **Contradiction Detection Fails**: Vector embeddings average semantic similarities, conflating legacy standards with active ones. FalkorDB models atomic assertions as first-class `(:Claim)` nodes with directional `[:CONFLICTS_WITH]` edges and temporal validity states (`active` vs `superseded`).
3. **Self-Healing State Transitions Break**: Relational updates require complex lock-heavy migrations. FalkorDB mutates graph relationships in 1 click, atomizing state changes and preserving historical audit trails.
4. **Degree-Weighted Expert Scoring Cannot Function**: Ranking incident commanders requires joining direct ownership (`:OWNS`), historical incident post-mortem participation (`:WORKED_ON`), and ADR authorship (`:AUTHORED`) across interconnected entities.

---

## 4. The Graph Data Model

### Node Schema
| Node Label | Key Properties | Purpose |
| :--- | :--- | :--- |
| **`Service`** | `id`, `name`, `tier`, `criticality` (P0/P1/P2), `status`, `repository_url` | Microservice topology and health state |
| **`Team`** | `id`, `name`, `department`, `slack_channel` | Engineering organizational units |
| **`Person`** | `id`, `name`, `role`, `email`, `oncall_status` | Engineers, commanders, and architects |
| **`Decision`** | `id`, `title`, `status` (approved/deprecated), `approved_by`, `effective_date` | Architectural Decision Records (ADRs & RFCs) |
| **`Incident`** | `id`, `title`, `severity`, `date`, `root_cause`, `postmortem_url` | Historical and active production outages |
| **`Claim`** | `id`, `predicate`, `object_value`, `status`, `valid_from`, `valid_to` | Atomic knowledge assertions with provenance |
| **`Document`** | `uri`, `title`, `hash` | Original source RFCs, specs, and post-mortems |

### Relationship Schema
- `(:Person)-[:MEMBER_OF]->(:Team)`
- `(:Team)-[:OWNS]->(:Service)`
- `(:Person)-[:OWNS]->(:Service)`
- `(:Service)-[:DEPENDS_ON]->(:Service)` *(arbitrary multi-hop hierarchy)*
- `(:Incident)-[:AFFECTS]->(:Service)`
- `(:Person)-[:WORKED_ON {role: string}]->(:Incident)`
- `(:Decision)-[:CHANGES]->(:Service)`
- `(:Document)-[:SUPPORTS]->(:Claim)`
- `(:Claim)-[:ABOUT]->(:Service)`
- `(:Claim)-[:CONFLICTS_WITH]->(:Claim)`
- `(:Claim)-[:SUPERSEDED_BY {reason: string}]->(:Claim)`

---

## 5. Core Cypher Traversal Suite & Graph Algorithms

OrgMind's intelligence is powered by 4 core Cypher traversals:

### 1. Multi-Hop Downstream Blast Radius Traversal
Traverses up to 5 hops of transitive dependencies to pinpoint every affected microservice and its operational criticality when a root service degrades:
```cypher
MATCH path = (root:Service {id: $service_id})<-[:DEPENDS_ON*1..5]-(dependent:Service)
RETURN root.name AS root,
       dependent.name AS dependent,
       dependent.criticality AS criticality,
       length(path) AS depth
ORDER BY depth ASC;
```

### 2. Conflicting Claims & Architectural Drift Detection
Identifies conflicting technical claims across disparate documents regarding the same service attribute:
```cypher
MATCH (a:Claim)-[:ABOUT]->(s:Service {id: $service_id}),
      (b:Claim)-[:ABOUT]->(s)
WHERE a.predicate = b.predicate AND a.id <> b.id
OPTIONAL MATCH (d1:Document)-[:SUPPORTS]->(a)
OPTIONAL MATCH (d2:Document)-[:SUPPORTS]->(b)
OPTIONAL MATCH (a)-[cf:CONFLICTS_WITH]->(b)
RETURN a, b, d1, d2, cf, s;
```

### 3. Degree-Weighted SME & Incident Commander Scoring
Dispatches the most qualified engineers to an outage by combining direct service ownership, past incident firefighting, and ADR authorship:
```cypher
MATCH (p:Person)-[:OWNS]->(s:Service {id: $service_id})
RETURN p.name AS name, p.role AS role, p.email AS email, 'Direct Service Owner' AS reason, 5 AS score
UNION
MATCH (p:Person)-[w:WORKED_ON]->(i:Incident)-[:AFFECTS]->(s:Service {id: $service_id})
RETURN p.name AS name, p.role AS role, p.email AS email, ('Incident Responder (' + w.role + ')') AS reason, 4 AS score
UNION
MATCH (p:Person)-[:AUTHORED]->(d:Decision)-[:CHANGES]->(s:Service {id: $service_id})
RETURN p.name AS name, p.role AS role, p.email AS email, ('Author of ' + d.id) AS reason, 4 AS score
ORDER BY score DESC;
```

### 4. Deterministic 1-Click Graph Self-Healing Mutation
Resolves institutional conflict in real time by deprecating obsolete claims and writing verified audit trails into the graph:
```cypher
MATCH (stale:Claim {id: $claim_id})
SET stale.status = 'superseded',
     stale.valid_to = date(),
     stale.reviewed_by = $reviewed_by,
     stale.reviewed_at = datetime()
WITH stale
MATCH (stale)-[cf:CONFLICTS_WITH]->(approved:Claim)
DELETE cf
CREATE (stale)-[:SUPERSEDED_BY {reason: 'Superseded via human review in OrgMind'}]->(approved)
RETURN stale;
```

---

## 6. Demo Video Walkthrough & Timestamps

The working demo video is recorded at **1080p 60 FPS**, dubbed with Microsoft Azure Neural Voice (`en-US-AndrewNeural`), demonstrating actual live UI actions:

- **0:00 - 0:35**: **System Architecture & FalkorDB GraphBLAS Core**  
  High-level overview of enterprise amnesia, graph linear algebra, and the interactive Vis.js full-width topology canvas.
- **0:35 - 1:25**: **Feature 1: Enterprise Architecture & Ownership Resolution**  
  Investigating `svc_payments`, displaying multi-tier service ownership, and resolving the responsible engineering team and Slack channel.
- **1:25 - 2:30**: **Feature 2: 1-Click Self-Healing Institutional Memory**  
  Detecting conflicting claims between legacy RFC-102 (`AUTH-V1` symmetric HMAC) and ratified ADR-042 (`AUTH-V2` RS256). Executing the 1-click graph mutation to supersede the obsolete claim.
- **2:30 - 3:35**: **Feature 3: P0 Incident Commander & 5-Hop Blast Radius**  
  Simulating a catastrophic auth outage on `svc_payments`. Computing 5-hop downstream blast radius on `checkout-web` [P0] and `billing-svc` [P1]. Formatting and copying the Slack War Room Dispatch.
- **3:35 - 4:10**: **Feature 4: Autonomous CI/CD PR Drift Guard**  
  Evaluating Pull Request #318 attempting to revert authentication. Blocking PR merge with verifiable ADR-042 citation and generating GitHub review markdown.
- **4:10 - 4:32**: **FalkorDB Visual Browser, Pytest Suite & Conclusion**  
  Demonstrating the raw FalkorDB visual query browser on port 3000, 6/6 passing automated graph tests, and concluding thoughts.

---

## 7. Deployment & Local Setup Instructions

OrgMind includes a 1-click automated setup script that configures FalkorDB, seeds the enterprise graph, starts the FastAPI backend, and launches the Vite React frontend.

### Prerequisites
- Docker & Docker Compose
- Python 3.9+
- Node.js 20+

### One-Click Launch
```bash
git clone https://github.com/aiwithrajan/falkordb-company-brain.git
cd falkordb-company-brain
./start.sh
```

### Access URLs
- **Web Application & Interactive Canvas**: `http://localhost:5173`
- **In-App Interactive Feature Tour**: `http://localhost:5173/tour`
- **FastAPI Intelligence Gateway & Swagger Docs**: `http://localhost:8001/docs`
- **FalkorDB GraphBLAS Engine**: `localhost:6379`
- **FalkorDB Web Visualizer**: `http://localhost:3000`

### Running Acceptance Tests
```bash
PYTHONPATH=. ./venv/bin/pytest tests/test_queries.py -v
```
*(All 6/6 graph test assertions pass deterministically).*

---

## 8. AI Coding Assistant Disclosure

In compliance with the official WeMakeDevs & FalkorDB Hackathon Rules:

> **AI Disclosure Statement**:  
> *"AI coding assistants (Google Antigravity AI) were utilized during the development of OrgMind for accelerating frontend layout generation, typing boilerplate models, and synthesizing test fixtures.  
> The core system architecture, GraphBLAS sparse matrix reasoning, Cypher multi-hop traversals, conflict-resolution graph state machine, and data modeling were designed and directed by the project author, who has full technical understanding of the submitted codebase, Cypher algorithms, and operational workflows."*

---

*Submitted to WeMakeDevs & FalkorDB Graph Hacks Hackathon — Track 3: Company Brain.*
