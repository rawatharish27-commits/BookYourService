
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import cookie from "cookie"; // You might need to add 'cookie' or parse manually. Using manual parse to avoid dep if simple.
import { env } from "../config/env";
import { eventBus, EventTypes } from "../events/eventBus";
import { logger } from "../utils/logger";

type ClientMeta = {
  userId: string;
  role: string;
};

const clients = new Map<WebSocket, ClientMeta>();

export function initWebSocket(server: any) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    try {
      // 1. Extract Cookie
      const rawCookies = req.headers.cookie;
      if (!rawCookies) {
          ws.close(1008, "No cookies");
          return;
      }

      // Simple manual parsing to avoid adding 'cookie' package dependency for just this file
      const parsedCookies = rawCookies.split(';').reduce((res, item) => {
          const data = item.trim().split('=');
          return { ...res, [data[0]]: data[1] };
      }, {} as Record<string, string>);

      const token = parsedCookies['access_token'];
      if (!token) {
          ws.close(1008, "Unauthorized");
          return;
      }

      // 2. Verify Token
      const payload: any = jwt.verify(token, env.JWT_SECRET);

      clients.set(ws, {
        userId: payload.id,
        role: payload.role,
      });

      // logger.info(`WS Connected: ${payload.id}`);

      ws.on("close", () => clients.delete(ws));
      ws.on("error", () => clients.delete(ws));

    } catch (e) {
      ws.close(1008, "Auth Failed");
    }
  });

  // 🔥 BROADCAST LOGIC
  
  // 1. Booking Created -> Notify Provider & Admin
  eventBus.on(EventTypes.BOOKING_CREATED, (data) => {
      broadcast(data, (meta) => {
          return meta.userId === data.providerId || meta.role === 'ADMIN';
      });
  });

  // 2. Booking Updated -> Notify Client, Provider & Admin
  eventBus.on(EventTypes.BOOKING_UPDATED, (data) => {
      broadcast(data, (meta) => {
          return meta.userId === data.clientId || 
                 meta.userId === data.providerId || 
                 meta.role === 'ADMIN';
      });
  });
}

function broadcast(data: any, filter: (meta: ClientMeta) => boolean) {
    const message = JSON.stringify(data);
    for (const [ws, meta] of clients) {
        if (ws.readyState === WebSocket.OPEN && filter(meta)) {
            ws.send(message);
        }
    }
}
