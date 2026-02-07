import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Shield, Users, Clock, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - BookYourService',
  description: 'Learn about BookYourService - your trusted platform for finding and booking professional services',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About BookYourService</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your trusted platform for finding and booking professional services
        </p>
      </div>

      {/* Our Story */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Our Story
          </h2>
          <div className="prose max-w-3xl mx-auto space-y-4">
            <p>
              BookYourService was founded with a simple mission: to connect people who need services 
              with trusted professionals who can provide them. We believe that everyone deserves access 
              to quality services, delivered by skilled and verified providers.
            </p>
            <p>
              What started as a small idea has grown into a comprehensive platform serving thousands 
              of customers across India. We've partnered with the best service providers in each category, 
              from home maintenance to beauty and wellness, from plumbing to personal training.
            </p>
            <p>
              Our platform isn't just about booking services—it's about building trust. Every provider 
              on our platform is verified, every booking is secured, and every customer experience 
              is our priority. We've implemented industry-leading safety measures, transparent pricing, 
              and a support system that's there when you need us.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Our Values */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold">Trust & Safety</h3>
              <p className="text-sm text-muted-foreground">
                Verified providers, secure payments
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold">Customer First</h3>
              <p className="text-sm text-muted-foreground">
                Your satisfaction is our priority
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold">Reliability</h3>
              <p className="text-sm text-muted-foreground">
                On-time service, always
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold">Quality</h3>
              <p className="text-sm text-muted-foreground">
                Verified professionals only
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why Choose Us */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6">Why Choose BookYourService?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Verified Professionals</h3>
                <p className="text-muted-foreground">
                  Every provider undergoes a thorough verification process, including identity 
                  verification, skill assessment, and background checks.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Transparent Pricing</h3>
                <p className="text-muted-foreground">
                  See the total cost upfront, including our platform fee. No hidden charges.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure Payments</h3>
                <p className="text-muted-foreground">
                  Multiple payment options with bank-grade security. Your financial data is protected.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Need help? Our support team is available round the clock via chat, email, and phone.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of satisfied customers who trust BookYourService for their service needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" variant="secondary">
                Browse Services
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
