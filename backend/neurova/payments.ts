import { Router } from "express";
import { db } from "./db.js";
import crypto from "crypto";

const router = Router();

const PAKASIR_SLUG = "mahasi";

const PLANS = {
  pro: {
    name: "Pro Student",
    price: 99000,
    features: ["Unlimited AI Chat", "Advanced Models", "Premium Exports"],
  },
  researcher: {
    name: "Researcher",
    price: 199000,
    features: ["Everything in Pro", "Advanced Research Tools", "Team Features"],
  },
  team: {
    name: "Team",
    price: 499000,
    features: ["Everything in Researcher", "5 Team Members", "Priority Support"],
  },
};

// Creates a payment session for a plan upgrade using Pakasir.
router.post("/create", async (req, res) => {
  try {
    const { userId, plan: requestedPlan } = req.body;
    const planKey = requestedPlan as keyof typeof PLANS;
    const plan = PLANS[planKey] || PLANS.pro;
    const orderId = `NEUROVA-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase()}`;

    const paymentId = crypto.randomUUID();
    
    const { error } = await db.from("payments").insert({
      id: paymentId,
      user_id: userId,
      order_id: orderId,
      amount: plan.price,
      status: "pending",
      plan: requestedPlan,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error creating payment:", error);
      return res.status(500).json({ error: "Failed to create payment in database" });
    }

    const redirectUrl = `https://proj-d83vfik82vjr2lt2ioag.lp.dev/#/dashboard?payment=success`;
    const paymentUrl = `https://app.pakasir.com/pay/${PAKASIR_SLUG}/${plan.price}?order_id=${orderId}&redirect=${encodeURIComponent(redirectUrl)}`;

    res.json({
      orderId,
      paymentUrl,
      amount: plan.price,
      planName: plan.name,
    });
  } catch (error) {
    console.error("Payment create error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Returns the current payment status for an order.
router.get("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: row, error } = await db
      .from("payments")
      .select("status, amount, created_at")
      .eq("order_id", orderId)
      .limit(1)
      .single();

    if (error || !row) {
      return res.json({ status: "not_found", amount: 0 });
    }

    res.json({
      status: row.status,
      amount: row.amount,
      completedAt: row.status === "completed" ? row.created_at : undefined,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
