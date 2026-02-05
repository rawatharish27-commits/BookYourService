
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Heart, ShieldCheck, Mail, Phone, MapPin, Globe } from 'lucide-react';

const TOP_CITIES = [
    { name: "Mumbai", slug: "mumbai" },
    { name: "Delhi", slug: "delhi" },
    { name: "Bangalore", slug: "bangalore" },
    { name: "Hyderabad", slug: "hyderabad" },
    { name: "Chennai", slug: "chennai" },
    { name: "Pune", slug: "pune" }
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Local Discovery Grid (SEO Hub) */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16 pb-16 border-b border-gray-800">
            <div className="col-span-2">
                <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" /> Local Hubs
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">Find verified professional services across India's major metropolitan areas.</p>
                <Link to="/cities" className="text-indigo-400 text-xs font-bold hover:underline">View all cities &rarr;</Link>
            </div>
            {TOP_CITIES.map(city => (
                <div key={city.slug}>
                    <h4 className="text-white font-bold text-sm mb-4">{city.name}</h4>
                    <ul className="space-y-2 text-[10px] font-black uppercase tracking-wider text-gray-500">
                        <li><Link to={`/${city.slug}/ac-repair`} className="hover:text-indigo-400 transition-colors">AC Repair</Link></li>
                        <li><Link to={`/${city.slug}/cleaning`} className="hover:text-indigo-400 transition-colors">Cleaning</Link></li>
                        <li><Link to={`/${city.slug}/plumbing`} className="hover:text-indigo-400 transition-colors">Plumbing</Link></li>
                    </ul>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & Description */}
          <div className="col-span-1">
            <h2 className="text-2xl font-extrabold text-white mb-6 tracking-tight">BookYourService</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed font-medium">
              India's leading marketplace connecting homeowners with verified local professionals. 
              Simple booking, transparent pricing, and quality guarantee.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Menu Links */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6 border-b border-gray-700 pb-2 w-fit">Company</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-indigo-400 transition-colors">All Categories</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">Our Story</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Partner Links */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6 border-b border-gray-700 pb-2 w-fit">For Partners</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/login?role=PROVIDER" className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4">Register as Professional</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Partner FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Service Standards</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6 border-b border-gray-700 pb-2 w-fit">Contact</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>Corporate Office,<br/>BKC, Mumbai 400051</span>
              </li>
              <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>+91 1800-419-100</span>
              </li>
              <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>support@bookyourservice.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} BookYourService. Proudly built in India.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-500" /> 256-bit Secure Payments</span>
            <span className="flex items-center gap-1">Made with <Heart className="w-3 h-3 text-red-500 fill-current" /> for Households</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
