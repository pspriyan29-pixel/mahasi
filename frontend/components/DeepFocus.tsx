import { useState, useEffect, useRef } from "react";

interface DeepFocusProps {
  onExit: () => void;
}

const QUOTES = [
  "The expert in anything was once a beginner.",
  "Knowledge is power. Concentrated knowledge is unstoppable.",
  "Deep work is the superpower of the 21st century.",
  "Your future self is watching. Make them proud.",
  "Every minute of focus is an investment in your potential.",
  "Intelligence is not fixed. It grows with deliberate practice.",
];

const SESSION_DURATION = 25 * 60;

export default function DeepFocus({ onExit }: DeepFocusProps) {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(quoteTimer);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setRunning(false);
            if (phase === "focus") {
              setSessions((s) => s + 1);
              setPhase("break");
              return 5 * 60;
            } else {
              setPhase("focus");
              return SESSION_DURATION;
            }
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const progress =
    phase === "focus"
      ? ((SESSION_DURATION - timeLeft) / SESSION_DURATION) * 100
      : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  const circumference = 2 * Math.PI * 140;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at center, #0B1020 0%, #050505 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${300 + i * 100}px`,
            height: `${300 + i * 100}px`,
            borderRadius: "50%",
            background:
              i === 0
                ? "rgba(124,58,237,0.08)"
                : i === 1
                ? "rgba(59,130,246,0.05)"
                : "rgba(6,182,212,0.04)",
            top: `${30 + i * 10}%`,
            left: `${40 + (i - 1) * 15}%`,
            transform: "translate(-50%, -50%)",
            animation: `focus-pulse ${4 + i}s ease-in-out ${i * 0.5}s infinite`,
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(124,58,237,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "neural-breathe 4s ease-in-out infinite",
        }}
      />

      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: "28px",
          right: "28px",
          padding: "10px 20px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px",
          color: "rgba(255,255,255,0.5)",
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.2s",
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "white";
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        }}
      >
        ✕ Exit Focus
      </button>

      <div
        style={{
          position: "absolute",
          top: "28px",
          left: "28px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: running ? "#10B981" : "#6B7280",
            boxShadow: running ? "0 0 8px rgba(16,185,129,0.8)" : "none",
            transition: "all 0.3s",
          }}
        />
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
          {running
            ? phase === "focus"
              ? "Deep Focus Active"
              : "Break Time"
            : "Ready to Focus"}{" "}
          · {sessions} sessions
        </span>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px",
        }}
      >
        <div
          style={{
            padding: "8px 20px",
            background:
              phase === "focus"
                ? "rgba(124,58,237,0.15)"
                : "rgba(16,185,129,0.15)",
            border: `1px solid ${
              phase === "focus"
                ? "rgba(124,58,237,0.3)"
                : "rgba(16,185,129,0.3)"
            }`,
            borderRadius: "100px",
            fontSize: "13px",
            color: phase === "focus" ? "#A855F7" : "#6EE7B7",
            fontWeight: 600,
            letterSpacing: "0.1em",
          }}
        >
          {phase === "focus" ? "⚡ DEEP FOCUS" : "☕ BREAK TIME"}
        </div>

        <div style={{ position: "relative", animation: "timer-glow 3s ease-in-out infinite" }}>
          <svg width="320" height="320" viewBox="0 0 320 320">
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="4"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="url(#timerGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              transform="rotate(-90 160 160)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={phase === "focus" ? "#7C3AED" : "#10B981"}
                />
                <stop
                  offset="100%"
                  stopColor={phase === "focus" ? "#06B6D4" : "#3B82F6"}
                />
              </linearGradient>
            </defs>
          </svg>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-2px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmt(timeLeft)}
            </div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
              {Math.round(progress)}% complete
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => setRunning((r) => !r)}
            style={{
              padding: "16px 40px",
              background: running
                ? "rgba(239,68,68,0.15)"
                : "linear-gradient(135deg, #7C3AED, #3B82F6)",
              border: running ? "1px solid rgba(239,68,68,0.3)" : "none",
              borderRadius: "14px",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: running
                ? "none"
                : "0 8px 32px rgba(124,58,237,0.4)",
              transition: "all 0.2s",
            }}
          >
            {running ? "⏸ Pause" : "▶ Start Focus"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setTimeLeft(SESSION_DURATION);
              setPhase("focus");
            }}
            style={{
              padding: "16px 24px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              color: "rgba(255,255,255,0.5)",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ↺ Reset
          </button>
        </div>

        <div
          style={{
            maxWidth: "480px",
            textAlign: "center",
            padding: "24px 32px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            key={quoteIdx}
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.6,
              fontStyle: "italic",
              animation: "fade-in-up 0.5s ease-out",
            }}
          >
            "{QUOTES[quoteIdx]}"
          </div>
        </div>

        <div style={{ display: "flex", gap: "32px", marginTop: "8px" }}>
          {[
            { label: "Sessions", value: sessions },
            { label: "Focus Time", value: `${sessions * 25}m` },
            { label: "Streak", value: `${sessions > 0 ? sessions : 0} 🔥` },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "white" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
