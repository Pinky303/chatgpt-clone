import { useEffect, useRef, useState, useCallback } from "react";

const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export function useChat(conversationId) {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!conversationId) return;
    const ws = new WebSocket(`${WS_BASE}/ws/${conversationId}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "history") {
        setMessages(data.messages || []);
        setStreaming(false);
        setStreamBuffer("");
      } else if (data.type === "user_message") {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "stream_start") {
        setStreaming(true);
        setStreamBuffer("");
      } else if (data.type === "stream_chunk") {
        setStreamBuffer((prev) => prev + data.chunk);
      } else if (data.type === "stream_end") {
        setMessages((prev) => [...prev, data.message]);
        setStreaming(false);
        setStreamBuffer("");
      } else if (data.type === "cleared") {
        setMessages([]);
        setStreaming(false);
        setStreamBuffer("");
      } else if (data.type === "error") {
        setStreaming(false);
        setStreamBuffer("");
        setMessages((prev) => [
          ...prev,
          {
            role: "error",
            content: data.message,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => ws.close();
  }, [conversationId]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (content, model, system) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "message", content, model, system })
        );
      }
    },
    []
  );

  const clearChat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "clear" }));
    }
  }, []);

  return { messages, streaming, streamBuffer, connected, sendMessage, clearChat };
}
