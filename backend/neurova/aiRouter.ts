import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// 1. GEMINI
export async function callGemini(messages: any[]): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : (m.role === "system" ? "user" : "user"),
    parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }]
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini Error: ${res.statusText}`);
  }

  const data = await res.json() as any;
  if (data?.candidates && data.candidates.length > 0 && data.candidates[0].content) {
    return data.candidates[0].content.parts[0].text;
  }
  
  throw new Error("Invalid response from Gemini");
}

// 2. GROQ
export async function callGroq(messages: any[]): Promise<string> {
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content)
  }));

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: formattedMessages,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq Error: ${res.statusText}`);
  }

  const data = await res.json() as any;
  return data?.choices?.[0]?.message?.content || "No response";
}

// 3. OLLAMA
export async function callOllama(messages: any[]): Promise<string> {
  const modelName = process.env.OLLAMA_MODEL || "hf.co/SulphurAI/Sulphur-2-base:BF16";
  const formattedMessages = messages.map(m => ({
    role: m.role === "system" ? "system" : m.role,
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content)
  }));

  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: formattedMessages,
      stream: false
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama Error: ${res.statusText}`);
  }

  const data = await res.json() as any;
  return data?.message?.content || "No response";
}

// 4. HUGGINGFACE
export async function callHF(messages: any[]): Promise<string> {
  const modelName = process.env.HUGGINGFACE_MODEL || "SulphurAI/Sulphur-2-base";
  const prompt = messages.map(m => `${m.role}: ${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}`).join("\n") + "\nassistant:";
  
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${modelName}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!res.ok) {
    throw new Error(`HuggingFace Error: ${res.statusText}`);
  }

  const data = await res.json() as any;
  return data?.[0]?.generated_text || "No response";
}

// AI ROUTER
export async function generateAI(messages: any[], provider: string = "auto"): Promise<string> {
  if (provider === "gemini") return await callGemini(messages);
  if (provider === "groq") return await callGroq(messages);
  if (provider === "ollama") return await callOllama(messages);
  if (provider === "hf") return await callHF(messages);

  try {
    console.log("Trying Gemini...");
    return await callGemini(messages);
  } catch (e1: any) {
    console.warn("Gemini failed:", e1.message);
    try {
      console.log("Trying Groq...");
      return await callGroq(messages);
    } catch (e2: any) {
      console.warn("Groq failed:", e2.message);
      try {
        console.log("Trying Ollama...");
        return await callOllama(messages);
      } catch (e3: any) {
        console.warn("Ollama failed:", e3.message);
        console.log("Trying HuggingFace...");
        return await callHF(messages);
      }
    }
  }
}
