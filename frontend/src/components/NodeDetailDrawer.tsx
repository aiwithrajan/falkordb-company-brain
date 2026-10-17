import React from "react";
import type { GraphNode } from "../types";
import { X, Info, FileCode } from "lucide-react";

interface NodeDetailDrawerProps {
  node: GraphNode | null;
  onClose: () => void;
  onOpenEvidence: (uri: string) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({ node, onClose, onOpenEvidence }) => {
  if (!node) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: 14,
        width: "320px",
        background: "rgba(12, 10, 9, 0.95)",
        border: "1px solid #242220",
        borderRadius: "10px",
        padding: "16px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 15px 35px rgba(0,0,0,0.8)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxHeight: "85%",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #242220", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Info size={15} color="#e0a35c" />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Node Inspector
          </span>
        </div>
        <button onClick={onClose} style={{ background: "transparent", color: "#a8a29e", cursor: "pointer", border: "none" }}>
          <X size={15} />
        </button>
      </div>

      <div>
        <div style={{ fontSize: "9.5px", color: "#78716c", letterSpacing: "0.12em", textTransform: "uppercase" }}>Label & Name</div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#e0a35c", marginTop: "2px" }}>{node.label}</div>
        <div
          style={{
            display: "inline-block",
            background: "#141210",
            border: "1px solid #242220",
            color: "#d6d3d1",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "10px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginTop: "6px",
          }}
        >
          Type: {node.type}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #242220", paddingTop: "10px" }}>
        <div style={{ fontSize: "9.5px", color: "#78716c", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
          Properties
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", fontFamily: "monospace" }}>
          {Object.entries(node.properties).map(([k, v]) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", background: "#080706", border: "1px solid #1c1917", padding: "5px 8px", borderRadius: "4px" }}>
              <span style={{ color: "#78716c", fontSize: "10px" }}>{k}:</span>
              <span style={{ color: k === "status" && v === "superseded" ? "#78716c" : k === "status" && v === "active" ? "#e0a35c" : "#f5f5f4" }}>
                {String(v)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {node.properties.source_uri && (
        <button
          onClick={() => onOpenEvidence(node.properties.source_uri)}
          style={{
            marginTop: "8px",
            background: "#d97706",
            color: "#000000",
            padding: "7px 14px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <FileCode size={13} color="#000000" /> View Document
        </button>
      )}
    </div>
  );
};
