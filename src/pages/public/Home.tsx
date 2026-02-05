import React from 'react';
import { Link } from "react-router-dom";
import Seo from "../../components/seo/Seo";
import Adsense from "../../components/ads/Adsense";

export const Home: React.FC = () => {
  return (
    <div className="bg-white">
      <Seo
        title="Book Your Service – Trusted Local Service Marketplace"
        description="Book verified local service providers for home, business and personal services. Simple booking, transparent pricing, trusted professionals."
        canonical="/"
      />

      {/* HERO */}
      <section className="px-6 py-20 md:py-32 bg-gray-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1581578731117-104f2a8d46a8?auto=format&fit=crop&w=1200" className="w-full h-full object-cover" alt="Service background" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Book Trusted Services <span className="text-indigo-500 font-black">Near You</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Find verified service professionals, book instantly, and get work done
            with confidence. From AC repair to house cleaning.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/categories"
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all hover:-translate-y-1"
            >
              Explore Services
            </Link>
            <Link
              to="/login?role=PROVIDER"
              className="px-8 py-4 border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all hover:-translate-y-1 backdrop-blur-sm"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

      {/* STRATEGIC AD PLACEMENT 1: Below Hero */}
      <div className="max-w-5xl mx-auto px-4">
        <Adsense slot="1111111111" />
      </div>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500">Getting help has never been this easy.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-6">1</div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Choose a Service</h3>
            <p className="text-gray-600">
              Browse categories and select the specific service you need from our catalog.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-6">2</div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Book Instantly</h3>
            <p className="text-gray-600">
              Pick a convenient time slot, provide your address, and confirm your booking.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-6">3</div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Get It Done</h3>
            <p className="text-gray-600">
              A verified professional arrives at your doorstep and completes the job.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="px-6 py-24 bg-indigo-900 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-6">
            Why Choose BookYourService?
          </h2>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-10 opacity-90 leading-relaxed">
            We prioritize quality and safety above all else. Every professional goes through 
            background checks, and every booking is protected by our service warranty.
          </p>
          <div className="flex flex-wrap justify-center gap-10">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black mb-1">10k+</span>
              <span className="text-xs uppercase font-bold tracking-widest opacity-60">Happy Clients</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black mb-1">500+</span>
              <span className="text-xs uppercase font-bold tracking-widest opacity-60">Verified Pros</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black mb-1">4.8/5</span>
              <span className="text-xs uppercase font-bold tracking-widest opacity-60">Avg Rating</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}