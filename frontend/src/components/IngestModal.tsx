import React, { useState } from "react";
import { X, Upload, FileCode, FileText, CheckCircle2 } from "lucide-react";

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess: () => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({ isOpen, onClose, onIngestSuccess }) => {
  const [activeTab, setActiveTab] = useState<"json" | "text">("json");
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

  const handleJsonSubmit = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const parsed = JSON.parse(jsonText);
      const res = await fetch("http://localhost:8001/api/ingest/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setStatusMessage(data.message || "Company successfully ingested!");
      setTimeout(() => {
        onIngestSuccess();
        onClose();
      }, 1000);
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
      const res = await fetch("http://localhost:8001/api/ingest/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, company_name: companyName }),
      });
      const data = await res.json();
      setStatusMessage(data.message || "Architecture successfully parsed into FalkorDB!");
      setTimeout(() => {
        onIngestSuccess();
        onClose();
      }, 1000);
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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "680px",
          maxWidth: "95%",
          maxHeight: "90vh",
          background: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "10px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Upload size={20} color="#06b6d4" />
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc" }}>
              Ingest Your Company Knowledge Graph
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", color: "#94a3b8" }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
          Load your company’s services, teams, dependencies, and decisions into FalkorDB.
          The AI Agent will immediately begin reasoning over your infrastructure and policies.
        </p>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", background: "#090d16", padding: "4px", borderRadius: "6px" }}>
          <button
            onClick={() => setActiveTab("json")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: activeTab === "json" ? 600 : 400,
              background: activeTab === "json" ? "#1e293b" : "transparent",
              color: activeTab === "json" ? "#38bdf8" : "#94a3b8",
            }}
          >
            <FileCode size={14} /> Structured JSON Import
          </button>
          <button
            onClick={() => setActiveTab("text")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: activeTab === "text" ? 600 : 400,
              background: activeTab === "text" ? "#1e293b" : "transparent",
              color: activeTab === "text" ? "#38bdf8" : "#94a3b8",
            }}
          >
            <FileText size={14} /> Plain Text / RFC Notes
          </button>
        </div>

        {/* JSON Import Tab */}
        {activeTab === "json" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Edit or paste your company topology spec below:
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={12}
              style={{
                width: "100%",
                background: "#090d16",
                border: "1px solid #1e293b",
                borderRadius: "6px",
                padding: "12px",
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#34d399",
                resize: "vertical",
              }}
            />
            <button
              onClick={handleJsonSubmit}
              disabled={isSubmitting}
              style={{
                background: "#0891b2",
                color: "#ffffff",
                padding: "10px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Creating FalkorDB Nodes & Edges..." : "Import Company to FalkorDB"}
            </button>
          </div>
        )}

        {/* Plain Text Import Tab */}
        {activeTab === "text" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#64748b" }}>Company Name:</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: "100%",
                  background: "#090d16",
                  border: "1px solid #1e293b",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "#f8fafc",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "#64748b" }}>Paste Architecture Notes / Dependencies:</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                style={{
                  width: "100%",
                  background: "#090d16",
                  border: "1px solid #1e293b",
                  borderRadius: "6px",
                  padding: "12px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#38bdf8",
                  marginTop: "4px",
                }}
              />
            </div>

            <button
              onClick={handleTextSubmit}
              disabled={isSubmitting}
              style={{
                background: "#0891b2",
                color: "#ffffff",
                padding: "10px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Parsing & Generating Graph..." : "Parse & Build FalkorDB Graph"}
            </button>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div style={{ padding: "8px 12px", background: "#1e293b", borderRadius: "6px", fontSize: "12px", color: "#38bdf8", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={14} color="#10b981" /> {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};
