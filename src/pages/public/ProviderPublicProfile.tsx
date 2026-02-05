import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Seo from "../../components/seo/Seo";
import { getPublicProviderProfile } from "../../services/api";
import { Star, ShieldCheck, Award, MessageSquare, ArrowLeft, ChevronRight, Zap, MapPin } from "lucide-react";
import Loader from "../../components/ui/Loader";

export const ProviderPublicProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
        try {
            const data = await getPublicProviderProfile(slug);
            setProvider(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetch();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!provider) return <div className="p-20 text-center font-black">Provider Not Found</div>;

  return (
    <>
      <Seo
        title={`${provider.name} | Verified Professional`}
        description={provider.bio || `Book trusted services from ${provider.name}. Top-rated professional with verified credentials.`}
        canonical={`/provider/${slug}`}
      />

      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Profile Header */}
        <div className="bg-gray-900 text-white py-16 px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="w-32 h-32 bg-indigo-500 rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white/10">
                    {provider.name.charAt(0)}
                </div>
                <div className="text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                        <h1 className="text-4xl font-black tracking-tight">{provider.name}</h1>
                        <span className="bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                            <ShieldCheck className="w-3 h-3" /> Verified Pro
                        </span>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl font-medium">{provider.bio || "Dedicated service professional committed to excellence and quality workmanship."}</p>
                    <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-6">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-xl font-black">{provider.rating || '4.8'}</span>
                            <span className="text-gray-500 text-sm">({provider.reviewCount || '120'} Reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Award className="w-5 h-5 text-indigo-400" />
                            <span className="text-sm font-bold uppercase tracking-widest">{provider.completedJobs || '500'}+ Jobs Done</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => navigate(-1)} className="md:self-start bg-white/10 hover:bg-white/20 p-3 rounded-2xl backdrop-blur-md transition-all">
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-20">
            {/* Sidebar Stats */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Service Locations</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                            <span className="font-bold text-gray-900">New York Metro</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">This professional serves residential and commercial properties within a 25-mile radius.</p>
                    </div>
                </div>

                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                    <Zap className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
                    <h3 className="text-lg font-black mb-2">Hire {provider.name}</h3>
                    <p className="text-sm opacity-80 font-medium mb-6">Experience guaranteed quality with 24/7 platform support.</p>
                    <button onClick={() => navigate('/services')} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Select a Service</button>
                </div>
            </div>

            {/* Catalog */}
            <div className="lg:col-span-8 space-y-10">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <Award className="w-6 h-6 text-indigo-600" /> Professional Catalog
                    </h2>
                    
                    {(!provider.services || provider.services.length === 0) ? (
                        <p className="text-gray-500 font-medium italic py-10">This provider hasn't listed services yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {provider.services.map((s: any) => (
                                <Link 
                                    key={s.id} 
                                    to={`/services/${s.category_slug}/${s.slug}/detail`}
                                    className="group flex items-center justify-between p-6 rounded-3xl bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-lg group-hover:text-indigo-900">{s.title}</h4>
                                            <p className="text-xs text-gray-400 font-black uppercase tracking-tighter mt-1">Starting from ₹{s.price}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-indigo-600" /> Recent Feedback
                    </h2>
                    <div className="space-y-6">
                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 italic text-gray-500 text-center font-medium">
                            No reviews posted yet. Be the first to book!
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};