import React, { useState } from "react";
import type { InvestigationResponse } from "../types";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  ShieldAlert,
  Scale,
  Brain,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  GitPullRequest,
  Users
} from "lucide-react";

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
  const [activeMode, setActiveMode] = useState<"overview" | "incident" | "architect">("overview");
  const [customQuery, setCustomQuery] = useState("");
  const [copiedAction, setCopiedAction] = useState(false);
  const [openTraceIndex, setOpenTraceIndex] = useState<number | null>(null);

  // 3 Clear, Real-World Enterprise Scenarios
  const scenarios = [
    {
      id: "overview" as const,
      title: "Company Knowledge & Decisions",
      tagline: "Track Ownership, Architecture & Stale Claims",
      icon: <Brain size={18} color="#06b6d4" />,
      accentColor: "#0891b2",
      prompt: "Explain how Payments works, who owns it, and what could be affected if Identity authentication changes.",
      badge: "Institutional Memory"
    },
    {
      id: "incident" as const,
      title: "P0 Incident Commander",
      tagline: "Outage Blast Radius & Automated Squad Dispatch",
      icon: <Flame size={18} color="#ef4444" />,
      accentColor: "#dc2626",
      prompt: "P0 Alert: payments-svc 500 auth cascade. Trace blast radius, historical precedents, and mobilize responders.",
      badge: "Firefighting Mode"
    },
    {
      id: "architect" as const,
      title: "AI Staff Architect Guard",
      tagline: "Prevent Architectural Drift & Code Regressions",
      icon: <GitPullRequest size={18} color="#a855f7" />,
      accentColor: "#7c3aed",
      prompt: "Review PR #318: Revert Payments authentication to symmetric HMAC key headers. Check architectural drift.",
      badge: "Fire Prevention Mode"
    }
  ];

  const handleSelectScenario = (scenarioId: "overview" | "incident" | "architect") => {
    setActiveMode(scenarioId);
    const target = scenarios.find((s) => s.id === scenarioId);
    if (target) {
      setCustomQuery(target.prompt);
      onInvestigate(target.prompt, scenarioId);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuery.trim()) {
      onInvestigate(customQuery, activeMode);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingRight: "4px" }}>
      
      {/* SECTION 1: PROMINENT FEATURE SELECTOR CARDS */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>
            Step 1: Choose Enterprise Capability
          </span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Powered by FalkorDB Graph</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
          {scenarios.map((sc) => {
            const isSelected = activeMode === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                style={{
                  background: isSelected ? "rgba(15, 23, 42, 0.9)" : "#0f172a",
                  border: isSelected ? `2px solid ${sc.accentColor}` : "1px solid #1e293b",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? `0 0 15px -3px ${sc.accentColor}40` : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ padding: "8px", background: "#1e293b", borderRadius: "6px" }}>
                    {sc.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: isSelected ? "#ffffff" : "#e2e8f0" }}>
                      {sc.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {sc.tagline}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    background: isSelected ? sc.accentColor : "#1e293b",
                    color: isSelected ? "#ffffff" : "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}
                >
                  {sc.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PROMPT & QUERY EXECUTION BOX */}
      <form onSubmit={handleCustomSubmit} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>
            Step 2: Natural Language Investigation
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <textarea
            value={customQuery || scenarios.find(s => s.id === activeMode)?.prompt}
            onChange={(e) => setCustomQuery(e.target.value)}
            rows={2}
            placeholder="Type any architecture, outage, or policy question..."
            style={{
              width: "100%",
              background: "#090d16",
              border: "1px solid #334155",
              borderRadius: "6px",
              padding: "10px 12px",
              color: "#f8fafc",
              fontSize: "12px",
              lineHeight: 1.5,
              resize: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: activeMode === "incident" ? "#dc2626" : activeMode === "architect" ? "#7c3aed" : "#0891b2",
              color: "#ffffff",
              padding: "7px 16px",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            <Search size={14} /> {isLoading ? "Querying FalkorDB Graph..." : "Execute Investigation"}
          </button>
        </div>
      </form>

      {/* SECTION 3: HUMAN-IN-THE-LOOP CONFLICT RESOLUTION ALERT */}
      {investigation?.pending_correction && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
          className="pulse-warning"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fbbf24", fontWeight: 600, fontSize: "12.5px" }}>
            <AlertTriangle size={16} />
            <span>Active Knowledge Conflict Detected in Graph!</span>
          </div>

          <div style={{ fontSize: "11.5px", color: "#cbd5e1", lineHeight: 1.5 }}>
            RFC-102 references deprecated <strong style={{ color: "#f87171" }}>AUTH-V1</strong>, while approved ADR-042 requires <strong style={{ color: "#34d399" }}>AUTH-V2</strong>.
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
            <button
              onClick={() => onApproveCorrection(investigation.pending_correction!.claim_id)}
              disabled={isApproving}
              style={{
                background: "#059669",
                color: "#ffffff",
                padding: "6px 14px",
                borderRadius: "5px",
                fontWeight: 600,
                fontSize: "11.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: isApproving ? "not-allowed" : "pointer"
              }}
            >
              <CheckCircle size={13} /> {isApproving ? "Updating FalkorDB..." : "1-Click Approve Correction"}
            </button>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-DEC-042.md")}
              style={{
                background: "#1e293b",
                color: "#38bdf8",
                padding: "6px 12px",
                borderRadius: "5px",
                fontSize: "11.5px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <BookOpen size={13} /> View ADR-042
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
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }}></div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#fca5a5" }}>
                      🚨 P0 WAR-ROOM ACTIVE: payments-svc 500 Cascade
                    </div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                      Status: <strong style={{ color: "#ef4444" }}>TRIAGING</strong> • Criticality: <strong style={{ color: "#ef4444" }}>P0 / Tier 1</strong> • Graph Traversal: 5 Hops
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(investigation.answer)}
                  style={{
                    background: "#dc2626",
                    color: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  {copiedAction ? <Check size={12} /> : <Copy size={12} />}
                  {copiedAction ? "Copied!" : "📋 Copy Slack Dispatch"}
                </button>
              </div>

              {/* Blast Radius Card */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Flame size={14} color="#ef4444" />
                    Multi-Hop Blast Radius (FalkorDB Cypher Traversal)
                  </div>
                  <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>Traversal: Cypher Multi-Hop</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11.5px" }}>
                  <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", marginBottom: "4px" }}>Downstream At-Risk (Impact)</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ background: "rgba(239, 68, 68, 0.25)", color: "#fca5a5", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>checkout-web (P0)</span>
                      <span style={{ background: "rgba(245, 158, 11, 0.25)", color: "#fcd34d", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>billing-svc (P1)</span>
                    </div>
                  </div>
                  <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", marginBottom: "4px" }}>Upstream Dependencies</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ background: "#090d16", color: "#38bdf8", padding: "2px 6px", borderRadius: "4px" }}>identity-svc (gRPC)</span>
                      <span style={{ background: "#090d16", color: "#38bdf8", padding: "2px 6px", borderRadius: "4px" }}>ledger-svc (gRPC)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Precedent Match Card */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <ShieldAlert size={14} color="#f59e0b" />
                  Matched Historical Precedent: INC-8812 (94% Pattern Similarity)
                </div>
                <div style={{ fontSize: "11.5px", color: "#cbd5e1", lineHeight: 1.5 }}>
                  <strong>Root Cause from Post-Mortem:</strong> Authentication key rotation failure caused symmetric HMAC signature mismatches. Prompted creation of ADR-042.
                </div>
                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => onOpenEvidence("synthetic_data/DOC-INC-8812.md")}
                    style={{ background: "#1e293b", color: "#f87171", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", border: "1px solid #334155" }}
                  >
                    <BookOpen size={12} /> View Post-Mortem INC-8812
                  </button>
                </div>
              </div>

              {/* Mobilized On-Call Squad Card */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Users size={14} color="#38bdf8" />
                  Automated On-Call Squad Dispatched (FalkorDB Expert Graph)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11.5px" }}>
                  <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                    <div style={{ color: "#38bdf8", fontWeight: 600 }}>Elena Rostova</div>
                    <div style={{ color: "#94a3b8", fontSize: "10.5px" }}>Incident Commander (Lead on INC-8812)</div>
                  </div>
                  <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                    <div style={{ color: "#38bdf8", fontWeight: 600 }}>Sarah Jenkins</div>
                    <div style={{ color: "#94a3b8", fontSize: "10.5px" }}>Payments Domain SME (Score: 0.82)</div>
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
                  background: "rgba(124, 58, 237, 0.12)",
                  border: "1px solid #a855f7",
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
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }}></div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#f87171" }}>
                      ❌ MERGE BLOCKED: Architectural Drift in PR #318
                    </div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                      Target: <strong style={{ color: "#f8fafc" }}>payments-svc</strong> • Governance Policy: <strong style={{ color: "#c084fc" }}>SEC-POL-001 / ADR-042</strong>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(investigation.answer)}
                  style={{
                    background: "#7c3aed",
                    color: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  {copiedAction ? <Check size={12} /> : <Copy size={12} />}
                  {copiedAction ? "Copied!" : "📋 Copy GitHub Review"}
                </button>
              </div>

              {/* Violated Standard Card */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <Scale size={14} color="#a855f7" />
                  Mandated Architecture Standard: ADR-042
                </div>
                <div style={{ fontSize: "11.5px", color: "#cbd5e1", lineHeight: 1.5 }}>
                  <strong>ADR-042: Mandate AUTH-V2 Asymmetric Tokens</strong> (Approved by Alex Chen on 2026-09-15 following outage INC-8812). Banned symmetric HMAC keys across all Tier-1 payments and checkout services.
                </div>
                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => onOpenEvidence("synthetic_data/DOC-DEC-042.md")}
                    style={{ background: "#1e293b", color: "#a78bfa", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", border: "1px solid #334155" }}
                  >
                    <BookOpen size={12} /> View Full ADR-042 Record
                  </button>
                </div>
              </div>

              {/* Drift Risk Analysis */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <AlertTriangle size={14} color="#f59e0b" />
                  Regression Risk Analysis
                </div>
                <div style={{ fontSize: "11.5px", color: "#cbd5e1", lineHeight: 1.5 }}>
                  PR #318 attempts to revert authentication to symmetric HMAC keys. This revives the exact vulnerability that caused historical P0 outage <strong>INC-8812</strong> and introduces token desync across <strong>checkout-web</strong>.
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
                  background: "rgba(6, 182, 212, 0.1)",
                  border: "1px solid #0891b2",
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
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#22d3ee" }}>
                    🌐 INSTITUTIONAL MEMORY & OWNERSHIP GRAPH
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Target: <strong style={{ color: "#f8fafc" }}>Payments Service (Tier 1 / P0)</strong> • Powered by FalkorDB
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(investigation.answer)}
                  style={{
                    background: "#0891b2",
                    color: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  {copiedAction ? <Check size={12} /> : <Copy size={12} />}
                  {copiedAction ? "Copied!" : "📋 Copy Report"}
                </button>
              </div>

              {/* Service Ownership */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>
                  Service Ownership & Governance
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11.5px" }}>
                  <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "10px" }}>Owning Team</div>
                    <div style={{ color: "#38bdf8", fontWeight: 600 }}>Platform Core Team</div>
                  </div>
                  <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "10px" }}>Technical Lead</div>
                    <div style={{ color: "#38bdf8", fontWeight: 600 }}>Alex Chen (VP Eng)</div>
                  </div>
                </div>
              </div>

              {/* Domain Experts */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Users size={14} color="#818cf8" />
                  Graph-Ranked Domain Experts (Degree Weighted)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px", fontSize: "11.5px" }}>
                    <div style={{ color: "#f8fafc", fontWeight: 600 }}>Alex Chen</div>
                    <div style={{ color: "#94a3b8", fontSize: "10px" }}>VP Eng • Approver of ADR-042</div>
                  </div>
                  <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px", fontSize: "11.5px" }}>
                    <div style={{ color: "#f8fafc", fontWeight: 600 }}>Elena Rostova</div>
                    <div style={{ color: "#94a3b8", fontSize: "10px" }}>SRE Lead • Incident Commander INC-8812</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Full Text Analysis */}
          <details style={{ background: "#090d16", border: "1px solid #1e293b", borderRadius: "6px", padding: "8px 12px" }}>
            <summary style={{ cursor: "pointer", fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>
              📄 View Full Cypher Traversal Report Text
            </summary>
            <div
              style={{
                marginTop: "8px",
                padding: "8px",
                background: "#050811",
                borderRadius: "4px",
                fontSize: "11.5px",
                lineHeight: 1.6,
                color: "#cbd5e1",
                whiteSpace: "pre-wrap",
                maxHeight: "220px",
                overflowY: "auto"
              }}
            >
              {investigation.answer}
            </div>
          </details>

          {/* Source Document Provenance Drawer Links */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", background: "#0b1222", padding: "8px 12px", borderRadius: "6px", border: "1px solid #1e293b" }}>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Auditable Docs:</span>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-RFC-102.md")}
              style={{ background: "#1e293b", color: "#38bdf8", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", border: "1px solid #334155", cursor: "pointer" }}
            >
              📄 RFC-102 (Payments Arch)
            </button>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-DEC-042.md")}
              style={{ background: "#1e293b", color: "#a78bfa", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", border: "1px solid #334155", cursor: "pointer" }}
            >
              ⚖️ ADR-042 (Auth-V2 Mandate)
            </button>
            <button
              onClick={() => onOpenEvidence("synthetic_data/DOC-INC-8812.md")}
              style={{ background: "#1e293b", color: "#f87171", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", border: "1px solid #334155", cursor: "pointer" }}
            >
              🚨 Post-Mortem INC-8812
            </button>
          </div>
        </div>
      )}

      {/* SECTION 5: TRANSPARENT GRAPH TOOLS LOG */}
      {investigation && (
        <div style={{ marginTop: "4px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "6px" }}>
            Verifiable Graph Tools Executed ({investigation.tool_traces.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {investigation.tool_traces.map((trace, idx) => {
              const isOpen = openTraceIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: "#090d16",
                    border: "1px solid #1e293b",
                    borderRadius: "5px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    onClick={() => setOpenTraceIndex(isOpen ? null : idx)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "11px",
                      color: "#94a3b8"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#06b6d4", fontFamily: "monospace" }}>{trace.tool}()</span>
                      <span>—</span>
                      <span style={{ color: "#cbd5e1" }}>{trace.explanation}</span>
                    </div>
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </div>

                  {isOpen && (
                    <div style={{ padding: "8px 12px", background: "#050811", borderTop: "1px solid #1e293b", fontSize: "11px", fontFamily: "monospace" }}>
                      <div style={{ color: "#64748b", marginBottom: "2px" }}>Input:</div>
                      <pre style={{ color: "#38bdf8", marginBottom: "6px" }}>{JSON.stringify(trace.input, null, 2)}</pre>
                      <div style={{ color: "#64748b", marginBottom: "2px" }}>Output:</div>
                      <pre style={{ color: "#34d399", maxHeight: "120px", overflowY: "auto" }}>{JSON.stringify(trace.output, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
