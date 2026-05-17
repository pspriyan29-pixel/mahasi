import { Router } from "express";
import { db } from "./db.js";

const router = Router();

interface WebhookPayload {
  amount: number;
  order_id: string;
  project: string;
  status: string;
  payment_method: string;
  completed_at: string;
  secret?: string;
}

// Handles Pakasir payment webhook notifications.
router.post("/pakasir", async (req, res) => {
  try {
    const payload = req.body as WebhookPayload;

    if (payload.status === "completed") {
      const { error: updatePaymentError } = await db
        .from("payments")
        .update({ status: "completed" })
        .eq("order_id", payload.order_id)
        .eq("amount", payload.amount);

      if (updatePaymentError) {
        console.error("Error updating payment:", updatePaymentError);
      }

      const { data: paymentRow, error: paymentQueryError } = await db
        .from("payments")
        .select("user_id, plan")
        .eq("order_id", payload.order_id)
        .limit(1)
        .single();

      if (paymentRow?.user_id) {
        await db
          .from("users")
          .update({ plan: paymentRow.plan })
          .eq("id", paymentRow.user_id);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
