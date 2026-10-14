import json
import time
from pathlib import Path
from typing import Any, Dict, List

from chokepoint.agent.loop import ChokePointAgent
from chokepoint.graph.client import FalkorManager
from chokepoint.graph.algorithms import GraphAlgorithms

BENCHMARK_FILE = Path(__file__).parent / "data" / "packages.json"

class BenchmarkRunner:
    def __init__(self):
        self.agent = ChokePointAgent()
        self.falkor = FalkorManager()

    def run_benchmark(self, limit: int = 12) -> List[Dict[str, Any]]:
        with open(BENCHMARK_FILE, "r", encoding="utf-8") as f:
            packages = json.load(f)[:limit]

        results = []
        print(f"🚀 Running ChokePoint Benchmark across {len(packages)} packages...\n")

        for item in packages:
            system = item["system"]
            pkg = item["name"]
            ver = item["version"]
            print(f"==> Testing {pkg}@{ver}...")

            t0 = time.time()
            try:
                agent_res = self.agent.run(system, pkg, ver)
                total_duration = time.time() - t0

                if agent_res.get("status") == "clean":
                    results.append({
                        "package": f"{pkg}@{ver}",
                        "status": "clean",
                        "initial_advisories": 0,
                        "per_advisory_baseline_changes": 0,
                        "chokepoint_changes": 0,
                        "efficiency_gain_pct": 0,
                        "time_sec": round(total_duration, 2)
                    })
                    continue

                init_vulns = agent_res.get("initial_vulnerabilities", 0)
                unique_vuln_pkgs = len(agent_res.get("initial_vulnerable_packages", []))
                chokepoint_changes = agent_res.get("chokepoint_changes_count", 0)

                # Baseline 1: Standard scanner opens 1 fix per distinct vulnerable package
                baseline_per_advisory = max(unique_vuln_pkgs, 1)

                reduction = baseline_per_advisory - chokepoint_changes
                efficiency_gain = round((reduction / baseline_per_advisory) * 100, 1) if baseline_per_advisory > 0 else 0.0

                record = {
                    "package": f"{pkg}@{ver}",
                    "initial_vulnerable_paths": init_vulns,
                    "unique_vulnerable_packages": unique_vuln_pkgs,
                    "per_advisory_baseline_changes": baseline_per_advisory,
                    "chokepoint_changes": chokepoint_changes,
                    "reduction_in_changes": reduction,
                    "efficiency_gain_pct": efficiency_gain,
                    "verification_clean": agent_res.get("verification_proof", {}).get("is_clean", True),
                    "duration_sec": round(total_duration, 2)
                }
                results.append(record)
                print(f"    ✔ Done: {baseline_per_advisory} scanner changes -> {chokepoint_changes} ChokePoint cuts ({efficiency_gain}% reduction in PRs!)\n")
            except Exception as e:
                print(f"    ❌ Error running {pkg}@{ver}: {e}\n")
                results.append({"package": f"{pkg}@{ver}", "error": str(e)})

        return results

if __name__ == "__main__":
    runner = BenchmarkRunner()
    results = runner.run_benchmark(limit=3)
    print(json.dumps(results, indent=2))
