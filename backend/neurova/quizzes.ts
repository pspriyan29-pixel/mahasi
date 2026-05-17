import { Router } from "express";
import { db } from "./db.js";

const router = Router();

// Retrieves all quiz questions generated for a document.
router.get("/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;
    const { data: quizzes, error } = await db
      .from("quizzes")
      .select("id, question, options, correct_answer")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: "Failed to get quizzes" });
    }

    const formattedQuizzes = (quizzes || []).map((row) => ({
      id: row.id,
      question: row.question,
      options: row.options,
      correct_answer: row.correct_answer,
    }));

    res.json({ quizzes: formattedQuizzes });
  } catch (error) {
    console.error("Quizzes error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
