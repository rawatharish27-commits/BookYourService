import React, { useEffect, useState } from 'react';
import { getSubCategoryDetailsBySlug, getServiceReviews } from '../../services/api';
import { getServiceImage } from '../../utils/imageAssets';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Star, XCircle, ShieldCheck, 
  Award, HelpCircle, ChevronDown, Check, Users, 
  Clock, ShieldAlert, MessageSquare, Sparkles, Zap
} from 'lucide-react';
import { Review } from '../../types';
import Seo from '../../components/seo/Seo';
import { getServiceSchema } from '../../utils/seoSchema';

export const ServicePage: React.FC = () => {
  const { categorySlug, subCategorySlug } = useParams<{ categorySlug: string, subCategorySlug: string }>();
  const [details, setDetails] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!categorySlug || !subCategorySlug) return;
    const init = async () => {
        setLoading(true);
        try {
            const d = await getSubCategoryDetailsBySlug(categorySlug, subCategorySlug, 1);
            setDetails(d);
            const r = await getServiceReviews(d.id);
            setReviews(r);
        } catch(e) { 
          console.error("Error loading service details", e); 
        } finally { 
          setLoading(false); 
        }
    };
    init();
  }, [categorySlug, subCategorySlug]);

  const handleBookClick = () => {
      navigate(`/services/${categorySlug}/${subCategorySlug}/book`);
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 font-medium animate-pulse">Loading expert details...</p>
          </div>
      </div>
  );
  
  if (!details) return <div className="text-center p-12">Service Not Found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Seo 
        title={`${details.name} - Verified Professionals`} 
        description={`Book top-rated ${details.name} starting from ₹${details.startingPrice}. Background verified professionals with 4.8+ ratings.`} 
        schema={getServiceSchema({
            name: details.name,
            description: details.description,
            area: "Mumbai", // Dynamic area mapping can be added here
            price: details.startingPrice,
            rating: details.ratings.average,
            reviewCount: details.ratings.total_reviews
        })}
      />

      <div className="max-w-7xl mx-auto pb-20 px-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 pt-6 group font-bold">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Explore
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-10">
              {/* Header & Immersive Hero */}
              <div className="relative">
                  <div className="rounded-[2.5rem] overflow-hidden h-72 md:h-[450px] w-full mb-8 relative shadow-2xl">
                      <img 
                          src={getServiceImage(subCategorySlug || '', categorySlug)} 
                          alt={details.name}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-10 left-10 text-white">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] shadow-lg">
                                {details.category_name}
                            </span>
                          </div>
                          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">{details.name}</h1>
                          <div className="flex items-center gap-4 mt-4">
                             <div className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1 rounded-lg font-black text-sm">
                                <Star className="w-4 h-4 fill-current" /> {details.ratings.average}
                             </div>
                             <p className="text-sm font-bold opacity-80">{details.ratings.total_reviews} Happy Customers</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Live Availability Pulse */}
              <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                          <Clock className="w-6 h-6" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                      </div>
                      <div>
                        <p className="font-black text-gray-900 leading-tight">High Availability Today</p>
                        <p className="text-xs text-gray-500 font-bold">Earliest slot available at <span className="text-indigo-600">4:00 PM</span></p>
                      </div>
                  </div>
                  <button onClick={handleBookClick} className="hidden md:block bg-indigo-50 text-indigo-600 px-6 py-2 rounded-xl text-sm font-black hover:bg-indigo-600 hover:text-white transition-all">
                    Reserve Slot
                  </button>
              </div>

              {/* Expert Vetting Trust Block */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="md:w-1/3">
                      <div className="relative">
                        <img 
                          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400" 
                          className="rounded-3xl shadow-xl border-4 border-white" 
                          alt="Professional Expert"
                        />
                        <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-xl">
                          <Award className="w-8 h-8 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Meet our Verified Pros</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        Every professional assigned for <b>{details.name}</b> undergoes a rigorous 4-step vetting process.
                      </p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500" /> Identity Verified
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500" /> Background Checked
                        </li>
                      </ul>
                    </div>
                  </div>
              </div>

              {/* Inclusions / Exclusions */}
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                      <h3 className="font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          Included
                      </h3>
                      <ul className="space-y-4">
                          {details.included.map((item: string, i: number) => (
                               <li key={i} className="flex gap-3 text-sm text-gray-700 font-medium items-start">
                                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                      <h3 className="font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-gray-400" />
                          </div>
                          Excluded
                      </h3>
                      <ul className="space-y-4">
                           {details.excluded.map((item: string, i: number) => (
                               <li key={i} className="flex gap-3 text-sm text-gray-500 font-medium items-start">
                                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-2 shrink-0"></span>
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50 p-8 sticky top-24 overflow-hidden">
                  <div className="mb-10 relative">
                      <p className="text-indigo-600 text-[10px] uppercase tracking-[0.2em] font-black mb-3">Instant Booking</p>
                      <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-black text-gray-900 tracking-tight">₹{details.startingPrice}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 font-bold leading-relaxed">
                        Final price depends on workload. <br/>
                        <span className="text-indigo-600">Transparent billing after inspection.</span>
                      </p>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
                        <div>
                            <p className="text-sm font-black text-gray-900">Service Warranty</p>
                            <p className="text-xs text-gray-500 font-medium">Free rework if you're not satisfied within 7 days.</p>
                        </div>
                    </div>
                  </div>

                  <button 
                      onClick={handleBookClick}
                      className="w-full bg-gray-900 text-white font-black py-5 rounded-[1.25rem] transition-all hover:bg-indigo-600 active:scale-95 shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-3 text-lg"
                  >
                      Book Professional <Zap className="w-5 h-5 fill-current" />
                  </button>

                  <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Pay Safely via</p>
                    <div className="flex justify-center items-center gap-4 grayscale opacity-50">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" className="h-4" alt="Razorpay" />
                    </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};