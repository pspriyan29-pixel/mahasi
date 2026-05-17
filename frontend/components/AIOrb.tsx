import { useEffect, useRef, useState } from "react";

interface AIorbProps {
  size?: number;
  label?: string;
  interactive?: boolean;
}

export default function AIOrb({ size = 200, label = "NEUROVA AI", interactive = true }: AIorbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setTilt({ x: dy * 12, y: dx * 12 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          perspective: "800px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${size}px`,
            height: `${size}px`,
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.1s ease-out",
            animation: "orb-pulse 4s ease-in-out infinite",
          }}
        >
          {/* Outer glow rings */}
          <div
            style={{
              position: "absolute",
              inset: `-${size * 0.2}px`,
              borderRadius: "50%",
              border: "1px solid rgba(124,58,237,0.15)",
              animation: "ring-rotate 20s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: `-${size * 0.12}px`,
              borderRadius: "50%",
              border: "1px solid rgba(59,130,246,0.2)",
              animation: "ring-rotate-reverse 15s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: `-${size * 0.05}px`,
              borderRadius: "50%",
              border: "1px solid rgba(6,182,212,0.25)",
              animation: "ring-rotate 10s linear infinite",
            }}
          />

          {/* Core orb */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 35%, #A855F7, #7C3AED 40%, #3B82F6 70%, #06B6D4 90%)",
              animation: "orb-breathe 3s ease-in-out infinite",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Inner highlight */}
            <div
              style={{
                position: "absolute",
                top: "15%",
                left: "20%",
                width: "35%",
                height: "30%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            />
            {/* Inner scan line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                animation: "ring-rotate 3s linear infinite",
                transformOrigin: `${size / 2}px ${size / 2}px`,
              }}
            />
          </div>
        </div>

        {label && (
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.3em",
              color: "rgba(167,139,250,1)",
              animation: "label-glow 3s ease-in-out infinite",
            }}
          >
            {label}
          </div>
        )}
      </div>
    </>
  );
}
