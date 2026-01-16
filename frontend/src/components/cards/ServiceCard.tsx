/**
 * Service Card Component - Display service category
 */
import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  id: string;
  name: string;
  icon: string;
  description: string;
  providers: number;
  startingPrice: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ id, name, icon, description, providers, startingPrice }) => {
  return (
    <Link
      to={`/services/${id}`}
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all group text-center"
    >
      <div className="w-20 h-20 bg-[#0A2540] rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all">
        {icon}
      </div>
      <h3 className="font-bold text-[#0A2540] text-lg mb-2">{name}</h3>
      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{providers} providers</span>
        <span className="font-bold text-emerald-600">From {startingPrice}</span>
      </div>
    </Link>
  );
};

export default ServiceCard;

