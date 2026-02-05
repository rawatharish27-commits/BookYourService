
import React, { useEffect, useState } from 'react';
import { Review } from '../../types';
import { getFlaggedReviews, moderateReview } from '../../services/api';
import { Check, X, AlertTriangle, EyeOff } from 'lucide-react';

export const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
        const data = await getFlaggedReviews();
        setReviews(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleModerate = async (id: string, action: 'HIDE' | 'RESTORE') => {
      try {
          await moderateReview(id, action);
          fetchReviews();
      } catch (e) {
          alert("Failed to moderate");
      }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading flagged reviews...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-red-50 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-800">Flagged Reviews</h3>
        </div>

        {reviews.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No flagged reviews found. Good job!</div>
        ) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map(r => (
                        <tr key={r.id}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.clientName}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{r.comment}</td>
                            <td className="px-6 py-4 text-sm text-yellow-600 font-bold">{r.rating} ★</td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button onClick={() => handleModerate(r.id, 'RESTORE')} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Allow
                                </button>
                                <button onClick={() => handleModerate(r.id, 'HIDE')} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <EyeOff className="w-4 h-4" /> Hide
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
  );
};
