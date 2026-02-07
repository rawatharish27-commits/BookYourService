import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp, Calendar, Percent, Wallet, Info, CheckCircle, ArrowRight, Calculator, Award } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Service Provider Charges - BookYourService',
  description: 'Complete pricing guide for service providers on BookYourService - fees, commissions, and earnings',
};

export default function ProviderChargesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-600/10 text-green-600 px-4 py-2 rounded-full mb-4">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">Transparent Earnings for Providers</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Service Provider Charges</h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to know about fees and earnings
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-4">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">₹50</div>
          <p className="text-xs text-muted-foreground">One-time Registration</p>
        </Card>
        <Card className="text-center p-4">
          <Percent className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">5-10%</div>
          <p className="text-xs text-muted-foreground">Platform Commission</p>
        </Card>
        <Card className="text-center p-4">
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">Weekly</div>
          <p className="text-xs text-muted-foreground">Payout Cycle</p>
        </Card>
        <Card className="text-center p-4">
          <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">90-95%</div>
          <p className="text-xs text-muted-foreground">You Keep</p>
        </Card>
      </div>

      {/* Registration Fee */}
      <Card className="mb-8 border-green-600/30 bg-green-50/50 dark:bg-green-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            One-Time Registration Fee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-4xl font-bold mb-2">₹50</p>
              <p className="text-muted-foreground mb-4">
                One-time fee to join BookYourService as a verified service provider
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-green-600">Lifetime Valid</Badge>
                <Badge className="bg-blue-600">No Renewal</Badge>
                <Badge className="bg-purple-600">Instant Verification</Badge>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-3">What's Included:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Background verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Identity verification (Aadhaar/PAN)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Skill assessment & training</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Profile creation on platform</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Access to customer base</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Commission */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Platform Commission Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            We charge a transparent commission on each completed booking. The commission is 
            automatically deducted from the total amount before payout.
          </p>

          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Standard Services</h4>
                <Badge className="bg-green-600">5% Commission</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Home cleaning, plumbing, electrical, carpentry, painting, pest control
              </p>
              <div className="text-xs text-muted-foreground">
                Example: ₹500 service → ₹25 commission → You receive ₹475
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Specialized Services</h4>
                <Badge className="bg-blue-600">7.5% Commission</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                AC repair, appliance repair, beauty services, salon, spa, fitness training
              </p>
              <div className="text-xs text-muted-foreground">
                Example: ₹1000 service → ₹75 commission → You receive ₹925
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Professional Services</h4>
                <Badge className="bg-purple-600">10% Commission</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Photography, videography, event planning, tutoring, consulting, web design
              </p>
              <div className="text-xs text-muted-foreground">
                Example: ₹5000 service → ₹500 commission → You receive ₹4500
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Payout Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Payout Cycle</h4>
                <p className="text-2xl font-bold mb-1">Weekly</p>
                <p className="text-sm text-muted-foreground">
                  Every Thursday for services completed before Sunday midnight
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Minimum Payout</h4>
                <p className="text-2xl font-bold mb-1">₹500</p>
                <p className="text-sm text-muted-foreground">
                  Earnings below threshold accumulate until reached
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Processing Time</h4>
                <p className="text-2xl font-bold mb-1">1-2 Days</p>
                <p className="text-sm text-muted-foreground">
                  After weekly payout is initiated
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Payout Methods</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Direct Bank Transfer (NEFT/IMPS)</li>
                  <li>• UPI (Instant)</li>
                  <li>• Provider Wallet (Instant)</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Tax & Deductions</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• TDS (1% if PAN provided, 20% if not)</li>
                  <li>• GST (applicable as per government rules)</li>
                  <li>• Platform commission (as per category)</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/10">
                <h4 className="font-semibold mb-2">Instant Wallet Option</h4>
                <p className="text-sm text-muted-foreground">
                  Withdraw to provider wallet instantly and use for purchases or 
                  withdraw to bank later
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earning Calculator */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Estimate Your Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="border rounded-lg p-4 bg-white dark:bg-background">
              <h4 className="font-semibold mb-2">Part-Time Provider</h4>
              <p className="text-3xl font-bold mb-1">₹15K - ₹25K</p>
              <p className="text-xs text-muted-foreground">
                Per month (3-4 bookings/day)
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-white dark:bg-background">
              <h4 className="font-semibold mb-2">Full-Time Provider</h4>
              <p className="text-3xl font-bold mb-1">₹30K - ₹50K</p>
              <p className="text-xs text-muted-foreground">
                Per month (6-8 bookings/day)
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-white dark:bg-background">
              <h4 className="font-semibold mb-2">Top Provider</h4>
              <p className="text-3xl font-bold mb-1">₹50K+</p>
              <p className="text-xs text-muted-foreground">
                Per month (8+ bookings/day)
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            * Earnings vary by service category, location, and individual performance
          </p>
        </CardContent>
      </Card>

      {/* Additional Fees */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Additional Fees (If Applicable)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 border-b pb-4">
              <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Cancellation Fee</h4>
                <p className="text-sm text-muted-foreground">
                  ₹50 penalty for cancellations within 4 hours of booking time. 
                  No fee for cancellations 4+ hours in advance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b pb-4">
              <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">No-Show Penalty</h4>
                <p className="text-sm text-muted-foreground">
                  ₹100 penalty for not arriving at customer location without notice. 
                  Repeat no-shows may result in account suspension.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Bank Transfer Fees</h4>
                <p className="text-sm text-muted-foreground">
                  No fees for NEFT/IMPS. UPI transfers are free. 
                  Wallet withdrawals are always free.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits & Perks */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Provider Benefits & Perks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Financial Benefits</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Weekly guaranteed payouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Instant wallet withdrawals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Low 5-10% commission</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>No hidden charges</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Tips and bonuses from customers</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Platform Benefits</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Access to 500K+ customers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Flexible working hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Free training and skill development</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Insurance coverage options</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Ratings and reviews system</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join 10,000+ providers earning ₹15K - ₹50K+ monthly
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/become-provider">
              <Button size="lg" variant="secondary">
                Register Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/platform-fees">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/20">
                View Platform Fees
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
