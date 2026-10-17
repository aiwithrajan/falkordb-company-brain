import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import type { OverviewData, InvestigationResponse, GraphNode } from "./types";
import { CompanyOverview } from "./components/CompanyOverview";
import { InvestigationPanel } from "./components/InvestigationPanel";
import { GraphCanvas } from "./components/GraphCanvas";
import { NodeDetailDrawer } from "./components/NodeDetailDrawer";
import { EvidenceModal } from "./components/EvidenceModal";
import { IngestModal } from "./components/IngestModal";
import { HomeHero } from "./components/HomeHero";
import { FeatureTourPage } from "./components/FeatureTourPage";
import { DocumentationPage } from "./components/DocumentationPage";
import { AIChatModal } from "./components/AIChatModal";
import { DEFAULT_OVERVIEW, DEFAULT_INVESTIGATION_OVERVIEW, getMockInvestigation } from "./fallbackData";

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
  const [overview, setOverview] = useState<OverviewData>(DEFAULT_OVERVIEW);
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(DEFAULT_INVESTIGATION_OVERVIEW);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [evidenceUri, setEvidenceUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"home" | "console" | "tour" | "docs">("home");

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

  useEffect(() => {
    (window as any).__selectNodeById = (nodeId: string) => {
      const nodes = investigation?.subgraph?.nodes || overview?.dependency_graph?.nodes || [];
      const target = nodes.find((n: GraphNode) => n.id === nodeId);
      if (target) setSelectedNode(target);
    };
    (window as any).__closeNodeDetail = () => setSelectedNode(null);
    (window as any).__setViewMode = (mode: "home" | "console" | "tour" | "docs") => setViewMode(mode);
    (window as any).__openIngest = () => setIsIngestOpen(true);
    (window as any).__closeIngest = () => setIsIngestOpen(false);
    (window as any).__setInvestigationMode = (mode: "overview" | "incident" | "architect") => handleSelectMode(mode);
  }, [investigation, overview]);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/overview`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      console.warn("Using offline / fallback graph overview:", err);
      setOverview((prev) => prev || DEFAULT_OVERVIEW);
    }
  };

  const runInvestigation = async (question: string, mode?: string) => {
    setIsLoading(true);
    setSelectedNode(null);
    const targetMode = mode || activeMode;
    if (mode) setActiveMode(mode as any);
    try {
      const res = await fetch(`${API_BASE}/investigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode: targetMode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await res.json();
      setInvestigation(data);
      fetchOverview();
    } catch (err) {
      console.warn("Using offline / fallback investigation:", err);
      const mock = getMockInvestigation(question, targetMode);
      setInvestigation(mock);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCorrection = async (claimId: string) => {
    setIsApproving(true);
    try {
      const res = await fetch(`${API_BASE}/claims/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_id: claimId, reviewed_by: "Alex Chen (VP Eng)" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (investigation) {
        await runInvestigation(investigation.question, activeMode);
      }
      fetchOverview();
    } catch (err) {
      console.warn("Applying client-side graph self-healing mutation:", err);
      // Mutate in-memory state
      setInvestigation((prev) => {
        if (!prev) return prev;
        const updatedNodes = prev.subgraph?.nodes?.map((n: GraphNode) =>
          n.id === claimId
            ? { ...n, properties: { ...n.properties, status: "superseded" } }
            : n
        );
        return {
          ...prev,
          pending_correction: undefined,
          conflict_data: {
            has_conflict: false,
            conflicts: [],
            historical_resolutions: prev.conflict_data?.conflicts || [],
            subgraph: prev.conflict_data?.subgraph,
          },
          subgraph: {
            ...prev.subgraph,
            nodes: updatedNodes || [],
          },
        };
      });
      setOverview((prev) => ({
        ...prev,
        counts: { ...prev.counts, active_conflicts: 0 },
      }));
    } finally {
      setIsApproving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchOverview();
      setActiveMode("overview");
      await runInvestigation("Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.", "overview");
    } catch (err) {
      console.warn("Resetting to default graph state:", err);
      setOverview(DEFAULT_OVERVIEW);
      setActiveMode("overview");
      setInvestigation(DEFAULT_INVESTIGATION_OVERVIEW);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    runInvestigation("Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.", "overview");
  }, []);

  if (viewMode === "home") {
    return (
      <>
        <HomeHero
          onEnterConsole={() => setIsIngestOpen(true)}
          companyName={overview?.company_name || "Nexora Cloud"}
          onOpenTour={() => setViewMode("tour")}
          onOpenDocs={() => setViewMode("docs")}
        />
        {/* Company Ingestion Wizard Gateway */}
        <IngestModal
          isOpen={isIngestOpen}
          onClose={() => setIsIngestOpen(false)}
          onIngestSuccess={() => {
            fetchOverview();
            setViewMode("console");
            runInvestigation("Explain service architecture, ownership, and dependencies.");
          }}
          onDirectEnter={() => {
            setViewMode("console");
          }}
        />
        <AIChatModal />
      </>
    );
  }

  if (viewMode === "docs") {
    return (
      <>
        <DocumentationPage
          onGoHome={() => setViewMode("home")}
          onEnterConsole={() => setViewMode("console")}
          onOpenTour={() => setViewMode("tour")}
        />
        <AIChatModal />
      </>
    );
  }

  if (viewMode === "tour") {
    return (
      <>
        <FeatureTourPage
          onGoHome={() => setViewMode("home")}
          onEnterConsole={(mode) => {
            if (mode) handleSelectMode(mode);
            setViewMode("console");
          }}
          onOpenIngest={() => setIsIngestOpen(true)}
        />
        <IngestModal
          isOpen={isIngestOpen}
          onClose={() => setIsIngestOpen(false)}
          onIngestSuccess={() => {
            fetchOverview();
            setViewMode("console");
            runInvestigation("Explain service architecture, ownership, and dependencies.");
          }}
          onDirectEnter={() => {
            setViewMode("console");
          }}
        />
        <AIChatModal />
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "20px 32px", background: "#050505", overflowY: "auto", overflowX: "hidden" }}>
      {/* Top Header & KPI Bar */}
      <CompanyOverview
        overview={overview}
        onReset={handleReset}
        isResetting={isResetting}
        onOpenIngest={() => setIsIngestOpen(true)}
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        onGoHome={() => setViewMode("home")}
        onOpenTour={() => setViewMode("tour")}
        onOpenDocs={() => setViewMode("docs")}
      />

      {/* SECTION 1: Full-Width FalkorDB Subgraph Canvas (Top Viewport) */}
      <div style={{ position: "relative", width: "100%", height: "calc(100vh - 210px)", minHeight: "580px", marginBottom: "32px" }}>
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
            <GraphCanvas
              subgraph={DEFAULT_OVERVIEW.dependency_graph}
              onSelectNode={(node) => setSelectedNode(node)}
              selectedNodeId={selectedNode?.id}
            />
          )}
        </ErrorBoundary>

        {/* Node Property Inspector Overlay */}
        <NodeDetailDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onOpenEvidence={(uri) => setEvidenceUri(uri)}
        />
      </div>

      {/* SECTION 2: Investigation & AI Capabilities (Unified Container with 1, 2, 3 Slider) */}
      <div id="investigation-section" style={{ width: "100%", maxWidth: "1240px", margin: "0 auto", paddingBottom: "48px" }}>
        <InvestigationPanel
          onInvestigate={runInvestigation}
          isLoading={isLoading}
          investigation={investigation}
          onApproveCorrection={handleApproveCorrection}
          isApproving={isApproving}
          onOpenEvidence={(uri) => setEvidenceUri(uri)}
          onJumpToCanvas={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          activeMode={activeMode}
          onSelectMode={handleSelectMode}
        />
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

      {/* Global Open-Source AI Copilot Chat */}
      <AIChatModal />
    </div>
  );
}

export default App;
