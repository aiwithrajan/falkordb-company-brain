import React from "react";
import {
  Flame,
  GitPullRequest,
  Brain,
  Database,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface FeatureTourPageProps {
  onGoHome: () => void;
  onEnterConsole: (mode?: "overview" | "incident" | "architect") => void;
  onOpenIngest: () => void;
}

export const FeatureTourPage: React.FC<FeatureTourPageProps> = ({
  onGoHome,
  onEnterConsole,
  onOpenIngest,
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#050505",
        color: "#f5f5f5",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <style>{`
        .tour-header-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #d4d4d4;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .tour-header-btn:hover {
          color: #ffffff;
          border-color: rgba(224, 163, 92, 0.5);
          background: rgba(224, 163, 92, 0.08);
        }
        .feature-showcase-card {
          background: #0c0a09;
          border: 1px solid #242220;
          border-radius: 14px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 20px 45px rgba(0,0,0,0.7);
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .feature-showcase-card:hover {
          border-color: rgba(224, 163, 92, 0.4);
          transform: translateY(-2px);
        }
        .launch-feature-btn {
          background: #141210;
          border: 1px solid #242220;
          color: #e0a35c;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 11.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .launch-feature-btn:hover {
          background: #d97706;
          color: #000000;
          border-color: #d97706;
          box-shadow: 0 4px 15px rgba(217, 119, 6, 0.35);
        }
      `}</style>

      {/* Top Navigation Bar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 48px",
          borderBottom: "1px solid #242220",
          backgroundColor: "#050505",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Brand */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
          onClick={onGoHome}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e0a35c", boxShadow: "0 0 10px #e0a35c" }} />
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.14em", color: "#ffffff", textTransform: "uppercase" }}>
              ORGMIND
            </div>
            <div style={{ fontSize: "9px", letterSpacing: "0.24em", color: "#78716c", textTransform: "uppercase" }}>
              FEATURE TOUR & CAPABILITIES
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="tour-header-btn" onClick={onGoHome}>
            ✦ Home
          </button>
          <button
            className="tour-header-btn"
            onClick={onOpenIngest}
            style={{ color: "#e0a35c", borderColor: "rgba(224, 163, 92, 0.3)" }}
          >
            📥 Ingest Data
          </button>
          <button
            onClick={() => onEnterConsole()}
            style={{
              background: "linear-gradient(135deg, #d97706, #b45309)",
              color: "#000000",
              padding: "7px 18px",
              borderRadius: "20px",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 2px 12px rgba(217, 119, 6, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Launch Portal</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Main Feature Content Container */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 32px 100px 32px", width: "100%", boxSizing: "border-box" }}>
        
        {/* Page Hero Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: "10.5px",
              letterSpacing: "0.22em",
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
            ENTERPRISE CAPABILITY TOUR
          </div>
          <h1
            style={{
              fontSize: "clamp(30px, 4.5vw, 48px)",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              margin: "0 0 16px 0",
            }}
          >
            Tour of OrgMind Capabilities
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#a8a29e",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Discover how FalkorDB transforms static documentation, git histories, and on-call rosters into an active, self-healing enterprise nervous system.
          </p>
        </div>

        {/* 4 In-Depth Feature Showcase Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* FEATURE 1: P0 INCIDENT COMMANDER */}
          <div className="feature-showcase-card" style={{ borderLeft: "3px solid #ef4444" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
                  <Flame size={15} color="#ef4444" />
                  Feature 01 • Firefighting Mode
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#ffffff", margin: "6px 0 0 0" }}>
                  P0 Incident Commander & Outage Blast Radius
                </h2>
                <p style={{ fontSize: "13px", color: "#a8a29e", margin: "6px 0 0 0", maxWidth: "750px", lineHeight: 1.6 }}>
                  During high-severity P0 outages, responders lose precious time guessing downstream casualties and tracking domain experts. OrgMind solves this in sub-seconds.
                </p>
              </div>

              <button
                className="launch-feature-btn"
                onClick={() => onEnterConsole("incident")}
              >
                <span>Try War Room in Console</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#e0a35c", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Multi-Hop Blast Radius
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Traverses upstream and downstream dependencies in FalkorDB within 12ms, pinpointing checkout-web and billing-svc impact.
                </div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#e0a35c", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Historical Post-Mortem Match
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Matches previous outage INC-8812 (94% pattern similarity), citing symmetric HMAC key rotation failure as root cause.
                </div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#e0a35c", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  On-Call Expert Mobilization
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Graph algorithms rank Elena Rostova (SRE Lead) and Sarah Jenkins (Domain SME) for instant Slack notification.
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE 2: AI STAFF ARCHITECT GUARD */}
          <div className="feature-showcase-card" style={{ borderLeft: "3px solid #c084fc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c084fc", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
                  <GitPullRequest size={15} color="#c084fc" />
                  Feature 02 • Fire Prevention Mode
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#ffffff", margin: "6px 0 0 0" }}>
                  AI Staff Architect Guard (PR Drift Prevention)
                </h2>
                <p style={{ fontSize: "13px", color: "#a8a29e", margin: "6px 0 0 0", maxWidth: "750px", lineHeight: 1.6 }}>
                  Enterprise codebases degrade when engineers unconsciously re-introduce old vulnerabilities or breach ADR standards. OrgMind gates pull requests against active governance.
                </p>
              </div>

              <button
                className="launch-feature-btn"
                onClick={() => onEnterConsole("architect")}
              >
                <span>Try PR Drift in Console</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#c084fc", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Automated Merge Blocking
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Blocks PR #318 attempting to revert Payments authentication to symmetric HMAC key headers.
                </div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#c084fc", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  ADR Standard Enforcement
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Cites approved standard ADR-042 (AUTH-V2 Asymmetric Tokens) approved by VP Alex Chen following INC-8812.
                </div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#c084fc", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Copyable GitHub Review
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Generates ready-to-paste architectural rationale explaining regression dangers directly to the developer.
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE 3: LIVING KNOWLEDGE GRAPH & 1-CLICK HEALING */}
          <div className="feature-showcase-card" style={{ borderLeft: "3px solid #e0a35c" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e0a35c", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
                  <Brain size={15} color="#e0a35c" />
                  Feature 03 • Autonomous Memory
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#ffffff", margin: "6px 0 0 0" }}>
                  Institutional Memory & 1-Click Graph Healing
                </h2>
                <p style={{ fontSize: "13px", color: "#a8a29e", margin: "6px 0 0 0", maxWidth: "750px", lineHeight: 1.6 }}>
                  Documents become outdated and contradict each other. OrgMind flags active knowledge conflicts and provides 1-click human-in-the-loop healing.
                </p>
              </div>

              <button
                className="launch-feature-btn"
                onClick={() => onEnterConsole("overview")}
              >
                <span>Try Healing in Console</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#e0a35c", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Conflict Detection
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Detects that RFC-102 references deprecated AUTH-V1 while ADR-042 requires AUTH-V2, creating a graph CONFLICTS_WITH edge.
                </div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#e0a35c", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  1-Click Healing in FalkorDB
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Reviewer approves correction with 1 click; FalkorDB updates graph edges to SUPERSEDED_BY with an audit trail.
                </div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#e0a35c", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Provenance Verification
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Every claim is tied to real file hashes on disk (`synthetic_data/DOC-DEC-042.md`) ensuring 0 hallucination.
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE 4: FALKORDB ENGINE ADVANTAGE */}
          <div className="feature-showcase-card" style={{ borderLeft: "3px solid #34d399" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34d399", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
                  <Database size={15} color="#34d399" />
                  Feature 04 • FalkorDB Core Advantage
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#ffffff", margin: "6px 0 0 0" }}>
                  Why FalkorDB: Ultra Low-Latency In-Memory Graph
                </h2>
                <p style={{ fontSize: "13px", color: "#a8a29e", margin: "6px 0 0 0", maxWidth: "750px", lineHeight: 1.6 }}>
                  Traditional vector databases fail at multi-hop enterprise dependency chains. FalkorDB’s C-Redis in-memory engine enables lightning-fast Cypher execution.
                </p>
              </div>

              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="launch-feature-btn"
                style={{ color: "#34d399" }}
              >
                <span>FalkorDB Browser (:3000)</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#34d399", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Multi-Hop Cypher Speed
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Performs 5-hop recursive service and decision walks in under 15ms directly in memory.
                </div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#34d399", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Dynamic Ingestion
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Supports custom JSON topologies and natural language text parsing to instantiate company brain graphs on the fly.
                </div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "16px" }}>
                <div style={{ color: "#34d399", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Subgraph Projection
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.5 }}>
                  Streams nodes and edges into Vis-Network interactive canvas with real-time physics and node property inspection.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            background: "#0c0a09",
            border: "1px solid #242220",
            borderRadius: "14px",
            padding: "48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div style={{ fontSize: "10.5px", letterSpacing: "0.2em", color: "#e0a35c", textTransform: "uppercase", fontWeight: 600 }}>
            READY TO EXPLORE THE COMPANY BRAIN?
          </div>
          <h3 style={{ fontSize: "26px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
            Launch the Live FalkorDB Interactive Console
          </h3>
          <p style={{ fontSize: "13px", color: "#a8a29e", maxWidth: "600px", margin: 0 }}>
            Test live Cypher investigations, triage simulated P0 cascades, and see the knowledge graph heal in real time.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => onEnterConsole()}
              style={{
                background: "linear-gradient(135deg, #d97706, #b45309)",
                color: "#000000",
                padding: "12px 32px",
                borderRadius: "24px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 20px rgba(217, 119, 6, 0.4)",
              }}
            >
              <span>Launch Live Portal</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={onGoHome}
              style={{
                background: "#141210",
                color: "#d4d4d4",
                border: "1px solid #242220",
                padding: "12px 24px",
                borderRadius: "24px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Return to Home
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};
