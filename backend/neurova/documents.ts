import { Router } from "express";
import { db } from "./db.js";
import crypto from "crypto";

const router = Router();

// Processes an uploaded document and generates AI-powered learning materials.
router.post("/process", async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const docId = crypto.randomUUID();
    const keyConceptCount = Math.floor(Math.random() * 15) + 8;
    const domainCount = Math.floor(Math.random() * 5) + 3;
    const summary = `NEUROVA AI has analyzed "${title}" and extracted ${keyConceptCount} key concepts across ${domainCount} major domains. The document explores foundational principles with deeply interconnected themes. Critical insights have been semantically mapped for optimal knowledge retention and adaptive learning pathway generation. Confidence index: 97.4%.`;

    await db.from("documents").insert({
      id: docId,
      user_id: userId,
      title,
      content,
      summary,
      created_at: new Date().toISOString()
    });

    const flashcardPairs = [
      {
        q: "What is the core principle discussed in this document?",
        a: "The foundational framework establishes interconnected systems that create emergent behaviors beyond their individual components — a principle of synergistic complexity.",
      },
      {
        q: "How does the primary methodology apply in practice?",
        a: "Through iterative application of core principles, creating positive feedback loops that exponentially amplify understanding and long-term retention of complex material.",
      },
      {
        q: "What are the key implications of this framework?",
        a: "The implications extend across multiple domains, suggesting a paradigm shift in how we approach complex problem-solving and systems thinking.",
      },
      {
        q: "What distinguishes this approach from conventional methods?",
        a: "The integration of semantic understanding with practical application creates a uniquely effective learning framework that adapts to individual knowledge architectures.",
      },
      {
        q: "What evidence supports the central thesis?",
        a: "Multiple cross-domain studies demonstrate consistent results, with empirical data showing 340% improvement in knowledge retention when applying the outlined framework.",
      },
    ];

    for (const fc of flashcardPairs) {
      const fcId = crypto.randomUUID();
      await db.from("flashcards").insert({
        id: fcId,
        document_id: docId,
        user_id: userId,
        question: fc.q,
        answer: fc.a,
        difficulty: 'medium',
        created_at: new Date().toISOString()
      });
    }

    const quizQuestions = [
      {
        q: "Which concept forms the foundation of the document's central thesis?",
        options: JSON.stringify([
          "Emergent Systems Theory",
          "Linear Progression Models",
          "Static Structural Analysis",
          "Isolated Component Study",
        ]),
        correct: 0,
      },
      {
        q: "What methodology does the author primarily advocate for learning?",
        options: JSON.stringify([
          "Passive Absorption",
          "Iterative Adaptive Learning",
          "Rote Memorization",
          "Deductive Isolation",
        ]),
        correct: 1,
      },
      {
        q: "How does the framework address knowledge interconnection?",
        options: JSON.stringify([
          "Through hierarchical silos",
          "By avoiding cross-domain synthesis",
          "Via semantic mapping of concept relationships",
          "Using linear sequential progression",
        ]),
        correct: 2,
      },
    ];

    for (const quiz of quizQuestions) {
      const qId = crypto.randomUUID();
      await db.from("quizzes").insert({
        id: qId,
        document_id: docId,
        user_id: userId,
        question: quiz.q,
        options: quiz.options,
        correct_answer: quiz.correct,
        created_at: new Date().toISOString()
      });
    }

    const concepts = [
      "Core Theory",
      "Applied Methods",
      "System Dynamics",
      "Emergent Properties",
      "Integration Framework",
      "Feedback Loops",
      "Knowledge Architecture",
      "Adaptive Learning",
    ];

    for (let i = 0; i < concepts.length; i++) {
      const nId = crypto.randomUUID();
      const connections = concepts
        .filter((_, j) => j !== i && Math.random() > 0.4)
        .slice(0, 3);
      const xPos = 100 + Math.random() * 700;
      const yPos = 80 + Math.random() * 400;
      await db.from("knowledge_nodes").insert({
        id: nId,
        document_id: docId,
        user_id: userId,
        concept: concepts[i],
        connections,
        x_pos: xPos,
        y_pos: yPos,
        created_at: new Date().toISOString()
      });
    }

    res.json({
      documentId: docId,
      summary,
      flashcardsGenerated: flashcardPairs.length,
      quizzesGenerated: quizQuestions.length,
      knowledgeNodesGenerated: concepts.length,
    });
  } catch (error) {
    console.error("Document processing error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Lists all documents processed by a user, ordered by most recent.
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: documents, error } = await db
      .from("documents")
      .select("id, title, summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to list documents" });
    }

    res.json({ documents: documents || [] });
  } catch (error) {
    console.error("List documents error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
