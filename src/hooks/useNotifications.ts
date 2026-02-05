import { useEffect, useState, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'PAYMENT' | 'SYSTEM';
  timestamp: string;
  read: boolean;
}

/**
 * PRODUCTION-GRADE REAL-TIME NOTIFICATIONS
 * Connects to Server-Sent Events (SSE) stream for low-latency updates.
 */
export default function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const fetchHistory = useCallback(async () => {
    // In real app: const res = await api.get('/api/v1/notifications');
  }, []);

  useEffect(() => {
    // Safe Env Retrieval
    const getApiUrl = () => {
      try {
        return (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";
      } catch {
        return "http://localhost:4000";
      }
    };

    const API_URL = getApiUrl();
    const eventSource = new EventSource(`${API_URL}/api/v1/notifications/stream`, { withCredentials: true });

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("🔔 Notification Stream Connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CONNECTED') return;
        
        setNotifications(prev => [
            { 
                id: Date.now().toString(), 
                title: data.title || "Update", 
                message: data.message || "Something changed in your account.",
                type: data.type || 'SYSTEM',
                timestamp: new Date().toISOString(),
                read: false
            }, 
            ...prev
        ]);
        
      } catch (e) {
        console.error("Failed to parse notification", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error", err);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { notifications, isConnected };
}