import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Seo from '../../components/seo/Seo';
import { CATEGORIES } from '../../data/categories';
import { SUBCATEGORIES } from '../../data/subCategories';
import { MapPin, ChevronRight, Star, ShieldCheck, ArrowRight, Zap, Users } from 'lucide-react';
import { getServiceImage } from '../../utils/imageAssets';
import Breadcrumbs from '../../components/navigation/Breadcrumbs';

export const CityCategoryPage: React.FC = () => {
  const { city, categorySlug } = useParams<{ city: string; categorySlug: string }>();
  const navigate = useNavigate();

  const category = CATEGORIES.find(c => c.slug === categorySlug);
  const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : "Your City";
  const subServices = SUBCATEGORIES.filter(s => s.catSlug === categorySlug);

  if (!category) return <div className="p-20 text-center">Category not found.</div>;

  const title = `${category.name} in ${cityName} | Verified Pros @ Best Prices`;
  const desc = `Looking for ${category.name.toLowerCase()} in ${cityName}? Book background-verified experts for ${subServices.slice(0, 3).map(s => s.name).join(', ')}. Instant booking and upfront pricing.`;

  // JSON-LD Breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bookyourservice.com" },
      { "@type": "ListItem", "position": 2, "name": cityName, "item": `https://bookyourservice.com/cities` },
      { "@type": "ListItem", "position": 3, "name": category.name, "item": `https://bookyourservice.com/${city}/${categorySlug}` }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo title={title} description={desc} schema={breadcrumbSchema} />

      {/* Hero */}
      <div className="bg-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1581578731117-104f2a8d46a8?auto=format&fit=crop&w=1200')] bg-cover"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <Breadcrumbs
                items={[
                    { label: "Cities", path: "/cities" },
                    { label: cityName, path: `/${city}` },
                    { label: category.name }
                ]}
            />
            <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold uppercase text-xs tracking-widest">
                <MapPin className="w-4 h-4" /> Best in {cityName}
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Professional {category.name} <br/>Services in <span className="text-indigo-500">{cityName}</span></h1>
            <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">{category.description}</p>
            <div className="flex flex-wrap gap-4">
                <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/10">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" /> 4.8 Avg Rating
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-green-400" /> 100% Verified
                </span>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between items-end mb-10">
              <div>
                  <h2 className="text-3xl font-black text-gray-900">Explore Services</h2>
                  <p className="text-gray-500 font-medium mt-1">Specific {category.name.toLowerCase()} available for you.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subServices.map(sub => (
                  <div 
                    key={sub.id} 
                    onClick={() => navigate(`/${city}/${sub.slug}`)}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden"
                  >
                      <div className="h-48 overflow-hidden relative">
                          <img src={getServiceImage(sub.slug, categorySlug)} alt={sub.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-6">
                              <h3 className="text-xl font-bold text-white">{sub.name}</h3>
                          </div>
                      </div>
                      <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase">Starts @ ₹{sub.startingPrice}</span>
                              <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                  <Star className="w-4 h-4 fill-current" /> 4.9
                              </div>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed mb-6">Expert {sub.name.toLowerCase()} at your doorstep in {cityName}. Equipped with professional tools.</p>
                          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                              <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Book Now</span>
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* Local Content Block for SEO */}
          <div className="mt-20 bg-white rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-sm">
              <div className="max-w-3xl">
                  <h3 className="text-2xl font-black text-gray-900 mb-6">Why choose our {category.name} in {cityName}?</h3>
                  <div className="space-y-6">
                      <div className="flex gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0"><Zap className="w-5 h-5 text-indigo-600" /></div>
                          <p className="text-gray-600 leading-relaxed"><span className="font-bold text-gray-900">Standardized Pricing:</span> No more bargaining. Get fixed, transparent rates for all {category.name.toLowerCase()} services across {cityName}.</p>
                      </div>
                      <div className="flex gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-indigo-600" /></div>
                          <p className="text-gray-600 leading-relaxed"><span className="font-bold text-gray-900">Hand-Picked Pros:</span> We only partner with the top 1% of service providers in {cityName} after rigorous background and skill tests.</p>
                      </div>
                  </div>
                  <div className="mt-10 pt-10 border-t border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4">Other cities we serve</h4>
                      <div className="flex flex-wrap gap-2">
                          {["Delhi", "Mumbai", "Bangalore", "Pune", "Chennai"].map(c => (
                              <Link key={c} to={`/${c.toLowerCase()}/${categorySlug}`} className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg">{c}</Link>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};