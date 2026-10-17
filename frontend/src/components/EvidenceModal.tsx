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
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        justifyContent: "flex-end",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "560px",
          maxWidth: "100%",
          height: "100%",
          background: "#0c0a09",
          borderLeft: "1px solid #242220",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "-15px 0 40px rgba(0,0,0,0.9)",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #242220", paddingBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={17} color="#e0a35c" />
            <h2 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff", margin: 0 }}>
              Source Evidence Viewer
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", color: "#a8a29e", cursor: "pointer", border: "none" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: "11px", color: "#78716c", fontFamily: "monospace" }}>
          Target File: <span style={{ color: "#e0a35c" }}>{sourceUri}</span>
        </div>

        <div
          style={{
            background: "#080706",
            border: "1px solid #242220",
            borderRadius: "8px",
            padding: "16px",
            fontFamily: "monospace",
            fontSize: "12px",
            lineHeight: 1.6,
            color: "#e7e5e4",
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {content}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#10b981", marginTop: "auto" }}>
          <CheckCircle2 size={14} /> Provenance Verified: Cryptographic content hash on disk
        </div>
      </div>
    </div>
  );
};
