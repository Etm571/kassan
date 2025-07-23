"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type MessageHandler = (data: any) => void;

interface WebSocketContextType {
  ws: WebSocket | null;
  isConnected: boolean;
  send: (data: any) => void;
  addMessageHandler: (handler: MessageHandler) => void;
  removeMessageHandler: (handler: MessageHandler) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/client?token=" + encodeURIComponent(process.env.NEXT_PUBLIC_WEBSOCKET_SECRET || ""));
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handlersRef.current.forEach((handler) => handler(data));
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    return () => ws.close();
  }, []);

  const send = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  const addMessageHandler = (handler: MessageHandler) => {
    handlersRef.current.add(handler);
  };

  const removeMessageHandler = (handler: MessageHandler) => {
    handlersRef.current.delete(handler);
  };

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, isConnected, send, addMessageHandler, removeMessageHandler }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be used within a WebSocketProvider");
  return ctx;
};