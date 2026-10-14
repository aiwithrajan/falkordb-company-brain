from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from chokepoint.mcp.tools import ChokePointTools

app = FastAPI(
    title="ChokePoint MCP Server",
    description="Model Context Protocol (MCP) tool server providing FalkorDB graph algorithms and dependency analysis",
    version="1.0.0"
)

tools = ChokePointTools()

class IngestRequest(BaseModel):
    system: str = "npm"
    package: str
    version: str

class ExposureRequest(BaseModel):
    graph_name: str
    root_key: str

class MinCutRequest(BaseModel):
    graph_name: str
    root_key: str

class PickVersionRequest(BaseModel):
    system: str = "npm"
    package: str
    current_version: str

class SimulateFixRequest(BaseModel):
    graph_name: str
    root_key: str
    changes: List[Dict[str, str]]

class ExplainRequest(BaseModel):
    graph_name: str
    root_key: str
    changes: List[Dict[str, str]]

@app.get("/")
def index():
    return {"status": "online", "server": "ChokePoint MCP Server", "version": "1.0.0"}

@app.get("/tools")
def list_tools():
    return {
        "tools": [
            {
                "name": "ingest_root",
                "description": "Loads a package version's resolved dependency graph and advisories into FalkorDB",
                "parameters": {"system": "str", "package": "str", "version": "str"}
            },
            {
                "name": "find_exposure",
                "description": "Returns vulnerable packages reachable from the root with their shortest paths",
                "parameters": {"graph_name": "str", "root_key": "str"}
            },
            {
                "name": "min_cut",
                "description": "Computes the minimum cut of packages to sever all vulnerable paths using FalkorDB",
                "parameters": {"graph_name": "str", "root_key": "str"}
            },
            {
                "name": "pick_version",
                "description": "Finds the nearest non-vulnerable version of a package",
                "parameters": {"system": "str", "package": "str", "current_version": "str"}
            },
            {
                "name": "simulate_fix",
                "description": "Clones graph using GRAPH.COPY, applies candidate version upgrades, and verifies max flow is 0",
                "parameters": {"graph_name": "str", "root_key": "str", "changes": "list[dict]"}
            },
            {
                "name": "explain",
                "description": "Returns the severed paths and the exact Cypher query behind the proposed changes",
                "parameters": {"graph_name": "str", "root_key": "str", "changes": "list[dict]"}
            }
        ]
    }

@app.post("/tools/ingest_root")
def call_ingest(req: IngestRequest):
    return tools.ingest_root(req.system, req.package, req.version)

@app.post("/tools/find_exposure")
def call_find_exposure(req: ExposureRequest):
    return tools.find_exposure(req.graph_name, req.root_key)

@app.post("/tools/min_cut")
def call_min_cut(req: MinCutRequest):
    return tools.min_cut(req.graph_name, req.root_key)

@app.post("/tools/pick_version")
def call_pick_version(req: PickVersionRequest):
    return tools.pick_version(req.system, req.package, req.current_version)

@app.post("/tools/simulate_fix")
def call_simulate_fix(req: SimulateFixRequest):
    return tools.simulate_fix(req.graph_name, req.root_key, req.changes)

@app.post("/tools/explain")
def call_explain(req: ExplainRequest):
    return tools.explain(req.graph_name, req.root_key, req.changes)
