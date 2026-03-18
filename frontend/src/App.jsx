import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Message from "./components/Message";
import ChatInput from "./components/ChatInput";
import { useChat } from "./hooks/useChat";
import "./App.css";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const WELCOME_PROMPTS = [
  { icon: "✦", label: "Explain a concept", prompt: "Explain how WebSockets work in simple terms." },
  { icon: "⬡", label: "Write code", prompt: "Write a Python function to parse JSON safely." },
  { icon: "◈", label: "Brainstorm ideas", prompt: "Give me 5 unique side project ideas for a developer." },
  { icon: "◉", label: "Draft a message", prompt: "Draft a professional email to follow up after an interview." },
];

export default function App() {
  const [convId, setConvId] = useState(() => generateId());
  const [model, setModel] = useState("claude-sonnet-4-20250514");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const bottomRef = useRef(null);

  const { messages, streaming, streamBuffer, connected, sendMessage, clearChat } = useChat(convId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamBuffer]);

  const handleSend = (text) => {
    sendMessage(text, model, "You are a helpful, harmless, and honest AI assistant.");
  };

  const handleNew = () => setConvId(generateId());
  const handleSelect = (id) => setConvId(id);
  const handleDelete = (id) => { if (id === convId) setConvId(generateId()); };

  return (
    <div className="app">
      <Sidebar
        activeId={convId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <main className="main">
        {/* Top bar */}
        <div className="topbar">
          <div className={`status-dot ${connected ? "online" : "offline"}`} />
          <span className="status-label">{connected ? "Connected" : "Reconnecting…"}</span>
          <span style={{ flex: 1 }} />
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat}>Clear chat</button>
          )}
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 && !streaming ? (
            <div className="welcome">
              <div className="welcome-logo">
                <div className="logo-circle" />
              </div>
              <h1 className="welcome-title">How can I help you today?</h1>
              <div className="prompt-grid">
                {WELCOME_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    className="prompt-card"
                    onClick={() => handleSend(p.prompt)}
                  >
                    <span className="prompt-icon">{p.icon}</span>
                    <span className="prompt-label">{p.label}</span>
                    <span className="prompt-text">{p.prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-inner">
              {messages.map((msg, i) => (
                <Message
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={false}
                />
              ))}
              {streaming && streamBuffer && (
                <Message role="assistant" content={streamBuffer} isStreaming={true} />
              )}
              {streaming && !streamBuffer && (
                <div className="typing-indicator">
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          disabled={streaming || !connected}
          model={model}
          onModelChange={setModel}
        />
      </main>
    </div>
  );
}
