import { Router, Request, Response } from "express";
import { db } from "../config/db";

const router = Router();

const SITE_URL = process.env.SITE_URL || "https://bookyourservice.com";

router.get("/", async (req: Request, res: Response) => {
    try {
        // 1. Static Core Pages
        const staticPages = ["", "/categories", "/about", "/privacy", "/terms", "/faq", "/cities"];
        
        // 2. Dynamic Categories
        const cats = await db.query("SELECT slug FROM categories WHERE is_active = true");
        const categoryPages = cats.rows.map(c => `/services/${c.slug}`);

        // 3. Dynamic Sub-Categories (SEO Landing Pages)
        const subs = await db.query(`
            SELECT sc.slug, c.slug as cat_slug 
            FROM service_subcategories sc 
            JOIN categories c ON c.id = sc.category_id 
            WHERE sc.is_active = true
        `);
        const subPages = subs.rows.map(s => `/services/${s.cat_slug}/${s.slug}`);

        // 4. Dynamic Cities
        const cities = await db.query("SELECT DISTINCT LOWER(city) as city_slug FROM zones");
        const cityPages = cities.rows.map(c => `/${c.city_slug}`);

        // Build XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        const allPages = [...staticPages, ...categoryPages, ...subPages, ...cityPages];
        const now = new Date().toISOString().split('T')[0];

        allPages.forEach(path => {
            const priority = path === "" ? "1.0" : (path.startsWith("/services") ? "0.8" : "0.5");
            xml += `
            <url>
                <loc>${SITE_URL}${path}</loc>
                <lastmod>${now}</lastmod>
                <changefreq>daily</changefreq>
                <priority>${priority}</priority>
            </url>`;
        });

        xml += `</urlset>`;

        res.header("Content-Type", "application/xml");
        res.status(200).send(xml);
    } catch (e) {
        console.error("Sitemap Generation Error:", e);
        res.status(500).end();
    }
});

export default router;