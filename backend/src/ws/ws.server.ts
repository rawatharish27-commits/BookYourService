import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { eventBus, EventTypes } from "../events/eventBus";
import { logger } from "../utils/logger";

type ClientMeta = {
  userId: string;
  role: string;
};

// Internal registry of active secured connections
const clients = new Map<WebSocket, ClientMeta>();

/**
 * 🔒 PHASE 3: SECURE WEBSOCKET SERVER
 * Prevents unauthenticated upgrades and maps sockets to user identities.
 */
export function initWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request: any, socket: any, head: any) => {
    try {
      // 1. Extract and Parse HttpOnly Cookies
      const rawCookies = request.headers.cookie || "";
      const cookies: Record<string, string> = {};
      rawCookies.split(';').forEach((cookie: string) => {
        const parts = cookie.split('=');
        if (parts.length === 2) {
          cookies[parts[0].trim()] = parts[1].trim();
        }
      });

      const token = cookies['access_token'];
      
      if (!token) {
        logger.warn("WebSocket Upgrade Rejected: Missing Access Token");
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // 2. Authoritative Verification
      const payload: any = jwt.verify(token, env.JWT_SECRET);
      
      // 3. Permitted Upgrade
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, payload);
      });
    } catch (e) {
      logger.warn("WebSocket Auth Handshake Failed: Invalid Signature or Expired");
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on("connection", (ws, req, user: any) => {
    // Successfully authenticated - map identity to socket
    clients.set(ws, {
      userId: user.id,
      role: user.role,
    });

    logger.info(`WebSocket Secured Connection Established: User ${user.id} (${user.role})`);

    ws.on("close", () => {
      clients.delete(ws);
      // Fixed: Property 'debug' does not exist on logger. Changed to info.
      logger.info(`WebSocket Disconnected: User ${user.id}`);
    });
    
    ws.on("error", () => clients.delete(ws));
  });

  // 📡 BROADCAST ENGINE
  // Listens to the internal EventBus and routes messages to authorized subscribers
  eventBus.on(EventTypes.BOOKING_UPDATED, (data) => {
      broadcast(data, (meta) => {
          // Rule: Only the involved parties or an Admin should receive live updates for a specific booking
          return meta.userId === data.client_id || 
                 meta.userId === data.provider_id || 
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