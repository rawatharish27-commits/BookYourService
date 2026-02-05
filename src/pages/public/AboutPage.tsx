
import React from 'react';
import { ShieldCheck, Users, Globe } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
        <div className="bg-gray-900 text-white py-24">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-5xl font-extrabold mb-6">About Us</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    We are on a mission to organize the world's service industry, bringing trust, transparency, and technology to your doorstep.
                </p>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <ShieldCheck className="w-12 h-12 text-indigo-600 mb-6" />
                    <h3 className="text-xl font-bold mb-3">Trust & Safety</h3>
                    <p className="text-gray-600">Every booking is insured, and every provider is vetted.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <Users className="w-12 h-12 text-indigo-600 mb-6" />
                    <h3 className="text-xl font-bold mb-3">Empowering Pros</h3>
                    <p className="text-gray-600">Helping thousands of micro-entrepreneurs grow their business.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <Globe className="w-12 h-12 text-indigo-600 mb-6" />
                    <h3 className="text-xl font-bold mb-3">Global Standard</h3>
                    <p className="text-gray-600">World-class service experience, standardized for you.</p>
                </div>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Founded in 2024, BookYourService started with a simple idea: booking a plumber should be as easy as booking a taxi. 
                We realized that the home services market was fragmented, unreliable, and often unsafe.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
                Today, we operate in 5 major cities, connecting over 10,000 customers with top-rated professionals. 
                Our technology ensures fair pricing, on-time service, and instant dispute resolution.
            </p>
        </div>
    </div>
  );
};
