import React, { useState } from "react";
import type { InvestigationResponse } from "../types";
import { Search, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Sparkles, BookOpen, ShieldAlert, Scale, Brain } from "lucide-react";

interface InvestigationPanelProps {
  onInvestigate: (question: string, mode?: string) => void;
  isLoading: boolean;
  investigation: InvestigationResponse | null;
  onApproveCorrection: (claimId: string) => void;
  isApproving: boolean;
  onOpenEvidence: (uri: string) => void;
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({
  onInvestigate,
  isLoading,
  investigation,
  onApproveCorrection,
  isApproving,
  onOpenEvidence,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "incident" | "architect">("overview");
  const [inputQuestion, setInputQuestion] = useState(
    "Explain how Payments works, who owns it, and what could be affected if Identity authentication changes."
  );
  const [openTraceIndex, setOpenTraceIndex] = useState<number | null>(null);

  const modePresets = {
    overview: "Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.",
    incident: "P0 Alert: payments-svc 500 auth cascade. Trace blast radius, historical precedents, and mobilize responders.",
    architect: "Review PR #318: Revert Payments authentication to symmetric HMAC key headers. Check architectural drift."
  };

  const handleSelectMode = (mode: "overview" | "incident" | "architect") => {
    setActiveTab(mode);
    const q = modePresets[mode];
    setInputQuestion(q);
    onInvestigate(q, mode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuestion.trim()) onInvestigate(inputQuestion, activeTab);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        height: "100%",
        overflowY: "auto",
        paddingRight: "6px",
      }}
    >
      {/* 3-Mode Enterprise Switcher */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", background: "#0b1222", padding: "4px", borderRadius: "8px", border: "1px solid #1e293b" }}>
        <button
          type="button"
          onClick={() => handleSelectMode("overview")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "8px 6px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: activeTab === "overview" ? 600 : 400,
            background: activeTab === "overview" ? "#0891b2" : "transparent",
            color: activeTab === "overview" ? "#ffffff" : "#94a3b8",
            transition: "all 0.2s ease",
          }}
        >
          <Brain size={14} /> Company Brain
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode("incident")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "8px 6px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: activeTab === "incident" ? 600 : 400,
            background: activeTab === "incident" ? "#dc2626" : "transparent",
            color: activeTab === "incident" ? "#ffffff" : "#94a3b8",
            transition: "all 0.2s ease",
          }}
        >
          <ShieldAlert size={14} /> Incident Commander
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode("architect")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "8px 6px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: activeTab === "architect" ? 600 : 400,
            background: activeTab === "architect" ? "#7c3aed" : "transparent",
            color: activeTab === "architect" ? "#ffffff" : "#94a3b8",
            transition: "all 0.2s ease",
          }}
        >
          <Scale size={14} /> Staff Architect
        </button>
      </div>

      {/* Query Input Box */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ position: "relative" }}>
          <textarea
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            rows={3}
            placeholder="Ask anything about company architecture, ownership, incidents, or decisions..."
            style={{
              width: "100%",
              background: "#0f172a",
              border: "1px solid #243452",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#f8fafc",
              fontSize: "13px",
              lineHeight: 1.5,
              resize: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            Active Mode: <strong style={{ color: activeTab === "incident" ? "#f87171" : activeTab === "architect" ? "#a78bfa" : "#38bdf8" }}>{activeTab.toUpperCase()}</strong>
          </span>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: activeTab === "incident" ? "#dc2626" : activeTab === "architect" ? "#7c3aed" : "#0891b2",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            <Search size={14} /> {isLoading ? "Traversing FalkorDB..." : "Run Mode Triage"}
          </button>
        </div>
      </form>

      {/* Pending Knowledge Correction Banner */}
      {investigation?.pending_correction && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
          className="pulse-warning"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fbbf24", fontWeight: 600, fontSize: "13px" }}>
            <AlertTriangle size={18} />
            <span>Human-in-the-Loop Knowledge Correction Required</span>
          </div>

          <div style={{ fontSize: "12px", color: "#e2e8f0", lineHeight: 1.5 }}>
            {investigation.pending_correction.recommended_action}
            <div style={{ marginTop: "6px", fontSize: "11px", color: "#94a3b8" }}>
              • Stale Claim: <span style={{ color: "#f87171" }}>{investigation.pending_correction.stale_value}</span> ({investigation.pending_correction.source_doc_a})
              <br />
              • Approved Decision: <span style={{ color: "#34d399" }}>{investigation.pending_correction.approved_value}</span> ({investigation.pending_correction.source_doc_b})
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button
              onClick={() => onApproveCorrection(investigation.pending_correction!.claim_id)}
              disabled={isApproving}
              style={{
                background: "#059669",
                color: "#ffffff",
                padding: "6px 14px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: isApproving ? "not-allowed" : "pointer",
              }}
            >
              <CheckCircle size={14} /> {isApproving ? "Updating FalkorDB..." : "Approve Correction & Update Graph"}
            </button>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-DEC-042.md")}
              style={{
                background: "#1e293b",
                color: "#38bdf8",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <BookOpen size={14} /> Review ADR-042
            </button>
          </div>
        </div>
      )}

      {/* Synthesized Output */}
      {investigation && (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: activeTab === "incident" ? "#f87171" : activeTab === "architect" ? "#a78bfa" : "#38bdf8", fontWeight: 600, fontSize: "13px" }}>
              <Sparkles size={16} /> {activeTab === "incident" ? "Incident War-Room Briefing" : activeTab === "architect" ? "Architectural Drift Review" : "Verifiable Graph Findings"}
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Target: {investigation.target_service}</span>
          </div>

          <div
            style={{
              fontSize: "12.5px",
              color: "#cbd5e1",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {investigation.answer}
          </div>

          {/* Quick Evidence Buttons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid #1e293b", paddingTop: "10px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", alignSelf: "center" }}>Source Records:</span>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-RFC-102.md")}
              style={{ background: "#1e293b", color: "#94a3b8", padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}
            >
              📄 RFC-102 (Payments Arch)
            </button>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-DEC-042.md")}
              style={{ background: "#1e293b", color: "#94a3b8", padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}
            >
              ⚖️ ADR-042 (Auth-V2 Mandate)
            </button>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-INC-8812.md")}
              style={{ background: "#1e293b", color: "#94a3b8", padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}
            >
              🚨 Post-Mortem INC-8812
            </button>
          </div>
        </div>
      )}

      {/* Tool Execution Traces Accordion */}
      {investigation && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, marginBottom: "4px" }}>
            FalkorDB Tool Execution Steps ({investigation.tool_traces.length})
          </div>

          {investigation.tool_traces.map((trace, idx) => {
            const isOpen = openTraceIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "6px",
                  overflow: "hidden",
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
                    fontSize: "12px",
                    color: "#e2e8f0",
                    background: isOpen ? "#1e293b" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#06b6d4", fontFamily: "monospace" }}>{trace.tool}()</span>
                    <span style={{ color: "#64748b" }}>—</span>
                    <span style={{ color: "#cbd5e1" }}>{trace.explanation}</span>
                  </div>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {isOpen && (
                  <div style={{ padding: "10px 14px", background: "#090d16", borderTop: "1px solid #1e293b", fontSize: "11.5px", fontFamily: "monospace" }}>
                    <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Input:</div>
                    <pre style={{ color: "#38bdf8", marginBottom: "8px" }}>{JSON.stringify(trace.input, null, 2)}</pre>
                    <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Output:</div>
                    <pre style={{ color: "#34d399", maxHeight: "150px", overflowY: "auto" }}>{JSON.stringify(trace.output, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
