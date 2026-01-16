import React from 'react';
import { motion } from 'framer-motion';

// ============================================
// ADVANCED ABOUT PAGE
// ============================================
// Purpose: Modern, polished about page with glassmorphism
// Stack: React + Framer Motion + Tailwind CSS
// Type: Production-Grade (Advanced UI)

const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'Raj Kumar',
      role: 'CEO & Founder',
      image: '👨‍💼',
      description: '10+ years experience in building scalable platforms'
    },
    {
      name: 'Priya Sharma',
      role: 'CTO',
      image: '👩‍💼',
      description: 'Expert in distributed systems and cloud architecture'
    },
    {
      name: 'Amit Singh',
      role: 'Head of Product',
      image: '👨',
      description: 'Building amazing user experiences since 2015'
    },
    {
      name: 'Neha Gupta',
      role: 'Head of Engineering',
      image: '👩‍💻',
      description: 'Full-stack development and DevOps automation'
    },
  ];

  const values = [
    { icon: '💎', title: 'Quality First', desc: 'We deliver excellence in every interaction' },
    { icon: '🔒', title: 'Trust & Security', desc: 'Your data and transactions are protected' },
    { icon: '⚡', title: 'Innovation', desc: 'Constantly improving and evolving' },
    { icon: '🤝', title: 'Customer Focus', desc: 'Your satisfaction is our top priority' },
    { icon: '🌍', title: 'Inclusivity', desc: 'Equal opportunities for all' },
  ];

  const stats = [
    { value: '50K+', label: 'Happy Customers', icon: '⭐' },
    { value: '10K+', label: 'Service Providers', icon: '👨‍🔧' },
    { value: '100K+', label: 'Bookings Completed', icon: '✅' },
    { value: '4.9★', label: 'Average Rating', icon: '💎' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* ============================================
           NAVIGATION
           ============================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">B</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                BookYourService
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Home</a>
              <a href="/services" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Services</a>
              <a href="/about" className="text-blue-600 font-semibold">About</a>
              <a href="/contact" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Contact</a>
            </div>

            {/* CTA Button */}
            <a
              href="/register"
              className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ============================================
           HERO SECTION
           ============================================ */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">
                BookYourService
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              We're on a mission to connect people with trusted service professionals.
              <br />
              <span className="font-semibold text-blue-600">Simple, Fast, Reliable.</span>
            </p>
          </motion.div>

          {/* ============================================
               MISSION & VISION CARDS
               ============================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <span className="text-4xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To connect millions of people with trusted, verified professionals for home services,
                making it easy, affordable, and safe to get quality service.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <span className="text-4xl">🔮</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Vision</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To become the world's most trusted platform for home services, where every interaction
                creates lasting value and builds trust.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
           STATS SECTION
           ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
              Trusted by Thousands
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer"
                >
                  <div className="text-4xl mb-4">{stat.icon}</div>
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-base text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
           VALUES SECTION
           ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
              What Drives Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: -5, transition: { duration: 0.2 } }}
                  className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <span className="text-4xl">{value.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-lg text-slate-600">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
           TEAM SECTION
           ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
              Meet Our Team
            </h2>
            <p className="text-xl text-slate-600 text-center mb-12 max-w-2xl mx-auto">
              A passionate team of experts dedicated to building the best service platform
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 shadow-lg border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl shadow-lg">
                    {member.image}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-lg font-semibold text-blue-600 mb-2">{member.role}</p>
                  <p className="text-base text-slate-600">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
           CONTACT SECTION
           ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-black text-white mb-6">
              Get In Touch
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Have questions? We'd love to hear from you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                href="mailto:info@bookyourservice.com"
                className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/30 hover:bg-white/30 transition-all"
              >
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
                <p className="text-blue-100">info@bookyourservice.com</p>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                href="tel:+919876543210"
                className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/30 hover:bg-white/30 transition-all"
              >
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-white mb-2">Call Us</h3>
                <p className="text-blue-100">+91 98765 43210</p>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                href="/contact"
                className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/30 hover:bg-white/30 transition-all"
              >
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-white mb-2">Contact Form</h3>
                <p className="text-blue-100">Send us a message</p>
              </motion.a>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/register'}
              className="px-12 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/30 transition-all"
            >
              Join Our Team 🚀
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ============================================
           FOOTER
           ============================================ */}
      <footer className="bg-slate-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4">BookYourService</h4>
              <p className="text-slate-400 mb-4">
                Your trusted platform for finding and booking professional services.
              </p>
              <div className="text-2xl space-x-2">⚡ 🔧 🛠️</div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/support" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Social</h4>
              <div className="flex space-x-4 text-2xl">
                <a href="#" className="hover:scale-110 transition-transform">📘</a>
                <a href="#" className="hover:scale-110 transition-transform">🐦</a>
                <a href="#" className="hover:scale-110 transition-transform">📸</a>
                <a href="#" className="hover:scale-110 transition-transform">💬</a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© 2025 BookYourService. All rights reserved.</p>
            <p className="text-sm mt-2">Built with ❤️ for our users</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
