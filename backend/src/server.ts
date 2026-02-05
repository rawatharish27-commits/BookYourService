
import http from "http";
import app from "./app";
import { env } from "./config/env";
import { db } from "./config/db";
import { logger } from "./config/logger";
import { initWebSocket } from "./ws/ws.server";

const server = http.createServer(app);

// Initialize WebSocket Server
initWebSocket(server);

async function startServer() {
  try {
    logger.info("Starting server...");

    await db.healthCheck();
    logger.info("Database connected");

    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    (process as any).on("SIGTERM", shutdown);
    (process as any).on("SIGINT", shutdown);
  } catch (err) {
    logger.error("Server failed to start", err);
    (process as any).exit(1);
  }
}

async function shutdown() {
  logger.info("Shutting down server...");
  server.close(async () => {
    await db.close();
    logger.info("Server closed gracefully");
    (process as any).exit(0);
  });
}

startServer();
