import { useState, useEffect } from "react";
import LoadingIntelligence from "./LoadingIntelligence";

interface FlashcardsProps {
  documentId: string;
  userId: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
}

const DEMO_CARDS: Flashcard[] = [
  { id: "1", question: "What is the fundamental principle of emergent systems?", answer: "Emergent systems exhibit properties that arise from the interaction of simpler components but cannot be predicted from any individual component alone. The whole becomes greater than the sum of its parts through synergistic interaction.", difficulty: "medium" },
  { id: "2", question: "How does spaced repetition optimize memory retention?", answer: "Spaced repetition exploits the psychological spacing effect — reviewing information at increasing intervals forces the brain to actively reconstruct memories, strengthening neural pathways and dramatically improving long-term retention.", difficulty: "hard" },
  { id: "3", question: "What defines an effective feedback loop in learning systems?", answer: "An effective feedback loop provides timely, specific, and actionable information that allows the learner to calibrate their understanding and adjust their approach, creating a self-improving cycle of knowledge acquisition.", difficulty: "medium" },
  { id: "4", question: "What is semantic understanding in the context of AI?", answer: "Semantic understanding refers to the ability to comprehend meaning, context, and relationships between concepts rather than just pattern matching. It involves grasping the underlying intent and implications of information.", difficulty: "easy" },
  { id: "5", question: "How does cross-domain synthesis accelerate learning?", answer: "By identifying structural similarities between different domains, cross-domain synthesis allows learners to transfer existing mental models to new contexts, dramatically reducing the cognitive load required to build new understanding.", difficulty: "hard" },
];

export default function Flashcards({ documentId }: FlashcardsProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Use demo cards — in production connect to Supabase flashcards table
    setTimeout(() => {
      setCards(DEMO_CARDS);
      setLoading(false);
    }, 600);
  }, [documentId]);

  const current = cards[currentIdx];
  const progress = cards.length > 0 ? (completed.size / cards.length) * 100 : 0;

  const next = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx((i) => (i + 1) % cards.length), 150);
  };

  const prev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx((i) => (i - 1 + cards.length) % cards.length), 150);
  };

  const markComplete = () => {
    if (current) {
      setCompleted((prev) => new Set([...prev, current.id]));
      next();
    }
  };

  const difficultyColor = (d: string) =>
    d === "easy" ? "#10B981" : d === "hard" ? "#EF4444" : "#F59E0B";

  return (
    <>
      <div style={{ padding: "40px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", margin: "0 0 8px" }}>🎴 Flashcards</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>
            {documentId ? "AI-generated flashcards from your document." : "Demo flashcards — upload a document to generate yours."}
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
            <LoadingIntelligence />
          </div>
        ) : (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            {/* Progress */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  Card {currentIdx + 1} of {cards.length}
                </span>
                <span style={{ color: "var(--accent-violet)", fontSize: "13px", fontWeight: 600 }}>
                  {completed.size} mastered
                </span>
              </div>
              <div style={{ height: "4px", background: "var(--border-subtle)", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent-gradient)", borderRadius: "2px", transition: "width 0.5s ease", boxShadow: "0 0 8px rgba(124,58,237,0.6)" }} />
              </div>
            </div>

            {/* Card */}
            {current && (
              <div style={{ perspective: "1200px", marginBottom: "28px" }}>
                <div
                  onClick={() => setFlipped(!flipped)}
                  style={{
                    position: "relative",
                    height: "380px",
                    cursor: "pointer",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front */}
                  <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    padding: "48px",
                    background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.05))",
                    border: "1px solid rgba(124,58,237,0.3)",
                    borderRadius: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "0 0 40px rgba(124,58,237,0.15)",
                  }}>
                    <div style={{ position: "absolute", top: "20px", left: "20px", padding: "4px 10px", background: `${difficultyColor(current.difficulty)}20`, border: `1px solid ${difficultyColor(current.difficulty)}40`, borderRadius: "20px", fontSize: "11px", color: difficultyColor(current.difficulty), fontWeight: 600 }}>
                      {current.difficulty.toUpperCase()}
                    </div>
                    <div style={{ position: "absolute", top: "20px", right: "20px", padding: "4px 10px", background: "rgba(124,58,237,0.15)", borderRadius: "20px", fontSize: "11px", color: "#A855F7" }}>AI Generated</div>
                    <div style={{ fontSize: "48px", marginBottom: "24px" }}>❓</div>
                    <p style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 600, lineHeight: 1.6, margin: 0 }}>{current.question}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "24px", margin: "24px 0 0" }}>Click to reveal answer</p>
                  </div>

                  {/* Back */}
                  <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    padding: "48px",
                    background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.05))",
                    border: "1px solid rgba(6,182,212,0.3)",
                    borderRadius: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "0 0 40px rgba(6,182,212,0.1)",
                  }}>
                    <div style={{ fontSize: "48px", marginBottom: "24px" }}>💡</div>
                    <p style={{ color: "var(--text-primary)", fontSize: "17px", lineHeight: 1.8, margin: 0 }}>{current.answer}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", alignItems: "center" }}>
              <button className="nav-btn neurova-btn-ghost" onClick={prev}
                style={{ padding: "12px 24px", fontSize: "14px", cursor: "pointer" }}>
                ← Prev
              </button>
              <button onClick={markComplete}
                style={{ padding: "12px 28px", background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(6,182,212,0.15))", border: "1px solid rgba(16,185,129,0.4)", borderRadius: "12px", color: "var(--success)", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                ✓ Got it
              </button>
              <button className="nav-btn neurova-btn-ghost" onClick={next}
                style={{ padding: "12px 24px", fontSize: "14px", cursor: "pointer" }}>
                Next →
              </button>
            </div>

            {/* Difficulty legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "24px" }}>
              {([["easy", "var(--success)"], ["medium", "var(--warning)"], ["hard", "var(--error)"]] as [string, string][]).map(([d, c]) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "capitalize" }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
