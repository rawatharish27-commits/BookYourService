import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Globe, Award, Target, Shield, Zap, MapPin, TrendingUp, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Company Profile - BookYourService',
  description: 'Learn about BookYourService company profile, mission, vision, achievements, and business operations',
};

export default function CompanyProfilePage() {
  const milestones = [
    { year: '2020', title: 'Founded', description: 'BookYourService launched in Bangalore' },
    { year: '2021', title: '10 Cities', description: 'Expanded operations to 10 major cities' },
    { year: '2022', title: '100K Users', description: 'Crossed 100,000 registered customers' },
    { year: '2023', title: '500 Cities', description: 'Pan India presence in 500+ cities' },
    { year: '2024', title: '1M Bookings', description: 'Achieved 1 million successful bookings' },
    { year: '2025', title: 'Market Leader', description: "India's #1 service marketplace" },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Building2 className="w-4 h-4" />
          <span className="text-sm font-medium">Established 2020 | GSTIN: 29AAAAA0000A1Z5</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Company Profile</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          India's most trusted platform for booking professional services
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-6">
          <Users className="w-10 h-10 text-primary mx-auto mb-2" />
          <div className="text-3xl font-bold">500K+</div>
          <p className="text-sm text-muted-foreground">Happy Customers</p>
        </Card>
        <Card className="text-center p-6">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
          <div className="text-3xl font-bold">500+</div>
          <p className="text-sm text-muted-foreground">Cities Covered</p>
        </Card>
        <Card className="text-center p-6">
          <Award className="w-10 h-10 text-primary mx-auto mb-2" />
          <div className="text-3xl font-bold">10K+</div>
          <p className="text-sm text-muted-foreground">Verified Providers</p>
        </Card>
        <Card className="text-center p-6">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
          <div className="text-3xl font-bold">1M+</div>
          <p className="text-sm text-muted-foreground">Bookings Completed</p>
        </Card>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              To revolutionize how Indians access home and professional services by creating a 
              trusted, transparent, and convenient marketplace that connects customers with verified, 
              skilled professionals at fair prices.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              To become India's most loved and trusted service marketplace, setting new standards 
              for quality, safety, and customer satisfaction while empowering millions of service 
              professionals with sustainable livelihood opportunities.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Core Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold">Trust First</h3>
              <p className="text-sm text-muted-foreground">
                Every provider verified, every booking secured
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold">Customer Obsessed</h3>
              <p className="text-sm text-muted-foreground">
                Your satisfaction is our only KPI
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold">Continuous Innovation</h3>
              <p className="text-sm text-muted-foreground">
                Always improving, never settling
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold">Excellence</h3>
              <p className="text-sm text-muted-foreground">
                Quality in everything we do
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What We Offer */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What We Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                For Customers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 500+ services across 32 categories</li>
                <li>• Verified and background-checked providers</li>
                <li>• Transparent pricing with no hidden charges</li>
                <li>• Instant booking and confirmation</li>
                <li>• Real-time provider tracking</li>
                <li>• Secure multiple payment options</li>
                <li>• 24/7 customer support</li>
                <li>• Satisfaction guarantee & easy refunds</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                For Providers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Low ₹50 registration fee</li>
                <li>• Flexible working hours</li>
                <li>• Direct customer access</li>
                <li>• Timely payments (weekly payout)</li>
                <li>• Provider wallet for quick withdrawals</li>
                <li>• Training and skill development</li>
                <li>• Rating and review system</li>
                <li>• Insurance coverage options</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Platform Features
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• AI-powered provider matching</li>
                <li>• Location-based service discovery</li>
                <li>• Smart scheduling & slot management</li>
                <li>• In-app chat & support</li>
                <li>• Digital invoices & receipts</li>
                <li>• Review and rating system</li>
                <li>• Dispute resolution mechanism</li>
                <li>• Wallet & loyalty rewards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey & Milestones */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform md:-translate-x-1/2" />
            <div className="space-y-6">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="relative pl-10 md:pl-0 md:grid md:grid-cols-2 md:gap-8">
                  <div className={`md:text-right ${idx % 2 === 0 ? '' : 'md:col-start-2'}`}>
                    <div className="absolute left-4 md:left-1/2 top-0 w-3 h-3 bg-primary rounded-full transform md:-translate-x-1/2" />
                    <Badge variant="outline" className="mb-2">{milestone.year}</Badge>
                    <h3 className="font-semibold">{milestone.title}</h3>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leadership */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Leadership Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Led by experienced professionals with decades of combined experience in technology, 
            operations, and customer service.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                RS
              </div>
              <h3 className="font-semibold">Rajesh Sharma</h3>
              <p className="text-sm text-primary">Founder & CEO</p>
              <p className="text-xs text-muted-foreground mt-1">
                15+ years in e-commerce and marketplace
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                PK
              </div>
              <h3 className="font-semibold">Priya Kumar</h3>
              <p className="text-sm text-blue-600">CTO</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ex-Google, 12+ years in tech leadership
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-green-400 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                AV
              </div>
              <h3 className="font-semibold">Amit Verma</h3>
              <p className="text-sm text-green-600">COO</p>
              <p className="text-xs text-muted-foreground mt-1">
                10+ years in operations and logistics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recognition & Awards */}
      <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/10 dark:to-orange-950/10">
        <CardHeader>
          <CardTitle>Recognition & Awards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-background rounded-lg">
              <Award className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Startup of the Year 2024</p>
                <p className="text-xs text-muted-foreground">India Startup Awards</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-background rounded-lg">
              <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Most Trusted Brand 2024</p>
                <p className="text-xs text-muted-foreground">Consumer Trust Index</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-background rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Fastest Growing Startup</p>
                <p className="text-xs text-muted-foreground">Business Today</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-background rounded-lg">
              <Users className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Customer Choice Award</p>
                <p className="text-xs text-muted-foreground">Digital India Awards</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Growing Family</h2>
          <p className="text-lg mb-6 opacity-90">
            Whether you're a customer looking for reliable services or a professional ready to grow your business, 
            BookYourService is the perfect platform for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="secondary" asChild>
              <a href="/services">
                Browse Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/20" asChild>
              <a href="/become-provider">
                Become a Provider
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
