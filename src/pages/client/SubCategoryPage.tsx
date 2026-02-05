import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SUBCATEGORIES } from '../../data/subCategories';
import { CATEGORIES } from '../../data/categories';
import Seo from '../../components/seo/Seo';
import { getServiceImage } from '../../utils/imageAssets';
import { ArrowLeft, Star, ShieldCheck, Clock, Check, ChevronRight, MapPin, Filter } from 'lucide-react';
import Breadcrumbs from '../../components/navigation/Breadcrumbs';
import { getBreadcrumbSchema } from '../../utils/seoSchema';

export const SubCategoryPage: React.FC = () => {
  const { categorySlug, subCategorySlug } = useParams<{ categorySlug: string, subCategorySlug: string }>();
  const navigate = useNavigate();
  
  const subInfo = SUBCATEGORIES.find(s => s.slug === subCategorySlug);
  const catInfo = CATEGORIES.find(c => c.slug === categorySlug);

  if (!subInfo || !catInfo) return <div className="p-20 text-center">Service not found.</div>;

  // Fix: Map property names 'name' to 'label' and 'url' to 'path' to comply with Crumb interface expectations in Breadcrumbs component
  const breadcrumbs = [
    { label: catInfo.name, path: `/services/${catInfo.slug}` },
    { label: subInfo.name }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Seo 
        title={`${subInfo.name} in your City`} 
        description={`Book verified ${subInfo.name} starting from ₹${subInfo.startingPrice}. Background checked professionals with 4.8+ ratings.`} 
        schema={getBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: catInfo.name, url: `/services/${catInfo.slug}` },
          { name: subInfo.name, url: `/services/${catInfo.slug}/${subInfo.slug}` }
        ])}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                      <h1 className="text-xl font-bold text-gray-900">{subInfo.name}</h1>
                      <Breadcrumbs items={breadcrumbs} />
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <button className="hidden md:flex items-center gap-2 bg-100 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200">
                      <MapPin className="w-4 h-4 text-indigo-600" /> New York
                  </button>
                  <button className="p-2 bg-gray-100 rounded-lg md:hidden">
                      <Filter className="w-5 h-5 text-gray-700" />
                  </button>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Left: Discovery Content */}
              <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="h-64 relative">
                          <img 
                            src={getServiceImage(subInfo.slug, categorySlug)} 
                            className="w-full h-full object-cover" 
                            alt={subInfo.name} 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-6 left-6 text-white">
                              <p className="text-xs font-bold uppercase tracking-widest bg-indigo-600 px-2 py-1 rounded w-fit mb-2">Most Trusted</p>
                              <h2 className="text-3xl font-extrabold">{subInfo.name}</h2>
                          </div>
                      </div>
                      <div className="p-8">
                          <div className="flex flex-wrap gap-6 mb-8">
                              <div className="flex items-center gap-2">
                                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                  <span className="font-bold text-gray-900">4.8</span>
                                  <span className="text-gray-400 text-sm">(12k reviews)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-5 h-5 text-green-600" />
                                  <span className="text-gray-700 text-sm font-medium">Safe & Background Verified</span>
                              </div>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{subInfo.description}</p>
                      </div>
                  </div>

                  <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose a Package</h3>
                      <div className="space-y-4">
                          {[
                            { name: 'Standard Package', price: subInfo.startingPrice, desc: 'Covers essential repair and general inspection.' },
                            { name: 'Premium Full-Service', price: subInfo.startingPrice + 500, desc: 'Includes deep cleaning and 3-month warranty extension.' }
                          ].map((pkg, i) => (
                              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:border-indigo-200 transition-colors cursor-pointer group" onClick={() => navigate(`/services/${categorySlug}/${subCategorySlug}/detail`)}>
                                  <div className="flex-1">
                                      <h4 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h4>
                                      <p className="text-sm text-gray-500 mb-4">{pkg.desc}</p>
                                      <ul className="grid grid-cols-2 gap-2">
                                          <li className="flex items-center gap-2 text-xs text-gray-600"><Check className="w-3 h-3 text-green-500" /> Professional Service</li>
                                          <li className="flex items-center gap-2 text-xs text-gray-600"><Check className="w-3 h-3 text-green-500" /> 7-Day Warranty</li>
                                          <li className="flex items-center gap-2 text-xs text-gray-600"><Check className="w-3 h-3 text-green-500" /> Verified Experts</li>
                                          <li className="flex items-center gap-2 text-xs text-gray-600"><Check className="w-3 h-3 text-green-500" /> Post-Service Cleanup</li>
                                      </ul>
                                  </div>
                                  <div className="text-center md:text-right min-w-[140px]">
                                      <p className="text-2xl font-extrabold text-gray-900">₹{pkg.price}</p>
                                      <button className="mt-2 bg-gray-900 text-white font-bold py-2 px-6 rounded-xl group-hover:bg-indigo-600 transition-colors">Select</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-32">
                      <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest opacity-50">Why choose us?</h3>
                      <div className="space-y-8">
                          <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                  <Clock className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900 text-sm">On-Time Arrival</h4>
                                  <p className="text-xs text-gray-500 mt-1">If our pro is late, you get a ₹100 discount instantly.</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                  <Star className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900 text-sm">Best Rated Pros</h4>
                                  <p className="text-xs text-gray-500 mt-1">We only assign pros with 4.5+ average user rating.</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900 text-sm">Service Warranty</h4>
                                  <p className="text-xs text-gray-500 mt-1">Free rework if you're not satisfied within 7 days.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};
