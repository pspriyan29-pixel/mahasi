import { useEffect, useState } from "react";
import type { Route } from "../App";
import LoadingIntelligence from "./LoadingIntelligence";
import { listDocuments, getAIMemory } from "../lib/supabase";
import { motion } from "framer-motion";

interface DashboardProps {
  userId: string;
  onNavigate: (route: Route) => void;
  onSelectDocument: (id: string) => void;
  onFocusMode: () => void;
}

interface Document {
  id: string;
  title: string;
  summary?: string;
  created_at: string;
  file_name?: string;
}

interface MemoryItem {
  id: string;
  topic: string;
  strength?: number;
  created_at: string;
}

const quickActions = [
  { icon: "📄", label: "Upload Document", desc: "Process PDF with AI", route: "documents" as Route, color: "#7C3AED" },
  { icon: "🧠", label: "AI Tutor", desc: "Ask anything", route: "chat" as Route, color: "#3B82F6" },
  { icon: "🔮", label: "Knowledge Graph", desc: "Visualize connections", route: "knowledge" as Route, color: "#06B6D4" },
  { icon: "📊", label: "Presentations", desc: "Generate slides", route: "presentations" as Route, color: "#A855F7" },
  { icon: "🎯", label: "Deep Focus", desc: "Enter flow state", route: "focus" as Route, color: "#10B981" },
  { icon: "🎴", label: "Flashcards", desc: "Review & memorize", route: "flashcards" as Route, color: "#F59E0B" },
];

function StatCard({ value, label, color, icon, delay }: { value: string | number; label: string; color: string; icon: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="neurova-card" 
      style={{ padding: "24px", flex: 1, cursor: "default", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "12px", boxShadow: "var(--shadow-raised)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ fontSize: "28px", fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: "24px", opacity: 0.7 }}>{icon}</div>
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
    </motion.div>
  );
}

export default function Dashboard({ userId, onNavigate, onSelectDocument, onFocusMode }: DashboardProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const load = async () => {
      try {
        const [docs, mem] = await Promise.allSettled([
          listDocuments(userId),
          getAIMemory(userId),
        ]);
        if (docs.status === "fulfilled") setDocuments(docs.value as Document[]);
        if (mem.status === "fulfilled") setMemory(mem.value as MemoryItem[]);
      } catch (e) {
        console.warn("Dashboard load error (expected if tables not yet created):", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const totalFlashcards = documents.length * 5;
  const knowledgeNodes = documents.length * 8;

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1400px" }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ marginBottom: "40px" }}
      >
        <div style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "8px", fontWeight: 500 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <h1 style={{ fontSize: "34px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span>{greeting},</span>
          <span style={{ background: "linear-gradient(135deg, var(--stripe-purple, #3370FF) 0%, #6366f1 50%, #8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Neural Explorer</span>
          <span>👋</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", margin: 0 }}>
          Your AI learning system is ready.{" "}
          {documents.length > 0 ? `${documents.length} documents processed.` : "Upload your first document to begin."}
        </p>

        {/* CMD+K hint */}
        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <kbd style={{
            padding: "4px 10px", background: "var(--bg-subtle)",
            border: "1px solid var(--border-light)", borderRadius: "6px",
            fontSize: "12px", color: "var(--text-muted)",
          }}>⌘K</kbd>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Command palette — search, navigate, ask AI</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "28px" }}>
        <StatCard value={documents.length} label="Documents Processed" color="var(--stripe-purple)" icon="📄" delay={0.1} />
        <StatCard value={totalFlashcards} label="Flashcards Generated" color="var(--accent-secondary)" icon="🎴" delay={0.2} />
        <StatCard value={knowledgeNodes} label="Knowledge Nodes" color="var(--success-text)" icon="🔮" delay={0.3} />
        <StatCard value={memory.length} label="AI Memory Items" color="var(--stripe-purple)" icon="🧬" delay={0.4} />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}
      >
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="stripe-card" style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "12px", boxShadow: "var(--shadow-raised)" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "18px", margin: "0 0 18px" }}>⚡ Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {quickActions.map((action) => (
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "var(--bg-subtle)" }}
                whileTap={{ scale: 0.98 }}
                key={action.route}
                className="quick-action-btn"
                onClick={() => action.route === "focus" ? onFocusMode() : onNavigate(action.route)}
                style={{
                  padding: "16px", background: "var(--bg-card)",
                  border: "1px solid var(--border-light)", borderRadius: "12px",
                  cursor: "pointer", textAlign: "left",
                  display: "flex", flexDirection: "column", gap: "6px",
                  boxShadow: "var(--shadow-raised)"
                }}
              >
                <span style={{ fontSize: "22px" }}>{action.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{action.label}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{action.desc}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* AI Memory Map */}
        <motion.div variants={itemVariants} className="stripe-card" style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "12px", boxShadow: "var(--shadow-raised)" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "18px", margin: "0 0 18px" }}>🧬 AI Memory Map</h2>
          {loading ? (
            <LoadingIntelligence compact />
          ) : memory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>🧠</div>
              <p style={{ fontSize: "14px", margin: 0 }}>Upload documents to build your AI memory map</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {memory.slice(0, 6).map((m, i) => {
                const pct = Math.round((m.strength || (0.3 + i * 0.12)) * 100);
                const color = pct > 70 ? "var(--success-text)" : pct > 40 ? "var(--stripe-purple)" : "var(--error-text)";
                return (
                  <div key={m.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{m.topic}</span>
                      <span style={{ fontSize: "12px", color, fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: "4px", background: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                        style={{ height: "100%", background: color, borderRadius: "2px" }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}
      >
        {/* Recent Documents */}
        <motion.div variants={itemVariants} className="stripe-card" style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "12px", boxShadow: "var(--shadow-raised)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>📄 Recent Documents</h2>
            <button onClick={() => onNavigate("documents")} style={{ background: "none", border: "none", color: "var(--stripe-purple)", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>Upload new →</button>
          </div>
          {loading ? <LoadingIntelligence compact /> : documents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
              <p style={{ margin: 0, fontSize: "14px" }}>No documents yet. Upload your first PDF!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {documents.slice(0, 5).map((doc) => (
                <motion.div key={doc.id} 
                  whileHover={{ scale: 1.01, x: 5, backgroundColor: "var(--bg-subtle)" }}
                  onClick={() => { onSelectDocument(doc.id); onNavigate("knowledge"); }}
                  style={{
                    padding: "14px 16px", background: "var(--bg-card)",
                    borderRadius: "10px", border: "1px solid var(--border-light)",
                    cursor: "pointer", transition: "border-color 0.2s ease"
                  }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{doc.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                    <span>{doc.file_name || "5 flashcards · 8 nodes"}</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={itemVariants} className="stripe-card" style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "12px", boxShadow: "var(--shadow-raised)" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "18px", margin: "0 0 18px" }}>✨ AI Insights</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "Upload a PDF to generate instant flashcards and quizzes",
              "Use CMD+K to quickly navigate or ask NEUROVA anything",
              "Try Deep Focus mode for distraction-free study sessions",
              "Knowledge Graph visualizes how concepts connect",
            ].map((rec, i) => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={i} style={{
                padding: "12px 14px",
                background: "var(--stripe-purple-tint)",
                border: "1px solid var(--stripe-purple-light)",
                borderRadius: "10px", display: "flex", gap: "10px", alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "14px", flexShrink: 0 }}>💡</span>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{rec}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
