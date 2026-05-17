import { Router } from "express";
import { db } from "./db.js";
import crypto from "crypto";

const router = Router();

// Retrieves the AI memory and learning strength data for a user.
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    let { data: memoryRows, error } = await db
      .from("ai_memory")
      .select("id, topic, strength, last_reviewed, review_count")
      .eq("user_id", userId)
      .order("strength", { ascending: true });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch memory data" });
    }

    let memory = (memoryRows || []).map(row => ({
      id: row.id,
      topic: row.topic,
      strength: row.strength,
      lastReviewed: row.last_reviewed,
      reviewCount: row.review_count,
    }));

    if (memory.length === 0) {
      const defaultTopics = [
        { topic: "Neural Networks", strength: 0.3 },
        { topic: "Machine Learning", strength: 0.7 },
        { topic: "Deep Learning", strength: 0.45 },
        { topic: "Data Structures", strength: 0.85 },
        { topic: "Algorithms", strength: 0.6 },
        { topic: "Statistical Analysis", strength: 0.25 },
        { topic: "Linear Algebra", strength: 0.55 },
        { topic: "Probability Theory", strength: 0.4 },
      ];

      for (const t of defaultTopics) {
        const id = crypto.randomUUID();
        const reviewCount = Math.floor(Math.random() * 15);
        const contentStr = `Core semantic concept: ${t.topic}`;
        
        await db.from("ai_memory").insert({
          id,
          user_id: userId,
          topic: t.topic,
          content: contentStr,
          strength: t.strength,
          last_reviewed: new Date().toISOString(),
          review_count: reviewCount
        });

        memory.push({
          id,
          topic: t.topic,
          strength: t.strength,
          lastReviewed: new Date().toISOString(),
          reviewCount,
        });
      }
      memory.sort((a, b) => a.strength - b.strength);
    }

    const weakTopics = memory.filter((m) => m.strength < 0.5).map((m) => m.topic);
    const recommendations = [
      `Review ${weakTopics[0] || "Neural Networks"} with spaced repetition — 15 min daily`,
      `Practice ${weakTopics[1] || "Statistical Analysis"} problems with active recall`,
      "Connect Deep Learning concepts to real-world applications for stronger encoding",
      "Schedule a comprehensive review session for low-strength topics this weekend",
    ];

    res.json({ memory, weakTopics, recommendations });
  } catch (error) {
    console.error("Memory error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
