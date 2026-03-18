import React from "react";
import { renderMarkdown } from "../utils/markdown";

export default function Message({ role, content, isStreaming }) {
  const isUser = role === "user";
  const isError = role === "error";

  return (
    <div className={`message ${isUser ? "user" : "assistant"} ${isError ? "error" : ""}`}>
      <div className="message-avatar">
        {isUser ? (
          <div className="avatar user-avatar-icon">U</div>
        ) : (
          <div className="avatar bot-avatar-icon">
            <BotIcon />
          </div>
        )}
      </div>
      <div className="message-body">
        <div className="message-role">{isUser ? "You" : isError ? "Error" : "Assistant"}</div>
        <div className="message-content">
          {isUser ? (
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{content}</p>
          ) : (
            <>
              {renderMarkdown(content)}
              {isStreaming && <span className="cursor-blink">▋</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
  </svg>
);
