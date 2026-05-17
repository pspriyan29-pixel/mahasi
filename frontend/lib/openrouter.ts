// OpenRouter AI Orchestrator for Neurova
// Uses the OpenAI SDK which is compatible with OpenRouter
import { franc } from "franc";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export type TaskType =
  | "chat"
  | "coding"
  | "multimodal"
  | "reasoning"
  | "research"
  | "fast"
  | "presentation"
  | "fallback"
  | "architect";

export const MODELS: Record<TaskType, string> = {
  coding: "poolside/laguna-m.1:free",
  multimodal: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  reasoning: "nvidia/nemotron-3-super-120b-a12b:free",
  fast: "google/gemma-4-26b-a4b-it:free",
  research: "arcee-ai/trinity-large-thinking:free",
  presentation: "google/gemma-4-26b-a4b-it:free",
  fallback: "liquid/lfm-2.5-1.2b-instruct:free",
  chat: "arcee-ai/trinity-large-thinking:free",
  architect: "poolside/laguna-m.1:free",
};

export const MODEL_NAMES: Record<string, string> = {
  "poolside/laguna-m.1:free": "Laguna M.1 (Coding)",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free": "Nemotron 3 Omni (Multimodal)",
  "nvidia/nemotron-3-super-120b-a12b:free": "Nemotron 3 Super (Reasoning)",
  "google/gemma-4-26b-a4b-it:free": "Gemma 4 26B (Fast/Presentation)",
  "arcee-ai/trinity-large-thinking:free": "Trinity Thinking (Research/Chat)",
  "liquid/lfm-2.5-1.2b-instruct:free": "LFM 2.5 (Fallback)",
};

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: any;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  reasoning?: string;
}

export interface ConversationContext {
  userGoal?: string;
  expertise?: "beginner" | "intermediate" | "advanced";
  preferredLanguage?: string;
  activeProject?: string;
  recentTopics?: string[];
}

export interface WorkspaceContext {
  framework?: string;
  stack?: string[];
  activeFiles?: string[];
  dependencies?: string[];
  currentProject?: string;
}

export type ResponseMode = "concise" | "architect" | "teacher" | "researcher" | "creative";
export type ArtifactType = "code" | "presentation" | "document" | "diagram" | "none";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. HYBRID INTENT ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface IntentScore {
  coding: number;
  research: number;
  reasoning: number;
  multimodal: number;
  presentation: number;
  fast: number;
}

