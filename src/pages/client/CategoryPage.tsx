import React from 'react';
import { SUBCATEGORIES } from '../../data/subCategories';
import { CATEGORIES } from '../../data/categories';
import { getServiceImage, getCategoryBanner } from '../../utils/imageAssets';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Star, AlertCircle, Users, DollarSign } from 'lucide-react';
import Seo from '../../components/seo/Seo';
import Breadcrumbs from '../../components/navigation/Breadcrumbs';
import { getBreadcrumbSchema } from '../../utils/seoSchema';

export const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();

  const category = CATEGORIES.find(c => c.slug === categorySlug);
  const subCategories = SUBCATEGORIES.filter(s => s.catSlug === categorySlug);

  if (!category) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Category Not Found</h1>
              <p className="text-gray-500 mt-2 mb-6">The category you are looking for does not exist or has been moved.</p>
              <button onClick={() => navigate('/categories')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">
                  Browse All Categories
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 pt-8 px-4">
        <Seo 
          title={category.seoTitle || `${category.name} Services`} 
          description={category.seoDescription || category.description} 
          canonical={`/services/${category.slug}`}
          schema={getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Categories", url: "/categories" },
            { name: category.name, url: `/services/${category.slug}` }
          ])}
        />

        <Breadcrumbs
          items={[
            { label: "Categories", path: "/categories" },
            { label: category.name },
          ]}
        />

        {/* 1. Category Banner */}
        <div className="bg-gray-900 rounded-3xl p-8 md:p-12 mb-10 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 z-0">
                <img 
                    src={getCategoryBanner(categorySlug || '')} 
                    alt={category.name} 
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent"></div>
            </div>

            <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{category.name} Services</h1>
                <p className="text-gray-300 text-lg max-w-xl">
                    {category.description || `Expert ${category.name.toLowerCase()}s for installation, repair, and maintenance. Verified professionals at your doorstep.`}
                </p>
                <div className="flex items-center gap-4 mt-6">
                    <span className="flex items-center bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/10">
                        <Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" /> 4.8 Rating
                    </span>
                    <span className="flex items-center bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/10">
                        <Users className="w-4 h-4 text-green-400 mr-1" /> 15k+ Bookings
                    </span>
                </div>
            </div>
        </div>

        {/* 2. Sub-Category List */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Available Services
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{subCategories.length}</span>
        </h2>
        
        {subCategories.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">No specific services found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    We are currently onboarding specialized professionals for {category.name} in your area. Please check back later.
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subCategories.map((sub) => (
                    <div 
                        key={sub.id}
                        onClick={() => navigate(`/services/${categorySlug}/${sub.slug}`)}
                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 cursor-pointer transition-all relative overflow-hidden"
                    >
                        <div className="h-40 overflow-hidden relative bg-gray-100">
                            <img 
                                src={getServiceImage(sub.slug || '', categorySlug)} 
                                alt={sub.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                            <div className="absolute bottom-3 left-4 text-white">
                                <h3 className="text-lg font-bold leading-tight">{sub.name}</h3>
                            </div>
                        </div>
                        
                        <div className="p-5">
                            <div className="space-y-2">
                                <p className="flex items-center text-sm font-medium text-gray-700">
                                    <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                                    Starting from ₹{sub.startingPrice}
                                </p>
                                <p className="flex items-center text-sm text-gray-500">
                                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                                    Verified experts available
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Book Now</span>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};