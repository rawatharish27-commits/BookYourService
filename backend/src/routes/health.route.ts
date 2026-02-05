import { Router } from "express";
import { db } from "../config/db";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    // Check DB connection
    await db.query("SELECT 1");
    res.json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: "error", 
      database: "disconnected",
      timestamp: new Date().toISOString() 
    });
  }
});

export default router;