import React, { useMemo } from 'react';
import Seo from "../../components/seo/Seo";
import { Star, MessageSquare, Filter } from 'lucide-react';
import ReviewBreakdown from "../../components/provider/ReviewBreakdown";

export default function ProviderReviews() {
  const reviews = useMemo(() => [
    { id: 1, rating: 5, comment: "Excellent service, arrived on time and fixed the AC quickly.", user: "Amit K.", date: "Oct 12" },
    { id: 2, rating: 4, comment: "Very professional approach. Recommended.", user: "Sanya G.", date: "Oct 08" },
    { id: 3, rating: 5, comment: "Highly recommended for deep cleaning. No spots left!", user: "Rahul M.", date: "Sep 28" },
  ], []);

  const ratingStats = useMemo(() => [
    { star: 5, count: reviews.filter(r => r.rating === 5).length, total: reviews.length },
    { star: 4, count: reviews.filter(r => r.rating === 4).length, total: reviews.length },
    { star: 3, count: reviews.filter(r => r.rating === 3).length, total: reviews.length },
    { star: 2, count: reviews.filter(r => r.rating === 2).length, total: reviews.length },
    { star: 1, count: reviews.filter(r => r.rating === 1).length, total: reviews.length },
  ], [reviews]);

  const avgRating = useMemo(() => {
    return reviews.length > 0 
      ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length 
      : 0;
  }, [reviews]);

  return (
    <>
      <Seo
        title="My Reviews"
        description="Client reviews and ratings"
        noIndex
      />

      <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-10">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-400 fill-current" />
                Client Feedback
            </h1>
            <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors shadow-sm">
                <Filter className="w-5 h-5" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-fit">
                <div className="text-center mb-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Rating</p>
                    <h2 className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</h2>
                    <div className="flex justify-center text-yellow-400 mt-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-current' : 'text-gray-200'}`} />)}
                    </div>
                    <p className="text-xs text-gray-400 font-bold mt-2">Based on {reviews.length} verified reviews</p>
                </div>
                
                <ReviewBreakdown stats={ratingStats} />
            </div>

            <div className="md:col-span-8 space-y-6">
                {reviews.length === 0 ? (
                <div className="bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 p-20 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold italic">No feedback received yet.</p>
                </div>
                ) : (
                <div className="space-y-4">
                    {reviews.map(r => (
                    <div key={r.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-indigo-100 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center font-black text-indigo-600 border border-gray-100">
                                    {r.user.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{r.user}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{r.date}</p>
                                </div>
                            </div>
                            <div className="flex text-yellow-400">
                                {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed italic">
                        "{r.comment}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Reply to Client</button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
}