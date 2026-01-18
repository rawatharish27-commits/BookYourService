import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.CORS_ORIGIN || "https://bookyourservice.co.in";

// Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Health Check (Vercel + UptimeRobot)
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      db: "connected",
      time: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      db: "disconnected",
    });
  }
});

// Root test
app.get("/", (req, res) => {
  res.json({
    name: "BookYourService API",
    status: "running",
    env: process.env.NODE_ENV,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
