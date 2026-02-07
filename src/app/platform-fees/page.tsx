import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Percent, Wallet, Info, CheckCircle, TrendingUp, Users, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Platform Fees - BookYourService',
  description: 'Platform fee structure for BookYourService - transparent pricing with no hidden charges',
};

export default function PlatformFeesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-600/10 text-green-600 px-4 py-2 rounded-full mb-4">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">100% Transparent Pricing</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Platform Fees</h1>
        <p className="text-xl text-muted-foreground">
          Clear, upfront pricing with no hidden charges
        </p>
      </div>

      {/* Platform Fee Overview */}
      <Card className="mb-8 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            What is Platform Fee?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The platform fee is a small service charge that covers:
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <span><strong>Provider Verification:</strong> Background checks, identity verification, skill assessment</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span><strong>Quality Assurance:</strong> Continuous monitoring, review system, customer support</span>
            </li>
            <li className="flex items-start gap-3">
              <Wallet className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span><strong>Payment Processing:</strong> Secure payment gateway integration, transaction security</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span><strong>Platform Operations:</strong> Technology infrastructure, app maintenance, new features</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Fee Structure */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Platform Fee Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border rounded-lg p-6 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">5% - 10%</h3>
                  <p className="text-sm text-muted-foreground">of service price</p>
                </div>
                <Badge className="text-lg px-4 py-2 bg-primary">Included in Displayed Price</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                The platform fee varies by service category and is already included in the price you see. 
                <strong>What you see is what you pay - no surprises at checkout!</strong>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Standard Services
                </h4>
                <p className="text-3xl font-bold mb-1">5%</p>
                <p className="text-xs text-muted-foreground">
                  Home cleaning, plumbing, electrical, carpentry, etc.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Specialized Services
                </h4>
                <p className="text-3xl font-bold mb-1">7.5%</p>
                <p className="text-xs text-muted-foreground">
                  AC repair, appliance repair, beauty services, etc.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  Professional Services
                </h4>
                <p className="text-3xl font-bold mb-1">10%</p>
                <p className="text-xs text-muted-foreground">
                  Photography, event planning, tutoring, etc.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  No Additional Fees
                </h4>
                <p className="text-3xl font-bold mb-1">₹0</p>
                <p className="text-xs text-muted-foreground">
                  No booking fee, no convenience fee, no hidden charges
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What's Included in Your Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Included (No Extra Cost)
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Service provider's fee</li>
                <li>• Platform fee (5-10%)</li>
                <li>• Payment gateway charges</li>
                <li>• GST (18%)</li>
                <li>• Booking confirmation</li>
                <li>• Customer support (24/7)</li>
                <li>• Dispute resolution</li>
                <li>• Provider verification</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Additional Costs (If Applicable)
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Emergency/express service surcharge</li>
                <li>• Materials cost (if not included)</li>
                <li>• Additional work beyond scope</li>
                <li>• Late-night service fees</li>
                <li>• Travel charges (remote locations)</li>
                <li>• Holiday service fees</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                * These charges are always disclosed before payment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Fee Structure */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            For Service Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-white dark:bg-background">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Registration Fee</h4>
                <Badge className="bg-green-600">One-Time</Badge>
              </div>
              <p className="text-3xl font-bold">₹50</p>
              <p className="text-xs text-muted-foreground mt-1">
                One-time registration fee to join the platform as a service provider
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-white dark:bg-background">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Platform Commission</h4>
                <Badge className="bg-blue-600">Per Booking</Badge>
              </div>
              <p className="text-3xl font-bold">5% - 10%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Commission on each completed booking, deducted from total payout
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-white dark:bg-background">
                <h4 className="font-semibold mb-1">Payout Cycle</h4>
                <p className="text-2xl font-bold">Weekly</p>
                <p className="text-xs text-muted-foreground">
                  Every Thursday for completed services
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-white dark:bg-background">
                <h4 className="font-semibold mb-1">Minimum Payout</h4>
                <p className="text-2xl font-bold">₹500</p>
                <p className="text-xs text-muted-foreground">
                  Amount accumulates until threshold
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Why Our Platform Fee is Worth It</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Verified Providers</h4>
                  <p className="text-sm text-muted-foreground">
                    Every provider undergoes 7-step verification including background check, 
                    identity verification, and skill assessment
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Continuous Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    We invest in technology, features, and user experience to make your 
                    booking experience better every day
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">24/7 Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Round-the-clock customer support via chat, email, and phone to help 
                    you with any issues
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Secure Payments</h4>
                  <p className="text-sm text-muted-foreground">
                    Bank-grade security with 256-bit SSL encryption. Your money is 
                    held in escrow until service completion
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Dispute Resolution</h4>
                  <p className="text-sm text-muted-foreground">
                    Fair and transparent dispute resolution process with quick 
                    turnaround times (48-72 hours)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Wallet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Wallet & Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Instant wallet refunds, loyalty rewards, and cashback on bookings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refund Policy Link */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Info className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Questions About Refunds?</h3>
              <p className="text-sm text-muted-foreground">
                Learn about our transparent refund policy and how cancellations work
              </p>
            </div>
            <Link href="/refund-policy">
              <Button variant="outline">
                View Refund Policy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Contact for Questions */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Have Questions About Fees?</h2>
          <p className="text-lg mb-6 opacity-90">
            Our team is here to help you understand our pricing structure
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/20">
                View FAQ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
