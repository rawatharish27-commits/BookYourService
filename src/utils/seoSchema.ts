/**
 * Standardized SEO JSON-LD Generators
 */

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BookYourService",
  "url": "https://bookyourservice.com",
  "logo": "https://bookyourservice.com/logo.png",
  "sameAs": [
    "https://facebook.com/bookyourservice",
    "https://twitter.com/bookyourservice",
    "https://instagram.com/bookyourservice"
  ]
};

export function getServiceSchema(service: {
  name: string;
  description: string;
  area: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "areaServed": {
      "@type": "City",
      "name": service.area
    },
    "provider": {
      "@type": "LocalBusiness",
      "name": "BookYourService",
      "image": "https://bookyourservice.com/logo.png"
    },
    ...(service.price && {
      "offers": {
        "@type": "Offer",
        "price": service.price,
        "priceCurrency": "INR"
      }
    }),
    ...(service.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": service.rating,
        "reviewCount": service.reviewCount || 1
      }
    })
  };
}

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://bookyourservice.com${item.url}`
  }))
});