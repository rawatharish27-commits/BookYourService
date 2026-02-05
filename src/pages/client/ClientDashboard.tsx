import React, { useEffect, useState, useMemo } from 'react';
import { Category, SubCategory } from '../../types';
import { getCategories, getPublicStats, getSubCategories } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { getServiceImage } from '../../utils/imageAssets';
import { 
    Search, MapPin, ChevronRight, Star, ShieldCheck, 
    Clock, CheckCircle, TrendingUp, ArrowRight, ChevronDown, Wrench, Zap, Droplets, Truck
} from 'lucide-react';
import Loader from '../../components/ui/Loader';

const FAQS = [
    { q: "How do I book a service?", a: "Simply search for a service, select a category, choose your preferred time slot, and confirm your booking with a secure payment." },
    { q: "Are the professionals verified?", a: "Yes, all our providers undergo a strict KYC and background check process before being approved." },
    { q: "What if I need to cancel?", a: "You can cancel up to 24 hours before the scheduled time for a full refund. Late cancellations may incur a small fee." },
    { q: "Is payment secure?", a: "Absolutely. We use Razorpay for secure transactions and hold funds in escrow until the job is completed." }
];

export const ClientDashboard: React.FC = () => {
  const [categories, setCategories] = useState<(Category & {slug?: string})[]>([]);
  const [popularSubs, setPopularSubs] = useState<SubCategory[]>([]);
  const [stats, setStats] = useState<any>({ total_bookings: 0, active_providers: 0, happy_clients: 0, visitors_today: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, publicStats] = await Promise.all([
            getCategories(),
            getPublicStats()
        ]);
        setCategories(cats);
        setStats(publicStats);

        if (cats.length > 0) {
            const subs = await getSubCategories(cats[0].id);
            setPopularSubs(subs.slice(0, 4));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getCategoryIcon = (slug: string) => {
      const s = slug.toLowerCase();
      if (s.includes('clean')) return <Droplets className="w-8 h-8" />;
      if (s.includes('electric')) return <Zap className="w-8 h-8" />;
      if (s.includes('plumb') || s.includes('repair')) return <Wrench className="w-8 h-8" />;
      if (s.includes('move') || s.includes('transport')) return <Truck className="w-8 h-8" />;
      return <TrendingUp className="w-8 h-8" />;
  };

  const firstCatSlug = categories[0]?.slug;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-gray-900 overflow-hidden min-h-[500px] flex items-center">
          <div className="absolute inset-0">
              <img 
                  src="https://5.imimg.com/data5/SELLER/Default/2023/9/344847333/GX/QV/OZ/26622329/housekeeping-services-500x500.jpg" 
                  alt="Home Services Banner" 
                  width="1200"
                  height="600"
                  className="w-full h-full object-cover opacity-20 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/60"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
              <div className="md:w-3/5 text-left z-10">
                  <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                      Trusted by {stats.happy_clients}+ Customers
                  </span>
                  <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
                      Your Home Needs,<br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Solved Instantly.</span>
                  </h1>
                  <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed font-light">
                      BookYourService connects you with verified local professionals for AC repair, cleaning, plumbing, and more. Fast, secure, and satisfaction guaranteed.
                  </p>

                  <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-xl flex flex-col md:flex-row gap-2 items-center">
                      <div className="relative w-full md:flex-1">
                          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="What do you need help with?" 
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-0 text-gray-900 font-medium h-12 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                      </div>
                      <button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg">
                          Search
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          
          <div className="mb-24">
              <div className="flex justify-between items-end mb-10">
                  <div>
                      <h2 className="text-3xl font-extrabold text-gray-900">Browse Categories</h2>
                      <p className="text-gray-500 mt-2">Find the right professional for every job.</p>
                  </div>
                  <button onClick={() => navigate('/categories')} className="hidden md:flex items-center text-indigo-600 font-bold hover:underline">
                      View all <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
              </div>

              {loading ? (
                <Loader />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {categories.map(cat => (
                    <div 
                        key={cat.id} 
                        onClick={() => navigate(`/services/${cat.slug}`)}
                        className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 hover:border-indigo-100 transition-all cursor-pointer flex flex-col items-center text-center h-48 justify-center relative overflow-hidden"
                    >
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                         {getCategoryIcon(cat.slug || '')}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700">{cat.name}</h3>
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div className="mb-24">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-10">Trending Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {popularSubs.length > 0 ? popularSubs.map(sub => (
                      <div key={sub.id} className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer border border-gray-100" onClick={() => navigate(`/services/${firstCatSlug}/${sub.slug}`)}>
                          <div className="h-56 overflow-hidden relative">
                              <img 
                                src={getServiceImage(sub.slug || '', firstCatSlug)} 
                                alt={sub.name} 
                                width="400"
                                height="300"
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900">
                                  Popular
                              </div>
                          </div>
                          <div className="p-6">
                              <h3 className="font-bold text-xl text-gray-900 mb-2">{sub.name}</h3>
                              <p className="text-gray-500 text-sm mb-4">Starting from ₹{sub.starting_price || 499}</p>
                              <div className="flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                                  Book Now <ChevronRight className="w-4 h-4 ml-1" />
                              </div>
                          </div>
                      </div>
                  )) : (
                      [1,2,3,4].map(i => <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse"></div>)
                  )}
              </div>
          </div>
          
          {/* FAQ */}
          <div className="max-w-3xl mx-auto mb-24">
              <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
              <div className="space-y-4">
                  {FAQS.map((faq, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                          <button 
                            className="w-full flex justify-between items-center p-6 text-left font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          >
                              {faq.q}
                              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                          </button>
                          {expandedFaq === idx && (
                              <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4 bg-gray-50/50">
                                  {faq.a}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};