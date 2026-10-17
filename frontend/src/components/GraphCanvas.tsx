import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import type { GraphNode, Subgraph } from "../types";
import { ZoomIn, ZoomOut, Maximize2, Layers } from "lucide-react";

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
  const [filterType, setFilterType] = useState<"all" | "services" | "incidents" | "governance">("all");

  useEffect(() => {
    if (!containerRef.current || !subgraph || subgraph.nodes.length === 0) return;

    // Harmonious luxury bronze / gold / charcoal node styling
    const getNodeColor = (type: string, props: Record<string, any>) => {
      if (type === "Claim") {
        if (props.status === "superseded") {
          return { background: "#1c1917", border: "#44403c", text: "#a8a29e" };
        }
        if (props.status === "approved") {
          return { background: "#064e3b", border: "#10b981", text: "#ecfdf5" };
        }
        return { background: "#d97706", border: "#f59e0b", text: "#000000" }; // Glowing active conflict
      }
      switch (type) {
        case "Service":
          return { background: "#92400e", border: "#e0a35c", text: "#fef3c7" }; // Metallic warm bronze
        case "Incident":
          return { background: "#7f1d1d", border: "#ef4444", text: "#fef2f2" }; // Crimson outage
        case "Decision":
        case "Policy":
          return { background: "#4c1d95", border: "#c084fc", text: "#faf5ff" }; // Deep royal purple/bronze
        case "Person":
          return { background: "#7c2d12", border: "#fb923c", text: "#fff7ed" }; // Terracotta
        case "Team":
          return { background: "#1c1917", border: "#78716c", text: "#f5f5f4" }; // Charcoal slate
        case "Document":
          return { background: "#292524", border: "#a8a29e", text: "#fafaf9" }; // Obsidian database
        default:
          return { background: "#1c1917", border: "#57534e", text: "#f5f5f4" };
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
    const uniqueNodesMap = new Map<string, GraphNode>();
    for (const node of subgraph.nodes) {
      if (!uniqueNodesMap.has(node.id)) {
        uniqueNodesMap.set(node.id, node);
      }
    }

    // Filter nodes according to filterType
    let candidateNodes = Array.from(uniqueNodesMap.values());
    if (filterType === "services") {
      candidateNodes = candidateNodes.filter(n => n.type === "Service");
    } else if (filterType === "incidents") {
      candidateNodes = candidateNodes.filter(n => ["Incident", "Person", "Service"].includes(n.type));
    } else if (filterType === "governance") {
      candidateNodes = candidateNodes.filter(n => ["Decision", "Policy", "Claim", "Document"].includes(n.type));
    }

    const candidateIds = new Set(candidateNodes.map(n => n.id));

    const visNodes = new DataSet(
      candidateNodes.map((node) => {
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
            hover: {
              background: colors.background,
              border: "#e0a35c",
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
            color: "rgba(0,0,0,0.7)",
            size: 6,
          },
        };
      })
    );

    // Deduplicate edges and filter to only edges between visible candidate nodes
    const seenEdges = new Set<string>();
    const safeEdges = [];
    for (let i = 0; i < subgraph.edges.length; i++) {
      const edge = subgraph.edges[i];
      if (!candidateIds.has(edge.source) || !candidateIds.has(edge.target)) {
        continue;
      }
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
            color: isConflict ? "#f59e0b" : isSuperseded ? "#57534e" : "rgba(224, 163, 92, 0.45)",
            highlight: "#f5d59f",
          },
          width: isConflict ? 2.5 : 1.2,
          dashes: isConflict || isSuperseded,
          font: {
            color: isConflict ? "#fbbf24" : "#a8a29e",
            size: 9,
            align: "horizontal",
            background: "#0c0a09",
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
  }, [subgraph, selectedNodeId, filterType]);

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
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#080706",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #242220",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* TOPBAR: Title, Counter & Filter Chips */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          background: "rgba(12, 10, 9, 0.95)",
          borderBottom: "1px solid #242220",
          zIndex: 10,
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Layers size={15} color="#e0a35c" />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            FalkorDB Subgraph Canvas
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "#a8a29e",
              background: "#141210",
              border: "1px solid #242220",
              padding: "2px 8px",
              borderRadius: "12px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {subgraph.nodes.length} Nodes • {subgraph.edges.length} Edges
          </span>
        </div>

        {/* Filter Chips */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setFilterType("all")}
            style={{
              background: filterType === "all" ? "#d97706" : "#141210",
              color: filterType === "all" ? "#000000" : "#a8a29e",
              border: filterType === "all" ? "none" : "1px solid #242220",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "10.5px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("services")}
            style={{
              background: filterType === "services" ? "#d97706" : "#141210",
              color: filterType === "services" ? "#000000" : "#a8a29e",
              border: filterType === "services" ? "none" : "1px solid #242220",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "10.5px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Services
          </button>
          <button
            onClick={() => setFilterType("incidents")}
            style={{
              background: filterType === "incidents" ? "#d97706" : "#141210",
              color: filterType === "incidents" ? "#000000" : "#a8a29e",
              border: filterType === "incidents" ? "none" : "1px solid #242220",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "10.5px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Outage & Squad
          </button>
          <button
            onClick={() => setFilterType("governance")}
            style={{
              background: filterType === "governance" ? "#d97706" : "#141210",
              color: filterType === "governance" ? "#000000" : "#a8a29e",
              border: filterType === "governance" ? "none" : "1px solid #242220",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "10.5px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ADRs & Claims
          </button>
        </div>
      </div>

      {/* BOTTOMBAR: Color Legend & Inspection Hint */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 14,
          zIndex: 10,
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          background: "rgba(12, 10, 9, 0.9)",
          padding: "6px 14px",
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
          border: "1px solid #242220",
          fontSize: "10px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: 8, height: 8, background: "#92400e", borderRadius: "2px", border: "1px solid #e0a35c" }}></span> Service
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: 8, height: 8, background: "#d97706", borderRadius: "2px" }}></span> Conflict
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: 8, height: 8, background: "#064e3b", borderRadius: "2px", border: "1px solid #10b981" }}></span> Approved
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: 8, height: 8, background: "#7f1d1d", borderRadius: "2px", border: "1px solid #ef4444" }}></span> Incident
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: 8, height: 8, background: "#4c1d95", borderRadius: "2px", border: "1px solid #c084fc" }}></span> Decision / ADR
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: 8, height: 8, background: "#7c2d12", borderRadius: "2px", border: "1px solid #fb923c" }}></span> Person
        </span>
        <span style={{ color: "#78716c", marginLeft: "4px" }}>| Click node to inspect</span>
      </div>

      {/* Floating Canvas Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 14,
          zIndex: 10,
          display: "flex",
          gap: "4px",
          background: "rgba(12, 10, 9, 0.9)",
          padding: "4px",
          borderRadius: "20px",
          border: "1px solid #242220",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            background: "#141210",
            color: "#f5f5f4",
            padding: "5px 8px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ZoomIn size={12} />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            background: "#141210",
            color: "#f5f5f4",
            padding: "5px 8px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ZoomOut size={12} />
        </button>
        <button
          onClick={handleFit}
          title="Fit to View"
          style={{
            background: "#141210",
            color: "#f5f5f4",
            padding: "5px 8px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Maximize2 size={12} />
        </button>
      </div>

      {/* Network Canvas */}
      <div ref={containerRef} style={{ width: "100%", height: "100%", flex: 1 }} />
    </div>
  );
};
