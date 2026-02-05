import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * 🔒 SECURE WEBSOCKET HOOK
 * Leverages HttpOnly cookies for handshake authentication.
 */
export default function useWebSocket() {
  const { isAuthenticated } = useAuth();
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!isAuthenticated) return;

    // Determine WS protocol based on environment
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = (import.meta as any).env?.VITE_WS_URL || "localhost:4000";
    
    const ws = new WebSocket(`${protocol}//${host}`);

    ws.onopen = () => {
      setIsConnected(true);
      console.log("📡 Secured WebSocket Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (e) {
        console.error("Malformed WS Message", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Simple re-connection logic
      setTimeout(connect, 5000);
    };

    socketRef.current = ws;
  }, [isAuthenticated]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  return { lastMessage, isConnected };
}