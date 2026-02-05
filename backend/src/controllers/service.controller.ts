import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AdminLogModel } from "../models/adminLog.model";

/**
 * PUBLIC LIST (Discovery Engine) - PHASE 8 OPTIMIZED
 * Uses tsvector/tsquery GIN indices for performance.
 */
export const listServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { zoneId, templateId, q, page = 1, limit = 20 } = (req as any).query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const params: any[] = [];
    let paramIdx = 1;

    // 🏎️ PHASE 8: Full-Text Search logic
    let searchQuery = "";
    if (q) {
      searchQuery = `AND (t.search_vector @@ plainto_tsquery('english', $${paramIdx++}))`;
      params.push(q);
    }

    let query = `
       SELECT s.id, s.price, 
              t.name AS title, t.description, t.duration_minutes,
              c.name AS category_name, sc.name AS subcategory_name, 
              z.name as zone_name,
              u.name as provider_name,
              COALESCE(ps.avg_rating, 0) as rating,
              ${q ? `ts_rank(t.search_vector, plainto_tsquery('english', $${q ? params.length : 0}))` : '0'} as rank,
              count(*) OVER() AS full_count
       FROM services s
       JOIN service_templates t ON t.id = s.template_id
       JOIN categories c ON c.id = s.category_id
       JOIN service_subcategories sc ON sc.id = s.subcategory_id
       JOIN zones z ON z.id = s.zone_id
       JOIN users u ON u.id = s.provider_id
       LEFT JOIN provider_stats ps ON ps.provider_id = s.provider_id
       WHERE s.is_active=true 
         AND s.is_approved=true
         AND u.verification_status='LIVE'
         ${searchQuery}
    `;

    if (zoneId) {
        query += ` AND s.zone_id = $${paramIdx++}`;
        params.push(zoneId);
    }
    
    if (templateId) {
        query += ` AND s.template_id = $${paramIdx++}`;
        params.push(templateId);
    }
    
    // Sort by Rank if searching, otherwise by Rating/Price
    const sortOrder = q 
      ? `ORDER BY rank DESC, ps.avg_rating DESC NULLS LAST` 
      : `ORDER BY ps.avg_rating DESC NULLS LAST, s.price ASC`;

    query += ` ${sortOrder} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(Number(limit), offset);

    const result = await db.query(query, params);
    
    const totalItems = Number(result.rows[0]?.full_count || 0);
    const totalPages = Math.ceil(totalItems / Number(limit));

    const rows = result.rows.map(({ full_count, rank, ...rest }) => rest);

    (res as any).json({
        data: rows,
        pagination: {
            total: totalItems,
            page: Number(page),
            limit: Number(limit),
            totalPages
        }
    });
  } catch (error) { next(error); }
};

/**
 * CREATE SERVICE
 */
export const createService = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const client = await db.connect();
  try {
    const { template_id, zone_id, price } = (req as any).body;
    const providerId = req.user!.id;

    if (!template_id || !zone_id || !price) {
        return (res as any).status(400).json({ message: "Missing required fields" });
    }

    await client.query("BEGIN");
    
    const tmplRes = await client.query(`SELECT * FROM service_templates WHERE id=$1`, [template_id]);
    if (tmplRes.rowCount === 0) return (res as any).status(404).json({ message: "Template not found" });
    const tmpl = tmplRes.rows[0];

    if (tmpl.min_price && price < tmpl.min_price) {
        return (res as any).status(400).json({ message: `Minimum allowed: ${tmpl.min_price}` });
    }

    const categoryId = (await client.query(`SELECT category_id FROM service_subcategories WHERE id=$1`, [tmpl.subcategory_id])).rows[0].category_id;

    const result = await client.query(
      `INSERT INTO services 
       (provider_id, template_id, category_id, subcategory_id, zone_id, title, description, price, duration_minutes, is_active, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, false) 
       RETURNING id`,
      [providerId, template_id, categoryId, tmpl.subcategory_id, zone_id, tmpl.name, tmpl.description, Number(price), tmpl.duration_minutes]
    );

    await client.query("COMMIT");
    (res as any).status(201).json({ success: true, serviceId: result.rows[0].id });
  } catch (e) {
      await client.query("ROLLBACK");
      next(e);
  } finally {
      client.release();
  }
};

export const getMyServices = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await db.query(
            `SELECT s.*, z.name as zone_name 
             FROM services s 
             JOIN zones z ON z.id = s.zone_id
             WHERE provider_id = $1 ORDER BY created_at DESC`,
            [req.user!.id]
        );
        (res as any).json(result.rows);
    } catch(e) { next(e); }
};

export const updateService = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { price, is_active } = (req as any).body;
        await db.query(
            `UPDATE services SET price=$1, is_active=$2 WHERE id=$3 AND provider_id=$4`,
            [price, is_active, (req as any).params.id, req.user!.id]
        );
        (res as any).json({message: "Updated"});
    } catch(e) { next(e); }
};

export const approveService = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user!.id;
        const serviceId = (req as any).params.id;

        await db.query(`UPDATE services SET is_approved=true, is_active=true WHERE id=$1`, [serviceId]);
        
        // 🔒 PHASE 7 Audit
        await AdminLogModel.log(adminId, 'APPROVE_SERVICE', 'SERVICE', serviceId, { status: 'APPROVED' });

        (res as any).json({message: "Approved"});
    } catch(e) { next(e); }
};

export const rejectService = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user!.id;
        const serviceId = (req as any).params.id;
        const { reason } = (req as any).body;

        await db.query(`UPDATE services SET is_approved=false, is_active=false, reject_reason=$1 WHERE id=$2`, [reason, serviceId]);
        
        // 🔒 PHASE 7 Audit
        await AdminLogModel.log(adminId, 'REJECT_SERVICE', 'SERVICE', serviceId, { status: 'REJECTED', reason });

        (res as any).json({message: "Rejected"});
    } catch(e) { next(e); }
};

export const getAllServicesAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await db.query(`
            SELECT s.*, u.name as provider_name, c.name as category_name, sc.name as subcategory_name 
            FROM services s
            JOIN users u ON u.id = s.provider_id
            JOIN categories c ON c.id = s.category_id
            JOIN service_subcategories sc ON sc.id = s.subcategory_id
            ORDER BY s.created_at DESC LIMIT 100
        `);
        (res as any).json(result.rows);
    } catch(e) { next(e); }
};