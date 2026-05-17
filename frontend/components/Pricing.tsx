import { useState } from "react";
import type { Route } from "../App";

interface PricingProps {
  userId: string;
  onNavigate: (route: Route) => void;
}



interface Plan {
  id: "free" | "pro" | "researcher" | "team";
  name: string;
  price: number;
  priceDisplay: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceDisplay: "Rp 0",
    period: "/forever",
    description: "Start your AI learning journey",
    features: [
      "5 documents per month",
      "Basic AI chat",
      "50 flashcards",
      "Standard knowledge graph",
      "Community support",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro Student",
    price: 99000,
    priceDisplay: "Rp 99.000",
    period: "/month",
    description: "Supercharge your learning with full AI power",
    features: [
      "Unlimited documents",
      "Advanced AI models",
      "Unlimited flashcards",
      "AI presentation generator",
      "Deep focus analytics",
      "Priority support",
      "Export to PDF/PPT",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "researcher",
    name: "Researcher",
    price: 199000,
    priceDisplay: "Rp 199.000",
    period: "/month",
    description: "Advanced tools for academic excellence",
    features: [
      "Everything in Pro",
      "Research gap finder",
      "Citation generator",
      "Journal summarizer",
      "Methodology suggestions",
      "Advanced analytics",
      "Team sharing (3 members)",
    ],
    highlighted: false,
  },
  {
    id: "team",
    name: "Team",
    price: 499000,
    priceDisplay: "Rp 499.000",
    period: "/month",
    description: "Collaborative AI learning for groups",
    features: [
      "Everything in Researcher",
      "5 team members",
      "Shared knowledge base",
      "Team knowledge graphs",
      "Admin dashboard",
      "Priority AI processing",
      "Dedicated support",
    ],
    highlighted: false,
  },
];

export default function Pricing({ userId, onNavigate }: PricingProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async (plan: Plan) => {
    if (plan.id === "free") {
      onNavigate("dashboard");
      return;
    }
    // Open Pakasir payment in new tab (placeholder URL)
    alert(`Redirecting to Pakasir payment for ${plan.name} plan (Rp ${plan.price.toLocaleString("id-ID")}/month)`);
    setSuccess(true);
  };

  return (
    <>
      <div style={{ padding: "60px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px", animation: "price-appear 0.6s ease-out" }}>
          <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "100px", fontSize: "12px", color: "#A855F7", fontWeight: 600, letterSpacing: "0.1em", marginBottom: "20px" }}>
            SIMPLE PRICING
          </div>
          <h1 style={{ fontSize: "52px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", lineHeight: 1.1, margin: "0 0 16px" }}>
            Invest in Your{" "}
            <span style={{ background: "linear-gradient(90deg, #A855F7, #3B82F6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Intelligence
            </span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "18px", maxWidth: "500px", margin: "0 auto" }}>
            One platform to research, learn, memorize, and present. Powered by the world's most advanced AI.
          </p>
        </div>

        {success && (
          <div style={{ maxWidth: "500px", margin: "0 auto 40px", padding: "20px 24px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "16px", textAlign: "center", color: "#10B981", fontSize: "16px", fontWeight: 500 }}>
            🎉 Payment successful! Your account has been upgraded.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", alignItems: "start" }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="plan-card"
              style={{
                padding: "32px 24px",
                background: plan.highlighted ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.02)",
                border: plan.highlighted ? "2px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                backdropFilter: "blur(20px)",
                position: "relative",
                animation: plan.highlighted ? "plan-glow 3s ease-in-out infinite" : "none",
              }}
            >
              {plan.badge && (
                <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", padding: "4px 16px", background: "linear-gradient(90deg, #7C3AED, #3B82F6)", borderRadius: "100px", fontSize: "12px", color: "white", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", margin: "0 0 8px" }}>{plan.name}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>{plan.description}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "32px", fontWeight: 900, color: plan.highlighted ? "#A855F7" : "var(--text-primary)" }}>{plan.priceDisplay}</span>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{plan.period}</span>
                </div>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                    <span style={{ color: plan.highlighted ? "#A855F7" : "var(--success)", flexShrink: 0, marginTop: "1px" }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="cta-btn"
                onClick={() => handlePayment(plan)}
                disabled={loading === plan.id}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: plan.highlighted
                    ? "linear-gradient(135deg, #7C3AED, #3B82F6)"
                    : "rgba(255,255,255,0.05)",
                  border: plan.highlighted ? "none" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: loading === plan.id ? "not-allowed" : "pointer",
                  opacity: loading === plan.id ? 0.6 : 1,
                  boxShadow: plan.highlighted ? "0 4px 20px rgba(124,58,237,0.4)" : "none",
                }}
              >
                {loading === plan.id ? "Processing..." : plan.id === "free" ? "Start Free" : "Upgrade Now"}
              </button>
            </div>
          ))}
        </div>

        <div className="neurova-card" style={{ marginTop: "80px", padding: "40px", textAlign: "center" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>Don't Just Study. Evolve.</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", marginBottom: "28px", maxWidth: "500px", margin: "0 auto 28px" }}>
            Join thousands of students using NEUROVA to transform their learning.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
            {[["10,000+", "Active Students"], ["1M+", "Flashcards Created"], ["50,000+", "Documents Processed"], ["98%", "Satisfaction Rate"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 900, background: "linear-gradient(90deg, #A855F7, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{num}</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
