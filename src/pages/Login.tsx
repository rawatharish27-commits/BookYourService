import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../services/api';
import { Category, Role } from '../types';
import { 
  ShieldCheck, UserCheck, Clock, Search, 
  Star, Settings, ChevronRight, LogIn, CheckCircle
} from 'lucide-react';

export const Login: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Smart Redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === Role.ADMIN) navigate('/admin');
      else if (user.role === Role.PROVIDER) navigate('/provider');
      else navigate('/services');
    }
  }, [isAuthenticated, user, navigate]);

  // 2. Fetch Categories
  useEffect(() => {
    const loadData = async () => {
        try {
            const cats = await getCategories();
            setCategories(cats);
        } catch (e) {
            console.error("Failed to load categories", e);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1581578731117-104f2a8d46a8?auto=format&fit=crop&q=80&w=2000" 
                alt="Background" 
                className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/50"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[600px]">
            <div className="absolute top-6 right-6">
                <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full backdrop-blur-md transition-all text-sm font-bold border border-white/10"
                >
                    <LogIn className="w-4 h-4" /> Sign In / Register
                </button>
            </div>

            <div className="max-w-3xl">
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                    The #1 Service Marketplace
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                    Expert services,<br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">delivered instantly.</span>
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
                    Book trusted professionals for cleaning, repair, and maintenance. 
                    Background verified • Upfront pricing • Satisfaction guaranteed.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => navigate('/services')}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/50 hover:-translate-y-1"
                    >
                        <Search className="w-5 h-5" /> Find a Service
                    </button>
                    <button 
                        onClick={() => navigate('/login?role=PROVIDER')}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm transition-all hover:-translate-y-1"
                    >
                        Join as a Professional
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Popular Services</h2>
          </div>

          {loading ? (
              <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
          ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {categories.slice(0, 5).map(cat => (
                      <div 
                        key={cat.id}
                        onClick={() => navigate(`/services/${cat.slug}`)}
                        className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 transition-all cursor-pointer text-center h-full flex flex-col items-center justify-center"
                      >
                          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                              <Settings className="w-7 h-7" />
                          </div>
                          <h3 className="font-bold text-gray-900">{cat.name}</h3>
                      </div>
                  ))}
                  <div 
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-all"
                    onClick={() => navigate('/services')}
                  >
                      <span className="font-bold">View All</span>
                      <ChevronRight className="w-5 h-5 mt-1" />
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};