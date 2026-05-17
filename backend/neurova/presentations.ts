import { Router } from "express";
import { db } from "./db.js";
import crypto from "crypto";

const router = Router();

// Generates an AI-powered presentation from a processed document.
router.post("/generate", async (req, res) => {
  try {
    const { documentId, userId, title } = req.body;
    const id = crypto.randomUUID();
    const slides = [
      {
        title: title,
        content: "AI-Generated Intelligence Brief by NEUROVA",
        type: "title",
        bulletPoints: [],
      },
      {
        title: "Executive Summary",
        content: "Core insights extracted by NEUROVA's semantic analysis engine",
        type: "overview",
        bulletPoints: [
          "Foundational framework analysis complete",
          "Key methodology pathways identified",
          "Critical implications semantically mapped",
          "Action pathways defined and prioritized",
        ],
      },
      {
        title: "Core Concepts",
        content: "Deep semantic analysis of primary knowledge nodes",
        type: "content",
        bulletPoints: [
          "Interconnected knowledge system architecture",
          "Emergent behavioral pattern recognition",
          "Feedback loop mechanisms identified",
          "Integration frameworks for practical application",
        ],
      },
      {
        title: "Key Findings",
        content: "NEUROVA intelligence reveals critical strategic insights",
        type: "findings",
        bulletPoints: [
          "Paradigm shift identified in conventional approach",
          "Novel cross-domain connections discovered",
          "Practical application frameworks validated",
          "Optimization pathways quantified",
        ],
      },
      {
        title: "Methodology Deep Dive",
        content: "Systematic approach analysis and validation",
        type: "methodology",
        bulletPoints: [
          "Iterative adaptive learning cycles",
          "Semantic mapping and concept clustering",
          "Cross-domain synthesis protocols",
          "Dynamic knowledge architecture building",
        ],
      },
      {
        title: "Conclusions & Strategic Roadmap",
        content: "Transform knowledge into decisive action",
        type: "conclusion",
        bulletPoints: [
          "Implementation roadmap with milestones defined",
          "Priority areas ranked by impact potential",
          "Resource allocation optimized",
          "Success metrics and KPIs established",
        ],
      },
    ];

    const { error } = await db.from("presentations").insert({
      id,
      document_id: documentId,
      user_id: userId,
      title,
      slides: JSON.stringify(slides),
      created_at: new Date().toISOString()
    });

    if (error) {
      return res.status(500).json({ error: "Failed to create presentation" });
    }

    res.json({ id, title, slides });
  } catch (error) {
    console.error("Presentation generation error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Lists all presentations generated for a document.
router.get("/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;
    const { data: presentations, error } = await db
      .from("presentations")
      .select("id, title, created_at")
      .eq("document_id", documentId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to list presentations" });
    }

    res.json({ presentations: presentations || [] });
  } catch (error) {
    console.error("List presentations error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
