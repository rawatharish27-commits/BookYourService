import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Seo from '../../components/seo/Seo';
import { SUBCATEGORIES } from '../../data/subCategories';
import { MapPin, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import Adsense from "../../components/ads/Adsense";

export const LocalServicePage: React.FC = () => {
  const { city, serviceSlug } = useParams<{ city: string; serviceSlug: string }>();
  const navigate = useNavigate();

  const service = SUBCATEGORIES.find(s => s.slug === serviceSlug);
  const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : "Your City";

  if (!service) return <div className="p-20 text-center">Service details not found.</div>;

  // 🧠 DYNAMIC SERVICE SCHEMA
  const serviceSchema = {
    "@context": "https://schema.org/",
    "@type": "Service",
    "name": `${service.name} in ${cityName}`,
    "description": `Professional ${service.name} services in ${cityName} by verified experts.`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "BookYourService",
      "image": "https://bookyourservice.com/logo.png"
    },
    "areaServed": {
      "@type": "City",
      "name": cityName
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": service.name,
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": `Standard ${service.name}`
          },
          "price": service.startingPrice,
          "priceCurrency": "INR"
        }
      ]
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1250"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo 
        title={`Best ${service.name} in ${cityName} | Verified Pros`} 
        description={`Book top-rated ${service.name} in ${cityName}. Starting at ₹${service.startingPrice}. Background verified professionals with 7-day warranty.`} 
        schema={serviceSchema}
      />

      {/* Local Hero */}
      <div className="bg-gray-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200" alt="City" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
            <div className="flex justify-center items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <span className="text-indigo-400 font-black uppercase tracking-widest text-sm">Services in {cityName}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Professional {service.name} <br/><span className="text-indigo-500">Expertly Done.</span></h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">Trusted by over 5,000 households in {cityName}. Instant booking & verified experts.</p>
            
            <button 
                onClick={() => navigate(`/services`)}
                className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all shadow-xl"
            >
                Book {service.name} Now
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main SEO Content */}
          <div className="lg:col-span-8 space-y-12">
              <section>
                  <h2 className="text-3xl font-black text-gray-900 mb-6">Why book {service.name} in {cityName} through us?</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <ShieldCheck className="w-8 h-8 text-indigo-600 mb-4" />
                          <h3 className="font-bold text-lg mb-2">Verified Experts Only</h3>
                          <p className="text-sm text-gray-500">Every professional in {cityName} goes through strict identity and skill verification.</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <Zap className="w-8 h-8 text-indigo-600 mb-4" />
                          <h3 className="font-bold text-lg mb-2">Fixed Prices</h3>
                          <p className="text-sm text-gray-500">No surprises. Know exactly what you'll pay starting from ₹{service.startingPrice}.</p>
                      </div>
                  </div>
              </section>

              {/* LOCAL PAGE AD PLACEMENT */}
              <Adsense slot="4444444444" />

              <section className="prose prose-indigo max-w-none">
                  <h3 className="text-2xl font-black">Professional Service Standard</h3>
                  <p className="text-gray-600 leading-relaxed">
                      Finding reliable {service.name.toLowerCase()} in {cityName} can be challenging. Our platform simplifies this by bringing together only the top-performing specialists. Whether it's emergency repair or regular maintenance, our professionals come equipped with advanced tools to ensure a job well done.
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none p-0">
                      <li className="flex items-center gap-2 text-sm text-gray-700 font-bold"><ArrowRight className="w-4 h-4 text-indigo-600" /> 7-Day Service Warranty</li>
                      <li className="flex items-center gap-2 text-sm text-gray-700 font-bold"><ArrowRight className="w-4 h-4 text-indigo-600" /> Background Checked Pros</li>
                      <li className="flex items-center gap-2 text-sm text-gray-700 font-bold"><ArrowRight className="w-4 h-4 text-indigo-600" /> Doorstep Service in 90 Mins</li>
                      <li className="flex items-center gap-2 text-sm text-gray-700 font-bold"><ArrowRight className="w-4 h-4 text-indigo-600" /> Transparent Digital Invoices</li>
                  </ul>
              </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl">
                  <h4 className="text-xl font-black mb-4">Limited Offer</h4>
                  <p className="text-indigo-100 mb-6 font-medium">Get ₹200 OFF on your first {service.name} booking in {cityName}.</p>
                  <div className="bg-white/10 border border-white/20 p-3 rounded-xl text-center font-mono font-black mb-6">
                      CITY200
                  </div>
                  <button onClick={() => navigate('/services')} className="w-full bg-white text-indigo-600 py-4 rounded-xl font-black">Apply & Book</button>
              </div>

              <div className="sticky top-24">
                {/* SIDEBAR AD PLACEMENT */}
                <Adsense slot="5555555555" format="rectangle" />
                
                <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <h5 className="font-black text-gray-900 mb-4 flex items-center gap-2 uppercase text-[10px] tracking-widest opacity-50">Local Stats</h5>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-sm font-bold text-gray-500">Pros in {cityName}</span>
                            <span className="text-sm font-black">250+</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-bold text-gray-500">Completed Jobs</span>
                            <span className="text-sm font-black">12.5k</span>
                        </div>
                    </div>
                </div>
              </div>
          </div>
      </div>
    </div>
  );
};