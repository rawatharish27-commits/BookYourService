import { NextResponse } from 'next/server';

interface Service {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  currency: string;
  durationMinutes: number;
  city: string | null;
  averageRating: number;
  totalReviews: number;
  verified: boolean;
  featured: boolean;
  category: {
    name: string;
    slug: string;
  };
  provider: {
    name: string | null;
    trustScore: number;
  };
}

// Generate Schema.org JSON-LD for services
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const serviceId = searchParams.get('id');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookyourservice.com';

  if (!serviceId) {
    return NextResponse.json(
      {
        success: false,
        error: 'MISSING_SERVICE_ID',
        message: 'Service ID parameter is required',
      },
      { status: 400 }
    );
  }

  try {
    // Fetch service details
    const response = await fetch(`${baseUrl}/api/services/${serviceId}`);
    const data = await response.json();

    if (!data.success || !data.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'SERVICE_NOT_FOUND',
          message: 'Service not found',
        },
        { status: 404 }
      );
    }

    const service: Service = data.data;

    // Generate Schema.org structured data
    const schemaOrg = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": service.title,
      "description": service.description,
      "image": `${baseUrl}/og-image.png`,
      "provider": {
        "@type": "Person",
        "name": service.provider.name || 'Professional Provider',
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": service.averageRating,
          "reviewCount": service.totalReviews,
          "bestRating": "5",
          "worstRating": "1",
        },
        "trustScore": service.provider.trustScore,
      },
      "offers": {
        "@type": "Offer",
        "category": service.category.name,
        "price": service.basePrice,
        "priceCurrency": service.currency,
        "availability": "Online Booking",
      },
      "areaServed": service.city || "India",
      "hasOfferCatalog": true,
      "priceRange": `${service.basePrice - Math.floor(service.basePrice * 0.2)} - ${Math.ceil(service.basePrice * 1.2)}`,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": service.averageRating,
        "reviewCount": service.totalReviews,
        "bestRating": "5",
        "worstRating": "1",
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Average Duration",
          "value": `${service.durationMinutes} minutes`,
        },
        {
          "@type": "PropertyValue",
          "name": "Verified",
          "value": service.verified,
        },
        {
          "@type": "PropertyValue",
          "name": "Featured",
          "value": service.featured,
        },
      ],
    };

    return new NextResponse(schemaOrg, {
      status: 200,
      headers: {
        'Content-Type': 'application/ld+json',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'SCHEMA_GENERATION_FAILED',
        message: 'Failed to generate Schema.org data',
      },
      { status: 500 }
    );
  }
}
