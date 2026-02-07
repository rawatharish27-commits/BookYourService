import { NextResponse } from 'next/server';

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface Service {
  id: string;
  slug: string;
  title: string;
  category: {
    slug: string;
  };
  updatedAt: string;
}

// Generate sitemap XML
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookyourservice.com';

    // Fetch all categories
    const categoriesRes = await fetch(`${baseUrl}/api/categories`);
    const categoriesData = await categoriesRes.json();
    const categories = categoriesData.success ? categoriesData.data : [];

    // Fetch all services for service URLs
    const servicesRes = await fetch(`${baseUrl}/api/services?limit=1000`);
    const servicesData = await servicesRes.json();
    const services = servicesData.success ? servicesData.data : [];

    // Static pages
    const staticPages = [
      { url: '', changefreq: 'weekly', priority: '1.0' },
      { url: 'about', changefreq: 'monthly', priority: '0.8' },
      { url: 'contact', changefreq: 'monthly', priority: '0.6' },
      { url: 'faq', changefreq: 'monthly', priority: '0.6' },
      { url: 'terms', changefreq: 'monthly', priority: '0.6' },
      { url: 'privacy', changefreq: 'monthly', priority: '0.5' },
      { url: 'refund', changefreq: 'monthly', priority: '0.5' },
      { url: 'login', changefreq: 'weekly', priority: '0.8' },
      { url: 'signup', changefreq: 'weekly', priority: '0.8' },
      { url: 'services', changefreq: 'daily', priority: '0.9' },
    ];

    // Build sitemap
    const date = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    sitemap += `  <!-- Home -->\n`;
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/</loc>\n`;
    sitemap += `    <lastmod>${date}</lastmod>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `  </url>\n`;

    // Static pages
    for (const page of staticPages) {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/${page.url}</loc>\n`;
      sitemap += `    <lastmod>${date}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += `  </url>\n`;
    }

    // Categories
    for (const category of categories) {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/categories/${category.slug}</loc>\n`;
      sitemap += `    <lastmod>${date}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    }

    // Services (limited to recent 1000 for performance)
    for (const service of services.slice(0, 1000)) {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/services/${service.id}</loc>\n`;
      sitemap += `    <lastmod>${new Date(service.updatedAt).toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>daily</changefreq>\n`;
      sitemap += `    <priority>0.6</priority>\n`;
      sitemap += `  </url>\n`;
    }

    sitemap += `</urlset>\n`;

    // Return XML with correct content type
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'SITEMAP_GENERATION_FAILED',
        message: 'Failed to generate sitemap',
      },
      { status: 500 }
    );
  }
}
