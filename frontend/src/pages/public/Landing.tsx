import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// ============================================
// ADVANCED LANDING PAGE
// ============================================
// Purpose: Modern, high-conversion landing page
// Stack: React + Framer Motion + Tailwind CSS
// Type: Production-Grade (Advanced UI)

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* ============================================
           NAVIGATION
           ============================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">B</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                BookYourService
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/services" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                Services
              </Link>
              <Link to="/providers" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                Providers
              </Link>
              <Link to="/about" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                About
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-slate-700 font-medium hover:text-blue-600 transition-colors"
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================
           HERO SECTION
           ============================================ */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6">
                Find Trusted
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {' '}Professional Services
                </span>
                <br />
                Near You
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Book verified professionals for home services, maintenance, and repairs.
                <br />
                <span className="font-semibold text-blue-600">100% satisfaction guaranteed.</span>
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                >
                  🚀 Book a Service
                </motion.button>
              </Link>
              <Link to="/register?role=provider">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold text-lg border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all"
                >
                  ⭐ Become a Provider
                </motion.button>
              </Link>
            </motion.div>

            {/* Email Signup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-md mx-auto"
            >
              <div className="flex items-center gap-3 bg-white rounded-2xl shadow-lg p-2 border border-slate-200">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Get Started Free
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
           SERVICES GRID
           ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
              Popular Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🏠', name: 'Home Cleaning', desc: 'Professional cleaning for your home' },
                { icon: '🔧', name: 'Plumbing', desc: 'Expert plumbing repairs and maintenance' },
                { icon: '⚡', name: 'Electrician', desc: 'Licensed electrical services' },
                { icon: '🔨', name: 'Painting', desc: 'Interior and exterior painting' },
                { icon: '🪵', name: 'AC Repair', desc: 'Air conditioning maintenance' },
                { icon: '🛠️', name: 'Carpentry', desc: 'Custom woodwork and repairs' },
                { icon: '🚿', name: 'Pest Control', desc: 'Safe and effective pest removal' },
                { icon: '🌿', name: 'Gardening', desc: 'Landscape and garden maintenance' },
              ].map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border-2 border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer"
                >
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                  <p className="text-slate-600">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
           HOW IT WORKS
           ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Search', desc: 'Find the service you need', icon: '🔍' },
                { step: '2', title: 'Compare', desc: 'Compare providers and prices', icon: '📊' },
                { step: '3', title: 'Book', desc: 'Schedule your appointment', icon: '📅' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="text-center"
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 rounded-full w-8 h-8 flex items-center justify-center font-bold border-4 border-white">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-lg text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
           STATS SECTION
           ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '10K+', label: 'Verified Providers', icon: '✅' },
              { value: '50K+', label: 'Happy Customers', icon: '⭐' },
              { value: '100K+', label: 'Bookings Made', icon: '📅' },
              { value: '4.9★', label: 'Average Rating', icon: '💎' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl mb-2">{stat.icon}</div>
                <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-lg text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================
           FOOTER
           ============================================ */}
      <footer className="bg-slate-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">BookYourService</h4>
              <p className="text-slate-400 mb-4">Your trusted platform for finding and booking professional services.</p>
              <div className="text-2xl space-x-2">⚡ 🔧 🛠️</div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Services</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/services" className="hover:text-white transition-colors">All Services</Link></li>
                <li><Link to="/providers" className="hover:text-white transition-colors">Find Providers</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© 2025 BookYourService. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
