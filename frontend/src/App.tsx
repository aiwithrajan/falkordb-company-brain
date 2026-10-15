import { useEffect, useState } from "react";
import type { OverviewData, InvestigationResponse, GraphNode } from "./types";
import { CompanyOverview } from "./components/CompanyOverview";
import { InvestigationPanel } from "./components/InvestigationPanel";
import { GraphCanvas } from "./components/GraphCanvas";
import { NodeDetailDrawer } from "./components/NodeDetailDrawer";
import { EvidenceModal } from "./components/EvidenceModal";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "/api";

export function App() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [evidenceUri, setEvidenceUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    }
  };

  const runInvestigation = async (question: string) => {
    setIsLoading(true);
    setSelectedNode(null);
    try {
      const res = await fetch(`${API_BASE}/investigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setInvestigation(data);
      fetchOverview();
    } catch (err) {
      console.error("Investigation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCorrection = async (claimId: string) => {
    setIsApproving(true);
    try {
      await fetch(`${API_BASE}/claims/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_id: claimId, reviewed_by: "Alex Chen (VP Eng)" }),
      });
      // Re-run investigation with updated graph
      if (investigation) {
        await runInvestigation(investigation.question);
      }
      fetchOverview();
    } catch (err) {
      console.error("Failed to approve correction:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch(`${API_BASE}/reset`, { method: "POST" });
      await fetchOverview();
      await runInvestigation("Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.");
    } catch (err) {
      console.error("Failed to reset graph:", err);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    runInvestigation("Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "16px", background: "#090d16", overflow: "hidden" }}>
      {/* Top Header & KPI Bar */}
      <CompanyOverview overview={overview} onReset={handleReset} isResetting={isResetting} />

      {/* Main Split Layout: Left 45% (Chat/Trace) | Right 55% (Graph Canvas) */}
      <div style={{ display: "grid", gridTemplateColumns: "45% 55%", gap: "16px", flex: 1, minHeight: 0 }}>
        {/* Left Side: Ask the Company & Investigation Trace */}
        <div style={{ height: "100%", overflow: "hidden" }}>
          <InvestigationPanel
            onInvestigate={runInvestigation}
            isLoading={isLoading}
            investigation={investigation}
            onApproveCorrection={handleApproveCorrection}
            isApproving={isApproving}
            onOpenEvidence={(uri) => setEvidenceUri(uri)}
          />
        </div>

        {/* Right Side: Interactive Subgraph Visualizer */}
        <div style={{ position: "relative", height: "100%" }}>
          {investigation?.subgraph ? (
            <GraphCanvas
              subgraph={investigation.subgraph}
              onSelectNode={(node) => setSelectedNode(node)}
              selectedNodeId={selectedNode?.id}
            />
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#64748b" }}>
              Loading FalkorDB Subgraph...
            </div>
          )}

          {/* Node Property Inspector Overlay */}
          <NodeDetailDrawer
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onOpenEvidence={(uri) => setEvidenceUri(uri)}
          />
        </div>
      </div>

      {/* Slide-over Evidence Drawer */}
      <EvidenceModal sourceUri={evidenceUri} onClose={() => setEvidenceUri(null)} />
    </div>
  );
}

export default App;
