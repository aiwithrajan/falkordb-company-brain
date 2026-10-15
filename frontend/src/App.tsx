import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import type { OverviewData, InvestigationResponse, GraphNode } from "./types";
import { CompanyOverview } from "./components/CompanyOverview";
import { InvestigationPanel } from "./components/InvestigationPanel";
import { GraphCanvas } from "./components/GraphCanvas";
import { NodeDetailDrawer } from "./components/NodeDetailDrawer";
import { EvidenceModal } from "./components/EvidenceModal";
import { IngestModal } from "./components/IngestModal";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "/api";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "#f87171", background: "#1e1b4b", borderRadius: "8px", margin: "20px" }}>
          <h3>⚠️ Canvas Render Error</h3>
          <p style={{ fontFamily: "monospace", fontSize: "12px", marginTop: "8px" }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: "12px", background: "#3b82f6", color: "#fff", padding: "6px 12px", borderRadius: "4px" }}
          >
            Retry Render
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [evidenceUri, setEvidenceUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  const [activeMode, setActiveMode] = useState<"overview" | "incident" | "architect">("overview");

  const modePrompts = {
    overview: "Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.",
    incident: "P0 Alert: payments-svc 500 auth cascade. Trace blast radius, historical precedents, and mobilize responders.",
    architect: "Review PR #318: Revert Payments authentication to symmetric HMAC key headers. Check architectural drift."
  };

  const handleSelectMode = (mode: "overview" | "incident" | "architect") => {
    setActiveMode(mode);
    runInvestigation(modePrompts[mode], mode);
  };

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    }
  };

  const runInvestigation = async (question: string, mode?: string) => {
    setIsLoading(true);
    setSelectedNode(null);
    if (mode) setActiveMode(mode as any);
    try {
      const res = await fetch(`${API_BASE}/investigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode: mode || activeMode }),
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
      if (investigation) {
        await runInvestigation(investigation.question, activeMode);
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
      setActiveMode("overview");
      await runInvestigation("Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.", "overview");
    } catch (err) {
      console.error("Failed to reset graph:", err);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    runInvestigation("Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.", "overview");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "16px", background: "#090d16", overflowY: "auto", overflowX: "hidden" }}>
      {/* Top Header & KPI Bar */}
      <CompanyOverview
        overview={overview}
        onReset={handleReset}
        isResetting={isResetting}
        onOpenIngest={() => setIsIngestOpen(true)}
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
      />

      {/* Main Split Layout: Left 46% (Investigation Panel) | Right 54% (Graph Canvas) */}
      <div style={{ display: "grid", gridTemplateColumns: "46% 54%", gap: "16px", flex: 1, minHeight: "calc(100vh - 220px)", height: "auto" }}>
        {/* Left Side: Ask the Company & Investigation Trace */}
        <div style={{ height: "calc(100vh - 220px)", minHeight: "560px", overflowY: "auto", paddingRight: "8px" }}>
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
        <div style={{ position: "sticky", top: "16px", height: "calc(100vh - 220px)", minHeight: "560px" }}>
          <ErrorBoundary>
            {(investigation?.subgraph && investigation.subgraph.nodes && investigation.subgraph.nodes.length > 0) ? (
              <GraphCanvas
                subgraph={investigation.subgraph}
                onSelectNode={(node) => setSelectedNode(node)}
                selectedNodeId={selectedNode?.id}
              />
            ) : (overview?.dependency_graph && overview.dependency_graph.nodes && overview.dependency_graph.nodes.length > 0) ? (
              <GraphCanvas
                subgraph={overview.dependency_graph}
                onSelectNode={(node) => setSelectedNode(node)}
                selectedNodeId={selectedNode?.id}
              />
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#64748b" }}>
                Loading FalkorDB Subgraph...
              </div>
            )}
          </ErrorBoundary>

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

      {/* Company Ingestion Wizard Modal */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onIngestSuccess={() => {
          fetchOverview();
          runInvestigation("Explain service architecture, ownership, and dependencies.");
        }}
      />
    </div>
  );
}

export default App;
