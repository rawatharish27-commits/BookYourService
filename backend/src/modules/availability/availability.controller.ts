
import { Request, Response, NextFunction } from "express";
import { availabilityService } from "./availability.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const availabilityController = {
  async set(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      // Expecting array of { day: 0-6, start: 'HH:MM', end: 'HH:MM' }
      const { slots } = (req as any).body; 
      
      if (!Array.isArray(slots)) {
          return (res as any).status(400).json({ message: "Invalid format. 'slots' must be an array." });
      }

      await availabilityService.setAvailability(userId, slots);
      (res as any).json({ success: true, message: "Availability updated" });
    } catch (e) {
      next(e);
    }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await availabilityService.list(userId);
      (res as any).json(data);
    } catch (e) {
      next(e);
    }
  },
};
