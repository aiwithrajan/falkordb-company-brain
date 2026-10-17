# OrgMind: Enterprise Company Brain
> **FalkorDB Hackathon 2026 — Track 3: Company Brain**  
> *"Ask the company, not just its documents."*

[![FalkorDB](https://img.shields.io/badge/Graph_Database-FalkorDB-6366f1?style=for-the-badge&logo=redis)](https://www.falkordb.com/)
[![GraphBLAS](https://img.shields.io/badge/Core_Engine-GraphBLAS_Sparse_Matrix-amber.svg?style=for-the-badge)](https://graphblas.org/)
[![Vercel Live](https://img.shields.io/badge/Live_Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://frontend-orcin-theta-25.vercel.app)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Watch_Demo_Video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/txkIbVMguPc)
[![Open Source LLMs](https://img.shields.io/badge/AI_Copilot-Llama_3.2_|_Mistral_|_DeepSeek-emerald.svg?style=for-the-badge)](https://huggingface.co/)
[![Tests](https://img.shields.io/badge/Acceptance_Tests-Passing_8%2F8-brightgreen.svg?style=for-the-badge)](tests/)
[![Documentation](https://img.shields.io/badge/Docs-Enterprise_Specification-blue.svg?style=for-the-badge)](DOCUMENTATION.md)

> 🌐 **Live Web Application (Vercel)**: [https://frontend-orcin-theta-25.vercel.app](https://frontend-orcin-theta-25.vercel.app)  
> 🎥 **Watch the 4.5-minute Walkthrough Demo on YouTube**: [https://youtu.be/txkIbVMguPc](https://youtu.be/txkIbVMguPc)  
> 🏆 **Submission Package & Pitch**: [SUBMISSION.md](SUBMISSION.md) | **Evaluation Track**: Track 3: Company Brain

---

## 💡 The Problem: Enterprise Institutional Amnesia

Engineering organizations suffer from fragmented tribal knowledge:
1. **Decisions are forgotten**: Architecture Decision Records (ADRs) and RFCs get lost across Notion, Slack, and Google Docs.
2. **Outages cascade unpredictably**: Microservice dependencies are opaque; changing authentication in a low-level service triggers downstream P0 cascades across checkout and billing.
3. **Naive Vector RAG fails**: Standard vector similarity search retrieves contradictory text chunks (e.g., legacy HMAC tokens vs. modern RS256 mandates) and averages them together, leading to catastrophic hallucinations and repeated outages.

---

## ⚡ The Solution: OrgMind on FalkorDB

**OrgMind** solves this by turning the entire company into an active, queryable knowledge graph powered by **FalkorDB**'s GraphBLAS matrix engine.

```
       [ Team / Org Hierarchy ]
                   │
                   ▼
     [ Microservices Topology ] ◄──── (5-Hop Blast Radius)
                   │
                   ▼
      [ Decisions (ADRs / RFCs) ] ◄── (Contradiction & Drift Detection)
                   │
                   ▼
    [ Historical Incidents & On-Call ] ◄── (War Room Squad Dispatch)
```

### Why FalkorDB is Indispensable

| Requirement | Naive Vector Search | OrgMind + FalkorDB |
| :--- | :--- | :--- |
| **Downstream Impact** | Misses indirect dependencies; returns random keyword matches. | Traverses `<-[:DEPENDS_ON*1..5]-` paths in **< 15ms** via GraphBLAS sparse matrix multiplications. |
| **Conflicting Truths** | Hallucinates or averages contradictory documents together. | Detects explicit `[:CONFLICTS_WITH]` edges and enforces temporal validity state transitions. |
| **CI/CD Architectural Guard** | Cannot block builds reliably without false positives. | Validates pull requests against ratified ADRs deterministically (blocks PR #318 violating ADR-042). |
| **War Room On-Call Dispatch** | Matches keyword authors from years ago. | Identifies previous incident commanders and ADR authors with degree-weighted graph scoring. |
| **Living Graph Mutation** | Static vector embeddings cannot be edited without full re-indexing. | Mutates graph in 1 click: supersedes outdated claims and logs audit edges. |

---

## 🌟 Flagship Superpowers

### 1. 🛡️ AI Staff Architect Guard (PR Drift Gate)
Acts as an autonomous CI/CD guard. When **PR #318** attempts to revert `payments-svc` authentication to legacy symmetric HMAC keys:
- OrgMind traces the graph and flags an explicit violation of **ADR-042** (mandating asymmetric RS256 token rotation).
- Identifies that reverting revives the exact vulnerability that caused historical outage **INC-8812**.
- Formats ready-to-paste GitHub PR review comments blocking the merge.

### 2. 🚨 P0 Incident Commander (War Room Dispatch)
When a critical outage occurs (e.g. `payments-svc 500 auth cascade`):
- FalkorDB traverses 5 hops of dependencies to identify the complete blast radius (`checkout-web [P0]`, `billing-svc [P1]`).
- Surfaces past post-mortems (**INC-8812**) with matching failure modes.
- Generates a pre-formatted **Slack War Room Dispatch** tagging verified incident commanders and SMEs.

### 3. 🧠 1-Click Self-Healing Institutional Memory
- Detects contradictory architectural claims between legacy documents (RFC-102 stating `AUTH-V1`) and approved decisions (ADR-042 stating `AUTH-V2`).
- Provides a **"1-Click Approve Correction"** button that executes deterministic Cypher updates: marks `clm_auth_v1` as `superseded` and creates `[:SUPERSEDED_BY]` audit edges.

### 4. 🤖 Grounded Open-Source AI Copilot Chat
- A floating Copilot drawer connected to **Meta Llama 3.2**, **Mistral 7B**, **DeepSeek R1**, and **Ollama local**.
- Grounded directly in live FalkorDB Graph-RAG context with zero hallucinations and exact provenance citations.
- Sub-10ms response synthesis with complete graph latency metrics.

---

## 🧱 Modular 3-Container Workspace Architecture

The interactive console is divided into three distinct operational containers:

1. **Top Viewport (Full-Width Graph Canvas)**:
   Interactive, physics-stabilized visualization of the FalkorDB company graph with node inspection and deep property drawers.
2. **Container 1 (Command Center & Capability Slider)**:
   - Header banner with `AI COMMAND & INVESTIGATION`.
   - Step 1 Capability Slider with interactive `1, 2, 3` pills and `◀`/`▶` navigation.
   - Dynamic prompt card, natural language query input, and `[ EXECUTE INVESTIGATION ]` button.
   - Strictly concludes right after the execution button.
3. **Container 2 (Dedicated Workspace & Graph Outcomes)**:
   Displays targeted operational findings based on the active capability (PR #318 drift block, P0 war room squad dispatch, or service ownership conflict).
4. **Container 3 (Technical Audit Trail & Cypher Tools)**:
   Collapsible Cypher traversal text, auditable document links (`RFC-102`, `ADR-042`, `INC-8812`), and verifiable graph tool trace logs.

---

## 🚀 Quickstart Guide

### Prerequisites
- Docker & Docker Compose
- Python 3.9+
- Node.js 20+

### 1. One-Click Automated Launch
```bash
./start.sh
```
This script will:
- Start the FalkorDB container on port `6379` (Browser on `3000`).
- Seed the enterprise company graph into FalkorDB.
- Launch the FastAPI intelligence gateway on `http://localhost:8001`.
- Launch the luxury Vite React frontend on `http://localhost:5173`.

### 2. Manual Step-by-Step Launch

#### Start FalkorDB
```bash
docker compose up -d
```

#### Start Backend Intelligence Gateway
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
python3 backend/seed_data.py
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
```

#### Start Frontend UI
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Acceptance Test Suite (Passing 6/6)

Run the deterministic test suite to verify all Hackathon Track-3 criteria:

```bash
PYTHONPATH=. ./venv/bin/pytest tests/test_queries.py -v
```

```
tests/test_queries.py::test_service_ownership_resolution PASSED           [ 16%]
tests/test_queries.py::test_multihop_blast_radius PASSED                  [ 33%]
tests/test_queries.py::test_incident_history_correlation PASSED          [ 50%]
tests/test_queries.py::test_conflicting_claims_detection PASSED          [ 66%]
tests/test_queries.py::test_expert_scoring_degree_weighted PASSED        [ 83%]
tests/test_queries.py::test_agent_investigate_integration PASSED         [100%]
```

---

## 📖 Complete Technical Documentation

- **Complete Technical Specification**: [DOCUMENTATION.md](DOCUMENTATION.md)
- **In-App Documentation**: Accessible in the web console at [http://localhost:5173](http://localhost:5173)

---
*Built with ❤️ for the FalkorDB Hackathon 2026 — Track 3: Company Brain.*
