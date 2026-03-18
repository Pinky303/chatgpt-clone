import React, { useRef, useEffect } from "react";

const MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  { id: "claude-opus-4-20250514", label: "Claude Opus 4" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
];

export default function ChatInput({ onSend, disabled, model, onModelChange }) {
  const [value, setValue] = React.useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <div className="input-bar">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message Assistant..."
          rows={1}
          disabled={disabled}
          className="chat-textarea"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="send-btn"
          title="Send"
        >
          <SendIcon />
        </button>
      </div>
      <div className="input-footer">
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="model-select"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        <span className="footer-note">
          Press Enter to send · Shift+Enter for newline
        </span>
      </div>
    </div>
  );
}

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
