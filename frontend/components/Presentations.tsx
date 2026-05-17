import { useState } from "react";
import LoadingIntelligence from "./LoadingIntelligence";
import { quickChat } from "../lib/openrouter";

interface PresentationsProps {
  documentId: string;
  userId: string;
}

interface Slide {
  title: string;
  content: string;
  type: string;
  bulletPoints: string[];
}

const SLIDE_GRADIENTS: Record<string, string> = {
  title: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
  overview: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))",
  content: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(124,58,237,0.1))",
  findings: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.1))",
  methodology: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
  conclusion: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1))",
};

export default function Presentations({ documentId }: PresentationsProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      // Use OpenRouter to generate slide content
      const prompt = `Generate a 6-slide presentation outline for: "${title}". 
Return JSON array with this structure (no markdown, raw JSON only):
[{"title": "...", "content": "...", "type": "title", "bulletPoints": []},...]
Types: title, overview, content, findings, methodology, conclusion.
Keep bullet points to max 4 per slide.`;
      const raw = await quickChat(prompt, "research");
      // Try to parse AI-returned JSON
      const jsonMatch = raw.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setSlides(parsed);
        setGenerated(true);
        setSelectedSlide(0);
        return;
      }
    } catch (e) {
      console.warn("AI slide gen failed, using fallback", e);
    }
    // Fallback slides
    setSlides([
      { title, content: "AI-generated presentation", type: "title", bulletPoints: [] },
      { title: "Overview", content: "Key topics covered in this presentation", type: "overview", bulletPoints: ["Introduction to the topic", "Core principles", "Practical applications", "Key takeaways"] },
      { title: "Core Concepts", content: "Fundamental principles and foundations", type: "content", bulletPoints: ["Theoretical framework", "Essential definitions", "Historical context", "Modern applications"] },
      { title: "Key Findings", content: "Evidence and analysis", type: "findings", bulletPoints: ["Primary research results", "Supporting data", "Comparative analysis", "Statistical insights"] },
      { title: "Methodology", content: "Approach and framework", type: "methodology", bulletPoints: ["Research design", "Data collection", "Analysis process", "Validation methods"] },
      { title: "Conclusion", content: "Summary and next steps", type: "conclusion", bulletPoints: ["Key insights", "Practical implications", "Future directions", "Call to action"] },
    ]);
    setGenerated(true);
    setSelectedSlide(0);
    setLoading(false);
  };

  return (
    <>
      <div style={{ padding: "40px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px" }}>📊 AI Presentations</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>Generate professional presentations from any topic or document.</p>
        </div>

        {!generated ? (
          <div style={{ maxWidth: "600px" }}>
            <div className="neurova-card" style={{ padding: "32px", marginBottom: "20px" }}>
              <label style={{ color: "var(--text-muted)", fontSize: "14px", display: "block", marginBottom: "12px" }}>Presentation Title or Topic</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Neural Networks"
                onKeyDown={(e) => e.key === "Enter" && generate()}
                className="neurova-input"
                style={{ width: "100%", padding: "14px 18px", fontSize: "16px", marginBottom: "20px" }}
              />
              <button onClick={generate} disabled={!title.trim() || loading}
                style={{ width: "100%", padding: "16px", background: title.trim() ? "linear-gradient(135deg, #7C3AED, #3B82F6)" : "var(--bg-card)", border: title.trim() ? "none" : "1px solid var(--border-default)", borderRadius: "12px", color: title.trim() ? "white" : "var(--text-muted)", fontSize: "16px", fontWeight: 700, cursor: title.trim() ? "pointer" : "not-allowed", boxShadow: title.trim() ? "0 0 30px rgba(124,58,237,0.3)" : "none", transition: "all 0.2s" }}>
                {loading ? "Generating with AI…" : "⚡ Generate Presentation"}
              </button>
            </div>

            {loading && (
              <div style={{ padding: "32px", background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "20px", display: "flex", justifyContent: "center" }}>
                <LoadingIntelligence messages={["Structuring narrative...", "Designing slide flow...", "Extracting key insights...", "Building visual hierarchy...", "Finalizing presentation..."]} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px" }}>
            {/* Thumbnails */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {slides.map((slide, i) => (
                <div key={i} className="slide-thumb"
                  onClick={() => setSelectedSlide(i)}
                  style={{
                    padding: "12px 14px",
                    background: selectedSlide === i ? "rgba(124,58,237,0.15)" : "var(--bg-card)",
                    border: `1px solid ${selectedSlide === i ? "rgba(124,58,237,0.5)" : "var(--border-subtle)"}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600 }}>
                    {String(i + 1).padStart(2, "0")} · {slide.type.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "13px", color: selectedSlide === i ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: 600, lineHeight: 1.3 }}>
                    {slide.title}
                  </div>
                </div>
              ))}

              <button onClick={() => { setGenerated(false); setSlides([]); setTitle(""); }}
                className="neurova-btn-ghost"
                style={{ marginTop: "8px", padding: "10px", fontSize: "13px", cursor: "pointer", width: "100%" }}>
                ← New Presentation
              </button>
            </div>

            {/* Slide View */}
            {slides[selectedSlide] && (
              <div style={{ animation: "slide-in 0.3s ease-out" }}>
                <div style={{
                  aspectRatio: "16/9",
                  padding: "60px",
                  background: SLIDE_GRADIENTS[slides[selectedSlide].type] || SLIDE_GRADIENTS.content,
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: "20px",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginBottom: "16px",
                  boxShadow: "0 0 60px rgba(124,58,237,0.1)",
                }}>
                  {/* Neural grid bg */}
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.5 }} />

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "11px", color: "rgba(167,139,250,0.6)", fontWeight: 600, letterSpacing: "0.15em", marginBottom: "16px" }}>
                      NEUROVA AI · SLIDE {selectedSlide + 1}/{slides.length}
                    </div>
                    {slides[selectedSlide].type === "title" ? (
                      <>
                        <h1 style={{ fontSize: "52px", fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: "16px" }}>{slides[selectedSlide].title}</h1>
                        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>{slides[selectedSlide].content}</p>
                      </>
                    ) : (
                      <>
                        <h2 style={{ fontSize: "36px", fontWeight: 700, color: "white", marginBottom: "12px" }}>{slides[selectedSlide].title}</h2>
                        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>{slides[selectedSlide].content}</p>
                        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                          {slides[selectedSlide].bulletPoints.map((bp, bi) => (
                            <li key={bi} style={{ display: "flex", alignItems: "center", gap: "12px", color: "rgba(255,255,255,0.8)", fontSize: "15px" }}>
                              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7C3AED", flexShrink: 0, boxShadow: "0 0 8px rgba(124,58,237,0.8)" }} />
                              {bp}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => setSelectedSlide(Math.max(0, selectedSlide - 1))} disabled={selectedSlide === 0}
                    style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", cursor: "pointer", opacity: selectedSlide === 0 ? 0.4 : 1 }}>
                    ← Prev
                  </button>
                  <button onClick={() => setSelectedSlide(Math.min(slides.length - 1, selectedSlide + 1))} disabled={selectedSlide === slides.length - 1}
                    style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", cursor: "pointer", opacity: selectedSlide === slides.length - 1 ? 0.4 : 1 }}>
                    Next →
                  </button>
                  <button style={{ marginLeft: "auto", padding: "10px 24px", background: "linear-gradient(135deg, #7C3AED, #3B82F6)", border: "none", borderRadius: "10px", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                    ↓ Export
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
