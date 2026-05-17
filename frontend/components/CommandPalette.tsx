import React, { useEffect, useRef, useState } from "react";
import type { Route } from "../App";
import { streamChat, detectTaskType } from "../lib/openrouter";

interface CommandPaletteProps {
  onNavigate: (route: Route) => void;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  category: string;
  action?: () => void;
  route?: Route;
}

const Icons = {
  Dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  Chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Documents: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Graph: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Cards: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="14" rx="2" ry="2"/><path d="M7 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/></svg>,
  Presentations: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="M12 21v-5"/><path d="M8 21h8"/></svg>,
  Focus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Pricing: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  AI: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  Search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

const NAV_COMMANDS = (onNavigate: (r: Route) => void, onClose: () => void): CommandItem[] => [
  { id: "dashboard", icon: Icons.Dashboard, label: "Dashboard", description: "Go to your AI dashboard", category: "Navigate", route: "dashboard" },
  { id: "chat", icon: Icons.Chat, label: "AI Tutor", description: "Chat with NEUROVA AI", category: "Navigate", route: "chat" },
  { id: "documents", icon: Icons.Documents, label: "Documents", description: "Upload & analyze PDFs", category: "Navigate", route: "documents" },
  { id: "knowledge", icon: Icons.Graph, label: "Knowledge Graph", description: "Visualize your knowledge", category: "Navigate", route: "knowledge" },
  { id: "flashcards", icon: Icons.Cards, label: "Flashcards", description: "Review with AI flashcards", category: "Navigate", route: "flashcards" },
  { id: "presentations", icon: Icons.Presentations, label: "Presentations", description: "Generate AI slides", category: "Navigate", route: "presentations" },
  { id: "focus", icon: Icons.Focus, label: "Deep Focus", description: "Enter flow state", category: "Navigate", route: "focus" },
  { id: "pricing", icon: Icons.Pricing, label: "Upgrade Plan", description: "View pricing & plans", category: "Navigate", route: "pricing" },
];

export default function CommandPalette({ onNavigate, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeModel, setActiveModel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = NAV_COMMANDS(onNavigate, onClose);

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Enter AI mode with ">"
  const isAIQuery = query.startsWith(">") || query.startsWith("ai ");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIdx(0);
    setAiResponse("");
    setIsAiMode(false);
  }, [query]);

  const executeCommand = (cmd: CommandItem) => {
    if (cmd.route) {
      onNavigate(cmd.route);
      onClose();
    }
  };

  const runAIQuery = async () => {
    const prompt = query.replace(/^>|^ai /, "").trim();
    if (!prompt) return;
    setIsAiMode(true);
    setIsAiLoading(true);
    setAiResponse("");

    const task = detectTaskType(prompt);
    let accumulated = "";
    await streamChat(
      [{ role: "user", content: prompt }],
      task,
      (chunk) => {
        accumulated += chunk.content;
        setAiResponse(accumulated);
        setIsAiLoading(false);
      },
      (model) => setActiveModel(model)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (isAIQuery) {
        runAIQuery();
      } else if (filtered[activeIdx]) {
        executeCommand(filtered[activeIdx]);
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "12vh", paddingInline: "16px",
        animation: "overlay-in 0.15s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: "680px",
        background: "var(--pure-white)",
        border: "1px solid var(--border-light)",
        borderRadius: "16px",
        boxShadow: "0 32px 96px rgba(0,0,0,0.2), 0 0 0 1px rgba(124,58,237,0.05)",
        overflow: "hidden",
        animation: "fade-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}>
        {/* Search Bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-light)",
          background: "var(--bg-card)",
        }}>
          <span style={{ fontSize: "20px", flexShrink: 0, color: "var(--text-muted)", display: "flex" }}>
            {isAIQuery ? <span style={{ color: "var(--stripe-purple)" }}>{Icons.AI}</span> : Icons.Search}
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAIQuery ? "Ask NEUROVA anything… (Press Enter)" : "Search commands or type > to ask AI…"}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: "18px", color: "var(--text-primary)", fontFamily: "inherit",
              fontWeight: 500, letterSpacing: "-0.01em"
            }}
          />
          <kbd style={{
            padding: "4px 8px", background: "var(--bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "6px", fontSize: "12px", color: "var(--text-muted)", flexShrink: 0,
            fontWeight: 600, fontFamily: "var(--font-sans)"
          }}>ESC</kbd>
        </div>

        {/* AI Response Panel */}
        {isAiMode && (
          <div style={{
            padding: "24px", borderBottom: "1px solid var(--border-light)",
            maxHeight: "350px", overflowY: "auto", background: "var(--pure-white)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success-text)", boxShadow: "0 0 6px var(--success-text)" }} />
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Neurova Engine</span>
              {activeModel && (
                <span style={{
                  fontSize: "11px", padding: "2px 10px",
                  background: "var(--stripe-purple-light)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: "20px", color: "var(--stripe-purple)",
                  fontWeight: 600
                }}>
                  {activeModel.split("/").pop()?.split(":")[0]}
                </span>
              )}
            </div>
            {isAiLoading && !aiResponse && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "12px 0" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: "var(--stripe-purple)",
                    animation: `thinking-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
            {aiResponse && (
              <p style={{ fontSize: "16px", color: "var(--text-primary)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", letterSpacing: "-0.01em" }}>
                {aiResponse}
                {isAiLoading && (
                  <span style={{ display: "inline-block", width: "8px", height: "16px", background: "var(--stripe-purple)", marginLeft: "4px", animation: "cursor-blink 0.8s ease-in-out infinite", verticalAlign: "middle" }} />
                )}
              </p>
            )}
          </div>
        )}

        {/* Commands List */}
        {!isAiMode && (
          <div style={{ maxHeight: "400px", overflowY: "auto", padding: "12px 8px" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "15px" }}>
                No commands found. Type <strong style={{ color: "var(--stripe-purple)" }}>{">"}</strong> to ask the AI.
              </div>
            )}

            {/* Group by category */}
            {Object.entries(
              filtered.reduce((acc, cmd) => {
                if (!acc[cmd.category]) acc[cmd.category] = [];
                acc[cmd.category].push(cmd);
                return acc;
              }, {} as Record<string, CommandItem[]>)
            ).map(([category, items]) => (
              <div key={category} style={{ marginBottom: "16px" }}>
                <div style={{
                  padding: "8px 16px 8px",
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em",
                  color: "var(--text-muted)", textTransform: "uppercase",
                }}>
                  {category}
                </div>
                {items.map((cmd, i) => {
                  const globalIdx = filtered.indexOf(cmd);
                  const isActive = globalIdx === activeIdx;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "12px 16px", borderRadius: "12px",
                        background: isActive ? "var(--bg-light)" : "transparent",
                        cursor: "pointer", transition: "all 0.1s ease",
                        margin: "0 8px 4px"
                      }}
                    >
                      <span style={{ display: "flex", color: isActive ? "var(--stripe-purple)" : "var(--text-muted)" }}>
                        {cmd.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}>{cmd.label}</div>
                        {isActive && <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{cmd.description}</div>}
                      </div>
                      {isActive && (
                        <kbd style={{
                          padding: "4px 10px", background: "var(--pure-white)",
                          border: "1px solid var(--border-light)",
                          borderRadius: "6px", fontSize: "12px", color: "var(--text-muted)",
                          fontWeight: 600, fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-raised)"
                        }}>↵</kbd>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: "12px 24px",
          borderTop: "1px solid var(--border-light)",
          display: "flex", gap: "24px", alignItems: "center",
          background: "var(--bg-card)",
        }}>
          {[
            { key: "↑↓", desc: "Navigate" },
            { key: "↵", desc: "Select" },
            { key: ">", desc: "Ask AI" },
          ].map(({ key, desc }) => (
            <div key={key} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <kbd style={{
                padding: "2px 8px", background: "var(--bg-light)",
                border: "1px solid var(--border-light)",
                borderRadius: "4px", fontSize: "12px", color: "var(--text-muted)",
                fontWeight: 600, fontFamily: "var(--font-sans)"
              }}>{key}</kbd>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes thinking-dot {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
