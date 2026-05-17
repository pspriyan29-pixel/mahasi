import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import webhookRouter from "./neurova/webhook.js";
import aiRouter from "./neurova/ai.js";
import documentsRouter from "./neurova/documents.js";
import flashcardsRouter from "./neurova/flashcards.js";
import knowledgeRouter from "./neurova/knowledge.js";
import memoryRouter from "./neurova/memory.js";
import notesRouter from "./neurova/notes.js";
import paymentsRouter from "./neurova/payments.js";
import presentationsRouter from "./neurova/presentations.js";
import quizzesRouter from "./neurova/quizzes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/webhook", webhookRouter);
app.use("/ai", aiRouter);
app.use("/documents", documentsRouter);
app.use("/flashcards", flashcardsRouter);
app.use("/knowledge", knowledgeRouter);
app.use("/memory", memoryRouter);
app.use("/notes", notesRouter);
app.use("/payments", paymentsRouter);
app.use("/presentations", presentationsRouter);
app.use("/quizzes", quizzesRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
