import React, { useState } from "react";
import type { OverviewData } from "../types";
import {
  Server,
  Users,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  FileText,
  RotateCcw,
  ExternalLink,
  Flame,
  GitPullRequest,
  Brain,
  Sparkles
} from "lucide-react";

interface CompanyOverviewProps {
  overview: OverviewData | null;
  onReset: () => void;
  isResetting: boolean;
  onOpenIngest: () => void;
  activeMode?: "overview" | "incident" | "architect";
  onSelectMode?: (mode: "overview" | "incident" | "architect") => void;
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({
  overview,
  onReset,
  isResetting,
  onOpenIngest,
  activeMode = "overview",
  onSelectMode
}) => {
  const [showGuide, setShowGuide] = useState(false);
  if (!overview) return null;
  const { counts } = overview;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
      {/* Top Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 12px #06b6d4" }}></div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "19px", fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.02em" }}>
                OrgMind
              </h1>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px", background: "rgba(6, 182, 212, 0.15)", color: "#22d3ee", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
                Track 3: Company Brain
              </span>
              <span style={{ fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                ⚡ FalkorDB Native
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Living Graph of <strong style={{ color: "#f1f5f9" }}>{overview.company_name}</strong> — Microservices, ADR Policies, People & Incidents
            </div>
          </div>
        </div>

        {/* Action Controls & External Links */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowGuide(!showGuide)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: showGuide ? "rgba(168, 85, 247, 0.2)" : "#1e293b",
              color: showGuide ? "#c084fc" : "#cbd5e1",
              border: showGuide ? "1px solid #a855f7" : "1px solid #334155",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            <Sparkles size={13} color={showGuide ? "#c084fc" : "#94a3b8"} />
            {showGuide ? "Hide Feature Tour" : "⚡ Feature Guide"}
          </button>

          <button
            onClick={onOpenIngest}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#0891b2",
              color: "#ffffff",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 2px 8px rgba(8, 145, 178, 0.3)"
            }}
            title="Import your own company's microservices and architecture"
          >
            📥 Ingest Company Data
          </button>

          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#1e293b",
              color: "#38bdf8",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              textDecoration: "none",
              border: "1px solid #334155"
            }}
          >
            FalkorDB Browser (:3000) <ExternalLink size={12} />
          </a>

          <button
            onClick={onReset}
            disabled={isResetting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#334155",
              color: "#f8fafc",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: isResetting ? "not-allowed" : "pointer",
              border: "none"
            }}
            title="Reset to clean initial state with seeded policy conflict"
          >
            <RotateCcw size={12} /> {isResetting ? "Resetting..." : "Reset Demo"}
          </button>
        </div>
      </div>

      {/* QUICK FEATURE GUIDE BANNER (Toggleable) */}
      {showGuide && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
            border: "1px solid #3b82f6",
            borderRadius: "8px",
            padding: "14px 16px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "14px"
          }}
        >
          <div
            onClick={() => onSelectMode && onSelectMode("incident")}
            style={{
              background: activeMode === "incident" ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.08)",
              border: activeMode === "incident" ? "2px solid #ef4444" : "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "6px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "transform 0.15s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontWeight: 700, fontSize: "12.5px" }}>
              <Flame size={15} /> 1. Incident Commander (P0) {activeMode === "incident" ? "• ACTIVE" : ""}
            </div>
            <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "4px", lineHeight: 1.4 }}>
              FalkorDB traces multi-hop blast radius, matches historical post-mortem INC-8812, and mobilizes the on-call incident squad.
            </div>
            <div style={{ fontSize: "10px", color: "#fca5a5", fontWeight: 600, marginTop: "6px" }}>
              👉 Click to activate Outage Triage
            </div>
          </div>

          <div
            onClick={() => onSelectMode && onSelectMode("architect")}
            style={{
              background: activeMode === "architect" ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.08)",
              border: activeMode === "architect" ? "2px solid #a855f7" : "1px solid rgba(168, 85, 247, 0.3)",
              borderRadius: "6px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "transform 0.15s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c084fc", fontWeight: 700, fontSize: "12.5px" }}>
              <GitPullRequest size={15} /> 2. AI Staff Architect (PR Drift) {activeMode === "architect" ? "• ACTIVE" : ""}
            </div>
            <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "4px", lineHeight: 1.4 }}>
              Blocks PR #318 attempting to revert Payments to HMAC keys, citing approved ADR-042 and preventing historical regression.
            </div>
            <div style={{ fontSize: "10px", color: "#d8b4fe", fontWeight: 600, marginTop: "6px" }}>
              👉 Click to activate PR Drift Guard
            </div>
          </div>

          <div
            onClick={() => onSelectMode && onSelectMode("overview")}
            style={{
              background: activeMode === "overview" ? "rgba(6, 182, 212, 0.15)" : "rgba(6, 182, 212, 0.08)",
              border: activeMode === "overview" ? "2px solid #06b6d4" : "1px solid rgba(6, 182, 212, 0.3)",
              borderRadius: "6px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "transform 0.15s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#22d3ee", fontWeight: 700, fontSize: "12.5px" }}>
              <Brain size={15} /> 3. Living Graph & 1-Click Heal {activeMode === "overview" ? "• ACTIVE" : ""}
            </div>
            <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "4px", lineHeight: 1.4 }}>
              Detects contradiction between RFC-102 (AUTH-V1) and ADR-042 (AUTH-V2). Resolves it in FalkorDB with 1-click healing.
            </div>
            <div style={{ fontSize: "10px", color: "#67e8f9", fontWeight: 600, marginTop: "6px" }}>
              👉 Click to explore Institutional Memory
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Server size={18} color="#06b6d4" />
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Services</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc" }}>{counts.services}</div>
          </div>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Users size={18} color="#3b82f6" />
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Teams</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc" }}>{counts.teams}</div>
          </div>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <UserCheck size={18} color="#818cf8" />
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Engineers</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc" }}>{counts.people}</div>
          </div>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert size={18} color="#ef4444" />
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Incidents (P0)</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#ef4444" }}>{counts.incidents}</div>
          </div>
        </div>

        <div style={{ background: "#0f172a", border: counts.active_conflicts > 0 ? "1px solid #f59e0b" : "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertTriangle size={18} color={counts.active_conflicts > 0 ? "#f59e0b" : "#10b981"} />
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Policy Conflicts</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: counts.active_conflicts > 0 ? "#f59e0b" : "#10b981" }}>
              {counts.active_conflicts} {counts.active_conflicts > 0 ? "⚠️" : "✓"}
            </div>
          </div>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <FileText size={18} color="#a78bfa" />
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Decisions / ADR</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc" }}>{counts.decisions}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
