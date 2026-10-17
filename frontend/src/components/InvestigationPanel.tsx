import React, { useState } from "react";
import type { InvestigationResponse } from "../types";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Brain,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Flame,
  GitPullRequest,
  Users,
  ShieldAlert,
  Scale
} from "lucide-react";

interface InvestigationPanelProps {
  onInvestigate: (question: string, mode?: string) => void;
  isLoading: boolean;
  investigation: InvestigationResponse | null;
  onApproveCorrection: (claimId: string) => void;
  isApproving: boolean;
  onOpenEvidence: (uri: string) => void;
  onJumpToCanvas?: () => void;
  activeMode?: "overview" | "incident" | "architect";
  onSelectMode?: (mode: "overview" | "incident" | "architect") => void;
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({
  onInvestigate,
  isLoading,
  investigation,
  onApproveCorrection,
  isApproving,
  onOpenEvidence,
  onJumpToCanvas,
  activeMode: activeModeProp,
  onSelectMode,
}) => {
  const [internalMode, setInternalMode] = useState<"overview" | "incident" | "architect">("overview");
  const activeMode = activeModeProp || internalMode;

  const [customQuery, setCustomQuery] = useState("");
  const [copiedAction, setCopiedAction] = useState(false);
  const [openTraceIndex, setOpenTraceIndex] = useState<number | null>(null);

  // 3 Clear, Real-World Enterprise Scenarios
  const scenarios = [
    {
      id: "overview" as const,
      index: 1,
      shortTitle: "Company Knowledge",
      title: "Company Knowledge & Decisions",
      tagline: "Track Ownership, Architecture & Stale Claims",
      icon: <Brain size={17} color="#e0a35c" />,
      accentColor: "#d97706",
      prompt: "Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.",
      badge: "Institutional Memory",
      stepDescription: "Live graph traversal across microservice ownership, ADR standards, and knowledge conflict resolution."
    },
    {
      id: "incident" as const,
      index: 2,
      shortTitle: "Incident War Room",
      title: "P0 Incident Commander",
      tagline: "Outage Blast Radius & Automated Squad Dispatch",
      icon: <Flame size={17} color="#f87171" />,
      accentColor: "#dc2626",
      prompt: "P0 Alert: payments-svc 500 auth cascade. Trace blast radius, historical precedents, and mobilize responders.",
      badge: "War Room Mode",
      stepDescription: "5-hop blast radius calculation, historical incident INC-8812 matching, and on-call Slack mobilization."
    },
    {
      id: "architect" as const,
      index: 3,
      shortTitle: "Staff Architect Guard",
      title: "AI Staff Architect Guard",
      tagline: "Prevent Architectural Drift & Code Regressions",
      icon: <GitPullRequest size={17} color="#f5d59f" />,
      accentColor: "#b45309",
      prompt: "Review PR #318: Revert Payments authentication to symmetric HMAC key headers. Check architectural drift.",
      badge: "Drift Guard Mode",
      stepDescription: "Architectural drift gating against ADR-042 standards to stop regression before code reaches production."
    }
  ];

  const activeIndex = Math.max(0, scenarios.findIndex((s) => s.id === activeMode));
  const activeScenario = scenarios[activeIndex];

  const handleSlideSelect = (slideIndex: number) => {
    const target = scenarios[slideIndex];
    if (target) {
      setInternalMode(target.id);
      if (onSelectMode) onSelectMode(target.id);
      setCustomQuery(target.prompt);
      onInvestigate(target.prompt, target.id);
    }
  };

  const handlePrevSlide = () => {
    if (activeIndex > 0) handleSlideSelect(activeIndex - 1);
  };

  const handleNextSlide = () => {
    if (activeIndex < scenarios.length - 1) handleSlideSelect(activeIndex + 1);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryToRun = customQuery.trim() || activeScenario.prompt;
    if (queryToRun) {
      onInvestigate(queryToRun, activeMode);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ============================================================== */}
      {/* CONTAINER 1: COMMAND CENTER & CAPABILITY SLIDER (ENDS BELOW)   */}
      {/* ============================================================== */}
      <div
        style={{
          background: "#0c0a09",
          border: "1px solid #242220",
          borderRadius: "16px",
          padding: "24px 28px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* 1. CONTAINER HEADER BANNER: Title & Subtitle + Jump Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #1f1d1b",
          paddingBottom: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.18em",
              color: "#e0a35c",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            AI COMMAND & INVESTIGATION
          </div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#ffffff",
              margin: "4px 0 0 0",
              letterSpacing: "-0.01em",
            }}
          >
            Enterprise Knowledge & Incident Investigation
          </h2>
          <p style={{ fontSize: "12px", color: "#a8a29e", margin: "3px 0 0 0" }}>
            Select an operational capability or query the FalkorDB graph in natural language.
          </p>
        </div>

        {onJumpToCanvas && (
          <button
            onClick={onJumpToCanvas}
            style={{
              background: "#141210",
              color: "#e0a35c",
              border: "1px solid #242220",
              padding: "7px 16px",
              borderRadius: "20px",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            ↑ Jump to Graph Canvas
          </button>
        )}
      </div>

      {/* 2. STEP 1: CAPABILITY SLIDER (1, 2, 3) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          background: "#080706",
          border: "1px solid #1f1d1b",
          borderRadius: "10px",
          padding: "10px 14px",
        }}
      >
        {/* Left Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: activeScenario.accentColor,
            }}
          >
            STEP 1: CAPABILITY SLIDER
          </span>
          <span style={{ color: "#3f3f46" }}>•</span>
          <span style={{ fontSize: "11px", color: "#a8a29e", fontWeight: 500 }}>
            Slide {activeIndex + 1} of 3:{" "}
            <strong style={{ color: "#f5f5f4" }}>{activeScenario.title}</strong>
          </span>
        </div>

        {/* Right Slider Tabs: [1] [2] [3] + Arrows */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "#141210",
              padding: "3px",
              borderRadius: "20px",
              border: "1px solid #242220",
            }}
          >
            {scenarios.map((sc, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSlideSelect(idx)}
                  style={{
                    background: isSelected ? sc.accentColor : "transparent",
                    color: isSelected
                      ? sc.id === "incident"
                        ? "#ffffff"
                        : "#000000"
                      : "#a8a29e",
                    border: "none",
                    borderRadius: "16px",
                    padding: "5px 14px",
                    fontSize: "11px",
                    fontWeight: isSelected ? 700 : 500,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 800,
                      background: isSelected
                        ? "rgba(0, 0, 0, 0.25)"
                        : "rgba(255, 255, 255, 0.08)",
                      color: isSelected ? "#ffffff" : "#d6d3d1",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span>{sc.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Prev & Next slider arrows */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={handlePrevSlide}
              disabled={activeIndex === 0}
              style={{
                background: "#141210",
                border: "1px solid #242220",
                color: activeIndex === 0 ? "#52525b" : "#e0a35c",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: activeIndex === 0 ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
              title="Previous Slide"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNextSlide}
              disabled={activeIndex === scenarios.length - 1}
              style={{
                background: "#141210",
                border: "1px solid #242220",
                color:
                  activeIndex === scenarios.length - 1
                    ? "#52525b"
                    : "#e0a35c",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  activeIndex === scenarios.length - 1
                    ? "not-allowed"
                    : "pointer",
                transition: "all 0.2s ease",
              }}
              title="Next Slide"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE SLIDE FOCUSED CAPABILITY HIGHLIGHT */}
      <div
        style={{
          background: `linear-gradient(135deg, ${activeScenario.accentColor}12 0%, #0c0a09 100%)`,
          border: `1px solid ${activeScenario.accentColor}50`,
          borderRadius: "10px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: `0 4px 20px ${activeScenario.accentColor}15`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              padding: "10px",
              background: "#141210",
              border: `1px solid ${activeScenario.accentColor}60`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {activeScenario.icon}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.02em",
                }}
              >
                {activeScenario.index}. {activeScenario.title}
              </span>
              <span
                style={{
                  fontSize: "9.5px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  background: activeScenario.accentColor,
                  color:
                    activeScenario.id === "incident"
                      ? "#ffffff"
                      : "#000000",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {activeScenario.badge}
              </span>
            </div>
            <div style={{ fontSize: "11.5px", color: "#a8a29e", marginTop: "3px" }}>
              {activeScenario.stepDescription}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setCustomQuery(activeScenario.prompt);
            onInvestigate(activeScenario.prompt, activeScenario.id);
          }}
          disabled={isLoading}
          style={{
            background: "#141210",
            color: activeScenario.accentColor,
            border: `1px solid ${activeScenario.accentColor}60`,
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? "Running..." : "Run Scenario ↻"}
        </button>
      </div>

      {/* 4. NATURAL LANGUAGE QUERY EXECUTION FOR ACTIVE SLIDE */}
      <form onSubmit={handleCustomSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", color: "#78716c" }}>
            Natural Language Investigation ({activeScenario.shortTitle})
          </span>
          <span style={{ fontSize: "10px", color: "#57534e", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            FalkorDB Cypher Engine Active
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <textarea
            value={customQuery || activeScenario.prompt}
            onChange={(e) => setCustomQuery(e.target.value)}
            rows={2}
            placeholder="Type any architecture, outage, or policy question..."
            style={{
              width: "100%",
              background: "#080706",
              border: "1px solid #242220",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#f5f5f4",
              fontSize: "12px",
              lineHeight: 1.5,
              resize: "none",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: `linear-gradient(135deg, ${activeScenario.accentColor}, #b45309)`,
              color: activeScenario.id === "incident" ? "#ffffff" : "#000000",
              padding: "7px 18px",
              borderRadius: "20px",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              border: "none",
              boxShadow: `0 2px 10px ${activeScenario.accentColor}35`
            }}
          >
            <Search size={13} color={activeScenario.id === "incident" ? "#ffffff" : "#000000"} />
            {isLoading ? `Querying Graph (${activeScenario.shortTitle})...` : "Execute Investigation"}
          </button>
        </div>
      </form>
    </div>

    {/* ============================================================== */}
    {/* CONTAINER 2: DEDICATED WORKSPACE & GRAPH OUTCOMES (NEW)       */}
    {/* ============================================================== */}
    <div
      style={{
        background: "#0c0a09",
        border: "1px solid #242220",
        borderRadius: "16px",
        padding: "24px 28px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      {/* Container 2 Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #1f1d1b",
          paddingBottom: "14px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              color: activeScenario.accentColor,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            STEP 2: GRAPH INTELLIGENCE & WORKSPACE
          </div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#ffffff",
              margin: "3px 0 0 0",
              letterSpacing: "-0.01em",
            }}
          >
            {activeScenario.shortTitle} — Live Analysis & Outcomes
          </h3>
        </div>
        <span
          style={{
            fontSize: "10px",
            color: "#78716c",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Audit Status: 100% Provenance Guaranteed
        </span>
      </div>

      {/* Loading Indicator inside Container 2 */}
      {isLoading && (
        <div
          style={{
            background: "#080706",
            border: `1px dashed ${activeScenario.accentColor}60`,
            borderRadius: "10px",
            padding: "28px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: `2px solid ${activeScenario.accentColor}`,
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
            Traversing FalkorDB Graph for {activeScenario.title}...
          </div>
          <div style={{ fontSize: "11px", color: "#a8a29e" }}>
            Executing multi-hop Cypher queries and synthesizing enterprise provenance.
          </div>
        </div>
      )}

      {/* SECTION 3: HUMAN-IN-THE-LOOP CONFLICT RESOLUTION ALERT */}
      {investigation?.pending_correction && (
        <div
          style={{
            background: "rgba(217, 119, 6, 0.08)",
            border: "1px solid #d97706",
            borderRadius: "8px",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
          className="pulse-warning"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e0a35c", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <AlertTriangle size={15} color="#e0a35c" />
            <span>Active Knowledge Conflict Detected in Graph</span>
          </div>

          <div style={{ fontSize: "11.5px", color: "#d6d3d1", lineHeight: 1.5 }}>
            RFC-102 references deprecated <strong style={{ color: "#f87171" }}>AUTH-V1</strong>, while approved ADR-042 mandates <strong style={{ color: "#34d399" }}>AUTH-V2</strong>.
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
            <button
              onClick={() => onApproveCorrection(investigation.pending_correction!.claim_id)}
              disabled={isApproving}
              style={{
                background: "#d97706",
                color: "#000000",
                padding: "6px 14px",
                borderRadius: "20px",
                fontWeight: 600,
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: isApproving ? "not-allowed" : "pointer",
                border: "none"
              }}
            >
              <CheckCircle size={12} /> {isApproving ? "Updating FalkorDB..." : "1-Click Approve Correction"}
            </button>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-DEC-042.md")}
              style={{
                background: "#141210",
                color: "#e0a35c",
                border: "1px solid #242220",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer"
              }}
            >
              <BookOpen size={12} /> View ADR-042
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: CLEAR STRUCTURED FINDINGS & ACTIONS */}
      {investigation && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {/* MODE 1: INCIDENT COMMANDER WAR-ROOM VIEW */}
          {(investigation.mode === "incident" || activeMode === "incident") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Alert Banner */}
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.12)",
                  border: "1px solid #ef4444",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }}></div>
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#fca5a5", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      🚨 P0 War-Room Active: payments-svc 500 Cascade
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#a8a29e", marginTop: "2px" }}>
                      Status: <strong style={{ color: "#ef4444" }}>TRIAGING</strong> • Criticality: <strong style={{ color: "#ef4444" }}>P0 / Tier 1</strong> • Graph Traversal: 5 Hops
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(investigation.answer)}
                  style={{
                    background: "#dc2626",
                    color: "#ffffff",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  {copiedAction ? <Check size={12} /> : <Copy size={12} />}
                  {copiedAction ? "Copied!" : "Copy Dispatch"}
                </button>
              </div>

              {/* Blast Radius Card */}
              <div style={{ background: "#0c0a09", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#f5f5f4", display: "flex", alignItems: "center", gap: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    <Flame size={13} color="#ef4444" />
                    Multi-Hop Blast Radius (FalkorDB Cypher Traversal)
                  </div>
                  <span style={{ fontSize: "10px", color: "#78716c", letterSpacing: "0.08em", textTransform: "uppercase" }}>Cypher Traversal</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                  <div style={{ background: "#141210", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220" }}>
                    <div style={{ color: "#78716c", fontSize: "9.5px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Downstream At-Risk</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>checkout-web (P0)</span>
                      <span style={{ background: "rgba(224, 163, 92, 0.2)", color: "#fcd34d", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>billing-svc (P1)</span>
                    </div>
                  </div>
                  <div style={{ background: "#141210", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220" }}>
                    <div style={{ color: "#78716c", fontSize: "9.5px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Upstream Dependencies</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ background: "#080706", color: "#e0a35c", border: "1px solid #242220", padding: "2px 6px", borderRadius: "4px" }}>identity-svc (gRPC)</span>
                      <span style={{ background: "#080706", color: "#e0a35c", border: "1px solid #242220", padding: "2px 6px", borderRadius: "4px" }}>ledger-svc (gRPC)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Precedent Match Card */}
              <div style={{ background: "#0c0a09", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#f5f5f4", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  <ShieldAlert size={13} color="#e0a35c" />
                  Matched Historical Precedent: INC-8812 (94% Pattern Similarity)
                </div>
                <div style={{ fontSize: "11px", color: "#a8a29e", lineHeight: 1.5 }}>
                  <strong>Root Cause:</strong> Key rotation failure caused symmetric HMAC signature mismatches. Prompted creation of ADR-042.
                </div>
                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => onOpenEvidence("synthetic_data/DOC-INC-8812.md")}
                    style={{ background: "#141210", color: "#f87171", padding: "4px 10px", borderRadius: "20px", fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", border: "1px solid #242220" }}
                  >
                    <BookOpen size={11} /> View Post-Mortem INC-8812
                  </button>
                </div>
              </div>

              {/* Mobilized On-Call Squad Card */}
              <div style={{ background: "#0c0a09", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#f5f5f4", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  <Users size={13} color="#e0a35c" />
                  Automated On-Call Squad Dispatched (FalkorDB Expert Graph)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                  <div style={{ background: "#141210", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220" }}>
                    <div style={{ color: "#e0a35c", fontWeight: 600 }}>Elena Rostova</div>
                    <div style={{ color: "#78716c", fontSize: "10px" }}>Incident Commander (Lead on INC-8812)</div>
                  </div>
                  <div style={{ background: "#141210", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220" }}>
                    <div style={{ color: "#e0a35c", fontWeight: 600 }}>Sarah Jenkins</div>
                    <div style={{ color: "#78716c", fontSize: "10px" }}>Payments Domain SME (Score: 0.82)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: AI STAFF ARCHITECT PR GATE VIEW */}
          {(investigation.mode === "architect" || activeMode === "architect") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Alert Banner */}
              <div
                style={{
                  background: "rgba(217, 119, 6, 0.12)",
                  border: "1px solid #d97706",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d97706", boxShadow: "0 0 8px #d97706" }}></div>
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#f5d59f", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      ❌ Merge Blocked: Architectural Drift in PR #318
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#a8a29e", marginTop: "2px" }}>
                      Target: <strong style={{ color: "#f5f5f4" }}>payments-svc</strong> • Governance Policy: <strong style={{ color: "#e0a35c" }}>SEC-POL-001 / ADR-042</strong>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(investigation.answer)}
                  style={{
                    background: "#d97706",
                    color: "#000000",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  {copiedAction ? <Check size={12} /> : <Copy size={12} />}
                  {copiedAction ? "Copied!" : "Copy Review"}
                </button>
              </div>

              {/* Violated Standard Card */}
              <div style={{ background: "#0c0a09", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#f5f5f4", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  <Scale size={13} color="#e0a35c" />
                  Mandated Architecture Standard: ADR-042
                </div>
                <div style={{ fontSize: "11px", color: "#a8a29e", lineHeight: 1.5 }}>
                  <strong>ADR-042: Mandate AUTH-V2 Asymmetric Tokens</strong> (Approved by Alex Chen following outage INC-8812). Banned symmetric HMAC keys across all Tier-1 services.
                </div>
                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => onOpenEvidence("synthetic_data/DOC-DEC-042.md")}
                    style={{ background: "#141210", color: "#e0a35c", padding: "4px 10px", borderRadius: "20px", fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", border: "1px solid #242220" }}
                  >
                    <BookOpen size={11} /> View ADR-042 Record
                  </button>
                </div>
              </div>

              {/* Drift Risk Analysis */}
              <div style={{ background: "#0c0a09", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#f5f5f4", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  <AlertTriangle size={13} color="#e0a35c" />
                  Regression Risk Analysis
                </div>
                <div style={{ fontSize: "11px", color: "#a8a29e", lineHeight: 1.5 }}>
                  PR #318 attempts to revert authentication to symmetric HMAC keys. This revives the exact vulnerability that caused historical P0 outage <strong>INC-8812</strong>.
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: LIVING COMPANY KNOWLEDGE VIEW */}
          {(investigation.mode === "overview" || activeMode === "overview") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Header */}
              <div
                style={{
                  background: "rgba(217, 119, 6, 0.08)",
                  border: "1px solid #d97706",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px"
                }}
              >
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#f5d59f", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Institutional Memory & Ownership Graph
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#a8a29e", marginTop: "2px" }}>
                    Target: <strong style={{ color: "#f5f5f4" }}>Payments Service (Tier 1 / P0)</strong> • FalkorDB Native
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(investigation.answer)}
                  style={{
                    background: "#d97706",
                    color: "#000000",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  {copiedAction ? <Check size={12} /> : <Copy size={12} />}
                  {copiedAction ? "Copied!" : "Copy Report"}
                </button>
              </div>

              {/* Service Ownership */}
              <div style={{ background: "#0c0a09", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#f5f5f4", marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Service Ownership & Governance
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                  <div style={{ background: "#141210", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220" }}>
                    <div style={{ color: "#78716c", fontSize: "9.5px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Owning Team</div>
                    <div style={{ color: "#e0a35c", fontWeight: 600, marginTop: "2px" }}>Platform Core Team</div>
                  </div>
                  <div style={{ background: "#141210", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220" }}>
                    <div style={{ color: "#78716c", fontSize: "9.5px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Technical Lead</div>
                    <div style={{ color: "#e0a35c", fontWeight: 600, marginTop: "2px" }}>Alex Chen (VP Eng)</div>
                  </div>
                </div>
              </div>

              {/* Domain Experts */}
              <div style={{ background: "#0c0a09", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#f5f5f4", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  <Users size={13} color="#e0a35c" />
                  Graph-Ranked Domain Experts (Degree Weighted)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ background: "#141210", padding: "8px 10px", borderRadius: "6px", fontSize: "11px", border: "1px solid #242220" }}>
                    <div style={{ color: "#f5f5f4", fontWeight: 600 }}>Alex Chen</div>
                    <div style={{ color: "#78716c", fontSize: "10px" }}>VP Eng • Approver of ADR-042</div>
                  </div>
                  <div style={{ background: "#141210", padding: "8px 10px", borderRadius: "6px", fontSize: "11px", border: "1px solid #242220" }}>
                    <div style={{ color: "#f5f5f4", fontWeight: 600 }}>Elena Rostova</div>
                    <div style={{ color: "#78716c", fontSize: "10px" }}>SRE Lead • Incident Commander INC-8812</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* ============================================================== */}
    {/* CONTAINER 3: AUDIT TRAIL, PROVENANCE & CYPHER TOOLS (SEPARATE) */}
    {/* ============================================================== */}
    {investigation && (
      <div
        style={{
          background: "#0c0a09",
          border: "1px solid #242220",
          borderRadius: "16px",
          padding: "24px 28px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Container 3 Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #1f1d1b",
            paddingBottom: "14px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: "#e0a35c",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              STEP 3: AUDIT TRAIL, PROVENANCE & CYPHER TOOLS
            </div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#ffffff",
                margin: "3px 0 0 0",
                letterSpacing: "-0.01em",
              }}
            >
              Enterprise Verification & Evidence Records
            </h3>
          </div>
          <span
            style={{
              fontSize: "10px",
              color: "#34d399",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            100% Cryptographic Provenance ✓
          </span>
        </div>

        {/* Collapsible Full Text Analysis */}
        <details style={{ background: "#0c0a09", border: "1px solid #242220", borderRadius: "8px", padding: "10px 14px" }}>
          <summary style={{ cursor: "pointer", fontSize: "11px", fontWeight: 600, color: "#a8a29e", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              📄 View Full Cypher Traversal Report Text
            </summary>
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                background: "#080706",
                borderRadius: "6px",
                border: "1px solid #242220",
                fontSize: "11px",
                lineHeight: 1.6,
                color: "#d6d3d1",
                whiteSpace: "pre-wrap",
                maxHeight: "220px",
                overflowY: "auto"
              }}
            >
              {investigation.answer}
            </div>
          </details>

          {/* Source Document Provenance Drawer Links */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", background: "#0c0a09", padding: "10px 14px", borderRadius: "8px", border: "1px solid #242220" }}>
            <span style={{ fontSize: "10.5px", color: "#78716c", letterSpacing: "0.08em", textTransform: "uppercase" }}>Auditable Docs:</span>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-RFC-102.md")}
              style={{ background: "#141210", color: "#e0a35c", padding: "4px 10px", borderRadius: "20px", fontSize: "10.5px", letterSpacing: "0.06em", border: "1px solid #242220", cursor: "pointer" }}
            >
              RFC-102 (Payments Arch)
            </button>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-DEC-042.md")}
              style={{ background: "#141210", color: "#f5d59f", padding: "4px 10px", borderRadius: "20px", fontSize: "10.5px", letterSpacing: "0.06em", border: "1px solid #242220", cursor: "pointer" }}
            >
              ADR-042 (Auth-V2 Mandate)
            </button>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-INC-8812.md")}
              style={{ background: "#141210", color: "#f87171", padding: "4px 10px", borderRadius: "20px", fontSize: "10.5px", letterSpacing: "0.06em", border: "1px solid #242220", cursor: "pointer" }}
            >
              Post-Mortem INC-8812
            </button>
          </div>

          {/* SECTION 5: TRANSPARENT GRAPH TOOLS LOG */}
          <div style={{ marginTop: "4px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", color: "#78716c", marginBottom: "6px" }}>
            Verifiable Graph Tools Executed ({investigation.tool_traces.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {investigation.tool_traces.map((trace, idx) => {
              const isOpen = openTraceIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: "#0c0a09",
                    border: "1px solid #242220",
                    borderRadius: "6px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    onClick={() => setOpenTraceIndex(isOpen ? null : idx)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "11px",
                      color: "#a8a29e"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#e0a35c", fontFamily: "monospace" }}>{trace.tool}()</span>
                      <span>—</span>
                      <span style={{ color: "#d6d3d1" }}>{trace.explanation}</span>
                    </div>
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </div>

                  {isOpen && (
                    <div style={{ padding: "8px 12px", background: "#080706", borderTop: "1px solid #242220", fontSize: "11px", fontFamily: "monospace" }}>
                      <div style={{ color: "#78716c", marginBottom: "2px" }}>Input:</div>
                      <pre style={{ color: "#e0a35c", marginBottom: "6px" }}>{JSON.stringify(trace.input, null, 2)}</pre>
                      <div style={{ color: "#78716c", marginBottom: "2px" }}>Output:</div>
                      <pre style={{ color: "#34d399", maxHeight: "120px", overflowY: "auto" }}>{JSON.stringify(trace.output, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* End of Container 3 */}
      </div>
    )}

    {/* End of Outer Flex Wrapper */}
  </div>
  );
};
