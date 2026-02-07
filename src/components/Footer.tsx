import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Shield,
  FileText,
  HelpCircle,
  Users,
  Wallet,
  Map,
  Star,
  AlertTriangle,
  Scale,
  DollarSign,
  Building2,
  Globe,
  TrendingUp,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">B</span>
              </div>
              <div>
                <span className="font-bold text-xl">BookYourService</span>
                <p className="text-xs text-muted-foreground">Global #1 Service Marketplace</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect with 100,000+ verified professionals across 2000+ cities globally. Quality services, instant booking, and secure payments - all in one platform.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">4.9/5 from 50K+ reviews</span>
            </div>
          </div>

          {/* About Company */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Company
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/company-profile" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Company Profile
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Press & Media
                </Link>
              </li>
            </ul>
          </div>

          {/* For Customers */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Users className="w-4 h-4 mr-2" />
              For Customers
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-primary transition-colors flex items-center">
                  <Wallet className="w-3 h-3 mr-1" />
                  Wallet
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/live-status" className="hover:text-primary transition-colors flex items-center">
                  <Map className="w-3 h-3 mr-1" />
                  Live Status
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-primary transition-colors flex items-center">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Help & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Star className="w-4 h-4 mr-2" />
              For Providers
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/become-provider" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/provider-guide" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Provider Guide
                </Link>
              </li>
              <li>
                <Link href="/provider-wallet" className="hover:text-primary transition-colors flex items-center">
                  <Wallet className="w-3 h-3 mr-1" />
                  Provider Wallet
                </Link>
              </li>
              <li>
                <Link href="/platform-fees" className="hover:text-primary transition-colors flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Platform Fees
                </Link>
              </li>
              <li>
                <Link href="/provider-charges" className="hover:text-primary transition-colors flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Service Charges
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Policies & Legal
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-primary transition-colors flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/dispute-handling" className="hover:text-primary transition-colors flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Dispute Handling
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-primary transition-colors flex items-center">
                  <Scale className="w-3 h-3 mr-1" />
                  Legal Aspects
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-xs">rawatharish27@gmail.com</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">24/7 Global Support</p>
                  <p className="text-xs">+91 8901172507 (WhatsApp Available)</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Global Headquarters</p>
                  <p className="text-xs">123 Business Tower, Tech City, Bangalore, Karnataka - 560001</p>
                  <p className="text-xs text-muted-foreground mt-1">With offices in 15+ countries</p>
                </div>
              </li>
            </ul>

            {/* Live Status Link */}
            <Link
              href="/live-status"
              className="flex items-center text-sm text-primary hover:underline mt-2"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Check Live System Status
            </Link>

            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              <a href="https://facebook.com/bookyourservice" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/bookyourservice" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/bookyourservice" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/bookyourservice" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@bookyourservice" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t">
          <div className="flex items-center space-x-3 text-sm">
            <Shield className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium">100% Secure</p>
              <p className="text-xs text-muted-foreground">Bank-Grade Encryption</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Star className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="font-medium">Verified Providers</p>
              <p className="text-xs text-muted-foreground">100K+ Worldwide</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Map className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium">2000+ Cities</p>
              <p className="text-xs text-muted-foreground">Global Coverage</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Globe className="w-8 h-8 text-purple-600" />
            <div>
              <p className="font-medium">50+ Countries</p>
              <p className="text-xs text-muted-foreground">Worldwide Operations</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm font-medium mb-3">Accepted Payment Methods (Global)</p>
          <div className="flex flex-wrap gap-3 items-center text-xs text-muted-foreground">
            <span className="bg-background px-3 py-2 rounded border">UPI (Global)</span>
            <span className="bg-background px-3 py-2 rounded border">Credit Card</span>
            <span className="bg-background px-3 py-2 rounded border">Debit Card</span>
            <span className="bg-background px-3 py-2 rounded border">Net Banking</span>
            <span className="bg-background px-3 py-2 rounded border">PayPal</span>
            <span className="bg-background px-3 py-2 rounded border">Stripe</span>
            <span className="bg-background px-3 py-2 rounded border">Wallet</span>
            <span className="bg-background px-3 py-2 rounded border">Google Pay</span>
            <span className="bg-background px-3 py-2 rounded border">Apple Pay</span>
            <span className="bg-background px-3 py-2 rounded border">Cash on Service</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="text-center md:text-left space-y-1">
            <p>&copy; {new Date().getFullYear()} BookYourService Global. All rights reserved.</p>
            <p className="text-xs">Made with ❤️ in India | Available in 50+ Countries | GSTIN: 29AAAAA0000A1Z5</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0">
            <Link href="/sitemap" className="hover:text-primary transition-colors">
              Sitemap
            </Link>
            <Link href="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href="/grievance" className="hover:text-primary transition-colors">
              Grievance Redressal
            </Link>
            <Link href="/accessibility" className="hover:text-primary transition-colors">
              Accessibility
            </Link>
            <Link href="/cookie-policy" className="hover:text-primary transition-colors">
              Cookie Policy
            </Link>
            <Link href="/passive-income" className="hover:text-primary transition-colors">
              Passive Income
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
