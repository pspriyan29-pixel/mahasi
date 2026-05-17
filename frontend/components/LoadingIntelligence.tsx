import { useEffect, useState } from "react";

interface LoadingIntelligenceProps {
  messages?: string[];
  compact?: boolean;
}

const DEFAULT_MESSAGES = [
  "Analyzing semantics...",
  "Building knowledge graph...",
  "Generating insights...",
  "Synthesizing understanding...",
  "Mapping neural pathways...",
  "Calibrating intelligence...",
];

export default function LoadingIntelligence({
  messages = DEFAULT_MESSAGES,
  compact = false,
}: LoadingIntelligenceProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [nodeStates, setNodeStates] = useState<boolean[]>(Array(8).fill(false));

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 1800);
    return () => clearInterval(msgTimer);
  }, [messages]);

  useEffect(() => {
    const progTimer = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1.2));
    }, 50);
    return () => clearInterval(progTimer);
  }, []);

  useEffect(() => {
    const nodeTimer = setInterval(() => {
      const idx = Math.floor(Math.random() * 8);
      setNodeStates((prev) => {
        const next = [...prev];
        next[idx] = !next[idx];
        return next;
      });
    }, 300);
    return () => clearInterval(nodeTimer);
  }, []);

  const nodePositions = [
    { x: 50, y: 20 }, { x: 150, y: 10 }, { x: 250, y: 30 },
    { x: 80, y: 80 }, { x: 180, y: 60 }, { x: 280, y: 80 },
    { x: 120, y: 120 }, { x: 220, y: 110 },
  ];

  const edges = [
    [0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 7], [5, 7], [6, 7],
  ];

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#7C3AED",
                animation: `thinking-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: "13px", color: "rgba(167,139,250,0.8)" }}>
          {messages[messageIndex]}
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          padding: "40px",
        }}
      >
        {/* Neural node graph */}
        <div style={{ position: "relative" }}>
          <svg width="320" height="150" viewBox="0 0 320 150">
            {edges.map(([a, b], i) => (
              <line
                key={i}
                x1={nodePositions[a].x + 10}
                y1={nodePositions[a].y + 10}
                x2={nodePositions[b].x + 10}
                y2={nodePositions[b].y + 10}
                stroke={
                  nodeStates[a] || nodeStates[b]
                    ? "rgba(124,58,237,0.8)"
                    : "rgba(124,58,237,0.2)"
                }
                strokeWidth={nodeStates[a] || nodeStates[b] ? "1.5" : "0.5"}
                strokeDasharray="8 4"
                style={{
                  animation: `edge-flow 2s linear ${i * 0.15}s infinite`,
                  transition: "stroke 0.3s, stroke-width 0.3s",
                }}
              />
            ))}
            {nodePositions.map((pos, i) => (
              <g key={i}>
                <circle
                  cx={pos.x + 10}
                  cy={pos.y + 10}
                  r={nodeStates[i] ? 7 : 4}
                  fill={nodeStates[i] ? "#7C3AED" : "rgba(124,58,237,0.4)"}
                  style={{ transition: "r 0.2s, fill 0.2s" }}
                />
                {nodeStates[i] && (
                  <circle
                    cx={pos.x + 10}
                    cy={pos.y + 10}
                    r="14"
                    fill="none"
                    stroke="rgba(124,58,237,0.3)"
                    strokeWidth="1"
                    style={{ animation: "node-pulse 1s ease-in-out infinite" }}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Scan line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, rgba(6,182,212,0.8), transparent)",
              animation: "scan-line 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Status message */}
        <div
          key={messageIndex}
          style={{
            color: "rgba(167,139,250,1)",
            fontSize: "15px",
            fontWeight: 500,
            letterSpacing: "0.05em",
            animation: "fade-in-up 0.4s ease-out",
          }}
        >
          {messages[messageIndex]}
        </div>

        {/* Neural progress bar */}
        <div
          style={{
            width: "280px",
            height: "3px",
            background: "rgba(124,58,237,0.15)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #7C3AED, #3B82F6, #06B6D4)",
              borderRadius: "2px",
              transition: "width 0.05s linear",
              boxShadow: "0 0 8px rgba(124,58,237,0.8)",
            }}
          />
        </div>
      </div>
    </>
  );
}
