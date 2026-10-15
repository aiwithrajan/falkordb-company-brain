import React, { useEffect, useRef } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import type { GraphNode, Subgraph } from "../types";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface GraphCanvasProps {
  subgraph: Subgraph;
  onSelectNode: (node: GraphNode) => void;
  selectedNodeId?: string | null;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  subgraph,
  onSelectNode,
  selectedNodeId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current || !subgraph || subgraph.nodes.length === 0) return;

    const getNodeColor = (type: string, props: Record<string, any>) => {
      if (type === "Claim") {
        if (props.status === "superseded") {
          return { background: "#475569", border: "#64748b", text: "#cbd5e1" };
        }
        if (props.status === "approved") {
          return { background: "#059669", border: "#10b981", text: "#ecfdf5" };
        }
        return { background: "#d97706", border: "#f59e0b", text: "#fffbeb" }; // Amber alert
      }
      switch (type) {
        case "Service":
          return { background: "#0891b2", border: "#22d3ee", text: "#ecfeff" };
        case "Incident":
          return { background: "#dc2626", border: "#f87171", text: "#fef2f2" };
        case "Decision":
        case "Policy":
          return { background: "#7c3aed", border: "#a78bfa", text: "#f5f3ff" };
        case "Person":
          return { background: "#4f46e5", border: "#818cf8", text: "#eef2ff" };
        case "Team":
          return { background: "#2563eb", border: "#60a5fa", text: "#eff6ff" };
        case "Document":
          return { background: "#0284c7", border: "#38bdf8", text: "#f0f9ff" };
        default:
          return { background: "#334155", border: "#64748b", text: "#f8fafc" };
      }
    };

    const getNodeShape = (type: string) => {
      switch (type) {
        case "Service":
          return "box";
        case "Claim":
          return "diamond";
        case "Incident":
          return "triangle";
        case "Person":
          return "circle";
        case "Team":
          return "box";
        case "Document":
          return "database";
        default:
          return "ellipse";
      }
    };

    // Deduplicate nodes by id
    const uniqueNodesMap = new Map();
    for (const node of subgraph.nodes) {
      if (!uniqueNodesMap.has(node.id)) {
        uniqueNodesMap.set(node.id, node);
      }
    }

    const visNodes = new DataSet(
      Array.from(uniqueNodesMap.values()).map((node) => {
        const colors = getNodeColor(node.type, node.properties);
        const isSelected = selectedNodeId === node.id;
        return {
          id: node.id,
          label: `[${node.type}]\n${node.label}`,
          shape: getNodeShape(node.type),
          color: {
            background: colors.background,
            border: isSelected ? "#ffffff" : colors.border,
            highlight: {
              background: colors.background,
              border: "#ffffff",
            },
          },
          borderWidth: isSelected ? 3 : 1.5,
          font: {
            color: colors.text,
            size: 11,
            face: "monospace",
            multi: "html",
          },
          margin: { top: 8, right: 10, bottom: 8, left: 10 },
          shadow: {
            enabled: true,
            color: "rgba(0,0,0,0.5)",
            size: 5,
          },
        };
      })
    );

    // Deduplicate edges by signature and assign guaranteed unique edge IDs
    const seenEdges = new Set<string>();
    const safeEdges = [];
    for (let i = 0; i < subgraph.edges.length; i++) {
      const edge = subgraph.edges[i];
      const sig = `${edge.source}-${edge.relation}->${edge.target}`;
      if (!seenEdges.has(sig)) {
        seenEdges.add(sig);
        const isConflict = edge.relation === "CONFLICTS_WITH";
        const isSuperseded = edge.relation === "SUPERSEDED_BY";
        safeEdges.push({
          id: `edge_uniq_${i}_${edge.source}_${edge.target}`,
          from: edge.source,
          to: edge.target,
          label: edge.relation,
          arrows: "to",
          color: {
            color: isConflict ? "#f59e0b" : isSuperseded ? "#64748b" : "#38bdf8",
            highlight: "#ffffff",
          },
          width: isConflict ? 2.5 : 1.2,
          dashes: isConflict || isSuperseded,
          font: {
            color: isConflict ? "#fbbf24" : "#94a3b8",
            size: 9,
            align: "horizontal",
            background: "#090d16",
          },
          smooth: {
            enabled: true,
            type: "cubicBezier",
            roundness: 0.2,
          },
        });
      }
    }

    const visEdges = new DataSet(safeEdges);

    const options = {
      physics: {
        solver: "forceAtlas2Based",
        forceAtlas2Based: {
          gravitationalConstant: -70,
          centralGravity: 0.015,
          springLength: 140,
          springConstant: 0.08,
          damping: 0.4,
        },
        stabilization: { iterations: 120 },
      },
      interaction: {
        hover: true,
        tooltipDelay: 150,
        zoomView: true,
        dragView: true,
      },
    };

    const network = new Network(
      containerRef.current,
      { nodes: visNodes as any, edges: visEdges as any },
      options as any
    );
    networkRef.current = network;

    network.on("click", (params) => {
      if (params.nodes.length > 0) {
        const clickedId = params.nodes[0];
        const fullNode = subgraph.nodes.find((n) => n.id === clickedId);
        if (fullNode) onSelectNode(fullNode);
      }
    });

    return () => {
      network.destroy();
    };
  }, [subgraph, selectedNodeId]);

  const handleZoomIn = () => {
    if (!networkRef.current) return;
    const scale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: scale * 1.3 });
  };

  const handleZoomOut = () => {
    if (!networkRef.current) return;
    const scale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: scale * 0.7 });
  };

  const handleFit = () => {
    if (!networkRef.current) return;
    networkRef.current.fit({ animation: { duration: 500, easingFunction: "easeInOutQuad" } });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#0c1322", borderRadius: "8px", overflow: "hidden", border: "1px solid #1e293b" }}>
      {/* Top Overlay Legend */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, display: "flex", gap: "8px", flexWrap: "wrap", background: "rgba(15, 23, 42, 0.85)", padding: "6px 12px", borderRadius: "6px", backdropFilter: "blur(6px)", border: "1px solid #334155", fontSize: "11px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: 8, height: 8, background: "#0891b2", borderRadius: "2px" }}></span> Service
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: 8, height: 8, background: "#d97706", borderRadius: "2px" }}></span> Claim (Active/Conflict)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: 8, height: 8, background: "#059669", borderRadius: "2px" }}></span> Claim (Approved)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: 8, height: 8, background: "#dc2626", borderRadius: "2px" }}></span> Incident
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: 8, height: 8, background: "#7c3aed", borderRadius: "2px" }}></span> Decision / Policy
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: 8, height: 8, background: "#4f46e5", borderRadius: "2px" }}></span> Person
        </span>
      </div>

      {/* Floating Canvas Controls */}
      <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 10, display: "flex", gap: "6px", background: "rgba(15, 23, 42, 0.85)", padding: "4px", borderRadius: "6px", border: "1px solid #334155" }}>
        <button onClick={handleZoomIn} title="Zoom In" style={{ background: "#1e293b", color: "#f8fafc", padding: "6px", borderRadius: "4px", display: "flex", alignItems: "center" }}>
          <ZoomIn size={14} />
        </button>
        <button onClick={handleZoomOut} title="Zoom Out" style={{ background: "#1e293b", color: "#f8fafc", padding: "6px", borderRadius: "4px", display: "flex", alignItems: "center" }}>
          <ZoomOut size={14} />
        </button>
        <button onClick={handleFit} title="Fit to View" style={{ background: "#1e293b", color: "#f8fafc", padding: "6px", borderRadius: "4px", display: "flex", alignItems: "center" }}>
          <Maximize2 size={14} />
        </button>
      </div>

      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
