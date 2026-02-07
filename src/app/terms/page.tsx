import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, User, Shield, AlertTriangle, Scale, Globe } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - BookYourService',
  description: 'Terms of Service for BookYourService platform - user agreement, service terms, and legal policies',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Last Updated: February 2025</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-xl text-muted-foreground">
          Please read these terms carefully before using BookYourService
        </p>
      </div>

      {/* Agreement Notice */}
      <Card className="mb-8 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Important: Your Agreement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            By accessing or using BookYourService platform (website, mobile app, or any related services), 
            you agree to be bound by these Terms of Service. If you do not agree to these terms, 
            please do not use our platform.
          </p>
        </CardContent>
      </Card>

      {/* Terms Content */}
      <div className="space-y-6">
        {/* 1. Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              By creating an account, browsing services, or making bookings on BookYourService, you acknowledge 
              that you have read, understood, and agree to be bound by these Terms of Service and our 
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. 
              These terms constitute a legally binding agreement between you and BookYourService.
            </p>
            <p>
              BookYourService reserves the right to modify these terms at any time. Continued use of the 
              platform after changes constitutes acceptance of the updated terms.
            </p>
          </CardContent>
        </Card>

        {/* 2. User Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              2. User Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>To use BookYourService, you must:</p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into contracts</li>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your account information</li>
              <li>Not use the platform for any illegal or unauthorized purpose</li>
            </ul>
            <p className="mt-4">
              BookYourService reserves the right to refuse service to anyone at any time without notice.
            </p>
          </CardContent>
        </Card>

        {/* 3. User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">3. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p><strong>Account Security:</strong></p>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>You are responsible for all activities under your account</li>
              <li>BookYourService is not liable for any loss from unauthorized account access</li>
            </ul>
            
            <p className="mt-4"><strong>Account Registration:</strong></p>
            <ul>
              <li>Provide accurate and truthful information</li>
              <li>One account per individual or business entity</li>
              <li>False information may result in immediate account termination</li>
            </ul>

            <p className="mt-4"><strong>Account Termination:</strong></p>
            <p>
              BookYourService may suspend or terminate your account for violations of these terms, 
              fraudulent activity, or any other reason at our sole discretion.
            </p>
          </CardContent>
        </Card>

        {/* 4. Services and Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">4. Services and Bookings</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p><strong>Service Listings:</strong></p>
            <ul>
              <li>Service providers are independent contractors, not BookYourService employees</li>
              <li>BookYourService acts as a marketplace connecting customers with providers</li>
              <li>We strive for accuracy but cannot guarantee service availability or pricing</li>
              <li>Prices may vary based on location, time, and service requirements</li>
            </ul>

            <p className="mt-4"><strong>Booking Process:</strong></p>
            <ul>
              <li>All bookings are subject to availability</li>
              <li>Provide accurate location and service requirements</li>
              <li>Be present at the scheduled time or inform in case of delays</li>
              <li>Payment must be completed to confirm booking</li>
            </ul>

            <p className="mt-4"><strong>Cancellation Policy:</strong></p>
            <p>
              Refer to our <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link> 
              for detailed cancellation terms and refund eligibility.
            </p>
          </CardContent>
        </Card>

        {/* 5. Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              5. Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p><strong>Payment Processing:</strong></p>
            <ul>
              <li>All payments are processed through secure payment gateways</li>
              <li>Platform fee of 5-10% is included in the displayed price</li>
              <li>Payment must be made in Indian Rupees (INR)</li>
              <li>Additional charges may apply for special requests or emergency services</li>
            </ul>

            <p className="mt-4"><strong>Refunds:</strong></p>
            <p>
              Refunds are processed according to our <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>. 
              Processing time is typically 5-7 business days.
            </p>

            <p className="mt-4"><strong>Wallet Services:</strong></p>
            <ul>
              <li>Wallet balance can be used for future bookings</li>
              <li>Withdrawal requests are processed within 7 business days</li>
              <li>Wallet credits are non-transferable and have no expiry</li>
            </ul>
          </CardContent>
        </Card>

        {/* 6. Provider Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">6. Provider Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Service providers agree to:</p>
            <ul>
              <li>Provide services with professional skill and care</li>
              <li>Arrive on time for scheduled bookings</li>
              <li>Complete services as described and agreed</li>
              <li>Maintain professional conduct at all times</li>
              <li>Not collect direct payments from customers (all payments through platform)</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Maintain valid licenses and certifications for services offered</li>
            </ul>
          </CardContent>
        </Card>

        {/* 7. User Conduct */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">7. User Conduct</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Users agree NOT to:</p>
            <ul>
              <li>Use the platform for fraudulent or illegal activities</li>
              <li>Harass, abuse, or threaten providers or other users</li>
              <li>Attempt to bypass payment processing or arrange direct payments</li>
              <li>Post false, misleading, or defamatory reviews</li>
              <li>Interfere with platform operation or security</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use automated tools to scrape data or manipulate bookings</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
            <p className="mt-4">
              Violation of these conduct rules may result in account termination and legal action.
            </p>
          </CardContent>
        </Card>

        {/* 8. Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              8. Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p><strong>BookYourService Property:</strong></p>
            <ul>
              <li>Platform design, features, and content are owned by BookYourService</li>
              <li>All trademarks, logos, and service marks are our exclusive property</li>
              <li>You may not copy, modify, or distribute our content without permission</li>
            </ul>

            <p className="mt-4"><strong>User Content:</strong></p>
            <ul>
              <li>You retain ownership of reviews, photos, and content you submit</li>
              <li>By submitting content, you grant us a worldwide, royalty-free license to use it</li>
              <li>You represent that you have the right to submit such content</li>
            </ul>
          </CardContent>
        </Card>

        {/* 9. Privacy and Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">9. Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Your privacy is important to us. Please review our 
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> 
              to understand how we collect, use, and protect your personal information.
            </p>
            <p className="mt-4">
              By using BookYourService, you consent to our data practices as described in the Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* 10. Dispute Resolution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-600" />
              10. Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p><strong>Informal Resolution:</strong></p>
            <p>
              We encourage users to first contact our support team for any disputes. We will attempt to 
              resolve issues amicably through mediation.
            </p>

            <p className="mt-4"><strong>Formal Disputes:</strong></p>
            <p>
              For unresolved disputes, refer to our 
              <Link href="/dispute-handling" className="text-primary hover:underline">Dispute Handling Policy</Link>.
            </p>

            <p className="mt-4"><strong>Governing Law:</strong></p>
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive 
              jurisdiction of courts in Bangalore, Karnataka.
            </p>
          </CardContent>
        </Card>

        {/* 11. Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">11. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>BookYourService shall not be liable for:</p>
            <ul>
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or platform unavailability</li>
              <li>Actions or omissions of independent service providers</li>
              <li>Third-party services or payment gateway failures</li>
            </ul>
            <p className="mt-4">
              Our total liability shall not exceed the amount paid by you for the specific service in question.
            </p>
          </CardContent>
        </Card>

        {/* 12. Indemnification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">12. Indemnification</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              You agree to indemnify, defend, and hold harmless BookYourService, its affiliates, officers, 
              directors, employees, and agents from any claims, damages, or expenses arising from:
            </p>
            <ul>
              <li>Your use of the platform</li>
              <li>Your violation of these terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you submit to the platform</li>
            </ul>
          </CardContent>
        </Card>

        {/* 13. Termination */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">13. Termination</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p><strong>By You:</strong></p>
            <p>You may terminate your account at any time by contacting support or through account settings.</p>
            
            <p className="mt-4"><strong>By BookYourService:</strong></p>
            <p>
              We may terminate or suspend your account immediately for violations, fraudulent activity, 
              or any other reason at our discretion, with or without notice.
            </p>
            
            <p className="mt-4">
              Upon termination, your right to use the platform ceases immediately. BookYourService 
              reserves the right to delete your account data, except as required by law.
            </p>
          </CardContent>
        </Card>

        {/* 14. Modifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">14. Modifications to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              BookYourService reserves the right to modify these terms at any time. We will notify 
              users of significant changes via email, platform notification, or prominent posting 
              on the website.
            </p>
            <p className="mt-4">
              Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
          </CardContent>
        </Card>

        {/* 15. Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">15. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> legal@bookyourservice.com</p>
              <p><strong>Phone:</strong> +91 1800-123-4567</p>
              <p><strong>Address:</strong> 123 Business Tower, Tech City, Bangalore, Karnataka - 560001</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="mt-8 bg-primary/5">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            By using BookYourService, you confirm that you have read, understood, and agreed to these Terms of Service.
          </p>
          <p className="text-sm text-muted-foreground">
            For detailed information on specific topics, visit our 
            <Link href="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</Link>, 
            <Link href="/refund-policy" className="text-primary hover:underline ml-1">Refund Policy</Link>, and 
            <Link href="/dispute-handling" className="text-primary hover:underline ml-1">Dispute Handling</Link> pages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
