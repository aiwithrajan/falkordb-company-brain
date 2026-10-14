import time
from typing import Any, Callable, Dict, List, Optional

from chokepoint.mcp.tools import ChokePointTools

class AgentExecutionTrace:
    def __init__(self):
        self.steps: List[Dict[str, Any]] = []
        self.start_time = time.time()

    def log_step(self, tool_name: str, input_args: Dict[str, Any], output_summary: Dict[str, Any], latency_ms: float):
        self.steps.append({
            "step": len(self.steps) + 1,
            "tool": tool_name,
            "input": input_args,
            "output": output_summary,
            "latency_ms": round(latency_ms, 2),
            "timestamp": time.time()
        })

    def get_total_duration_sec(self) -> float:
        return round(time.time() - self.start_time, 2)


class ChokePointAgent:
    def __init__(self, tools: Optional[ChokePointTools] = None):
        self.tools = tools or ChokePointTools()

    def run(
        self,
        system: str,
        package: str,
        version: str,
        max_tool_budget: int = 10,
        trace_callback: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        """
        Executes the agent loop:
        1. ingest_root
        2. find_exposure
        3. min_cut
        4. pick_version
        5. simulate_fix (GRAPH.COPY)
        6. explain
        Halts at Human Approval Gate.
        """
        trace = AgentExecutionTrace()
        root_key = f"{system.lower()}:{package}@{version}"
        graph_name = f"analysis:{system.lower()}:{package}:{version}"

        # Step 1: Ingest Root
        t0 = time.time()
        ingest_res = self.tools.ingest_root(system, package, version)
        lat = (time.time() - t0) * 1000
        step_log = {"tool": "ingest_root", "result": ingest_res["message"], "latency_ms": lat}
        trace.log_step("ingest_root", {"system": system, "package": package, "version": version}, ingest_res, lat)
        if trace_callback: trace_callback(step_log)

        # Step 2: Find Exposure
        t0 = time.time()
        exposure_res = self.tools.find_exposure(graph_name, root_key)
        lat = (time.time() - t0) * 1000
        step_log = {
            "tool": "find_exposure",
            "findings_count": exposure_res["total_reachable_vulnerabilities"],
            "vulnerable_pkgs": exposure_res["unique_vulnerable_packages"],
            "latency_ms": lat
        }
        trace.log_step("find_exposure", {"graph_name": graph_name, "root_key": root_key}, exposure_res, lat)
        if trace_callback: trace_callback(step_log)

        # If clean, nothing to fix
        if exposure_res["total_reachable_vulnerabilities"] == 0:
            return {
                "status": "clean",
                "message": f"Package {package}@{version} has 0 reachable vulnerable paths.",
                "trace": trace.steps,
                "duration_sec": trace.get_total_duration_sec()
            }

        # Step 3: Compute Minimum Cut
        t0 = time.time()
        min_cut_res = self.tools.min_cut(graph_name, root_key)
        lat = (time.time() - t0) * 1000
        cut_proposals = min_cut_res["cut_proposals"]
        step_log = {
            "tool": "min_cut",
            "packages_to_change": len(cut_proposals),
            "proposals": [p["name"] for p in cut_proposals],
            "latency_ms": lat
        }
        trace.log_step("min_cut", {"graph_name": graph_name, "root_key": root_key}, min_cut_res, lat)
        if trace_callback: trace_callback(step_log)

        # Step 4: Pick clean versions for the cut
        changes_to_simulate = []
        for p in cut_proposals:
            t0 = time.time()
            pkg_name = p["name"]
            curr_ver = p["current_version"]
            ver_res = self.tools.pick_version(system, pkg_name, curr_ver)
            lat = (time.time() - t0) * 1000
            clean_ver = ver_res.get("recommended_clean_version")
            changes_to_simulate.append({
                "name": pkg_name,
                "old_version": curr_ver,
                "new_version": clean_ver
            })
            trace.log_step("pick_version", {"package": pkg_name, "version": curr_ver}, ver_res, lat)
            if trace_callback:
                trace_callback({"tool": "pick_version", "package": pkg_name, "recommendation": f"{curr_ver} -> {clean_ver}", "latency_ms": lat})

        # Step 5: Simulate and verify on GRAPH.COPY
        t0 = time.time()
        sim_res = self.tools.simulate_fix(graph_name, root_key, changes_to_simulate)
        lat = (time.time() - t0) * 1000
        proof = sim_res["proof_result"]
        trace.log_step("simulate_fix", {"changes": changes_to_simulate}, sim_res, lat)
        if trace_callback:
            trace_callback({"tool": "simulate_fix", "proof": proof["proof"], "is_clean": proof["is_clean"], "latency_ms": lat})

        # Step 6: Explain cut and generate evidence
        t0 = time.time()
        explain_res = self.tools.explain(graph_name, root_key, changes_to_simulate)
        lat = (time.time() - t0) * 1000
        trace.log_step("explain", {"changes": changes_to_simulate}, explain_res, lat)
        if trace_callback:
            trace_callback({"tool": "explain", "explanation": explain_res["explanation"]["impact_summary"], "latency_ms": lat})

        # Final Package proposal stopped at Approval Gate
        approval_proposal = {
            "status": "awaiting_approval",
            "root_package": f"{package}@{version}",
            "initial_vulnerabilities": exposure_res["total_reachable_vulnerabilities"],
            "initial_vulnerable_packages": exposure_res["unique_vulnerable_packages"],
            "chokepoint_changes_count": len(changes_to_simulate),
            "proposed_changes": changes_to_simulate,
            "verification_proof": proof,
            "explanation": explain_res["explanation"],
            "trace": trace.steps,
            "total_duration_sec": trace.get_total_duration_sec()
        }

        return approval_proposal
