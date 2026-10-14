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
        top: 12,
        right: 12,
        width: "320px",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid #334155",
        borderRadius: "8px",
        padding: "16px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxHeight: "85%",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Info size={16} color="#38bdf8" />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>Node Inspector</span>
        </div>
        <button onClick={onClose} style={{ background: "transparent", color: "#94a3b8" }}>
          <X size={16} />
        </button>
      </div>

      <div>
        <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Label & Name</div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#38bdf8" }}>{node.label}</div>
        <div style={{ display: "inline-block", background: "#1e293b", color: "#a5b4fc", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", marginTop: "4px" }}>
          Type: {node.type}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: "8px" }}>
        <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Properties</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", fontFamily: "monospace" }}>
          {Object.entries(node.properties).map(([k, v]) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", background: "#090d16", padding: "4px 8px", borderRadius: "4px" }}>
              <span style={{ color: "#94a3b8", fontSize: "11px" }}>{k}:</span>
              <span style={{ color: k === "status" && v === "superseded" ? "#94a3b8" : k === "status" && v === "active" ? "#f59e0b" : "#e2e8f0" }}>
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
            marginTop: "6px",
            background: "#0891b2",
            color: "#ffffff",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <FileCode size={14} /> View Supporting Document
        </button>
      )}
    </div>
  );
};
