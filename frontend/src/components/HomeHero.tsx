import React, { useState } from "react";
import { Sparkles, ExternalLink, BookOpen, Play } from "lucide-react";
import { WorkflowDiagram } from "./WorkflowDiagram";

interface HomeHeroProps {
  onEnterConsole: () => void;
  companyName?: string;
  onOpenTour?: () => void;
  onOpenDocs?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onEnterConsole,
  companyName = "Nexora Cloud",
  onOpenTour,
  onOpenDocs,
}) => {
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#050505",
        color: "#f5f5f5",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflowX: "hidden",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes subtlePulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 60px rgba(185, 120, 55, 0.45));
          }
          50% {
            transform: scale(1.025);
            filter: drop-shadow(0 0 95px rgba(215, 145, 75, 0.65));
          }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .header-icon-btn {
          color: #a3a3a3;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
          cursor: pointer;
          background: none;
          border: none;
          padding: 6px;
          border-radius: 6px;
        }
        .header-icon-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }
        .feature-tour-header-btn {
          color: #e0a35c;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 20px;
          border: 1px solid rgba(224, 163, 92, 0.4);
          background: rgba(224, 163, 92, 0.08);
          transition: all 0.25s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .feature-tour-header-btn:hover {
          color: #ffffff;
          border-color: rgba(224, 163, 92, 0.85);
          background: rgba(224, 163, 92, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(224, 163, 92, 0.25);
        }
        .contact-btn {
          color: #d4d4d4;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 500;
          padding: 7px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .contact-btn:hover {
          color: #ffffff;
          border-color: rgba(224, 163, 92, 0.6);
          background: rgba(224, 163, 92, 0.1);
        }
        .cta-bottom-link {
          color: #e5e5e5;
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .cta-bottom-link:hover {
          color: #e0a35c;
          transform: translateX(4px);
        }
        .scroll-hint-link {
          color: #78716c;
          text-decoration: none;
          font-size: 10.5px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.25s ease;
          animation: bounceDown 2.5s ease-in-out infinite;
        }
        .scroll-hint-link:hover {
          color: #e0a35c;
        }
        .footer-link-btn {
          background: none;
          border: none;
          color: #a8a29e;
          padding: 0;
          cursor: pointer;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .footer-link-btn:hover {
          color: #e0a35c;
          transform: translateX(3px);
        }
      `}</style>

      {/* SCREEN 1: FULLSCREEN HERO VIEW */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(24px, 4vh, 44px) clamp(24px, 5vw, 64px)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Background Ambient Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(160, 95, 35, 0.18) 0%, rgba(90, 50, 15, 0.08) 45%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Top Header: Brand (Left) | GitHub + Contact Us (Right) */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
            position: "relative",
            width: "100%",
          }}
        >
          {/* Brand Logo & Project Tagline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                fontSize: "19px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "#ffffff",
                textTransform: "uppercase",
              }}
            >
              ORGMIND
            </div>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "0.26em",
                color: "#737373",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              BETWEEN CODE AND DECISIONS
            </div>
          </div>

          {/* Right Header: Feature Tour + GitHub Icon + Contact Us */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            {/* Feature Tour Button (Next to GitHub) */}
            {onOpenTour && (
              <button
                className="feature-tour-header-btn"
                onClick={onOpenTour}
                title="Explore OrgMind Feature Tour & Capabilities"
              >
                <Sparkles size={13} style={{ color: "#e0a35c" }} />
                <span>FEATURE TOUR</span>
              </button>
            )}

            {/* Documentation Button */}
            {onOpenDocs && (
              <button
                className="feature-tour-header-btn"
                onClick={onOpenDocs}
                style={{
                  borderColor: "rgba(224, 163, 92, 0.65)",
                  background: "rgba(224, 163, 92, 0.12)",
                }}
                title="Open Technical Documentation"
              >
                <BookOpen size={13} style={{ color: "#e0a35c" }} />
                <span>DOCUMENTATION</span>
              </button>
            )}

            {/* Watch Demo Video Button */}
            <a
              href="https://youtu.be/txkIbVMguPc"
              target="_blank"
              rel="noopener noreferrer"
              className="feature-tour-header-btn"
              style={{
                borderColor: "rgba(239, 68, 68, 0.5)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#f87171",
                textDecoration: "none",
              }}
              title="Watch 4.5-min Working Demo on YouTube"
            >
              <Play size={12} fill="#ef4444" style={{ color: "#ef4444" }} />
              <span style={{ color: "#ffffff" }}>DEMO VIDEO</span>
            </a>

            {/* GitHub Icon Link */}
            <a
              href="https://github.com/aiwithrajan/falkordb-company-brain"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon-btn"
              title="GitHub Repository"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>

            {/* Contact Us Button */}
            <button
              className="contact-btn"
              onClick={() => setShowContact(true)}
            >
              CONTACT US
            </button>
          </div>
        </header>

        {/* Hero Center with Bronze Metallic Sphere & Typography */}
        <main
          style={{
            position: "relative",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            margin: "auto 0",
            padding: "24px 0",
          }}
        >
          {/* Bronze Metallic Glowing Sphere */}
          <div
            style={{
              position: "relative",
              width: "420px",
              height: "420px",
              maxWidth: "85vw",
              maxHeight: "85vw",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 36% 28%, #f8dfb6 0%, #d49852 16%, #8f531e 38%, #4a2408 68%, #140802 88%, #000000 100%)",
              boxShadow:
                "inset -18px -18px 45px rgba(0, 0, 0, 0.95), inset 14px 14px 30px rgba(255, 235, 195, 0.35), 0 0 100px rgba(185, 115, 45, 0.45)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              animation: "subtlePulse 7s ease-in-out infinite",
            }}
          >
            {/* Inner Light Reflection Crescent */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "22px",
                width: "120px",
                height: "60px",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(255, 250, 240, 0.45) 0%, rgba(255, 220, 160, 0.1) 60%, transparent 80%)",
                transform: "rotate(-32deg)",
                filter: "blur(4px)",
                pointerEvents: "none",
              }}
            />

            {/* Minimalist Architectural / Graph Emblem */}
            <div
              style={{
                marginBottom: "16px",
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                border: "1px solid rgba(255, 255, 255, 0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(255, 230, 180, 0.3)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="4" x2="6" y2="19" />
                <line x1="12" y1="4" x2="18" y2="19" />
                <line x1="8" y1="14" x2="16" y2="14" />
                <circle cx="12" cy="4" r="1.2" fill="#ffffff" />
              </svg>
            </div>

            {/* Eyebrow Label */}
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.3em",
                color: "#f3d8b4",
                textTransform: "uppercase",
                fontWeight: 500,
                marginBottom: "14px",
                opacity: 0.9,
              }}
            >
              INTELLIGENCE IN THE GRAPH ERA
            </div>

            {/* Main Huge Typography: BETWEEN CODE / AND DECISIONS */}
            <h1
              style={{
                fontSize: "clamp(38px, 6vw, 68px)",
                fontWeight: 400,
                lineHeight: 1.08,
                letterSpacing: "0.04em",
                color: "#ffffff",
                textTransform: "uppercase",
                margin: 0,
                padding: "0 16px",
                textShadow: "0 4px 30px rgba(0, 0, 0, 0.8)",
              }}
            >
              BETWEEN CODE
              <br />
              AND DECISIONS
            </h1>

            {/* Project-Related Subtitle */}
            <div
              style={{
                marginTop: "18px",
                fontSize: "12px",
                letterSpacing: "0.18em",
                color: "#e5d5c0",
                fontWeight: 400,
                textTransform: "uppercase",
                opacity: 0.95,
              }}
            >
              LIVING KNOWLEDGE GRAPH OF THE ENTIRE COMPANY
            </div>
          </div>

          {/* Sub-label under sphere */}
          <div
            style={{
              marginTop: "24px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              color: "#737373",
              textTransform: "uppercase",
            }}
          >
            ACTIVE KNOWLEDGE ENGINE • {companyName.toUpperCase()} • FALKORDB NATIVE
          </div>
        </main>

        {/* Bottom Corner Meta & Action */}
        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            zIndex: 10,
            position: "relative",
            width: "100%",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Bottom Left: Track 3 */}
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.25em",
              color: "#666666",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            TRACK 3: COMPANY BRAIN • FALKORDB ENGINE 2026
          </div>

          {/* Center Hint: Scroll to Workflow */}
          <div style={{ textAlign: "center" }}>
            <a href="#workflow-section" className="scroll-hint-link">
              <span>EXPLORE ARCHITECTURE WORKFLOW</span>
              <span>↓</span>
            </a>
          </div>

          {/* Bottom Right CTA Trigger */}
          <button
            className="cta-bottom-link"
            onClick={onEnterConsole}
            style={{
              borderBottom: "1px solid rgba(224, 163, 92, 0.4)",
              paddingBottom: "4px",
            }}
          >
            <span>EXPLORE COMPANY BRAIN</span>
            <span style={{ fontSize: "16px" }}>→</span>
          </button>
        </footer>
      </section>

      {/* SCREEN 2: WORKFLOW & ARCHITECTURE DIAGRAM CONTAINER */}
      <div id="workflow-section">
        <WorkflowDiagram onEnterConsole={onEnterConsole} onOpenTour={onOpenTour} />
      </div>

      {/* SCREEN 3: FRONT PAGE FOOTER */}
      <footer
        style={{
          width: "100%",
          backgroundColor: "#030303",
          borderTop: "1px solid #1c1a18",
          padding: "70px 48px 40px 48px",
          boxSizing: "border-box",
          color: "#d4d4d4",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          {/* Main Footer Columns Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "40px",
              paddingBottom: "48px",
              borderBottom: "1px solid #1a1816",
            }}
          >
            {/* Column 1: Brand & Enterprise Mission */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#e0a35c",
                    boxShadow: "0 0 10px #e0a35c",
                  }}
                />
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "#ffffff",
                    textTransform: "uppercase",
                  }}
                >
                  ORGMIND
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.6, margin: 0 }}>
                The autonomous living knowledge graph for modern engineering organizations. Powered by FalkorDB’s in-memory GraphBLAS engine to unify microservices, architectural decisions, and operational war rooms.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "3px 9px",
                    borderRadius: "12px",
                    background: "rgba(224, 163, 92, 0.1)",
                    color: "#e0a35c",
                    border: "1px solid rgba(224, 163, 92, 0.3)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Track 3: Company Brain
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "3px 9px",
                    borderRadius: "12px",
                    background: "#141210",
                    color: "#78716c",
                    border: "1px solid #242220",
                    textTransform: "uppercase",
                  }}
                >
                  FalkorDB 2026
                </span>
              </div>
            </div>

            {/* Column 2: About & Architecture */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: "#e0a35c", textTransform: "uppercase" }}>
                About & Architecture
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>
                  <button onClick={() => setShowAbout(true)} className="footer-link-btn">
                    <span>About OrgMind Mission</span>
                    <span style={{ fontSize: "10px", color: "#e0a35c" }}>✦</span>
                  </button>
                </li>
                {onOpenDocs && (
                  <li>
                    <button onClick={onOpenDocs} className="footer-link-btn" style={{ color: "#e0a35c", fontWeight: 600 }}>
                      <span>📖 Technical Documentation</span>
                      <span style={{ fontSize: "10px", color: "#e0a35c" }}>✦</span>
                    </button>
                  </li>
                )}
                <li>
                  <button onClick={onEnterConsole} className="footer-link-btn">
                    Living Graph Architecture
                  </button>
                </li>
                <li>
                  <button onClick={onOpenTour} className="footer-link-btn">
                    ADR-042 Governance Standard
                  </button>
                </li>
                <li>
                  <button onClick={onEnterConsole} className="footer-link-btn">
                    Microservice Blast Radius
                  </button>
                </li>
                <li>
                  <button onClick={onOpenTour} className="footer-link-btn">
                    1-Click Knowledge Healing
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Autonomous Solutions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: "#e0a35c", textTransform: "uppercase" }}>
                Autonomous Solutions
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>
                  <button onClick={onOpenTour} className="footer-link-btn">
                    P0 Incident Commander
                  </button>
                </li>
                <li>
                  <button onClick={onOpenTour} className="footer-link-btn">
                    AI Staff Architect Guard
                  </button>
                </li>
                <li>
                  <button onClick={onEnterConsole} className="footer-link-btn">
                    Graph-RAG Open-Source Copilot
                  </button>
                </li>
                <li>
                  <button onClick={onEnterConsole} className="footer-link-btn">
                    Automated Squad Slack Dispatch
                  </button>
                </li>
                <li>
                  <button onClick={onEnterConsole} className="footer-link-btn">
                    Interactive Vis-Network Visualizer
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Open-Source & Resources */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: "#e0a35c", textTransform: "uppercase" }}>
                Open-Source & Connect
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>
                  <a href="https://youtu.be/txkIbVMguPc" target="_blank" rel="noopener noreferrer" className="footer-link-btn" style={{ color: "#f87171" }}>
                    <span>▶ Watch Demo Video (YouTube)</span>
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/falkordb/falkordb" target="_blank" rel="noopener noreferrer" className="footer-link-btn">
                    <span>FalkorDB GitHub</span>
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://docs.falkordb.com" target="_blank" rel="noopener noreferrer" className="footer-link-btn">
                    <span>FalkorDB Documentation</span>
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://opencypher.org" target="_blank" rel="noopener noreferrer" className="footer-link-btn">
                    <span>OpenCypher Query Language</span>
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <button onClick={() => setShowContact(true)} className="footer-link-btn">
                    Contact Engineering Team
                  </button>
                </li>
                <li>
                  <a href="http://localhost:8001/docs" target="_blank" rel="noopener noreferrer" className="footer-link-btn">
                    <span>FastAPI Swagger Spec</span>
                    <ExternalLink size={12} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Engine Meta */}
          <div
            style={{
              paddingTop: "28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              fontSize: "11.5px",
              color: "#78716c",
            }}
          >
            <div>
              © 2026 <strong style={{ color: "#d6d3d1" }}>OrgMind</strong> • FalkorDB Hackathon (Track 3: Company Brain). All rights reserved.
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
                GraphBLAS In-Memory Core
              </span>
              <span>•</span>
              <span>Sub-15ms Multi-Hop Cypher</span>
              <span>•</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#e0a35c",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                <span>↑ Top</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* About OrgMind Modal */}
      {showAbout && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.88)",
            backdropFilter: "blur(14px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setShowAbout(false)}
        >
          <div
            style={{
              maxWidth: "620px",
              width: "100%",
              background: "#0c0a09",
              border: "1px solid #292524",
              borderRadius: "16px",
              padding: "36px",
              color: "#e7e5e4",
              boxShadow: "0 25px 60px rgba(0,0,0,0.95)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "10.5px", letterSpacing: "0.22em", color: "#e0a35c", textTransform: "uppercase", fontWeight: 700 }}>
              ABOUT ORGMIND
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 600, color: "#ffffff", margin: "6px 0 14px 0" }}>
              The Living Enterprise Company Brain
            </h3>
            <p style={{ fontSize: "13px", color: "#a8a29e", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              Modern engineering organizations suffer from <strong>institutional amnesia</strong>: tribal knowledge is lost during employee turnover, architecture decisions (ADRs) get forgotten, and microservices cascade in outages because blast radiuses aren’t understood.
            </p>
            <p style={{ fontSize: "13px", color: "#a8a29e", lineHeight: 1.6, margin: "0 0 20px 0" }}>
              <strong>OrgMind</strong> solves this by turning the entire company into an active, querying knowledge graph powered by <strong>FalkorDB</strong>:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ color: "#e0a35c", fontWeight: 600, fontSize: "12.5px" }}>⚡ GraphBLAS Matrix Engine</div>
                <div style={{ color: "#a8a29e", fontSize: "11.5px", marginTop: "2px" }}>Linear algebra multi-hop traversals in sub-15ms across thousands of microservices and dependencies.</div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ color: "#f87171", fontWeight: 600, fontSize: "12.5px" }}>🚨 P0 War Room Incident Commander</div>
                <div style={{ color: "#a8a29e", fontSize: "11.5px", marginTop: "2px" }}>Instant blast radius tracing and automated squad mobilization via pre-formatted Slack dispatches.</div>
              </div>

              <div style={{ background: "#141210", border: "1px solid #242220", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ color: "#34d399", fontWeight: 600, fontSize: "12.5px" }}>⚖️ 1-Click Self-Healing Institutional Memory</div>
                <div style={{ color: "#a8a29e", fontSize: "11.5px", marginTop: "2px" }}>Detects contradictory claims between legacy RFCs and ratified ADRs and updates the graph in 1 click.</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => {
                  setShowAbout(false);
                  onEnterConsole();
                }}
                style={{
                  background: "linear-gradient(135deg, #d97706, #b45309)",
                  color: "#000000",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Launch Brain Console →
              </button>
              <button
                onClick={() => setShowAbout(false)}
                style={{
                  background: "#141210",
                  color: "#a8a29e",
                  border: "1px solid #292524",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContact && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setShowContact(false)}
        >
          <div
            style={{
              maxWidth: "520px",
              width: "100%",
              background: "#0c0a09",
              border: "1px solid #292524",
              borderRadius: "12px",
              padding: "32px",
              color: "#e7e5e4",
              boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.25em",
                color: "#d97706",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              ORGMIND CONNECT
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 500,
                color: "#ffffff",
                marginBottom: "12px",
                letterSpacing: "-0.01em",
              }}
            >
              Contact the OrgMind Team
            </h2>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#a8a29e",
                marginBottom: "20px",
              }}
            >
              OrgMind is built for the FalkorDB Hackathon (Track 3: Company Brain). Reach out to us for enterprise deployment, integrations, or feedback.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                background: "#171412",
                border: "1px solid #292524",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#78716c" }}>Track:</span>
                <span style={{ color: "#f5f5f4", fontWeight: 500 }}>Track 3 — Company Brain</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#78716c" }}>Engine:</span>
                <span style={{ color: "#e0a35c", fontWeight: 500 }}>FalkorDB Graph Engine</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#78716c" }}>GitHub:</span>
                <a
                  href="https://github.com/aiwithrajan/falkordb-company-brain"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#38bdf8", textDecoration: "none" }}
                >
                  github.com/aiwithrajan/falkordb-company-brain
                </a>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#78716c" }}>Email:</span>
                <a
                  href="mailto:contact@orgmind.ai"
                  style={{ color: "#38bdf8", textDecoration: "none" }}
                >
                  contact@orgmind.ai
                </a>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowContact(false)}
                style={{
                  background: "#292524",
                  color: "#d6d3d1",
                  padding: "8px 18px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowContact(false);
                  onEnterConsole();
                }}
                style={{
                  background: "#d97706",
                  color: "#000000",
                  padding: "8px 18px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Open Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
