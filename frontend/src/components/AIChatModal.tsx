import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Bot,
  Settings
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  latencyMs?: number;
  timestamp: string;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || "/api";

export const AIChatModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "👋 **Welcome to OrgMind AI Copilot!**\n\nI am connected to your **FalkorDB Company Graph** and open-source models (**Meta Llama 3.2 / Mistral 7B / DeepSeek R1**). Ask me anything about microservices, ownership, ADR decisions, historical outages, or architectural drift.",
      modelUsed: "Meta Llama 3.2 (Open Source)",
      timestamp: "Now"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama-3.2");
  const [showSettings, setShowSettings] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    (window as any).__openAIChat = () => setIsOpen(true);
    (window as any).__closeAIChat = () => setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Who owns Payments and what microservices depend on it?",
    "Why was PR #318 blocked by ADR-042?",
    "What was the blast radius of historical incident INC-8812?",
    "Are there any active RFC conflicts in the graph?"
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: historyPayload,
          model: selectedModel,
          custom_endpoint: customEndpoint || undefined,
          api_key: apiKey || undefined
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || "No response received.",
        modelUsed: data.model_used || "Open-Source AI",
        latencyMs: data.latency_ms,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Error connecting to AI backend:** ${err.message}. Please verify the backend is running.`,
        modelUsed: "Error Fallback",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        .chat-launcher-btn {
          position: fixed;
          bottom: 24px;
          right: 28px;
          z-index: 999;
          background: #0c0a09;
          border: 1px solid rgba(224, 163, 92, 0.45);
          color: #f5f5f4;
          padding: 10px 18px;
          border-radius: 30px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(217, 119, 6, 0.25);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.25s ease;
        }
        .chat-launcher-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(224, 163, 92, 0.8);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(217, 119, 6, 0.4);
        }
        .chat-bubble-user {
          background: #141210;
          border: 1px solid #292524;
          color: #f5f5f4;
          border-radius: 12px 12px 2px 12px;
          padding: 12px 16px;
          max-width: 82%;
          margin-left: auto;
          font-size: 13px;
          line-height: 1.5;
        }
        .chat-bubble-assistant {
          background: #080706;
          border: 1px solid #242220;
          color: #e7e5e4;
          border-radius: 12px 12px 12px 2px;
          padding: 14px 18px;
          max-width: 88%;
          margin-right: auto;
          font-size: 13px;
          line-height: 1.6;
        }
        .quick-prompt-btn {
          background: #141210;
          border: 1px solid #242220;
          color: #d6d3d1;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .quick-prompt-btn:hover {
          border-color: rgba(224, 163, 92, 0.5);
          color: #e0a35c;
          background: rgba(224, 163, 92, 0.08);
        }
      `}</style>

      {/* FLOATING LAUNCHER PILL BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-launcher-btn"
          title="Open OrgMind AI Copilot (Open Source AI)"
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#e0a35c",
              boxShadow: "0 0 8px #e0a35c",
              animation: "pulse 2s infinite"
            }}
          />
          <Sparkles size={16} color="#e0a35c" />
          <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Ask AI Copilot
          </span>
          <span
            style={{
              fontSize: "9px",
              background: "rgba(224, 163, 92, 0.15)",
              color: "#e0a35c",
              padding: "2px 6px",
              borderRadius: "10px",
              border: "1px solid rgba(224, 163, 92, 0.3)",
              fontWeight: 600,
              letterSpacing: "0.04em"
            }}
          >
            Open Source AI
          </span>
        </button>
      )}

      {/* EXPANDED AI CHAT MODAL / DRAWER */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "clamp(340px, 92vw, 480px)",
            height: "clamp(500px, 80vh, 640px)",
            backgroundColor: "#0c0a09",
            border: "1px solid #242220",
            borderRadius: "18px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(217, 119, 6, 0.2)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}
        >
          {/* HEADER BAR */}
          <div
            style={{
              padding: "14px 18px",
              background: "#080706",
              borderBottom: "1px solid #1f1d1b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #d97706, #78350f)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 10px rgba(217, 119, 6, 0.4)"
                }}
              >
                <Bot size={15} color="#000000" />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>
                  OrgMind AI Copilot
                </div>
                <div style={{ fontSize: "10px", color: "#34d399", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }}></span>
                  Connected: FalkorDB Graph-RAG
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: showSettings ? "#1c1917" : "transparent",
                  border: "1px solid #292524",
                  color: showSettings ? "#e0a35c" : "#78716c",
                  borderRadius: "6px",
                  padding: "5px",
                  cursor: "pointer"
                }}
                title="Model & Provider Settings"
              >
                <Settings size={14} />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#78716c",
                  cursor: "pointer",
                  padding: "4px"
                }}
                title="Close Copilot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* MODEL SELECTOR & SETTINGS ACCORDION */}
          {showSettings && (
            <div
              style={{
                padding: "12px 18px",
                background: "#141210",
                borderBottom: "1px solid #242220",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "11px"
              }}
            >
              <div>
                <label style={{ color: "#a8a29e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Active Open-Source Model:
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "4px",
                    background: "#080706",
                    color: "#f5f5f4",
                    border: "1px solid #292524",
                    borderRadius: "6px",
                    padding: "6px 8px",
                    outline: "none",
                    fontSize: "11px"
                  }}
                >
                  <option value="llama-3.2">Meta Llama 3.2 (Open Source Foundation)</option>
                  <option value="mistral-7b">Mistral 7B Instruct (Open Source)</option>
                  <option value="deepseek-r1">DeepSeek R1 (Open Source Reasoning)</option>
                  <option value="ollama">Ollama Local (http://localhost:11434)</option>
                </select>
              </div>

              <div>
                <label style={{ color: "#a8a29e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Optional Ollama / Custom Endpoint:
                </label>
                <input
                  type="text"
                  placeholder="e.g. http://localhost:11434"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "4px",
                    background: "#080706",
                    color: "#f5f5f4",
                    border: "1px solid #292524",
                    borderRadius: "6px",
                    padding: "5px 8px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ color: "#a8a29e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Optional HuggingFace / Open-Source API Token:
                </label>
                <input
                  type="password"
                  placeholder="hf_... (optional)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "4px",
                    background: "#080706",
                    color: "#f5f5f4",
                    border: "1px solid #292524",
                    borderRadius: "6px",
                    padding: "5px 8px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          )}

          {/* CHAT MESSAGES BODY */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {msg.content.split("\n").map((line, lidx) => {
                      if (line.startsWith("### ")) {
                        return <h4 key={lidx} style={{ margin: "4px 0 8px 0", color: "#f5d59f" }}>{line.replace("### ", "")}</h4>;
                      }
                      return <p key={lidx} style={{ margin: "2px 0" }}>{line}</p>;
                    })}
                  </div>
                </div>

                {/* Metadata footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "4px",
                    fontSize: "9.5px",
                    color: "#78716c",
                    padding: "0 4px"
                  }}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && (
                    <>
                      <span>•</span>
                      <span style={{ color: "#e0a35c" }}>{msg.modelUsed}</span>
                    </>
                  )}
                  {msg.latencyMs && (
                    <>
                      <span>•</span>
                      <span>{msg.latencyMs}ms</span>
                    </>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px", color: "#e0a35c" }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #e0a35c",
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite"
                  }}
                />
                <span style={{ fontSize: "11.5px" }}>Querying FalkorDB Graph & Reasoning...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPTS HORIZONTAL SCROLLER */}
          <div
            style={{
              padding: "8px 18px",
              background: "#080706",
              borderTop: "1px solid #1f1d1b",
              display: "flex",
              gap: "6px",
              overflowX: "auto"
            }}
          >
            {quickPrompts.map((qp, idx) => (
              <button key={idx} onClick={() => handleSend(qp)} className="quick-prompt-btn">
                {qp}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div
            style={{
              padding: "12px 18px",
              background: "#0c0a09",
              borderTop: "1px solid #242220",
              display: "flex",
              gap: "10px",
              alignItems: "flex-end"
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about architecture, incidents, or ownership..."
              rows={2}
              style={{
                flex: 1,
                background: "#141210",
                border: "1px solid #292524",
                borderRadius: "10px",
                padding: "8px 12px",
                color: "#f5f5f4",
                fontSize: "12px",
                lineHeight: 1.4,
                resize: "none",
                outline: "none",
                boxSizing: "border-box"
              }}
            />

            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{
                background: input.trim() && !isLoading ? "linear-gradient(135deg, #d97706, #b45309)" : "#242220",
                color: input.trim() && !isLoading ? "#000000" : "#78716c",
                border: "none",
                borderRadius: "10px",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                transition: "all 0.2s ease"
              }}
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </div>

          {/* BOTTOM ENGINE BADGE */}
          <div
            style={{
              padding: "4px 18px",
              background: "#080706",
              textAlign: "center",
              fontSize: "9px",
              color: "#78716c",
              borderTop: "1px solid #141210",
              letterSpacing: "0.06em",
              textTransform: "uppercase"
            }}
          >
            FalkorDB Graph-RAG • Open-Source AI Native
          </div>
        </div>
      )}
    </>
  );
};
