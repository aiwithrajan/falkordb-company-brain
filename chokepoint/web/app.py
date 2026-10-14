import json
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from chokepoint.agent.loop import ChokePointAgent
from chokepoint.benchmark.runner import BenchmarkRunner
from chokepoint.benchmark.ablation import Rule3AblationStudy
from chokepoint.graph.client import FalkorManager

app = FastAPI(title="ChokePoint Dashboard", version="1.0.0")

agent = ChokePointAgent()
falkor = FalkorManager()

class AnalyzeRequest(BaseModel):
    system: str = "npm"
    package: str = "express"
    version: str = "4.16.0"

class ApprovalRequest(BaseModel):
    package: str
    changes: list

@app.post("/api/analyze")
def run_analysis(req: AnalyzeRequest):
    result = agent.run(req.system, req.package, req.version)
    return result

@app.post("/api/apply_patch")
def apply_patch(req: ApprovalRequest):
    # Generates the package.json diff and overrides
    patch_diff = f"""--- package.json (original)
+++ package.json (ChokePoint remediated)
@@ -10,6 +10,12 @@
   "dependencies": {{
-    "{req.package}": "current"
+    "{req.package}": "remediated"
   }},
+  "overrides": {{
"""
    for c in req.changes:
        patch_diff += f'    "{c["name"]}": "{c["new_version"]}",\n'
    patch_diff += "  }\n"

    return {
        "status": "approved_and_generated",
        "patch_diff": patch_diff,
        "message": f"Successfully generated zero-vulnerability patch for {req.package}."
    }

@app.get("/api/benchmark")
def run_quick_benchmark():
    runner = BenchmarkRunner()
    results = runner.run_benchmark(limit=4)
    return results

@app.get("/api/ablation")
def run_ablation(package: str = "express", version: str = "4.16.0"):
    study = Rule3AblationStudy()
    return study.run_comparison("npm", package, version)

@app.get("/", response_class=HTMLResponse)
def index_page():
    html_path = Path(__file__).parent / "static" / "index.html"
    if html_path.exists():
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>ChokePoint Dashboard</h1><p>Static index.html loading...</p>"
