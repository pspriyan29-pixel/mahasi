import { Router } from "express";
import { db } from "./db.js";

const router = Router();

// Retrieves the knowledge graph for a processed document.
router.get("/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;
    const { data: nodes, error } = await db
      .from("knowledge_nodes")
      .select("id, concept, connections, x_pos, y_pos")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: "Failed to get knowledge graph" });
    }

    const formattedNodes = (nodes || []).map((row) => ({
      id: row.id,
      concept: row.concept,
      connections: row.connections || [],
      x: row.x_pos,
      y: row.y_pos,
    }));

    res.json({ nodes: formattedNodes });
  } catch (error) {
    console.error("Knowledge graph error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
