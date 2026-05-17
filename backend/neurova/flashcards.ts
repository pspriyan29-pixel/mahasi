import { Router } from "express";
import { db } from "./db.js";

const router = Router();

// Retrieves all flashcards generated for a document.
router.get("/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;
    const { data: flashcards, error } = await db
      .from("flashcards")
      .select("id, question, answer, difficulty")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: "Failed to get flashcards" });
    }

    res.json({ flashcards: flashcards || [] });
  } catch (error) {
    console.error("Flashcards error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
