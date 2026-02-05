
import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await db.query(
            `SELECT id, name, slug, description, is_active FROM categories 
             WHERE is_active = true 
             ORDER BY name`
        );
        (res as any).json(result.rows);
    } catch (e) { next(e); }
};

export const listAllCategoriesAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await db.query(`SELECT * FROM categories ORDER BY name`);
        (res as any).json(result.rows);
    } catch (e) { next(e); }
};

export const listSubCategoriesBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = (req as any).params;
        const catRes = await db.query(`SELECT id, name, slug, description FROM categories WHERE slug=$1`, [slug]);
        
        if (catRes.rowCount === 0) return (res as any).status(404).json({ message: "Category not found" });
        const catId = catRes.rows[0].id;

        // AGGREGATION QUERY: Get SubCategories with Starting Price & Provider Count
        const result = await db.query(
            `SELECT sc.id, sc.category_id, sc.name, sc.slug, sc.is_active,
                    COALESCE(MIN(s.price), 0) as starting_price,
                    COUNT(s.id) as service_count
             FROM service_subcategories sc
             LEFT JOIN services s ON s.subcategory_id = sc.id AND s.is_active = true AND s.is_approved = true
             WHERE sc.category_id = $1 AND sc.is_active = true
             GROUP BY sc.id
             ORDER BY sc.name`,
            [catId]
        );
        (res as any).json({ category: catRes.rows[0], subcategories: result.rows });
    } catch (e) { next(e); }
};

export const listSubCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categoryId } = (req as any).params;
        const result = await db.query(
            `SELECT id, category_id, name, slug FROM service_subcategories 
             WHERE category_id = $1 AND is_active = true ORDER BY name`,
            [categoryId]
        );
        (res as any).json(result.rows);
    } catch (e) { next(e); }
};

/**
 * CLIENT: Get Virtual Service Page Details
 * Endpoint: GET /api/categories/:catSlug/:subSlug/details
 * Aggregates data to form a provider-agnostic service page
 */
export const getSubCategoryDetailsBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { catSlug, subSlug } = (req as any).params;
        const { zoneId } = (req as any).query;

        // 1. Basic Info (Category + SubCategory)
        const subCatRes = await db.query(
            `SELECT sc.id, sc.name, sc.slug, 
                    c.id as cat_id, c.name as category_name, c.slug as category_slug
             FROM service_subcategories sc
             JOIN categories c ON c.id = sc.category_id
             WHERE sc.slug = $1 AND c.slug = $2 AND sc.is_active = true`, 
             [subSlug, catSlug]
        );

        if (subCatRes.rowCount === 0) return (res as any).status(404).json({message: "Service not found"});

        const subCat = subCatRes.rows[0];
        const subCategoryId = subCat.id;
        const searchZoneId = zoneId || 1; // Default to zone 1 if missing

        // 2. Pricing & Availability Stats
        // Aggregates lowest price and count of approved providers in the zone
        const statsRes = await db.query(
            `SELECT 
                MIN(price) as starting_price, 
                COUNT(DISTINCT provider_id) as provider_count
             FROM services 
             WHERE subcategory_id = $1 
             AND zone_id = $2 
             AND is_active=true 
             AND is_approved=true`,
             [subCategoryId, searchZoneId]
        );
        
        const stats = statsRes.rows[0];

        // 3. Ratings Aggregation
        // Average rating for this specific service type (via bookings)
        const ratingRes = await db.query(
            `SELECT 
                COALESCE(AVG(r.rating), 0) as avg_rating, 
                COUNT(r.id) as review_count
             FROM reviews r
             JOIN bookings b ON b.id = r.booking_id
             JOIN services s ON s.id = b.service_id
             WHERE s.subcategory_id = $1`,
            [subCategoryId]
        );

        const ratings = ratingRes.rows[0];
        const serviceName = subCat.name;
        
        const responsePayload = {
            id: subCat.id,
            name: serviceName,
            slug: subCat.slug,
            description: `Professional ${serviceName} services verified by BookYourService.`,
            category_name: subCat.category_name,
            category_slug: subCat.category_slug,
            
            pricing: {
                starting_price: Number(stats.starting_price) || 0, 
                currency: "INR"
            },
            
            availability: {
                providers_available: Number(stats.provider_count),
                zone_id: Number(searchZoneId)
            },
            
            ratings: {
                average: Number(Number(ratings.avg_rating).toFixed(1)) || 4.8, 
                total_reviews: Number(ratings.review_count)
            },
            
            included: [
                `Inspection and diagnosis for ${serviceName}`,
                "Standard tools and labor charges",
                "Post-service cleanup",
                "Safety protocols followed"
            ],
            excluded: [
                "Spare parts cost (billed separately)",
                "Major repair work (unless specified)",
                "Warranty on parts (manufacturer dependant)"
            ],
            how_it_works: [
                { title: "Select Service", desc: "Choose your preferred time slot." },
                { title: "We Assign a Pro", desc: "A verified expert is assigned to you." },
                { title: "Service & Pay", desc: "Pay securely after service is done." }
            ],
            faqs: [
                { q: `How long does ${serviceName} take?`, a: "Usually 1-2 hours depending on the scope of work." },
                { q: "Do I need to provide tools?", a: "No, our professionals bring their own standard tools." },
                { q: "Is there a warranty?", a: "Yes, we provide a 7-day service warranty." }
            ],
            
            startingPrice: Number(stats.starting_price) || 0,
            availableProviders: Number(stats.provider_count)
        };

        (res as any).json(responsePayload);

    } catch (e) { next(e); }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = (req as any).body;
        const slug = name.toLowerCase().replace(/ /g, '-');
        await db.query(
            `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)`,
            [name, slug, description]
        );
        (res as any).status(201).json({ message: "Category created" });
    } catch (e) { next(e); }
};

export const toggleCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = (req as any).params;
        const { isActive } = (req as any).body;
        await db.query(
            `UPDATE categories SET is_active = $1 WHERE id = $2`,
            [isActive, id]
        );
        (res as any).json({ message: "Category status updated" });
    } catch (e) { next(e); }
};

export const createSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category_id, name } = (req as any).body;
        const slug = name.toLowerCase().replace(/ /g, '-');
        await db.query(
            `INSERT INTO service_subcategories (category_id, name, slug) VALUES ($1, $2, $3)`,
            [category_id, name, slug]
        );
        (res as any).status(201).json({ message: "Sub-category created" });
    } catch (e) { next(e); }
};
