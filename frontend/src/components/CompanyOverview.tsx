import React from "react";
import type { OverviewData } from "../types";
import { Server, Users, UserCheck, AlertTriangle, ShieldAlert, FileText, RotateCcw, ExternalLink } from "lucide-react";

interface CompanyOverviewProps {
  overview: OverviewData | null;
  onReset: () => void;
  isResetting: boolean;
  onOpenIngest: () => void;
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({ overview, onReset, isResetting, onOpenIngest }) => {
  if (!overview) return null;
  const { counts } = overview;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
      {/* Top Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 10px #06b6d4" }}></div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", letterSpacing: "-0.02em" }}>
              OrgMind <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}>— Living Graph of {overview.company_name}</span>
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={onOpenIngest}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#0891b2", color: "#ffffff", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
            title="Import your own company's microservices and architecture"
          >
            📥 Ingest Company Data
          </button>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#1e293b", color: "#38bdf8", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", textDecoration: "none", border: "1px solid #334155" }}
          >
            FalkorDB Browser (:3000) <ExternalLink size={12} />
          </a>
          <button
            onClick={onReset}
            disabled={isResetting}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#334155", color: "#f8fafc", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: isResetting ? "not-allowed" : "pointer" }}
            title="Reset to clean initial state with seeded policy conflict"
          >
            <RotateCcw size={12} /> {isResetting ? "Resetting..." : "Reset Demo"}
          </button>
        </div>
      </div>

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
