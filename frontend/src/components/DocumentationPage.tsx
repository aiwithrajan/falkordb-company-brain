import React, { useState } from "react";
import {
  Sparkles,
  FileCode,
  Layers,
  Database,
  Terminal,
  CheckCircle2,
} from "lucide-react";

interface DocumentationPageProps {
  onGoHome: () => void;
  onEnterConsole: () => void;
  onOpenTour: () => void;
}

export const DocumentationPage: React.FC<DocumentationPageProps> = ({
  onGoHome,
  onEnterConsole,
  onOpenTour,
}) => {
  const [activeTab, setActiveTab] = useState<"architecture" | "schema" | "cypher" | "api" | "setup">("architecture");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e7e5e4", display: "flex", flexDirection: "column" }}>
      {/* Header Bar */}
      <header
        style={{
          borderBottom: "1px solid #1f1d1b",
          padding: "16px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(12, 10, 9, 0.9)",
          backdropFilter: "blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={onGoHome}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e0a35c", boxShadow: "0 0 12px #d97706" }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "0.14em", color: "#ffffff", textTransform: "uppercase" }}>
                ORGMIND
              </span>
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "12px", background: "rgba(224, 163, 92, 0.1)", color: "#e0a35c", border: "1px solid rgba(224, 163, 92, 0.3)" }}>
                Technical Documentation
              </span>
            </div>
            <div style={{ fontSize: "10px", color: "#78716c", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              FalkorDB Hackathon 2026 • Track 3: Company Brain
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={onGoHome}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              color: "#d4d4d4",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              padding: "7px 16px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ← Home
          </button>
          <button
            onClick={onOpenTour}
            style={{
              background: "#141210",
              color: "#e0a35c",
              border: "1px solid #292524",
              padding: "7px 16px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <Sparkles size={12} color="#e0a35c" />
            Feature Tour
          </button>
          <button
            onClick={onEnterConsole}
            style={{
              background: "linear-gradient(135deg, #d97706, #b45309)",
              color: "#000000",
              border: "none",
              padding: "7px 18px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(217, 119, 6, 0.3)",
            }}
          >
            Launch Console →
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "36px 32px", display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Title Banner */}
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "0.22em", color: "#e0a35c", textTransform: "uppercase", fontWeight: 700 }}>
            ENTERPRISE TECHNICAL MANUAL & ARCHITECTURE SPEC
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#ffffff", margin: "6px 0 10px 0", letterSpacing: "-0.02em" }}>
            OrgMind: The Living Company Brain
          </h1>
          <p style={{ fontSize: "14px", color: "#a8a29e", maxWidth: "880px", lineHeight: 1.6, margin: 0 }}>
            Comprehensive architectural specifications, multi-hop Cypher traversal patterns, entity ontology schemas, REST API documentation, and local verification test suites for OrgMind powered by FalkorDB GraphBLAS.
          </p>
        </div>

        {/* TECHNICAL DOCUMENTATION TABS */}
        <div
          style={{
            background: "#0c0a09",
            border: "1px solid #242220",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Tab Navigation */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #1f1d1b", paddingBottom: "12px", overflowX: "auto" }}>
            {[
              { id: "architecture", label: "1. System Architecture", icon: Layers },
              { id: "schema", label: "2. Graph Schema & Nodes", icon: Database },
              { id: "cypher", label: "3. Core Cypher Suite", icon: Terminal },
              { id: "api", label: "4. REST API Specifications", icon: FileCode },
              { id: "setup", label: "5. Local Setup & Pytest", icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    background: isActive ? "rgba(224, 163, 92, 0.12)" : "transparent",
                    color: isActive ? "#ffffff" : "#a8a29e",
                    border: isActive ? "1px solid rgba(224, 163, 92, 0.4)" : "1px solid transparent",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "11.5px",
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={13} color={isActive ? "#e0a35c" : "#78716c"} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: ARCHITECTURE */}
          {activeTab === "architecture" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", margin: "0 0 8px 0" }}>
                  Why FalkorDB GraphBLAS Beats Standard Vector RAG
                </h3>
                <p style={{ fontSize: "13px", color: "#a8a29e", lineHeight: 1.6, margin: 0 }}>
                  Standard Vector RAG searches across isolated text chunks. When an engineer asks <em>"What happens if Identity authentication changes?"</em>, vector search matches keywords but fails to calculate downstream blast radiuses. When reviewing contradictory standards (e.g. RFC-102 vs ADR-042), vector embeddings hallucinate. OrgMind models these as explicit graph paths and typed conflict edges.
                </p>
              </div>

              {/* Comparison Table */}
              <div style={{ overflowX: "auto", border: "1px solid #242220", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#141210", borderBottom: "1px solid #242220", color: "#e0a35c" }}>
                      <th style={{ padding: "12px 16px", fontWeight: 600 }}>Capability</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600 }}>Naive Vector RAG</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600 }}>OrgMind on FalkorDB</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #1f1d1b" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#f5f5f4" }}>Downstream Blast Radius</td>
                      <td style={{ padding: "12px 16px", color: "#f87171" }}>Fails to traverse transitive dependencies. Only retrieves exact text matches.</td>
                      <td style={{ padding: "12px 16px", color: "#34d399" }}>Traverses <code style={{ color: "#e0a35c" }}>&lt;-[:DEPENDS_ON*1..5]-</code> paths via GraphBLAS matrix multiplication in &lt;15ms.</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #1f1d1b" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#f5f5f4" }}>Contradiction Handling</td>
                      <td style={{ padding: "12px 16px", color: "#f87171" }}>Averages contradictory text embeddings (HMAC vs RS256) together into hallucinations.</td>
                      <td style={{ padding: "12px 16px", color: "#34d399" }}>Explicit <code style={{ color: "#e0a35c" }}>[:CONFLICTS_WITH]</code> edges flag contradictions; 1-click mutation updates state to <code style={{ color: "#e0a35c" }}>superseded</code>.</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #1f1d1b" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#f5f5f4" }}>PR Architectural Gate</td>
                      <td style={{ padding: "12px 16px", color: "#f87171" }}>No deterministic enforcement. High false positive rate in CI/CD.</td>
                      <td style={{ padding: "12px 16px", color: "#34d399" }}>Hard merge block against ratified ADR-042 and previous outage INC-8812.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#f5f5f4" }}>War Room Mobilization</td>
                      <td style={{ padding: "12px 16px", color: "#f87171" }}>Matches keyword authors from 3 years ago who may have left the company.</td>
                      <td style={{ padding: "12px 16px", color: "#34d399" }}>Degree-weighted scoring joins direct ownership, incident commander history, and ADR authorship.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA */}
          {activeTab === "schema" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                Typed Property Graph Data Model
              </h3>
              <p style={{ fontSize: "13px", color: "#a8a29e", lineHeight: 1.6, margin: 0 }}>
                OrgMind connects services, teams, decisions, incidents, and first-class claims as a typed property graph:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                {[
                  { label: "(:Service)", color: "#e0a35c", desc: "Microservices with tier, criticality (P0/P1), repository URL, and runtime health." },
                  { label: "(:Team)", color: "#78716c", desc: "Engineering squads with domain ownership and dedicated on-call Slack channels." },
                  { label: "(:Person)", color: "#fb923c", desc: "Engineers, tech leads, and previous incident commanders." },
                  { label: "(:Decision)", color: "#c084fc", desc: "Ratified Architecture Decision Records (ADRs) with approvals and effective dates." },
                  { label: "(:Incident)", color: "#ef4444", desc: "Historical outages (e.g. INC-8812) with root causes and affected components." },
                  { label: "(:Claim)", color: "#34d399", desc: "First-class knowledge assertions linked via [:CONFLICTS_WITH] and [:SUPERSEDED_BY]." },
                ].map((item, i) => (
                  <div key={i} style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "14px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: item.color, fontFamily: "monospace" }}>{item.label}</div>
                    <div style={{ fontSize: "12px", color: "#a8a29e", marginTop: "4px", lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CYPHER SUITE */}
          {activeTab === "cypher" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                Core FalkorDB Cypher Queries
              </h3>
              <p style={{ fontSize: "13px", color: "#a8a29e", margin: 0 }}>
                Executed directly on FalkorDB's GraphBLAS matrix engine:
              </p>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#e0a35c", textTransform: "uppercase" }}>
                    A. Multi-Hop Downstream Blast Radius (5 Hops)
                  </span>
                  <button
                    onClick={() => copyText("MATCH path = (root:Service {id: $service_id})<-[:DEPENDS_ON*1..5]-(dependent:Service)\nRETURN root.name AS root, dependent.name AS dependent, dependent.criticality AS criticality, length(path) AS depth\nORDER BY depth ASC;", "cypher_1")}
                    style={{ background: "#1c1917", border: "1px solid #292524", color: "#d6d3d1", fontSize: "10px", padding: "3px 8px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    {copiedCode === "cypher_1" ? "Copied!" : "Copy Cypher"}
                  </button>
                </div>
                <pre style={{ background: "#050505", border: "1px solid #242220", borderRadius: "8px", padding: "14px", color: "#e0a35c", fontSize: "12px", fontFamily: "monospace", overflowX: "auto", margin: 0 }}>
{`MATCH path = (root:Service {id: $service_id})<-[:DEPENDS_ON*1..5]-(dependent:Service)
RETURN root.name AS root, dependent.name AS dependent, dependent.criticality AS criticality, length(path) AS depth
ORDER BY depth ASC;`}
                </pre>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#e0a35c", textTransform: "uppercase" }}>
                    B. 1-Click Graph Healing Mutation
                  </span>
                  <button
                    onClick={() => copyText("MATCH (stale:Claim {id: $claim_id})\nSET stale.status = 'superseded', stale.valid_to = date()\nWITH stale\nMATCH (stale)-[cf:CONFLICTS_WITH]->(approved:Claim)\nDELETE cf\nCREATE (stale)-[:SUPERSEDED_BY {reason: 'Superseded via OrgMind'}]->(approved)\nRETURN stale;", "cypher_2")}
                    style={{ background: "#1c1917", border: "1px solid #292524", color: "#d6d3d1", fontSize: "10px", padding: "3px 8px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    {copiedCode === "cypher_2" ? "Copied!" : "Copy Cypher"}
                  </button>
                </div>
                <pre style={{ background: "#050505", border: "1px solid #242220", borderRadius: "8px", padding: "14px", color: "#34d399", fontSize: "12px", fontFamily: "monospace", overflowX: "auto", margin: 0 }}>
{`MATCH (stale:Claim {id: $claim_id})
SET stale.status = 'superseded', stale.valid_to = date()
WITH stale
MATCH (stale)-[cf:CONFLICTS_WITH]->(approved:Claim)
DELETE cf
CREATE (stale)-[:SUPERSEDED_BY {reason: 'Superseded via OrgMind'}]->(approved)
RETURN stale;`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: API */}
          {activeTab === "api" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                REST Intelligence Gateway (Port 8001)
              </h3>
              <p style={{ fontSize: "13px", color: "#a8a29e", margin: 0 }}>
                FastAPI endpoints with automatic Swagger documentation at <code style={{ color: "#e0a35c" }}>http://localhost:8001/docs</code>:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { method: "GET", path: "/api/health", desc: "Pings FalkorDB via Redis protocol. Returns connection status and latency." },
                  { method: "GET", path: "/api/overview", desc: "Retrieves topology counts (services, teams, ADRs) and Vis-Network graph nodes." },
                  { method: "POST", path: "/api/investigate", desc: "Executes multi-hop entity resolution, blast radius, and verifiable tool traces." },
                  { method: "POST", path: "/api/chat", desc: "Grounded Graph-RAG inference with open-source LLMs (Meta Llama 3.2, Mistral, DeepSeek)." },
                  { method: "POST", path: "/api/ingest/json", desc: "Ingests structured enterprise JSON architecture specifications into FalkorDB." },
                  { method: "POST", path: "/api/claims/correct", desc: "Executes 1-click Cypher mutation resolving contradictory claims." },
                ].map((ep, i) => (
                  <div key={i} style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: ep.method === "GET" ? "#064e3b" : "#78350f", color: ep.method === "GET" ? "#34d399" : "#fbbf24" }}>
                        {ep.method}
                      </span>
                      <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#ffffff" }}>{ep.path}</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#a8a29e" }}>{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SETUP & PYTEST */}
          {activeTab === "setup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                Local Setup & Deterministic Pytest Acceptance Suite
              </h3>
              <p style={{ fontSize: "13px", color: "#a8a29e", margin: 0 }}>
                Run all 6 deterministic Hackathon Track-3 test suites:
              </p>

              <pre style={{ background: "#050505", border: "1px solid #242220", borderRadius: "8px", padding: "16px", color: "#34d399", fontSize: "12px", fontFamily: "monospace", overflowX: "auto", margin: 0 }}>
{`# 1. Start fullstack stack
./start.sh

# 2. Run automated test suite (Passes 6/6)
PYTHONPATH=. ./venv/bin/pytest tests/test_queries.py -v

# Output:
# tests/test_queries.py::test_service_ownership_resolution PASSED    [ 16%]
# tests/test_queries.py::test_multihop_blast_radius PASSED           [ 33%]
# tests/test_queries.py::test_incident_history_correlation PASSED   [ 50%]
# tests/test_queries.py::test_conflicting_claims_detection PASSED   [ 66%]
# tests/test_queries.py::test_expert_scoring_degree_weighted PASSED [ 83%]
# tests/test_queries.py::test_agent_investigate_integration PASSED  [100%]`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
