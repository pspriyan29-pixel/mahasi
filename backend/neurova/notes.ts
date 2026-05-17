import { Router } from "express";
import { db } from "./db.js";
import crypto from "crypto";

const router = Router();

// Creates a new note for the user.
router.post("/", async (req, res) => {
  try {
    const { userId, title, content, tags: reqTags } = req.body;
    const id = crypto.randomUUID();
    const tags = reqTags || [];
    
    const { error } = await db.from("notes").insert({
      id,
      user_id: userId,
      title,
      content,
      tags,
      created_at: new Date().toISOString()
    });

    if (error) {
      return res.status(500).json({ error: "Failed to create note" });
    }

    res.json({
      id,
      title,
      content,
      tags,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Lists all notes for a user, ordered by most recent.
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: notes, error } = await db
      .from("notes")
      .select("id, title, content, tags, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to list notes" });
    }

    res.json({ notes: notes || [] });
  } catch (error) {
    console.error("List notes error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
