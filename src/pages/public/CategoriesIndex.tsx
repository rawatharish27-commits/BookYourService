import React, { useState } from 'react';
import { CATEGORIES } from '../../data/categories';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Search, ArrowRight } from 'lucide-react';
import Seo from '../../components/seo/Seo';
import Adsense from "../../components/ads/Adsense";

export const CategoriesIndex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filtered = CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
        <Seo 
          title="All Service Categories" 
          description="Browse over 25+ home service categories including AC repair, cleaning, plumbing, beauty, and more." 
        />

        {/* Header */}
        <div className="bg-indigo-600 pt-20 pb-28">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Expert Help for Every Task</h1>
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search categories (e.g. AC, Cleaning...)" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-none outline-none shadow-2xl text-gray-900 font-medium h-14"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 -mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map((cat, index) => (
                    <React.Fragment key={cat.id}>
                        {/* STRATEGIC AD PLACEMENT 2: In-grid break */}
                        {index === 4 && (
                            <div className="sm:col-span-2 lg:col-span-4">
                                <Adsense slot="2222222222" format="horizontal" />
                            </div>
                        )}
                        
                        <div 
                            onClick={() => navigate(`/services/${cat.slug}`)}
                            className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-5 h-5 text-indigo-600" />
                            </div>
                            
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                            
                            <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{cat.name}</h2>
                            <p className="text-sm text-gray-500 leading-relaxed flex-1">{cat.description}</p>
                            
                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                Explore Services
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No categories found matching "{searchTerm}"</p>
                </div>
            )}
        </div>

        {/* STRATEGIC AD PLACEMENT 3: Near Footer */}
        <div className="max-w-4xl mx-auto px-4">
            <Adsense slot="3333333333" />
        </div>

        {/* SEO Content Block */}
        <div className="max-w-4xl mx-auto px-4 mt-20 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">India's Largest Service Marketplace</h3>
            <p className="text-gray-600 leading-relaxed">
                From fixing a leaky tap to getting a full home deep clean, BookYourService is your one-stop solution. 
                We bring together thousands of verified professionals across 25+ categories to ensure your home maintenance 
                is stress-free and reliable. All our services come with upfront pricing and a quality guarantee.
            </p>
        </div>
    </div>
  );
};