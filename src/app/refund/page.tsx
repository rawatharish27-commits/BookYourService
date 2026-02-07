import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Clock, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy - BookYourService',
  description: 'Complete refund policy for BookYourService - refund timeline, cancellation policy, and refund process',
};

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm font-medium">Last Updated: February 2025</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
        <p className="text-xl text-muted-foreground">
          Clear, transparent, and customer-friendly refund policy
        </p>
      </div>

      {/* Key Highlights */}
      <Card className="mb-8 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Refund Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">100% Refund Guarantee</p>
              <p className="text-sm text-muted-foreground">
                Full refund if cancelled 24+ hours before scheduled time
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Quick Processing</p>
              <p className="text-sm text-muted-foreground">
                Refunds processed within 5-7 business days
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">No Questions Asked</p>
              <p className="text-sm text-muted-foreground">
                Provider no-show or service not delivered = 100% refund + compensation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Timeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cancellation Timeline & Refund Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Before 24 hours */}
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Before 24 hours</span>
                </div>
                <Badge className="bg-green-600 hover:bg-green-700">100% Refund</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Cancel anytime up to 24 hours before scheduled service time for a full refund
              </p>
            </div>

            {/* 4-24 hours */}
            <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold">4-24 hours before</span>
                </div>
                <Badge className="bg-yellow-600 hover:bg-yellow-700">75% Refund</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Cancel between 4-24 hours before scheduled time for a 75% refund (25% administrative fee)
              </p>
            </div>

            {/* Within 4 hours */}
            <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold">Within 4 hours</span>
                </div>
                <Badge className="bg-red-600 hover:bg-red-700">No Refund</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Cancellations within 4 hours of scheduled time are not eligible for refund
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Cases */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Special Refund Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Provider No-Show
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              If the provider doesn't arrive within 30 minutes of scheduled time
            </p>
            <Badge className="bg-green-600">100% Refund + ₹50 Compensation</Badge>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Provider Cancels
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              If provider cancels the booking (for any reason)
            </p>
            <Badge className="bg-green-600">100% Refund + ₹25 Compensation</Badge>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              Poor Service Quality
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              If service doesn't meet quality standards (with valid proof)
            </p>
            <Badge className="bg-yellow-600">Partial Refund (50-100%)</Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Medical Emergency
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Medical emergencies with valid documentation
            </p>
            <Badge className="bg-green-600">100% Refund (Any Time)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Refund Process */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How to Request a Refund</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  1
                </div>
              </div>
              <div className="pb-4">
                <h4 className="font-semibold">Go to My Bookings</h4>
                <p className="text-sm text-muted-foreground">
                  Navigate to your dashboard and find the booking you want to cancel
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
              </div>
              <div className="pb-4">
                <h4 className="font-semibold">Click Cancel/Refund</h4>
                <p className="text-sm text-muted-foreground">
                  Select the cancellation option and provide reason (optional)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  3
                </div>
              </div>
              <div className="pb-4">
                <h4 className="font-semibold">Confirm Cancellation</h4>
                <p className="text-sm text-muted-foreground">
                  Review refund amount and confirm cancellation
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-semibold">Receive Refund</h4>
                <p className="text-sm text-muted-foreground">
                  Refund initiated to original payment method or wallet (5-7 business days)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refund Timeline */}
      <Card className="mb-8 bg-primary/5">
        <CardHeader>
          <CardTitle>Refund Processing Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">0-24 Hours</p>
              <p className="text-sm text-muted-foreground">Refund initiated</p>
            </div>
            <div className="text-center p-4 border-l border-r">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">3-5 Days</p>
              <p className="text-sm text-muted-foreground">Bank processing</p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">5-7 Days</p>
              <p className="text-sm text-muted-foreground">Amount credited</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Refund Option */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Instant Wallet Refund</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <DollarSign className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium mb-2">Get Instant Refund to Your BookYourService Wallet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Choose to receive your refund instantly in your BookYourService wallet instead of waiting 
                5-7 days. Wallet balance can be used for future bookings or withdrawn to your bank account.
              </p>
              <div className="flex gap-2">
                <Badge className="bg-green-600">Instant Credit</Badge>
                <Badge className="bg-blue-600">No Processing Fee</Badge>
                <Badge className="bg-purple-600">Use for Future Bookings</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact for Disputes */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help with a Refund?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you're facing any issues with your refund or have questions about our policy, 
            our support team is here to help you 24/7.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/contact">
              <Button>
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dispute-handling">
              <Button variant="outline">
                File a Dispute
              </Button>
            </Link>
            <Link href="/live-chat">
              <Button variant="outline">
                Start Live Chat
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