export function detectTaskType(message: string): TaskType {
  const lower = message.toLowerCase();
  const score: IntentScore = { coding: 0, research: 0, reasoning: 0, multimodal: 0, presentation: 0, fast: 0 };

  if (lower.includes("react") || lower.includes("typescript") || lower.includes("code")) score.coding += 5;
  if (lower.includes("build") || lower.includes("component") || lower.includes("app")) score.coding += 3;

  if (lower.includes("thesis") || lower.includes("paper")) score.research += 5;
  if (lower.includes("research") || lower.includes("literature") || lower.includes("study")) score.research += 3;

  if (lower.includes("architecture") || lower.includes("complex") || lower.includes("analyze")) score.reasoning += 4;
  if (lower.includes("deeply") || lower.includes("reason") || lower.includes("argue")) score.reasoning += 3;

  if (lower.includes("presentation") || lower.includes("pitch deck") || lower.includes("slides")) score.presentation += 6;

  if (lower.includes("image") || lower.includes("screenshot") || lower.includes("visual")) score.multimodal += 5;

  if (lower.length < 50) score.fast += 4;

  let maxScore = 0;
  let detectedTask: TaskType = "chat";

  for (const [task, val] of Object.entries(score)) {
    if (val > maxScore) {
      maxScore = val;
      detectedTask = task as TaskType;
    }
  }

  return maxScore > 2 ? detectedTask : "chat";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. ARTIFACT & MODE DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function detectArtifactType(message: string): ArtifactType {
  const lower = message.toLowerCase();

  if (lower.includes("build website") || lower.includes("create app") || lower.includes("landing page") || lower.includes("dashboard") || lower.includes("react component") || lower.includes("buat website") || lower.includes("bikin web")) {
    return "code";
  }
  if (lower.includes("presentation") || lower.includes("pitch deck") || lower.includes("slides") || lower.includes("presentasi")) {
    return "presentation";
  }
  if (lower.includes("research") || lower.includes("report") || lower.includes("essay") || lower.includes("laporan") || lower.includes("makalah")) {
    return "document";
  }
  if (lower.includes("diagram") || lower.includes("flowchart") || lower.includes("architecture") || lower.includes("arsitektur")) {
    return "diagram";
  }
  return "none";
}

export function detectResponseMode(message: string): ResponseMode {
  const lower = message.toLowerCase();
  if (lower.includes("teach me") || lower.includes("how to") || lower.includes("explain")) return "teacher";
  if (lower.includes("build system") || lower.includes("architecture") || lower.includes("design")) return "architect";
  if (lower.includes("research") || lower.includes("study") || lower.includes("thesis")) return "researcher";
  if (lower.includes("story") || lower.includes("creative") || lower.includes("generate ideas")) return "creative";
  return "concise";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. TRUE MULTILINGUAL UX (Language Detector)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function detectLanguage(text: string): string {
  const lower = text.toLowerCase();

  // Heuristic fallback for short Indonesian prompts
  const indoKeywords = [
    "buat", "bikin", "gimana", "tolong", "kenapa", "saya",
    "aku", "bisa", "tidak", "dengan", "untuk", "halo", "apa"
  ];

  if (text.length < 30 && indoKeywords.some(word => lower.includes(word))) {
    return "Indonesian";
  }

  try {
    const langCode = franc(text);
    switch (langCode) {
      case "ind": return "Indonesian";
      case "spa": return "Spanish";
      case "fra": return "French";
      case "jpn": return "Japanese";
      case "zho": return "Chinese";
      default: return "English";
    }
  } catch {
    return "English";
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. LAYERED SYSTEM PROMPTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BASE_SYSTEM_PROMPT = `You are NEUROVA. An advanced AI operating system.
Your purpose: Provide world-class, premium, structured responses.

ADVANCED RESPONSE CONTRACT:
Never expose chain-of-thought or internal reasoning in final output.
Always answer in the user's language naturally.
Always structure responses cleanly.
Use markdown professionally and preserve markdown integrity.
Always close XML tags properly.
Never generate incomplete code artifacts.
Always ensure artifact renderability.
Prefer modular multi-file output.
Avoid placeholder pseudo-code unless explicitly requested.
Maintain production-grade architecture.
Ensure UI consistency and responsive design.
Use sections and hierarchy.
Use artifacts for: code, presentations, diagrams, long documents.
If uncertain: state uncertainty clearly, avoid hallucination.
Responses must feel: premium, intelligent, calm, world-class.

RESPONSE PROTOCOL:
1. Understand intent deeply.
2. Structure output clearly (use markdown, sections, bullets).
3. Separate explanation from implementation.
4. Use artifacts for complex outputs.
5. NEVER output unformatted code dumps.
6. Prefer concise intelligence over verbosity.
7. Verify logic, avoid shallow responses, optimize clarity.

ARTIFACT SYSTEM & XML TAGS (CRITICAL):
When you generate code, presentations, or complex documents, you MUST use the Neurova Artifact System.
Format:
<artifact type="react" title="Landing Page">
  <file name="App.tsx">
    // code
  </file>
</artifact>
Supported types: "react", "html", "presentation", "mermaid", "document".

IMAGE GENERATION:
If the user asks to generate, create, or draw an image, you MUST respond by outputting a markdown image tag using Pollinations AI. Do not write code to generate the image, just output the image directly in markdown.
Format: ![Image Description](https://image.pollinations.ai/prompt/describe-the-image-in-english-with-detail-and-style)
`;

const CODING_PROMPT = `
CODING RESPONSE RULES:
- Use TypeScript, modular architecture, clean naming, production-grade patterns, responsive UI.
- Think like a senior engineer. Prioritize maintainability and scalable solutions.
- ALWAYS USE THE <artifact type="react"> TAG FOR MULTI-FILE CODE.
- Avoid beginner mistakes and insecure implementations.
`;

const RESEARCH_PROMPT = `
RESEARCH MODE:
- Synthesize information deeply, identify key insights, explain implications.
- Compare alternatives and provide nuanced analysis.
- Responses should feel investor-grade, analyst-level, highly informed.
- For complex responses use: # Title, ## Overview, ## Deep Dive, ## Conclusion.
`;

const PRESENTATION_PROMPT = `
PRESENTATION ENGINE FORMAT:
When generating presentations:
- ALWAYS wrap in <artifact type="presentation" title="...">.
- Separate slides using --- (three dashes).
- Use clear titles, concise bullets, and presentation-friendly formatting.
- Structure: Intro, Problem, Solution, Architecture/Details, Conclusion.
`;

const FAST_PROMPT = `You are Neurova. Reply naturally, concisely, and directly in the user's language. DO NOT use artifacts. DO NOT explain your reasoning. DO NOT output XML. Just answer the user's input as quickly and concisely as possible.`;

export function buildSystemPrompt(task: TaskType, lastMessage: string, context?: ConversationContext, workspace?: WorkspaceContext, isFastMode?: boolean): string {
  if (task === "fast" || isFastMode) {
    return FAST_PROMPT;
  }

  let prompt = BASE_SYSTEM_PROMPT;

  if (task === "coding") prompt += CODING_PROMPT;
  if (task === "research") prompt += RESEARCH_PROMPT;
  if (task === "presentation") prompt += PRESENTATION_PROMPT;

  const mode = detectResponseMode(lastMessage);
  prompt += `\nRESPONSE MODE: ${mode.toUpperCase()}`;

  const lang = detectLanguage(lastMessage);
  prompt += `\nUSER LANGUAGE DETECTED: ${lang}\nAlways reason internally in English for maximum intelligence, but ALWAYS respond naturally in ${lang}. Avoid robotic translation.`;

  if (context) {
    prompt += `\nCONTEXT ENGINE:\n- Expertise: ${context.expertise || 'intermediate'}\n- Goal: ${context.userGoal || 'unknown'}\n`;
  }

  if (workspace) {
    prompt += `\nACTIVE WORKSPACE:\n- Project: ${workspace.currentProject || 'None'}\n- Stack: ${workspace.stack?.join(', ') || 'React, TypeScript, Tailwind'}\n- Framework: ${workspace.framework || 'Vite'}\n`;
  }

  return prompt;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. MEMORY COMPRESSION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function compressConversation(messages: ChatMessage[]): ChatMessage[] {
  const systemMsg = messages.filter(m => m.role === 'system');
  const contextMsgs = messages.filter(m => m.role !== 'system');
  // Optimal context window limit for perceived intelligence and speed
  return [...systemMsg, ...contextMsgs.slice(-6)];
}

export async function streamChat(
  messages: ChatMessage[],
  task: TaskType = "chat",
  onChunk: (chunk: StreamChunk) => void,
  onModel?: (model: string) => void,
  retryCount: number = 3,
  signal?: AbortSignal,
  isFastMode?: boolean,
  provider: string = "auto"
): Promise<void> {
  const lastUserMessageObj = messages.filter(m => m.role === 'user').pop();
  let lastUserMessage = "";
  if (lastUserMessageObj) {
    if (typeof lastUserMessageObj.content === "string") {
      lastUserMessage = lastUserMessageObj.content;
    } else if (Array.isArray(lastUserMessageObj.content)) {
      const textBlock = lastUserMessageObj.content.find((c: any) => c.type === "text");
      if (textBlock) lastUserMessage = textBlock.text;
    }
  }

  if (onModel) {
    const providerNames: Record<string, string> = {
      auto: "Neurova Fallback Engine",
      gemini: "Google Gemini 3",
      groq: "Groq Llama 3.3",
      ollama: "Local Ollama (Sulphur)",
      hf: "HuggingFace (Sulphur)",
      openrouter: "OpenRouter (Premium)"
    };
    onModel(providerNames[provider] || provider.toUpperCase());
  }

  const detectedTask = detectTaskType(lastUserMessage);
  const finalTask = task === "chat" ? detectedTask : task;
  let model = MODELS[finalTask] || MODELS.chat;

  // If using local backend, we let the backend decide the model
  // Only for openrouter/auto do we use the OpenRouter models
  if (provider === "openrouter" || provider === "auto") {
    // Keep the model mapped from MODELS
  }

  const systemPrompt = buildSystemPrompt(finalTask, lastUserMessage, undefined, undefined, isFastMode);
  let processedMessages = [...messages];
  processedMessages = processedMessages.filter(m => m.role !== "system");
  processedMessages.unshift({ role: "system", content: systemPrompt });
  processedMessages = compressConversation(processedMessages);

  let maxTokens: number | undefined = undefined;
  if (finalTask === "fast") maxTokens = 1024;
  else if (finalTask === "coding" || finalTask === "reasoning" || finalTask === "architect" || finalTask === "multimodal") maxTokens = 16384;
  else if (finalTask === "research") maxTokens = 8192;
  else maxTokens = 4096;

  let temperature = 0.7;
  if (finalTask === "coding") temperature = 0.2;
  if (detectResponseMode(lastUserMessage) === "creative") temperature = 0.9;

  try {
    let useLocalBackend = provider !== "openrouter" && provider !== "auto";

    if (!useLocalBackend) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          signal,
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Neurova AI OS",
          },
          body: JSON.stringify({
            model,
            messages: processedMessages,
            stream: true,
            max_tokens: maxTokens,
            temperature: temperature,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[Neurova AI] OpenRouter failed (${response.status}): ${errText}`);
          if (provider === "auto") {
            console.log("[Neurova AI] Limit reached or error. Auto-switching to Fallback Engine...");
            useLocalBackend = true;
          } else {
            throw new Error(`${response.status} - ${errText}`);
          }
        } else {
          const reader = response.body?.getReader();
          if (!reader) throw new Error("No response body");

          const decoder = new TextDecoder();
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed === "data: [DONE]") {
                onChunk({ content: "", done: true });
                continue;
              }
              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const content = json.choices?.[0]?.delta?.content || "";
                  if (content) onChunk({ content, done: false });
                } catch { }
              }
            }
          }
          onChunk({ content: "", done: true });
          return;
        }
      } catch (err: any) {
        if (err.name === "AbortError") throw err; // let outer catch handle it
        console.warn("[Neurova AI] OpenRouter connection error:", err);
        if (provider === "auto") {
          console.log("[Neurova AI] Auto-switching to Fallback Engine...");
          useLocalBackend = true;
        } else {
          throw err;
        }
      }
    }

    if (useLocalBackend) {
      // Call Local Backend Router for fallback or specific provider
      const backendUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:4000/ai/chat"
        : "https://mahasi.tech/ai/chat";
      const response = await fetch(backendUrl, {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: processedMessages,
          provider: provider === "auto" ? "auto" : provider
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Fallback Engine Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const finalContent = data.response || "";

      // Simulate streaming to preserve UI animations
      const words = finalContent.split(" ");
      for (let i = 0; i < words.length; i++) {
        if (signal?.aborted) break;
        onChunk({ content: words[i] + (i === words.length - 1 ? "" : " "), done: false });
        await new Promise(r => setTimeout(r, 20)); // typing speed
      }

      if (!signal?.aborted) {
        onChunk({ content: "", done: true });
      }
    }

  } catch (err: any) {
    if (err.name === "AbortError") {
      console.log("[Neurova AI] Generation stopped by user.");
      return;
    }
    console.error("[Neurova AI] Error:", err);
    onChunk({ content: `\n\n*Neural pathway disrupted.*\n\n**Debug Info:** ${err.message}`, done: true });
  }
}

export async function quickChat(
  prompt: string,
  task: TaskType = "fast"
): Promise<string> {
  let result = "";
  await streamChat(
    [{ role: "user", content: prompt }],
    task,
    (chunk) => { result += chunk.content; }
  );
  return result;
}
