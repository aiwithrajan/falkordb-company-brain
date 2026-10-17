import React, { useState } from "react";
import type { OverviewData } from "../types";
import {
  Server,
  Users,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  ExternalLink,
  Flame,
  GitPullRequest,
  Brain,
  Sparkles,
  Layers,
  FileCheck,
  FileText
} from "lucide-react";

interface CompanyOverviewProps {
  overview: OverviewData | null;
  onReset: () => void;
  isResetting: boolean;
  onOpenIngest: () => void;
  activeMode?: "overview" | "incident" | "architect";
  onSelectMode?: (mode: "overview" | "incident" | "architect") => void;
  onGoHome?: () => void;
  onOpenTour?: () => void;
  onOpenDocs?: () => void;
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({
  overview,
  onReset,
  isResetting,
  onOpenIngest,
  activeMode = "overview",
  onSelectMode,
  onGoHome,
  onOpenTour,
  onOpenDocs,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  if (!overview) return null;
  const { counts } = overview;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
      {/* Top Header Banner matching Home Hero style */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #242220",
          paddingBottom: "14px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Left: Brand Identity */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            cursor: onGoHome ? "pointer" : "default",
          }}
          onClick={onGoHome}
          title={onGoHome ? "Return to OrgMind Home Hero" : undefined}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#e0a35c",
              boxShadow: "0 0 12px #d97706",
            }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "#ffffff",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                OrgMind
              </h1>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  background: "rgba(224, 163, 92, 0.08)",
                  color: "#e0a35c",
                  border: "1px solid rgba(224, 163, 92, 0.25)",
                }}
              >
                Track 3: Company Brain
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  background: "#141210",
                  color: "#a8a29e",
                  border: "1px solid #292524",
                }}
              >
                FalkorDB Native
              </span>
            </div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#78716c",
                marginTop: "3px",
              }}
            >
              Living Knowledge Graph of <strong style={{ color: "#e7e5e4" }}>{overview.company_name}</strong>
            </div>
          </div>
        </div>

        {/* Right: Action Controls matching luxury pill buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {onGoHome && (
            <button
              onClick={onGoHome}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255, 255, 255, 0.03)",
                color: "#f5f5f4",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              ✦ Home
            </button>
          )}

          <button
            onClick={() => {
              if (onOpenTour) {
                onOpenTour();
              } else {
                setShowGuide(!showGuide);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#0e0d0c",
              color: "#e0a35c",
              border: "1px solid #242220",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            <Sparkles size={12} color="#e0a35c" />
            Feature Tour
          </button>

          {onOpenDocs && (
            <button
              onClick={onOpenDocs}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#141210",
                color: "#e0a35c",
                border: "1px solid rgba(224, 163, 92, 0.45)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(224, 163, 92, 0.15)",
              }}
              title="Open Technical Documentation"
            >
              <FileText size={12} color="#e0a35c" />
              Documentation
            </button>
          )}

          <button
            onClick={onOpenIngest}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#d97706",
              color: "#000000",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              border: "none",
              boxShadow: "0 2px 10px rgba(217, 119, 6, 0.25)",
            }}
            title="Import custom enterprise architecture"
          >
            📥 Ingest Data
          </button>

          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "#0e0d0c",
              color: "#d4d4d4",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              border: "1px solid #242220",
            }}
          >
            FalkorDB :3000 <ExternalLink size={11} />
          </a>

          <button
            onClick={onReset}
            disabled={isResetting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "#141210",
              color: "#a8a29e",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: isResetting ? "not-allowed" : "pointer",
              border: "1px solid #242220",
            }}
            title="Reset to clean initial state"
          >
            <RotateCcw size={11} /> {isResetting ? "..." : "Reset"}
          </button>
        </div>
      </div>

      {/* QUICK FEATURE GUIDE BANNER (Toggleable) */}
      {showGuide && (
        <div
          style={{
            background: "#0c0a09",
            border: "1px solid #292524",
            borderRadius: "10px",
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "14px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div
            onClick={() => onSelectMode && onSelectMode("incident")}
            style={{
              background: activeMode === "incident" ? "rgba(220, 38, 38, 0.12)" : "#141210",
              border: activeMode === "incident" ? "1px solid #ef4444" : "1px solid #242220",
              borderRadius: "8px",
              padding: "12px 14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontWeight: 600, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <Flame size={14} /> 1. Incident Commander {activeMode === "incident" ? "• Active" : ""}
            </div>
            <div style={{ fontSize: "11px", color: "#a8a29e", marginTop: "6px", lineHeight: 1.5 }}>
              Traces multi-hop blast radius in FalkorDB, retrieves historical post-mortem INC-8812, and mobilizes on-call responders.
            </div>
          </div>

          <div
            onClick={() => onSelectMode && onSelectMode("architect")}
            style={{
              background: activeMode === "architect" ? "rgba(224, 163, 92, 0.12)" : "#141210",
              border: activeMode === "architect" ? "1px solid #e0a35c" : "1px solid #242220",
              borderRadius: "8px",
              padding: "12px 14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e0a35c", fontWeight: 600, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <GitPullRequest size={14} /> 2. AI Staff Architect {activeMode === "architect" ? "• Active" : ""}
            </div>
            <div style={{ fontSize: "11px", color: "#a8a29e", marginTop: "6px", lineHeight: 1.5 }}>
              Blocks PR #318 attempting to revert Payments to HMAC keys, citing approved ADR-042 and preventing architecture drift.
            </div>
          </div>

          <div
            onClick={() => onSelectMode && onSelectMode("overview")}
            style={{
              background: activeMode === "overview" ? "rgba(217, 119, 6, 0.15)" : "#141210",
              border: activeMode === "overview" ? "1px solid #d97706" : "1px solid #242220",
              borderRadius: "8px",
              padding: "12px 14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f5d59f", fontWeight: 600, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <Brain size={14} /> 3. Institutional Memory {activeMode === "overview" ? "• Active" : ""}
            </div>
            <div style={{ fontSize: "11px", color: "#a8a29e", marginTop: "6px", lineHeight: 1.5 }}>
              Detects contradiction between RFC-102 and ADR-042. Resolves it with 1-click healing directly inside FalkorDB.
            </div>
          </div>
        </div>
      )}

      {/* 6 Minimalist Luxury KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
        <div
          style={{
            background: "#0c0a09",
            border: "1px solid #242220",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Server size={17} color="#e0a35c" />
          <div>
            <div style={{ fontSize: "10px", color: "#78716c", letterSpacing: "0.14em", textTransform: "uppercase" }}>Services</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#f5f5f4" }}>{counts.services}</div>
          </div>
        </div>

        <div
          style={{
            background: "#0c0a09",
            border: "1px solid #242220",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Users size={17} color="#a8a29e" />
          <div>
            <div style={{ fontSize: "10px", color: "#78716c", letterSpacing: "0.14em", textTransform: "uppercase" }}>Teams</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#f5f5f4" }}>{counts.teams}</div>
          </div>
        </div>

        <div
          style={{
            background: "#0c0a09",
            border: "1px solid #242220",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <UserCheck size={17} color="#d4d4d4" />
          <div>
            <div style={{ fontSize: "10px", color: "#78716c", letterSpacing: "0.14em", textTransform: "uppercase" }}>Engineers</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#f5f5f4" }}>{counts.people}</div>
          </div>
        </div>

        <div
          style={{
            background: "#0c0a09",
            border: counts.incidents > 0 ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid #242220",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <ShieldAlert size={17} color={counts.incidents > 0 ? "#f87171" : "#78716c"} />
          <div>
            <div style={{ fontSize: "10px", color: "#78716c", letterSpacing: "0.14em", textTransform: "uppercase" }}>Incidents (P0)</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: counts.incidents > 0 ? "#f87171" : "#f5f5f4" }}>
              {counts.incidents}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#0c0a09",
            border: counts.active_conflicts > 0 ? "1px solid rgba(224, 163, 92, 0.5)" : "1px solid #242220",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FileCheck size={17} color={counts.active_conflicts > 0 ? "#e0a35c" : "#10b981"} />
          <div>
            <div style={{ fontSize: "10px", color: "#78716c", letterSpacing: "0.14em", textTransform: "uppercase" }}>Policy Conflicts</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: counts.active_conflicts > 0 ? "#e0a35c" : "#34d399" }}>
              {counts.active_conflicts > 0 ? `${counts.active_conflicts} Active` : "0 ✓"}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#0c0a09",
            border: "1px solid #242220",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Layers size={17} color="#e0a35c" />
          <div>
            <div style={{ fontSize: "10px", color: "#78716c", letterSpacing: "0.14em", textTransform: "uppercase" }}>Decisions / ADR</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#f5f5f4" }}>{counts.decisions}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
