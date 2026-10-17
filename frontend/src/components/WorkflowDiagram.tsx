import React from "react";
import {
  Server,
  FileText,
  AlertOctagon,
  Users,
  Flame,
  GitPullRequest,
  Zap,
  ArrowRight,
  Database
} from "lucide-react";

interface WorkflowDiagramProps {
  onEnterConsole: () => void;
  onOpenTour?: () => void;
}

export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ onEnterConsole, onOpenTour }) => {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "#050505",
        color: "#f5f5f5",
        padding: "100px 32px 120px 32px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        boxSizing: "border-box",
        overflow: "hidden",
        borderTop: "1px solid #1a1816",
      }}
    >
      <style>{`
        @keyframes flowPulse {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes corePulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.04); }
        }
        .flow-node-card {
          background: #0c0a09;
          border: 1px solid #242220;
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flexDirection: column;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .flow-node-card:hover {
          border-color: rgba(224, 163, 92, 0.45);
          transform: translateY(-2px);
        }
        .wire-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0a35c;
          box-shadow: 0 0 10px #e0a35c;
        }
        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #141210;
          border: 1px solid #242220;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 11.5px;
          color: #d6d3d1;
          transition: all 0.2s ease;
        }
        .tag-pill:hover {
          border-color: #e0a35c;
          color: #ffffff;
        }
        .core-badge {
          display: flex;
          flex-direction: column;
          padding: 10px 12px;
          border-radius: 8px;
          background: #141210;
          border: 1px solid #242220;
          transition: all 0.2s ease;
        }
        .core-badge:hover {
          background: #1a1714;
        }
      `}</style>

      {/* Subtle Dot Matrix Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
          opacity: 0.7,
        }}
      />

      {/* Ambient Bronze Gradient Bloom */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "400px",
          background:
            "radial-gradient(ellipse at center, rgba(217, 119, 6, 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: "10.5px",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#e0a35c",
              border: "1px solid rgba(224, 163, 92, 0.3)",
              background: "rgba(224, 163, 92, 0.06)",
              padding: "4px 14px",
              borderRadius: "20px",
              fontWeight: 600,
              marginBottom: "14px",
            }}
          >
            ARCHITECTURE & WORKFLOW
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              margin: "0 0 14px 0",
            }}
          >
            How OrgMind Functions as the Company Brain
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#a8a29e",
              maxWidth: "680px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            A unified pipeline powered by <strong style={{ color: "#f5d59f" }}>FalkorDB</strong>: connecting fragmented code, ADR records, and incident histories into an active, real-time knowledge graph.
          </p>
        </div>

        {/* 3-Column Connected Workflow Diagram (Portkey Style) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
            alignItems: "stretch",
            position: "relative",
          }}
        >
          {/* COLUMN 1: ENTERPRISE INPUTS & ARTIFACTS */}
          <div className="flow-node-card">
            {/* Top header */}
            <div style={{ marginBottom: "18px", borderBottom: "1px solid #1f1d1b", paddingBottom: "14px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#e0a35c", textTransform: "uppercase", fontWeight: 600 }}>
                STEP 01 • INPUT SIGNALS
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#ffffff", margin: "4px 0 0 0" }}>
                Enterprise Knowledge Sources
              </h3>
              <p style={{ fontSize: "11.5px", color: "#78716c", margin: "4px 0 0 0" }}>
                Scattered across repos, wikis & tools
              </p>
            </div>

            {/* Input Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
              <div className="tag-pill">
                <Server size={15} color="#e0a35c" />
                <div>
                  <div style={{ fontWeight: 600, color: "#f5f5f4" }}>Microservices & Topology</div>
                  <div style={{ fontSize: "10px", color: "#78716c" }}>Endpoints, gRPC/REST dependencies</div>
                </div>
              </div>

              <div className="tag-pill">
                <FileText size={15} color="#c084fc" />
                <div>
                  <div style={{ fontWeight: 600, color: "#f5f5f4" }}>ADRs & RFC Standards</div>
                  <div style={{ fontSize: "10px", color: "#78716c" }}>Architecture policies, Auth-V2 mandates</div>
                </div>
              </div>

              <div className="tag-pill">
                <AlertOctagon size={15} color="#f87171" />
                <div>
                  <div style={{ fontWeight: 600, color: "#f5f5f4" }}>Historical Post-Mortems</div>
                  <div style={{ fontSize: "10px", color: "#78716c" }}>INC-8812 root cause & resolution logs</div>
                </div>
              </div>

              <div className="tag-pill">
                <Users size={15} color="#60a5fa" />
                <div>
                  <div style={{ fontWeight: 600, color: "#f5f5f4" }}>Teams & Domain Ownership</div>
                  <div style={{ fontSize: "10px", color: "#78716c" }}>Org hierarchy, on-call directory</div>
                </div>
              </div>
            </div>

            {/* Output Connector Indicator */}
            <div
              style={{
                marginTop: "20px",
                paddingTop: "12px",
                borderTop: "1px solid #1f1d1b",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#78716c",
              }}
            >
              <span>Ingested & Parsed</span>
              <span style={{ color: "#e0a35c", fontWeight: 600 }}>Stream into Graph →</span>
            </div>
          </div>

          {/* COLUMN 2: ORGMIND CORE GRAPH ENGINE (FALKORDB) */}
          <div
            className="flow-node-card"
            style={{
              borderColor: "rgba(224, 163, 92, 0.4)",
              background: "linear-gradient(180deg, #0e0c0a 0%, #080706 100%)",
              boxShadow: "0 0 50px rgba(217, 119, 6, 0.15)",
            }}
          >
            {/* Top header */}
            <div style={{ marginBottom: "18px", borderBottom: "1px solid #242220", paddingBottom: "14px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#f5d59f", textTransform: "uppercase", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                <Database size={12} color="#e0a35c" />
                STEP 02 • THE LIVING BRAIN
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#ffffff", margin: "4px 0 0 0" }}>
                OrgMind Graph Engine
              </h3>
              <p style={{ fontSize: "11.5px", color: "#e0a35c", margin: "4px 0 0 0", fontWeight: 500 }}>
                ⚡ FalkorDB In-Memory C-Redis Graph
              </p>
            </div>

            {/* 6 Capabilities Grid (Portkey style) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              <div className="core-badge" style={{ borderLeft: "2px solid #e0a35c" }}>
                <span style={{ fontSize: "9.5px", color: "#e0a35c", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                  BLAST RADIUS
                </span>
                <span style={{ fontSize: "10.5px", color: "#d6d3d1", marginTop: "2px" }}>
                  Multi-Hop Cypher Traversal
                </span>
              </div>

              <div className="core-badge" style={{ borderLeft: "2px solid #c084fc" }}>
                <span style={{ fontSize: "9.5px", color: "#c084fc", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                  DRIFT DETECTOR
                </span>
                <span style={{ fontSize: "10.5px", color: "#d6d3d1", marginTop: "2px" }}>
                  ADR Policy Verification
                </span>
              </div>

              <div className="core-badge" style={{ borderLeft: "2px solid #f87171" }}>
                <span style={{ fontSize: "9.5px", color: "#f87171", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                  INCIDENT MATCH
                </span>
                <span style={{ fontSize: "10.5px", color: "#d6d3d1", marginTop: "2px" }}>
                  Historical Post-Mortems
                </span>
              </div>

              <div className="core-badge" style={{ borderLeft: "2px solid #60a5fa" }}>
                <span style={{ fontSize: "9.5px", color: "#60a5fa", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                  SQUAD DISPATCH
                </span>
                <span style={{ fontSize: "10.5px", color: "#d6d3d1", marginTop: "2px" }}>
                  Degree-Ranked Experts
                </span>
              </div>

              <div className="core-badge" style={{ borderLeft: "2px solid #34d399" }}>
                <span style={{ fontSize: "9.5px", color: "#34d399", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                  GRAPH HEALING
                </span>
                <span style={{ fontSize: "10.5px", color: "#d6d3d1", marginTop: "2px" }}>
                  1-Click Conflict Resolver
                </span>
              </div>

              <div className="core-badge" style={{ borderLeft: "2px solid #fbbf24" }}>
                <span style={{ fontSize: "9.5px", color: "#fbbf24", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                  SUBGRAPH PROOF
                </span>
                <span style={{ fontSize: "10.5px", color: "#d6d3d1", marginTop: "2px" }}>
                  Vis-Network Visualizer
                </span>
              </div>
            </div>

            {/* Glowing Core Visual (Portkey bottom graphic style) */}
            <div
              style={{
                background: "radial-gradient(ellipse at center, rgba(224, 163, 92, 0.2) 0%, rgba(20, 18, 16, 0.9) 70%)",
                border: "1px solid #292524",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "1px solid #e0a35c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(224, 163, 92, 0.4)",
                  animation: "corePulse 4s ease-in-out infinite",
                }}
              >
                <Database size={22} color="#ffffff" />
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#f5f5f4", marginTop: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                FalkorDB In-Memory Subgraph
              </div>
              <div style={{ fontSize: "10px", color: "#78716c" }}>
                Sub-millisecond query execution & multi-hop traversal
              </div>
            </div>
          </div>

          {/* COLUMN 3: AUTONOMOUS ENTERPRISE ACTIONS */}
          <div className="flow-node-card">
            {/* Top header */}
            <div style={{ marginBottom: "18px", borderBottom: "1px solid #1f1d1b", paddingBottom: "14px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#e0a35c", textTransform: "uppercase", fontWeight: 600 }}>
                STEP 03 • AUTONOMOUS ACTIONS
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#ffffff", margin: "4px 0 0 0" }}>
                Enterprise Outcomes
              </h3>
              <p style={{ fontSize: "11.5px", color: "#78716c", margin: "4px 0 0 0" }}>
                Instant decision-making & guardrails
              </p>
            </div>

            {/* Action Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.06)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontSize: "12px", fontWeight: 600 }}>
                  <Flame size={15} /> P0 War-Room Mobilization
                </div>
                <div style={{ fontSize: "11px", color: "#a8a29e", marginTop: "4px", lineHeight: 1.4 }}>
                  Calculates blast radius across 5 hops, matches historical outage INC-8812, and generates on-call Slack dispatch.
                </div>
              </div>

              <div
                style={{
                  background: "rgba(192, 132, 252, 0.06)",
                  border: "1px solid rgba(192, 132, 252, 0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c084fc", fontSize: "12px", fontWeight: 600 }}>
                  <GitPullRequest size={15} /> PR Architecture Guard
                </div>
                <div style={{ fontSize: "11px", color: "#a8a29e", marginTop: "4px", lineHeight: 1.4 }}>
                  Blocks PR #318 attempting to revert Payments to HMAC keys, citing approved ADR-042 standard.
                </div>
              </div>

              <div
                style={{
                  background: "rgba(52, 211, 153, 0.06)",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34d399", fontSize: "12px", fontWeight: 600 }}>
                  <Zap size={15} /> 1-Click Knowledge Healing
                </div>
                <div style={{ fontSize: "11px", color: "#a8a29e", marginTop: "4px", lineHeight: 1.4 }}>
                  Detects contradiction between RFC-102 and ADR-042 and updates FalkorDB graph relationships directly.
                </div>
              </div>
            </div>

            {/* Bottom Status */}
            <div
              style={{
                marginTop: "20px",
                paddingTop: "12px",
                borderTop: "1px solid #1f1d1b",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#78716c",
              }}
            >
              <span>Audit Trail Guaranteed</span>
              <span style={{ color: "#34d399", fontWeight: 600 }}>100% Provenance ✓</span>
            </div>
          </div>
        </div>

        {/* Call to Action Bar */}
        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={onEnterConsole}
              style={{
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                color: "#000000",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "14px 34px",
                borderRadius: "30px",
                cursor: "pointer",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 25px rgba(217, 119, 6, 0.4)",
                transition: "all 0.25s ease",
              }}
            >
              <span>Launch Interactive Brain Console</span>
              <ArrowRight size={16} />
            </button>

            {onOpenTour && (
              <button
                onClick={onOpenTour}
                style={{
                  background: "rgba(224, 163, 92, 0.08)",
                  color: "#e0a35c",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "13px 28px",
                  borderRadius: "30px",
                  cursor: "pointer",
                  border: "1px solid rgba(224, 163, 92, 0.4)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.25s ease",
                }}
              >
                <span>Explore Feature Tour</span>
                <span>→</span>
              </button>
            )}
          </div>
          <span style={{ fontSize: "11px", color: "#78716c", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Track 3: Company Brain • FalkorDB Native
          </span>
        </div>

      </div>
    </section>
  );
};
