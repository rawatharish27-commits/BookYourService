/**
 * Provider Card Component - Display provider info
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

interface ProviderCardProps {
  id: string;
  name: string;
  service: string;
  rating: number;
  reviews: number;
  experience: string;
  price: string;
  available: boolean;
  image?: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  id, name, service, rating, reviews, experience, price, available, image
}) => {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-[#0A2540] rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black italic group-hover:scale-110 transition-transform">
          {image ? <img src={image} alt={name} className="w-full h-full object-cover rounded-[1.5rem]" /> : name[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-[#0A2540] text-lg">{name}</h3>
              <p className="text-sm text-slate-400">{service}</p>
            </div>
            <Badge variant={available ? 'success' : 'default'}>{available ? 'Available' : 'Busy'}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 text-yellow-500">⭐ {rating}</span>
            <span className="text-slate-400">({reviews} reviews)</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">{experience}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        <span className="text-xl font-black text-emerald-600">{price}</span>
        <Link
          to={`/provider/${id}`}
          className="px-6 py-2 bg-[#0A2540] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#0A2540]/90 transition-all"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default ProviderCard;

