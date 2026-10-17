import React, { useState } from "react";
import { X, FileCode, FileText, CheckCircle2, Zap, Server, ShieldAlert, Scale, Database } from "lucide-react";

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess: () => void;
  onDirectEnter?: () => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({
  isOpen,
  onClose,
  onIngestSuccess,
  onDirectEnter,
}) => {
  const [activeTab, setActiveTab] = useState<"demo" | "json" | "text">("demo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sampleJson = JSON.stringify(
    {
      company_name: "Acme FinTech Corp",
      teams: [
        { id: "team_platform", name: "Core Platform", department: "Engineering" },
        { id: "team_payments", name: "Payments Squad", department: "Product" }
      ],
      people: [
        { id: "p_jordan", name: "Jordan Smith", role: "Staff Engineer", team_id: "team_payments", email: "jordan@acme.com" },
        { id: "p_taylor", name: "Taylor Green", role: "SRE Lead", team_id: "team_platform", email: "taylor@acme.com" }
      ],
      services: [
        { id: "svc_auth", name: "Auth Service", tier: 1, criticality: "P0", team_id: "team_platform", owner_id: "p_taylor" },
        { id: "svc_checkout", name: "Checkout API", tier: 1, criticality: "P0", team_id: "team_payments", owner_id: "p_jordan" },
        { id: "svc_payment", name: "Payment Gateway", tier: 1, criticality: "P0", team_id: "team_payments", owner_id: "p_jordan" }
      ],
      dependencies: [
        { from: "svc_checkout", to: "svc_payment", protocol: "gRPC" },
        { from: "svc_payment", to: "svc_auth", protocol: "REST" }
      ],
      decisions: [
        { id: "adr_acme_01", title: "ADR-001: Mutual TLS for Payment Gateway", approved_by: "Taylor Green", service_id: "svc_payment" }
      ],
      incidents: [
        { id: "inc_acme_90", severity: "P0", summary: "Gateway latency spike during token verification", service_id: "svc_payment" }
      ]
    },
    null,
    2
  );

  const [jsonText, setJsonText] = useState(sampleJson);
  const [rawText, setRawText] = useState(
    "Service: checkout-api depends on payment-gateway\nService: payment-gateway depends on auth-service\nTeam: Platform Engineering owns auth-service\nTeam: Monetization owns payment-gateway"
  );
  const [companyName, setCompanyName] = useState("Acme FinTech Corp");

  if (!isOpen) return null;

  const handleDemoSubmit = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      setStatusMessage(data.message || "Nexora Cloud company loaded into FalkorDB!");
      setTimeout(() => {
        onIngestSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJsonSubmit = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const parsed = JSON.parse(jsonText);
      const res = await fetch("/api/ingest/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setStatusMessage(data.message || "Company successfully ingested into FalkorDB!");
      setTimeout(() => {
        onIngestSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextSubmit = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/ingest/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName, text: rawText }),
      });
      const data = await res.json();
      setStatusMessage(data.message || "Company text processed into FalkorDB!");
      setTimeout(() => {
        onIngestSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0, 0, 0, 0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "680px",
          maxWidth: "100%",
          maxHeight: "90vh",
          background: "#0c0a09",
          border: "1px solid #292524",
          borderRadius: "14px",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.95)",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #242220", paddingBottom: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e0a35c", boxShadow: "0 0 10px #e0a35c" }} />
              <span style={{ fontSize: "10.5px", letterSpacing: "0.2em", color: "#e0a35c", textTransform: "uppercase", fontWeight: 600 }}>
                GATEWAY TO PORTAL
              </span>
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em", color: "#ffffff", margin: "2px 0 0 0" }}>
              Ingest Company Data & Launch Portal
            </h2>
            <p style={{ fontSize: "12px", color: "#a8a29e", margin: "2px 0 0 0", lineHeight: 1.5 }}>
              Choose a dataset or import your own company to build the FalkorDB Knowledge Graph.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", color: "#a8a29e", cursor: "pointer", border: "none", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher (3 clear options) */}
        <div style={{ display: "flex", gap: "6px", background: "#080706", padding: "5px", borderRadius: "24px", border: "1px solid #242220" }}>
          <button
            onClick={() => setActiveTab("demo")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: activeTab === "demo" ? 700 : 500,
              background: activeTab === "demo" ? "#d97706" : "transparent",
              color: activeTab === "demo" ? "#000000" : "#a8a29e",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Zap size={13} color={activeTab === "demo" ? "#000000" : "#e0a35c"} /> ⚡ Pre-Built Demo
          </button>
          <button
            onClick={() => setActiveTab("json")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: activeTab === "json" ? 700 : 500,
              background: activeTab === "json" ? "#d97706" : "transparent",
              color: activeTab === "json" ? "#000000" : "#a8a29e",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <FileCode size={13} color={activeTab === "json" ? "#000000" : "#e0a35c"} /> Custom JSON
          </button>
          <button
            onClick={() => setActiveTab("text")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: activeTab === "text" ? 700 : 500,
              background: activeTab === "text" ? "#d97706" : "transparent",
              color: activeTab === "text" ? "#000000" : "#a8a29e",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <FileText size={13} color={activeTab === "text" ? "#000000" : "#e0a35c"} /> Plain Text
          </button>
        </div>

        {/* TAB 1: PRE-BUILT DEMO (NEXORA CLOUD) */}
        {activeTab === "demo" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                background: "#141210",
                border: "1px solid #242220",
                borderRadius: "10px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#f5d59f" }}>
                  Nexora Cloud (Official Hackathon Dataset)
                </span>
                <span style={{ fontSize: "10px", background: "rgba(224, 163, 92, 0.1)", color: "#e0a35c", border: "1px solid rgba(224, 163, 92, 0.3)", padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase", fontWeight: 600 }}>
                  Ready to Test
                </span>
              </div>

              <p style={{ fontSize: "11.5px", color: "#a8a29e", margin: 0, lineHeight: 1.5 }}>
                Full enterprise microservice graph with pre-configured scenarios ready for instant investigation:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <div style={{ background: "#0c0a09", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Server size={14} color="#e0a35c" />
                  <span><strong>6 Microservices</strong> (Payments, Auth, etc.)</span>
                </div>
                <div style={{ background: "#0c0a09", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldAlert size={14} color="#f87171" />
                  <span><strong>P0 Cascade</strong> (payments-svc 500)</span>
                </div>
                <div style={{ background: "#0c0a09", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Scale size={14} color="#c084fc" />
                  <span><strong>ADR-042 Policy</strong> (Auth-V2 Mandate)</span>
                </div>
                <div style={{ background: "#0c0a09", padding: "8px 10px", borderRadius: "6px", border: "1px solid #242220", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Database size={14} color="#34d399" />
                  <span><strong>Active Conflict</strong> (RFC-102 vs ADR-042)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDemoSubmit}
              disabled={isSubmitting}
              style={{
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                color: "#000000",
                padding: "12px 20px",
                borderRadius: "24px",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                border: "none",
                boxShadow: "0 4px 20px rgba(217, 119, 6, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Zap size={14} color="#000000" />
              {isSubmitting ? "Loading Nexora Cloud into FalkorDB..." : "Load Nexora Cloud & Open Portal →"}
            </button>
          </div>
        )}

        {/* TAB 2: STRUCTURED JSON */}
        {activeTab === "json" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "10.5px", color: "#78716c", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Edit or paste company topology JSON below:
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={11}
              style={{
                width: "100%",
                background: "#080706",
                border: "1px solid #242220",
                borderRadius: "8px",
                padding: "12px",
                fontFamily: "monospace",
                fontSize: "11px",
                color: "#e0a35c",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            <button
              onClick={handleJsonSubmit}
              disabled={isSubmitting}
              style={{
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                color: "#000000",
                padding: "11px 18px",
                borderRadius: "24px",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                border: "none",
                boxShadow: "0 4px 15px rgba(217, 119, 6, 0.3)",
              }}
            >
              {isSubmitting ? "Ingesting JSON & Building Subgraph..." : "Ingest JSON & Open Portal →"}
            </button>
          </div>
        )}

        {/* TAB 3: PLAIN TEXT */}
        {activeTab === "text" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "10.5px", color: "#78716c", letterSpacing: "0.06em", textTransform: "uppercase" }}>Company Name:</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: "100%",
                  background: "#080706",
                  border: "1px solid #242220",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "#f5f5f4",
                  fontSize: "12px",
                  marginTop: "4px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "10.5px", color: "#78716c", letterSpacing: "0.06em", textTransform: "uppercase" }}>Paste Architecture Notes / Dependencies:</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={7}
                style={{
                  width: "100%",
                  background: "#080706",
                  border: "1px solid #242220",
                  borderRadius: "6px",
                  padding: "12px",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  color: "#e0a35c",
                  marginTop: "4px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <button
              onClick={handleTextSubmit}
              disabled={isSubmitting}
              style={{
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                color: "#000000",
                padding: "11px 18px",
                borderRadius: "24px",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                border: "none",
                boxShadow: "0 4px 15px rgba(217, 119, 6, 0.3)",
              }}
            >
              {isSubmitting ? "Parsing & Building Graph..." : "Parse Text & Open Portal →"}
            </button>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div style={{ padding: "9px 14px", background: "#141210", border: "1px solid #242220", borderRadius: "8px", fontSize: "11.5px", color: "#e0a35c", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={15} color="#10b981" /> {statusMessage}
          </div>
        )}

        {/* Bottom Link: Already loaded session */}
        {onDirectEnter && (
          <div style={{ borderTop: "1px solid #1f1d1b", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
            <span style={{ color: "#78716c" }}>Already have active data in FalkorDB?</span>
            <button
              onClick={() => {
                onClose();
                onDirectEnter();
              }}
              style={{
                background: "transparent",
                color: "#e0a35c",
                cursor: "pointer",
                border: "none",
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>Directly Enter Portal</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
