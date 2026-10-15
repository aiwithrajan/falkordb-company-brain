from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.agent import agent
from backend.tools import apply_knowledge_correction, get_source_evidence
from backend.seed_data import seed_nexora_company
from backend.graph_db import db

app = FastAPI(
    title="OrgMind API",
    description="FalkorDB-powered Company Brain: Living Graph of the Entire Enterprise",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InvestigateRequest(BaseModel):
    question: str
    mode: Optional[str] = None

class CorrectionRequest(BaseModel):
    claim_id: str
    reviewed_by: Optional[str] = "Engineering Lead"

@app.get("/api/health")
def health():
    try:
        res = db.query("RETURN 'pong' as ping")
        return {"status": "ok", "falkordb": "connected", "result": res.result_set[0][0]}
    except Exception as e:
        return {"status": "error", "falkordb": str(e)}

@app.get("/api/overview")
def get_overview():
    try:
        services_res = db.query("MATCH (s:Service) RETURN count(s) as c")
        teams_res = db.query("MATCH (t:Team) RETURN count(t) as c")
        people_res = db.query("MATCH (p:Person) RETURN count(p) as c")
        incidents_res = db.query("MATCH (i:Incident) RETURN count(i) as c")
        conflicts_res = db.query("MATCH (c:Claim {status: 'active'})-[cf:CONFLICTS_WITH]->(c2:Claim) RETURN count(cf) as c")
        decisions_res = db.query("MATCH (d:Decision) RETURN count(d) as c")

        # Full high-level company graph for overview visualizer
        full_sub_res = db.query("""
            MATCH path = (s:Service)-[r:DEPENDS_ON]->(s2:Service)
            RETURN path
        """)
        dependency_graph = db.extract_subgraph([[r[0]] for r in full_sub_res.result_set])

        return {
            "company_name": "Nexora Cloud",
            "counts": {
                "services": services_res.result_set[0][0] if services_res.result_set else 0,
                "teams": teams_res.result_set[0][0] if teams_res.result_set else 0,
                "people": people_res.result_set[0][0] if people_res.result_set else 0,
                "incidents": incidents_res.result_set[0][0] if incidents_res.result_set else 0,
                "active_conflicts": conflicts_res.result_set[0][0] if conflicts_res.result_set else 0,
                "decisions": decisions_res.result_set[0][0] if decisions_res.result_set else 0
            },
            "dependency_graph": dependency_graph
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/investigate")
def investigate(req: InvestigateRequest):
    try:
        result = agent.investigate(req.question, mode=req.mode)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/claims/correct")
def correct_claim(req: CorrectionRequest):
    try:
        res = apply_knowledge_correction(req.claim_id, req.reviewed_by)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reset")
def reset_knowledge_graph():
    try:
        seed_nexora_company()
        return {"status": "success", "message": "Nexora Cloud graph re-seeded to initial state"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/evidence/{source_uri:path}")
def fetch_evidence(source_uri: str):
    content = get_source_evidence(source_uri)
    return {"source_uri": source_uri, "content": content}

import os
from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
