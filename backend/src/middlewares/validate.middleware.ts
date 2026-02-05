
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse((req as any).body);
    next();
  } catch (err: any) {
    if (err instanceof z.ZodError) {
        return (res as any).status(400).json({ 
            message: "Validation Error", 
            errors: (err as z.ZodError).issues.map(e => ({ path: e.path.join('.'), message: e.message })) 
        });
    }
    return (res as any).status(400).json({ message: "Invalid Input" });
  }
};
