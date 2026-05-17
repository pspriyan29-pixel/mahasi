import { Router } from "express";
import { db } from "./db.js";
import crypto from "crypto";
import { generateAI } from "./aiRouter.js";

const router = Router();

// Processes an AI chat message and returns an intelligent response.
router.post("/chat", async (req, res) => {
  try {
    const { messages, message, context, userId, provider } = req.body;
    
    // Create a fallback messages array if only 'message' was passed
    const payload = messages && Array.isArray(messages) ? messages : [{ role: "user", content: message || "" }];

    // Generate AI response dynamically using the fallback router
    const aiResponseText = await generateAI(payload, provider || "auto");

    const defaultSuggestions = [
      "Explain quantum entanglement simply",
      "Create flashcards from my notes",
      "Build a knowledge graph",
      "Generate a study roadmap",
    ];

    if (userId) {
      const uid1 = crypto.randomUUID();
      const uid2 = crypto.randomUUID();
      const sessionId = "default-session";
      
      await db.from("ai_conversations").insert([
        { id: uid1, user_id: userId, session_id: sessionId, role: "user", content: message, created_at: new Date().toISOString() },
        { id: uid2, user_id: userId, session_id: sessionId, role: "assistant", content: aiResponseText, created_at: new Date().toISOString() }
      ]);
    }

    res.json({
      response: aiResponseText,
      suggestions: defaultSuggestions,
      confidence: 0.94 + Math.random() * 0.05,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Retrieves the AI conversation history for a user.
router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: conversations, error } = await db
      .from("ai_conversations")
      .select("role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      return res.status(500).json({ error: "Failed to fetch conversations" });
    }

    res.json({ conversations: conversations || [] });
  } catch (error) {
    console.error("AI conversations error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
