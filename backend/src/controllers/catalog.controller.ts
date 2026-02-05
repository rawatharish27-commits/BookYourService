
import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Get Templates for a SubCategory
 * Used by Provider to select what they want to offer
 */
export const getTemplatesBySubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { subCategoryId } = (req as any).params;
        const result = await db.query(
            `SELECT * FROM service_templates 
             WHERE subcategory_id = $1 AND is_active = true 
             ORDER BY name`,
            [subCategoryId]
        );
        (res as any).json(result.rows);
    } catch (e) {
        next(e);
    }
};

/**
 * ADMIN: Create Template
 */
export const createTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { subCategoryId, name, description, basePrice, minPrice, maxPrice } = (req as any).body;
        
        await db.query(
            `INSERT INTO service_templates (subcategory_id, name, description, base_price, min_price, max_price)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [subCategoryId, name, description, basePrice, minPrice, maxPrice]
        );
        
        (res as any).status(201).json({ message: "Template created" });
    } catch (e) {
        next(e);
    }
};

/**
 * ADMIN: List All Templates
 */
export const getAllTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await db.query(`
            SELECT t.*, sc.name as subcategory_name, c.name as category_name 
            FROM service_templates t
            JOIN service_subcategories sc ON sc.id = t.subcategory_id
            JOIN categories c ON c.id = sc.category_id
            ORDER BY t.created_at DESC
        `);
        (res as any).json(result.rows);
    } catch (e) {
        next(e);
    }
};
