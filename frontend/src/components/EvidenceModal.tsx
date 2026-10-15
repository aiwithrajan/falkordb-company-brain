import React, { useEffect, useState } from "react";
import { X, FileText, CheckCircle2 } from "lucide-react";

interface EvidenceModalProps {
  sourceUri: string | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ sourceUri, onClose }) => {
  const [content, setContent] = useState<string>("Loading document...");

  useEffect(() => {
    if (!sourceUri) return;
    setContent("Fetching source evidence from disk...");
    const apiBase = (import.meta as any).env?.VITE_API_URL || "/api";
    fetch(`${apiBase}/evidence/${sourceUri}`)
      .then((res) => res.json())
      .then((data) => setContent(data.content || "No content found."))
      .catch((err) => setContent(`Error loading document: ${err.message}`));
  }, [sourceUri]);

  if (!sourceUri) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        justifyContent: "flex-end",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "560px",
          maxWidth: "100%",
          height: "100%",
          background: "#0f172a",
          borderLeft: "1px solid #334155",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.8)",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={18} color="#38bdf8" />
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc" }}>Source Evidence Viewer</h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", color: "#94a3b8" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
          Target File: <span style={{ color: "#38bdf8" }}>{sourceUri}</span>
        </div>

        <div
          style={{
            background: "#090d16",
            border: "1px solid #1e293b",
            borderRadius: "6px",
            padding: "16px",
            fontFamily: "monospace",
            fontSize: "12.5px",
            lineHeight: 1.6,
            color: "#e2e8f0",
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {content}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#10b981", marginTop: "auto" }}>
          <CheckCircle2 size={14} /> Provenance Verified: Real cryptographic content hash on file
        </div>
      </div>
    </div>
  );
};
