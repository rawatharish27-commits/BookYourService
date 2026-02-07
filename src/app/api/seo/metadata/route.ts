import { NextRequest, NextResponse } from 'next/server';

// SEO metadata for dynamic pages
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'home';
  const path = searchParams.get('path') || '';

  const metadata = {
    title: {
      home: 'BookYourService - Professional Service Marketplace | सेवा और ऑया सेवा',
      categories: 'Categories - Browse 32+ Service Categories | श्रेणियाएं देखें',
      services: 'Services - Find Professional Services | व्यावसिकाएं खोजें',
      serviceDetails: 'Service Details | सेवा विवरण',
      booking: 'Book Service | सेवा बुक करें',
      dashboard: 'Dashboard | डैशबोर्ड',
      about: 'About Us | हमारे बारे में',
      contact: 'Contact | संपर्क करें',
      faq: 'FAQ | पूछे-जैज सवाल',
      terms: 'Terms of Service | सेवा की शर्तें',
      privacy: 'Privacy Policy | गोपनीयत नीति',
      refund: 'Refund Policy | वापसी नीति',
    },
    description: {
      home: 'BookYourService - India ka sabse bada service marketplace. 32+ service categories, 640+ subcategories aur 200+ services. Trusted providers, quality assurance aur 24/7 support.',
      categories: 'Browse through 32 comprehensive service categories. 640+ subcategories har specialized service. Home maintenance, appliances, beauty wellness aur bahut kuch.',
      services: 'Find verified professionals across India. Real-time availability, transparent pricing, aur quality assurance.',
      serviceDetails: 'Complete service information including pricing, duration, provider details, reviews, aur booking availability.',
      booking: 'Book professional services instantly. Real-time slot checking, secure payments, aur instant confirmation.',
      dashboard: 'Manage your bookings, services, aur earnings. Track performance, communicate with clients, aur grow your business.',
      about: 'BookYourService India ka leading service marketplace platform. Hum providers aur clients ko connect karte hain. Quality service, transparent pricing, aur complete peace of mind.',
      contact: '24/7 customer support. Email, phone, aur office hours. Feedback welcome aur support guaranteed.',
      faq: 'Common questions about services, booking, payments, refunds, aur platform policies. Detailed answers in Hindi aur English.',
      terms: 'Complete terms of service, provider, aur user agreement. Clear cancellation policy, refund rules, aur dispute resolution.',
      privacy: 'We protect your personal information. Data collection, usage, storage, aur sharing policies. GDPR compliant.',
      refund: 'Transparent refund policy. 100% money-back guarantee for eligible cancellations. Quick processing within 5-7 business days.',
    },
    keywords: {
      common: [
        'bookyourservice, service marketplace, online booking, professional services',
        'home services, home repair, AC repair, plumbing, electrical',
        'appliance repair, laptop repair, mobile repair, gadget repair',
        'beauty services, salon, spa, massage, fitness, yoga, grooming',
        'cleaning services, home cleaning, office cleaning, deep cleaning',
        'automotive, car wash, car repair, bike service, car detailing',
        'tutors, home tutoring, online classes, music lessons, dance classes',
        'event planning, wedding planner, birthday organizer, event management',
        'pet care, dog grooming, pet sitting, veterinary services, pet training',
        'India services, Mumbai services, Delhi services, Bangalore services',
      ],
      localized: {
        hindi: 'ऑनलाइन सेवा, पेशेश्वासी, ब्यूज सेवा, गोधन, स्वच्छन, कपड़ पहनन, सफाई सफाई, संवाधन',
        english: 'services, providers, booking, home repair, beauty, cleaning, education, events, pets',
      },
    },
    openGraph: {
      siteName: 'BookYourService - Professional Service Marketplace',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://bookyourservice.com',
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      site: '@bookyourservice',
      creator: '@bookyourservice',
      title: 'BookYourService - India ka Professional Service Marketplace',
      description: 'Connect with trusted professionals for all your needs. 32+ categories, 640+ services.',
    },
    robots: {
      allow: true,
      crawlDelay: 1000,
    },
  };

  // Return metadata for requested type
  if (type === 'title') {
    const page = path;
    const title = page ? metadata.title[page] || metadata.title.home : metadata.title.home;
    return NextResponse.json({ success: true, data: { title } });
  }

  if (type === 'description') {
    const page = path;
    const description = page ? metadata.description[page] || metadata.description.home : metadata.description.home;
    return NextResponse.json({ success: true, data: { description } });
  }

  if (type === 'keywords') {
    const page = path;
    const keywords = page ? metadata.keywords.localized.hindi : metadata.keywords.localized.english;
    return NextResponse.json({ success: true, data: { keywords } });
  }

  if (type === 'all') {
    return NextResponse.json({ success: true, data: metadata });
  }

  return NextResponse.json(
    { success: false, error: 'INVALID_TYPE', message: 'Invalid metadata type' },
    { status: 400 }
  );
}
