import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { streamChat, detectTaskType, MODEL_NAMES, type ChatMessage, type TaskType } from "../lib/openrouter";
import { processAttachment, type Attachment } from "../lib/fileProcessing";

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <button
          onClick={handleCopy}
          style={{
            position: "absolute", top: "8px", right: "8px", zIndex: 10,
            background: copied ? "var(--success-bg)" : "rgba(255,255,255,0.1)",
            color: copied ? "var(--success-text)" : "#ccc",
            border: "none", borderRadius: "6px", padding: "4px 8px",
            fontSize: "12px", cursor: "pointer", transition: "all 0.2s"
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: "8px", fontSize: "14px", padding: "16px" }}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  }
  return (
    <code className={className} style={{ background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.9em" }} {...props}>
      {children}
    </code>
  );
};

interface AIChatProps {
  userId: string;
  documentId?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: { name: string; type: string; url?: string; textContent?: string }[];
  reasoning?: string;
  suggestions?: string[];
  timestamp: Date;
  model?: string;
  task?: TaskType;
}

const STARTER_SUGGESTIONS = [
  "Explain the core concepts",
  "Create a study plan",
  "Summarize recent documents",
];

const DYNAMIC_STATES = [
  "🧠 Analyzing request...",
  "⚙ Evaluating architecture...",
  "📚 Gathering context...",
  "✨ Generating response..."
];

export default function AIChat({ userId, documentId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I'm Neurova, your AI learning companion. I adapt my intelligence to your needs. How can I assist you today?",
      suggestions: STARTER_SUGGESTIONS,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStateIdx, setLoadingStateIdx] = useState(0);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const [activeModel, setActiveModel] = useState("");
  const [activeTask, setActiveTask] = useState<TaskType>("chat");
  const [selectedMode, setSelectedMode] = useState<TaskType>("fast");
  const [showAutoSuggest, setShowAutoSuggest] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("auto");
  const [isRecording, setIsRecording] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [processingType, setProcessingType] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingContent]);

  // Cycle through loading states
  useEffect(() => {
    if (!loading || streamingContent) return;
    const currentStates = processingType === "image" ? ["🧠 Analyzing image...", "⚙ Contextualizing visuals..."] 
      : processingType === "audio" ? ["🎤 Transcribing audio...", "🧠 Analyzing transcript..."] 
      : processingType === "document" ? ["📄 Reading document...", "📚 Extracting key insights..."] 
      : DYNAMIC_STATES;

    const interval = setInterval(() => {
      setLoadingStateIdx((prev) => (prev + 1) % currentStates.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading, streamingContent, processingType]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please try Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((res: any) => res[0].transcript)
        .join("");
      setInput(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setLoadingStateIdx(0);

    if (attachments.some(a => a.status === "processing")) {
      alert("Please wait for files to finish processing.");
      return;
    }

    let task = selectedMode;
    if (attachments.length > 0) {
      task = "multimodal";
      setProcessingType(attachments[0].type);
    } else {
      setProcessingType(null);
    }

    const userMsg: Message = { 
      role: "user", 
      content: msg,
      attachments: attachments.map(a => ({ name: a.name, type: a.type, url: a.base64, textContent: a.content })),
      timestamp: new Date() 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setStreamingContent("");
    setStreamingReasoning("");

    setActiveTask(task);
    setShowAutoSuggest(false);
    
    setAttachments([]);

    const controller = new AbortController();
    setAbortController(controller);

    const chatHistory: ChatMessage[] = messages.map((m) => {
      let apiContent: any = m.content;
      if (m.role === "user" && m.attachments && m.attachments.length > 0) {
        apiContent = [{ type: "text", text: m.content }];
        for (const att of m.attachments) {
           if (att.type === "image" && att.url) {
             apiContent.push({ type: "image_url", image_url: { url: att.url } });
           } else if (att.textContent) {
             apiContent[0].text += `\n\n[Attachment: ${att.name}]\n${att.textContent}`;
           }
        }
      }
      return { role: m.role, content: apiContent };
    });

    let currentApiContent: any = msg;
    if (attachments.length > 0) {
      currentApiContent = [{ type: "text", text: msg }];
      for (const att of attachments) {
        if (att.type === "image" && att.base64) {
          currentApiContent.push({ type: "image_url", image_url: { url: att.base64 } });
        } else if (att.content) {
          currentApiContent[0].text += `\n\n[Attachment: ${att.name}]\n${att.content}`;
        }
      }
    }
    chatHistory.push({ role: "user", content: currentApiContent });

    let accumulated = "";
    let accReasoning = "";

    try {
      await streamChat(
        chatHistory,
        task,
        (chunk) => {
          if (chunk.content) {
            accumulated += chunk.content;
            setStreamingContent(accumulated);
          }
          if (chunk.reasoning) {
            accReasoning += chunk.reasoning;
            setStreamingReasoning(accReasoning);
          }
          if (chunk.done && accumulated) {
            const aiMsg: Message = {
              role: "assistant",
              content: accumulated,
              reasoning: accReasoning || undefined,
              task,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
            setStreamingContent("");
            setStreamingReasoning("");
            setLoading(false);
            setAbortController(null);
            setProcessingType(null);
          }
        },
        (model) => setActiveModel(model),
        3,
        controller.signal,
        selectedMode === "fast",
        selectedProvider
      );
    } catch (err: any) {
      if (err.name === "AbortError") {
        const aiMsg: Message = {
          role: "assistant",
          content: accumulated || "*Generation stopped by user.*",
          reasoning: accReasoning || undefined,
          task,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "We encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        }]);
      }
      setLoading(false);
      setStreamingContent("");
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    for (const file of files) {
      const tempId = Math.random().toString(36).substr(2, 9);
      setAttachments(prev => [...prev, {
        id: tempId, name: file.name, type: "document", mimeType: file.type, size: file.size, status: "processing"
      } as Attachment]);

      processAttachment(file, (status) => {
        setAttachments(prev => prev.map(a => a.id === tempId ? { ...a, status } : a));
      }).then(result => {
        setAttachments(prev => prev.map(a => a.id === tempId ? result : a));
      });
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";

    if (selectedMode === "fast") {
      const lower = val.toLowerCase();
      if (lower.includes("build") || lower.includes("research") || lower.includes("architecture")) {
        setShowAutoSuggest(true);
      } else {
        setShowAutoSuggest(false);
      }
    } else {
      setShowAutoSuggest(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-light)", position: "relative" }}>
      {/* Context Engine Panel (Floating) */}
      <div style={{
        position: "absolute", top: "24px", right: "24px", zIndex: 10,
        background: "var(--pure-white)", border: "1px solid var(--border-light)",
        borderRadius: "12px", padding: "16px", boxShadow: "var(--shadow-elevated)",
        width: "260px", display: "flex", flexDirection: "column", gap: "12px",
        animation: "fade-up 0.5s ease-out"
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Context Engine
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "var(--text-muted)" }}>Active Model</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: activeModel ? "var(--success-text)" : "var(--text-muted)", boxShadow: activeModel ? "0 0 6px var(--success-text)" : "none" }} />
            {activeModel ? (MODEL_NAMES[activeModel]?.split(" (")[0] || activeModel.split("/").pop()?.split(":")[0]) : "Standby"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "var(--text-muted)" }}>Reasoning Depth</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{activeTask === "reasoning" || activeTask === "research" ? "Deep" : "Standard"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "var(--text-muted)" }}>Memory Usage</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{messages.length} Blocks</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "var(--text-muted)" }}>Semantic Confidence</span>
          <span style={{ color: "var(--stripe-purple)", fontWeight: 600 }}>{loading ? "Analyzing..." : "98%"}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "80px 24px 32px", display: "flex", flexDirection: "column", gap: "32px", margin: "0 auto", width: "100%", maxWidth: "800px" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: "flex", flexDirection: "column", gap: "8px",
            alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            animation: "fade-up 0.4s ease-out forwards"
          }}>
            {msg.role === "user" ? (
              <div style={{
                maxWidth: "80%", padding: "14px 18px",
                background: "var(--pure-white)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px", borderBottomRightRadius: "4px",
                color: "var(--text-primary)", fontSize: "15px", lineHeight: 1.6,
                boxShadow: "var(--shadow-raised)"
              }}>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    {msg.attachments.map((att: any, i: number) => (
                      att.type === "image" && att.url ? 
                        <img key={i} src={att.url} alt="upload" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--border-light)" }} />
                      : <div key={i} style={{ padding: "6px 10px", background: "var(--bg-light)", border: "1px solid var(--border-light)", borderRadius: "6px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500, color: "var(--stripe-purple)" }}>
                          📄 {att.name}
                        </div>
                    ))}
                  </div>
                )}
                {msg.content}
              </div>
            ) : (
              <div style={{ maxWidth: "100%", display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                  {/* Custom SVG Logo instead of Emoji or text */}
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "linear-gradient(135deg, var(--stripe-purple), #3B82F6)",
                    color: "white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(124,58,237,0.2)"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, paddingTop: "6px" }}>
                    {msg.reasoning && (
                      <div>
                        <button
                          onClick={() => setShowReasoning(!showReasoning)}
                          className="btn-ghost"
                          style={{ padding: "4px 8px", fontSize: "12px", background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-muted)" }}
                        >
                          {showReasoning ? "Hide Reasoning Chain" : "View Reasoning Chain"}
                        </button>
                        {showReasoning && (
                          <div style={{
                            padding: "16px", marginTop: "8px",
                            background: "var(--pure-white)", border: "1px solid var(--border-light)",
                            borderRadius: "12px", fontSize: "13px",
                            color: "var(--text-muted)", lineHeight: 1.6,
                            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)"
                          }}>
                            {msg.reasoning}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="prose prose-invert max-w-none" style={{
                      color: "var(--text-primary)", fontSize: "15px", lineHeight: 1.7,
                      letterSpacing: "-0.01em", width: "100%"
                    }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                        {typeof msg.content === "string" ? msg.content : ""}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
                {msg.suggestions && (
                  <div style={{ paddingLeft: "56px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {msg.suggestions.map((s, si) => (
                      <button key={si} className="btn-secondary btn-premium"
                        onClick={() => sendMessage(s)}
                        style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "100px" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Streaming/Loading message */}
        {loading && (
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", animation: "fade-up 0.4s ease-out" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, var(--stripe-purple), #3B82F6)",
              color: "white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(124,58,237,0.3)", animation: "glow-pulse 2s infinite"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            
            <div style={{ flex: 1, width: "100%", paddingTop: "6px" }}>
              {/* Layer 1: Reasoning */}
              {streamingReasoning && (
                <div style={{
                  padding: "16px", marginBottom: "16px",
                  background: "var(--pure-white)", border: "1px solid var(--border-light)",
                  borderRadius: "12px", fontSize: "14px",
                  color: "var(--text-muted)", lineHeight: 1.6,
                  boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", textTransform: "uppercase" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--stripe-purple)", animation: "pulse 1s infinite" }} />
                    Reasoning Engine
                  </div>
                  {streamingReasoning.slice(-300)}
                  <span style={{ display: "inline-block", width: "6px", height: "12px", background: "var(--text-muted)", marginLeft: "4px", animation: "cursor-blink 1s infinite" }} />
                </div>
              )}
              
              {/* Layer 2: Output */}
              {streamingContent ? (
                <div className="prose prose-invert max-w-none" style={{
                  color: "var(--text-primary)", fontSize: "15px", lineHeight: 1.7,
                  letterSpacing: "-0.01em", width: "100%"
                }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                    {streamingContent}
                  </ReactMarkdown>
                  <span style={{ display: "inline-block", width: "8px", height: "16px", background: "var(--stripe-purple)", marginLeft: "4px", animation: "cursor-blink 1s infinite", verticalAlign: "middle" }} />
                </div>
              ) : (
                selectedMode !== "fast" && (
                  <div style={{ 
                    color: "var(--text-muted)", fontSize: "15px", display: "flex", alignItems: "center", gap: "12px",
                    animation: "pulse 2s infinite"
                  }}>
                    <div style={{ width: "16px", height: "16px", border: "2px solid var(--border-light)", borderTopColor: "var(--stripe-purple)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    {(processingType === "image" ? ["🧠 Analyzing image...", "⚙ Contextualizing visuals..."] 
                      : processingType === "audio" ? ["🎤 Transcribing audio...", "🧠 Analyzing transcript..."] 
                      : processingType === "document" ? ["📄 Reading document...", "📚 Extracting key insights..."] 
                      : DYNAMIC_STATES)[loadingStateIdx]}
                  </div>
                )
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: "24px 40px",
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border-light)",
        flexShrink: 0,
        position: "relative", zIndex: 10
      }}>
        <div style={{ margin: "0 auto", width: "100%", maxWidth: "800px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
            {/* Response Mode Switcher */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            {[
              { id: "fast", label: "⚡ Fast" },
              { id: "reasoning", label: "🧠 Deep Thinking" },
              { id: "architect", label: "🏗 Architect" },
              { id: "research", label: "🔬 Research" },
              { id: "coding", label: "💻 Coding" }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => { setSelectedMode(mode.id as TaskType); setShowAutoSuggest(false); }}
                style={{
                  padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 500,
                  whiteSpace: "nowrap", transition: "all 0.2s", cursor: "pointer",
                  background: selectedMode === mode.id ? "var(--stripe-purple)" : "var(--pure-white)",
                  color: selectedMode === mode.id ? "#fff" : "var(--text-muted)",
                  border: selectedMode === mode.id ? "1px solid var(--stripe-purple)" : "1px solid var(--border-light)",
                  boxShadow: selectedMode === mode.id ? "0 2px 8px rgba(124,58,237,0.3)" : "none"
                }}
              >
                {mode.label}
              </button>
            ))}
            </div>

            {/* Provider Selection */}
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              style={{
                padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                background: "var(--pure-white)", color: "var(--text-primary)",
                border: "1px solid var(--border-light)", cursor: "pointer",
                boxShadow: "var(--shadow-sm)", outline: "none"
              }}
            >
              <option value="auto">🌟 Auto (Smart Fallback)</option>
              <option value="openrouter">🌌 OpenRouter (Premium)</option>
              <option value="gemini">🧠 Google Gemini</option>
              <option value="groq">⚡ Groq Llama</option>
              <option value="hf">🤗 HuggingFace</option>
              <option value="ollama">🦙 Local Ollama</option>
            </select>
          </div>

          {showAutoSuggest && (
            <div style={{
              background: "rgba(124, 58, 237, 0.05)", border: "1px solid rgba(124, 58, 237, 0.2)",
              color: "var(--stripe-purple)", padding: "10px 14px", borderRadius: "10px",
              fontSize: "13px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between",
              animation: "fade-up 0.3s ease"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                This task may benefit from Deep Thinking Mode.
              </span>
              <button 
                onClick={() => { setSelectedMode("reasoning"); setShowAutoSuggest(false); }} 
                style={{ background: "var(--pure-white)", color: "var(--stripe-purple)", border: "1px solid var(--border-light)", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", boxShadow: "var(--shadow-sm)" }}
              >
                Switch Mode
              </button>
            </div>
          )}

          {attachments.length > 0 && (
            <div style={{ display: "flex", gap: "8px", padding: "8px", background: "var(--bg-card)", borderRadius: "8px", marginBottom: "8px" }}>
              {attachments.map((att, idx) => (
                <div key={idx} style={{ position: "relative", width: "40px", height: "40px", borderRadius: "6px", overflow: "hidden", background: "var(--bg-light)", border: "1px solid var(--border-light)" }}>
                  {att.type === "image" && att.base64 ? (
                    <img src={att.base64} alt="attachment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "var(--stripe-purple)", textAlign: "center", wordBreak: "break-all", padding: "2px" }}>
                      {att.type.toUpperCase()}
                    </div>
                  )}
                  {att.status === "processing" && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, fontSize: "14px" }}>
                      ⏳
                    </div>
                  )}
                  <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} style={{ position: "absolute", top: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "white", border: "none", cursor: "pointer", fontSize: "10px", padding: "2px" }}>X</button>
                </div>
              ))}
            </div>
          )}

          <div style={{
            display: "flex", gap: "12px", alignItems: "flex-end",
            background: "var(--pure-white)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "10px",
            boxShadow: "var(--shadow-elevated)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="focus-within-ring"
          >
            {/* Attachment Button */}
            <input id="neurova-file-upload" type="file" style={{ display: "none" }} multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*,audio/*,video/*,.pdf,.txt" />
            <button
              type="button"
              style={{
                width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                background: "var(--bg-light)", border: "1px solid var(--border-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)", cursor: "pointer", transition: "all 0.2s"
              }}
              onClick={() => document.getElementById("neurova-file-upload")?.click()}
              title="Attach Document, Image, or Voice Note"
              className="hover-bg-border"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            
            {/* Mic Button */}
            <button
              type="button"
              style={{
                width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                background: isRecording ? "rgba(239, 68, 68, 0.1)" : "var(--bg-light)",
                border: isRecording ? "1px solid var(--error)" : "1px solid var(--border-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isRecording ? "var(--error)" : "var(--text-muted)",
                cursor: "pointer", transition: "all 0.2s"
              }}
              onClick={startRecording}
              title="Voice Input (Speech to Text)"
              className="hover-bg-border"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
            
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask Neurova anything... (Press Cmd+K for commands)"
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "var(--text-primary)", fontSize: "15px", resize: "none",
                lineHeight: 1.6, fontFamily: "inherit", maxHeight: "200px",
                overflowY: "auto", padding: "10px", boxShadow: "none"
              }}
            />
            {loading ? (
              <button
                className="btn-primary"
                onClick={handleStop}
                style={{ padding: "10px 20px", height: "42px", flexShrink: 0, borderRadius: "10px", fontWeight: 600, background: "var(--text-primary)", color: "var(--bg-light)" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                  Stop
                </span>
              </button>
            ) : (
              <button
                className="btn-primary btn-premium"
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                style={{ padding: "10px 20px", height: "42px", flexShrink: 0, borderRadius: "10px", fontWeight: 600 }}
              >
                Send
              </button>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.02em" }}>
            Ultra Intelligence Engine • Multi-Model Orchestration Active
          </div>
        </div>
      </div>
      <style>{`
        .focus-within-ring:focus-within {
          border-color: var(--stripe-purple) !important;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1) !important;
          transform: translateY(-2px);
        }
        .hover-bg-border:hover {
          background: var(--border-light) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
