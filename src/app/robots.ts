import { NextResponse } from 'next/server';

// Generate robots.txt for Google and other search engines
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookyourservice.com';

  const robotsTxt = `# BookYourService - Robots.txt
# सर्चेंग एं खोजनगी के लिए खोजनगी

User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay to reduce server load
Crawl-delay: 1

# Disallow admin areas
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /_next/
Disallow: /.env*

# Disallow search parameters to prevent duplicate indexing
Disallow: /*?*
Disallow: /*&*
Disallow: /*page=*
Disallow: /*limit=*
Disallow: /*offset=*

# AdSense bot allowance
User-agent: Mediapartners-Google
Allow: /

User-agent: Googlebot
Allow: /

User-agent: bingbot
Allow: /

# Crawl-delay for major bots
User-agent: Slurp
Crawl-delay: 3
User-agent: DuckDuckBot
Crawl-delay: 2
User-agent: Baiduspider
Crawl-delay: 2

# Specific pages to not index (if any)
# Disallow: /login?*
# Disallow: /signup?*

`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
}
