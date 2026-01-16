/**
 * Customer Reviews Page - View and write reviews
 */
import React from 'react';

const CustomerReviews: React.FC = () => {
  const reviews = [
    { id: 'REV001', provider: 'Rahul Sharma', service: 'Electrical Repair', rating: 5, comment: 'Excellent work! Fixed all issues quickly.', date: 'Dec 25, 2024' },
    { id: 'REV002', provider: 'Amit Kumar', service: 'AC Service', rating: 4, comment: 'Good service, arrived on time.', date: 'Dec 20, 2024' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#0A2540] italic">My Reviews</h1>
      
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0A2540]">{review.provider}</h3>
                <p className="text-sm text-slate-400">{review.service}</p>
              </div>
              <div className="flex gap-1 text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</div>
            </div>
            <p className="text-slate-600">{review.comment}</p>
            <p className="text-xs text-slate-400 mt-4">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerReviews;

