import { useState, useEffect, useRef } from "react";
import LoadingIntelligence from "./LoadingIntelligence";

interface KnowledgeGraphProps {
  documentId: string;
  userId: string;
}

interface KNode {
  id: string;
  concept: string;
  connections: string[];
  x: number;
  y: number;
}

const DEMO_NODES: KNode[] = [
  { id: "1", concept: "Core Theory", connections: ["Applied Methods", "System Dynamics"], x: 380, y: 240 },
  { id: "2", concept: "Applied Methods", connections: ["Core Theory", "Feedback Loops", "Integration Framework"], x: 180, y: 150 },
  { id: "3", concept: "System Dynamics", connections: ["Core Theory", "Emergent Properties"], x: 580, y: 150 },
  { id: "4", concept: "Emergent Properties", connections: ["System Dynamics", "Knowledge Architecture"], x: 680, y: 300 },
  { id: "5", concept: "Integration Framework", connections: ["Applied Methods", "Adaptive Learning"], x: 120, y: 320 },
  { id: "6", concept: "Feedback Loops", connections: ["Applied Methods", "Core Theory"], x: 280, y: 380 },
  { id: "7", concept: "Knowledge Architecture", connections: ["Emergent Properties", "Adaptive Learning"], x: 520, y: 380 },
  { id: "8", concept: "Adaptive Learning", connections: ["Knowledge Architecture", "Integration Framework"], x: 300, y: 100 },
];

const NODE_COLORS = ["#7C3AED", "#3B82F6", "#06B6D4", "#A855F7", "#8B5CF6", "#60A5FA", "#22D3EE", "#C084FC"];

export default function KnowledgeGraph({ documentId, userId }: KnowledgeGraphProps) {
  const [nodes, setNodes] = useState<KNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<KNode | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setTimeout(() => {
      setNodes(DEMO_NODES);
      setLoading(false);
    }, 800);
  }, [documentId]);

  const getNodeByLabel = (label: string) => nodes.find((n) => n.concept === label);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y };
    setDragging(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.current.x;
    const y = e.clientY - rect.top - dragOffset.current.y;
    setNodes((prev) => prev.map((n) => n.id === dragging ? { ...n, x: Math.max(60, Math.min(740, x)), y: Math.max(40, Math.min(460, y)) } : n));
  };

  return (
    <>
      <div style={{ padding: "40px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px" }}>🔮 Knowledge Graph</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>
            {documentId ? "AI-generated concept connections from your document." : "Demo knowledge graph — upload a document to see your own."}
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
            <LoadingIntelligence />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "24px" }}>
            {/* Graph */}
            <div className="neurova-card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(124,58,237,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
              <svg
                ref={svgRef}
                width="100%"
                height="520"
                viewBox="0 0 800 500"
                onMouseMove={handleMouseMove}
                onMouseUp={() => setDragging(null)}
                onMouseLeave={() => setDragging(null)}
                style={{ cursor: dragging ? "grabbing" : "default" }}
              >
                {/* Edges */}
                {nodes.map((node) =>
                  node.connections.map((connLabel, ci) => {
                    const target = getNodeByLabel(connLabel);
                    if (!target) return null;
                    const isHighlighted =
                      hoveredNode === node.id || hoveredNode === target.id ||
                      selectedNode?.id === node.id || selectedNode?.id === target.id;
                    return (
                      <line
                        key={`${node.id}-${ci}`}
                        x1={node.x} y1={node.y} x2={target.x} y2={target.y}
                        stroke={isHighlighted ? "rgba(167,139,250,0.6)" : "rgba(124,58,237,0.15)"}
                        strokeWidth={isHighlighted ? 1.5 : 0.8}
                        strokeDasharray={isHighlighted ? "6 3" : "none"}
                        style={{ transition: "all 0.3s", animation: isHighlighted ? "edge-animate 1s linear infinite" : "none" }}
                      />
                    );
                  })
                )}

                {/* Nodes */}
                {nodes.map((node, i) => {
                  const color = NODE_COLORS[i % NODE_COLORS.length];
                  const isSelected = selectedNode?.id === node.id;
                  const isHovered = hoveredNode === node.id;
                  const r = isSelected ? 20 : isHovered ? 18 : 14;

                  return (
                    <g key={node.id}
                      onMouseDown={(e) => handleMouseDown(e, node.id)}
                      onClick={() => setSelectedNode(isSelected ? null : node)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: "grab" }}
                    >
                      {/* Glow */}
                      <circle cx={node.x} cy={node.y} r={r + 16} fill={`${color}15`}
                        style={{ animation: "node-pulse 2s ease-in-out infinite" }} />
                      {/* Ring */}
                      {(isSelected || isHovered) && (
                        <circle cx={node.x} cy={node.y} r={r + 8} fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
                      )}
                      {/* Core */}
                      <circle cx={node.x} cy={node.y} r={r} fill={color} opacity={isSelected ? 1 : 0.85}
                        style={{ filter: `drop-shadow(0 0 ${isSelected ? 16 : 8}px ${color})`, transition: "all 0.2s" }} />
                      {/* Label */}
                      <text x={node.x} y={node.y + r + 16} textAnchor="middle"
                        fill="var(--text-secondary)" fontSize="11" fontWeight={isSelected ? "700" : "500"}>
                        {node.concept}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Selected node info */}
              {selectedNode ? (
                <div style={{ padding: "20px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: "16px" }}>
                  <h3 style={{ color: "var(--accent-violet)", fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>
                    🔮 {selectedNode.concept}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "12px" }}>
                    Connected to {selectedNode.connections.length} concepts
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {selectedNode.connections.map((c, i) => (
                      <div key={i} style={{ padding: "8px 12px", background: "rgba(124,58,237,0.1)", borderRadius: "8px", fontSize: "12px", color: "var(--accent-violet)" }}>
                        → {c}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="neurova-card" style={{ padding: "20px" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", margin: 0 }}>
                    Click a node to explore its connections
                  </p>
                </div>
              )}

              {/* Legend */}
              <div className="neurova-card" style={{ padding: "20px" }}>
                <h4 style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 600, margin: "0 0 12px", letterSpacing: "0.1em" }}>LEGEND</h4>
                {[
                  { color: "#7C3AED", label: "Primary Concepts" },
                  { color: "#3B82F6", label: "Supporting Ideas" },
                  { color: "#06B6D4", label: "Applied Concepts" },
                ].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: l.color, boxShadow: `0 0 8px ${l.color}` }} />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{l.label}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="neurova-card" style={{ padding: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-violet)" }}>{nodes.length}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Nodes</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-secondary)" }}>
                      {nodes.reduce((acc, n) => acc + n.connections.length, 0)}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Connections</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
