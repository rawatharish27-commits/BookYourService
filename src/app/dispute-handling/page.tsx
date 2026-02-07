import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Scale, FileText, Clock, CheckCircle, XCircle, MessageCircle, ArrowRight, Phone } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dispute Handling - BookYourService',
  description: 'Complete dispute resolution policy for BookYourService - how to file and resolve disputes',
};

export default function DisputeHandlingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Scale className="w-4 h-4" />
          <span className="text-sm font-medium">Fair & Transparent Resolution</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Dispute Handling Policy</h1>
        <p className="text-xl text-muted-foreground">
          How we resolve disputes fairly and efficiently
        </p>
      </div>

      {/* Key Principles */}
      <Card className="mb-8 border-green-600/30 bg-green-50/50 dark:bg-green-950/10">
        <CardContent className="p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Our Dispute Resolution Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium mb-1">Fair & Impartial</p>
              <p className="text-sm text-muted-foreground">
                Every dispute is reviewed objectively based on facts and evidence
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Quick Resolution</p>
              <p className="text-sm text-muted-foreground">
                Most disputes resolved within 48-72 hours
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Customer First</p>
              <p className="text-sm text-muted-foreground">
                Your satisfaction is our top priority
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Can Be Disputed */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What Can Be Disputed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                Common Disputes
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Service not delivered as described</li>
                <li>• Poor quality or incomplete service</li>
                <li>• Provider no-show or late arrival</li>
                <li>• Unprofessional behavior</li>
                <li>• Damaged property during service</li>
                <li>• Overcharging or hidden fees</li>
                <li>• Unauthorized additional charges</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Required Information
              </h3>
              <p className="text-sm text-muted-foreground mb-2">To file a dispute, you'll need:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Booking ID or service details</li>
                <li>• Clear description of the issue</li>
                <li>• Photos/videos (if applicable)</li>
                <li>• Communication logs with provider</li>
                <li>• Any receipts or invoices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dispute Resolution Process */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dispute Resolution Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  1
                </div>
              </div>
              <div className="pb-4 border-b">
                <h4 className="font-semibold text-lg">Direct Communication (First 24 Hours)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Try to resolve the issue directly with the provider through our in-app messaging system. 
                  Most issues can be resolved quickly through open communication.
                </p>
                <Badge className="mt-2 bg-blue-600">Recommended First Step</Badge>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
              </div>
              <div className="pb-4 border-b">
                <h4 className="font-semibold text-lg">File a Dispute (After 24 Hours)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  If the issue isn't resolved, file a formal dispute through your booking history. 
                  Provide all relevant details and supporting evidence.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  File a Dispute
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  3
                </div>
              </div>
              <div className="pb-4 border-b">
                <h4 className="font-semibold text-lg">Investigation (24-48 Hours)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Our dispute resolution team will review your case, contact both parties, examine 
                  evidence, and reach a fair decision based on our policies.
                </p>
                <Badge className="mt-2 bg-yellow-600">Under Review</Badge>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  4
                </div>
              </div>
              <div className="pb-4 border-b">
                <h4 className="font-semibold text-lg">Resolution Decision</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on the investigation, we'll determine the outcome: full/partial refund, 
                  service redo, compensation, or uphold the original transaction.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  5
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Implementation & Closure</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The decision is implemented immediately. Refunds are processed within 5-7 business days. 
                  You can appeal within 7 days if you disagree with the outcome.
                </p>
                <Badge className="mt-2 bg-green-600">Final Resolution</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Possible Outcomes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Possible Dispute Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/10">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Full Refund</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                100% refund to original payment method or wallet. Applies when provider didn't 
                deliver service, no-show, or service was completely unsatisfactory.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold">Partial Refund (50-75%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Refund based on the extent of service delivered. Applies when service was partially 
                completed or quality issues affected a portion of the work.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/10">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Service Redo / Correction</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Provider returns to complete or correct the service at no additional cost. Applicable 
                for fixable issues and minor quality concerns.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold">Compensation Voucher</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Voucher for future services as goodwill gesture. Applies when there were minor issues 
                but not significant enough for a refund.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/10">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold">Dispute Rejected</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Original transaction stands. Applies when evidence shows service was delivered as described 
                or dispute is without merit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="mb-8 bg-primary/5">
        <CardHeader>
          <CardTitle>Dispute Resolution Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">0-24 Hours</p>
              <p className="text-sm text-muted-foreground">Direct communication with provider</p>
            </div>
            <div className="p-4">
              <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">24-72 Hours</p>
              <p className="text-sm text-muted-foreground">Investigation and review</p>
            </div>
            <div className="p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Within 7 Days</p>
              <p className="text-sm text-muted-foreground">Refund processing and closure</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appeal Process */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Appeal Process</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you disagree with the dispute resolution decision, you can appeal within 7 days 
            of receiving the outcome. Appeals must include new evidence or information that 
            wasn't considered in the original review.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm">
              <strong>Important:</strong> Appeals without new evidence will not be considered. 
              The decision of the senior dispute resolution team is final.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Provider Penalties */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Provider Penalties for Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            To maintain service quality, providers who receive frequent disputes may face:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span><strong>Warning:</strong> First dispute in a month results in a warning</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span><strong>Temporary Suspension:</strong> 2-3 disputes in a month leads to 7-day suspension</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span><strong>Permanent Removal:</strong> Repeat offenders or serious violations result in account termination</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="mb-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help with a Dispute?</h2>
          <p className="text-lg mb-6 opacity-90">
            Our dispute resolution team is here to help you 24/7
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/live-chat">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/20">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Live Chat
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/20">
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
          </div>
          <p className="mt-4 text-sm opacity-75">
            Toll-free: +91 1800-123-4567
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
