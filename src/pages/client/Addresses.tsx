import React from 'react';
import Seo from "../../components/seo/Seo";
import { MapPin, Plus, Trash2, Home, Briefcase, MapPinned } from 'lucide-react';

export default function Addresses() {
  const mockAddresses = [
    { id: 1, label: 'Home', address: 'Flat 402, Sunset Heights, Silicon Valley, CA 94025', icon: Home },
    { id: 2, label: 'Office', address: 'Floor 12, Googleplex, Mountain View, CA 94043', icon: Briefcase }
  ];

  return (
    <>
      <Seo title="My Addresses" description="Manage your service addresses" />

      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Saved <span className="text-indigo-600">Places</span></h1>
            <button className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                <Plus className="w-4 h-4" /> Add New
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockAddresses.map((addr) => (
                <div key={addr.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:border-indigo-100 transition-all relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <addr.icon className="w-6 h-6" />
                        </div>
                        <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">{addr.label}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{addr.address}</p>
                    
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <MapPin className="w-3 h-3" /> Default Address
                    </div>
                </div>
            ))}

            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-200 transition-all min-h-[220px]">
                <MapPinned className="w-10 h-10 text-gray-300 mb-4" />
                <p className="text-sm font-bold text-gray-400">You can save up to 10 addresses for faster booking checkout.</p>
            </div>
        </div>
      </div>
    </>
  );
}