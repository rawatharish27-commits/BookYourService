
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '../../components/seo/Seo';
import { CATEGORIES } from '../../data/categories';
import { SUBCATEGORIES } from '../../data/subCategories';
import { MapPin, Globe, ChevronRight, Search, Building2, Landmark } from 'lucide-react';

const MAJOR_CITIES = [
    { id: 1, name: "Mumbai", slug: "mumbai", state: "Maharashtra" },
    { id: 2, name: "Delhi", slug: "delhi", state: "NCR" },
    { id: 3, name: "Bangalore", slug: "bangalore", state: "Karnataka" },
    { id: 4, name: "Hyderabad", slug: "hyderabad", state: "Telangana" },
    { id: 5, name: "Chennai", slug: "chennai", state: "Tamil Nadu" },
    { id: 6, name: "Pune", slug: "pune", state: "Maharashtra" },
];

export const CityIndex: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo 
        title="Find Services in Your City | Local Directories" 
        description="Browse professional home services across all major cities in India. Verified experts for AC repair, cleaning, and more." 
      />

      {/* Hero */}
      <div className="bg-indigo-600 py-20 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
                  <Globe className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Our Service <span className="text-indigo-200">Footprint</span></h1>
              <p className="text-indigo-100 max-w-2xl mx-auto font-medium">Select your city to find top-rated professionals nearby.</p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* City Grid (8 Cols) */}
              <div className="lg:col-span-8 space-y-10">
                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12">
                      <h2 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-3">
                          <Building2 className="w-6 h-6 text-indigo-600" /> Major Hubs
                      </h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {MAJOR_CITIES.map(city => (
                              <div key={city.id} className="group p-6 rounded-3xl border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer">
                                  <div className="flex justify-between items-center mb-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                              <MapPin className="w-5 h-5" />
                                          </div>
                                          <div>
                                              <h3 className="font-black text-gray-900">{city.name}</h3>
                                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{city.state}</p>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                      {SUBCATEGORIES.slice(0, 3).map(sub => (
                                          <button 
                                            key={sub.id}
                                            onClick={() => navigate(`/${city.slug}/${sub.slug}`)}
                                            className="w-full text-left text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center justify-between py-1 transition-colors"
                                          >
                                              {sub.name} in {city.name}
                                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </button>
                                      ))}
                                      <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest pt-2 hover:underline">View All 25+ Services</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                      <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                          <Landmark className="w-6 h-6 text-indigo-600" /> Expanding Soon
                      </h3>
                      <div className="flex flex-wrap gap-3">
                          {["Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh"].map(c => (
                              <span key={c} className="px-4 py-2 bg-gray-50 rounded-xl text-sm font-bold text-gray-400 border border-gray-100">{c}</span>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Sidebar Info (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[80px] opacity-20"></div>
                      <h3 className="text-xl font-black mb-4">Can't find your city?</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-8">
                          We are rapidly expanding our network of verified professionals. Subscribe to get notified when we launch in your area.
                      </p>
                      <div className="space-y-3">
                          <input type="email" placeholder="Your email address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500" />
                          <button className="w-full bg-indigo-600 py-3 rounded-xl font-black text-sm hover:bg-indigo-700 transition-all">Notify Me</button>
                      </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Service Standards</h4>
                      <div className="space-y-6">
                          <div className="flex gap-4">
                              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0"><ChevronRight className="w-4 h-4" /></div>
                              <p className="text-xs font-bold text-gray-600 leading-relaxed font-medium">Standardized pricing across all cities.</p>
                          </div>
                          <div className="flex gap-4">
                              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0"><ChevronRight className="w-4 h-4" /></div>
                              <p className="text-xs font-bold text-gray-600 leading-relaxed font-medium">Verified local background checks for every pro.</p>
                          </div>
                      </div>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};
