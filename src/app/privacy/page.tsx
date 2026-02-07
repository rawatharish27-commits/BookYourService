import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, Cookie, UserCheck, Globe, FileText } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - BookYourService',
  description: 'Privacy Policy for BookYourService - how we collect, use, and protect your personal information',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Last Updated: February 2025</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-xl text-muted-foreground">
          Your privacy is our priority - learn how we protect your data
        </p>
      </div>

      {/* Trust Banner */}
      <Card className="mb-8 border-green-600/30 bg-green-50/50 dark:bg-green-950/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-lg">Your Data is Protected</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>256-bit SSL encryption for all data transmission</span>
            </li>
            <li className="flex items-start gap-2">
              <Database className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Secure data centers with SOC 2 Type II compliance</span>
            </li>
            <li className="flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Strict access controls and regular security audits</span>
            </li>
            <li className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Never sell your personal data to third parties</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Privacy Content */}
      <div className="space-y-6">
        {/* 1. Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p><strong>Personal Information:</strong></p>
            <ul>
              <li>Name, email address, phone number</li>
              <li>Delivery/service address</li>
              <li>Payment information (processed securely through payment gateways)</li>
              <li>Government ID (for provider verification only)</li>
              <li>Profile photo (optional)</li>
            </ul>

            <p className="mt-4"><strong>Account Information:</strong></p>
            <ul>
              <li>Username and password (encrypted)</li>
              <li>Login history and device information</li>
              <li>Booking history and transaction records</li>
              <li>Preferences and settings</li>
            </ul>

            <p className="mt-4"><strong>Usage Information:</strong></p>
            <ul>
              <li>Pages visited and time spent</li>
              <li>Services browsed and searched</li>
              <li>Device type and browser information</li>
              <li>IP address and approximate location</li>
            </ul>
          </CardContent>
        </Card>

        {/* 2. How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>We use your information to:</p>
            <ul>
              <li><strong>Provide Services:</strong> Process bookings, connect you with providers, and facilitate payments</li>
              <li><strong>Improve Experience:</strong> Personalize recommendations and improve platform functionality</li>
              <li><strong>Communicate:</strong> Send booking confirmations, reminders, and support messages</li>
              <li><strong>Verify Identity:</strong> Confirm provider credentials and customer authenticity</li>
              <li><strong>Prevent Fraud:</strong> Detect and prevent fraudulent activities</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations and regulations</li>
              <li><strong>Analytics:</strong> Analyze usage patterns to improve services</li>
            </ul>
            <p className="mt-4">
              <strong>We NEVER:</strong> Sell your personal data, share it with advertisers, or use it for unrelated marketing without consent.
            </p>
          </CardContent>
        </Card>

        {/* 3. Information Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p><strong>Service Providers:</strong></p>
            <ul>
              <li>We share necessary details with providers to fulfill your booking (name, contact, address, service details)</li>
              <li>Providers only see information relevant to the specific booking</li>
              <li>Payment information is never shared with providers</li>
            </ul>

            <p className="mt-4"><strong>Payment Processors:</strong></p>
            <ul>
              <li>Payment details are processed through Razorpay, Stripe, or other secure gateways</li>
              <li>We do not store complete card numbers or CVV</li>
              <li>All payment processing is PCI-DSS compliant</li>
            </ul>

            <p className="mt-4"><strong>Service Providers:</strong></p>
            <ul>
              <li>Cloud infrastructure providers (AWS, Google Cloud)</li>
              <li>Analytics services (Google Analytics, with anonymized data)</li>
              <li>Communication services (for email, SMS notifications)</li>
              <li>All third parties are bound by strict data protection agreements</li>
            </ul>

            <p className="mt-4"><strong>Legal Requirements:</strong></p>
            <p>We may disclose information if required by law, court order, or to protect our rights and safety.</p>
          </CardContent>
        </Card>

        {/* 4. Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              4. Data Security Measures
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>We implement industry-leading security measures:</p>
            <ul>
              <li><strong>Encryption:</strong> 256-bit SSL/TLS encryption for all data in transit</li>
              <li><strong>Storage:</strong> AES-256 encryption for sensitive data at rest</li>
              <li><strong>Access Control:</strong> Role-based access with strict authentication</li>
              <li><strong>Monitoring:</strong> 24/7 intrusion detection and monitoring</li>
              <li><strong>Regular Audits:</strong> Quarterly security assessments and penetration testing</li>
              <li><strong>Compliance:</strong> ISO 27001, SOC 2 Type II, and GDPR compliant</li>
              <li><strong>Payment Security:</strong> PCI-DSS Level 1 compliant payment processing</li>
            </ul>
            <p className="mt-4">
              Despite our best efforts, no method of transmission is 100% secure. While we strive to protect 
              your data, we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        {/* 5. Cookies and Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Cookie className="w-5 h-5 text-orange-600" />
              5. Cookies and Tracking Technologies
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p><strong>Essential Cookies:</strong></p>
            <p>Required for basic platform functionality (login, booking, payments)</p>
            
            <p className="mt-4"><strong>Performance Cookies:</strong></p>
            <p>Help us understand how you use the platform and improve performance</p>
            
            <p className="mt-4"><strong>Functionality Cookies:</strong></p>
            <p>Remember your preferences and settings for a better experience</p>
            
            <p className="mt-4"><strong>Marketing Cookies:</strong></p>
            <p>Used only with your consent to show relevant advertisements</p>
            
            <p className="mt-4">
              You can manage cookie preferences through your browser settings. Disabling cookies may affect 
              platform functionality. See our <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link> for details.
            </p>
          </CardContent>
        </Card>

        {/* 6. Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">6. Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correct:</strong> Update or correct inaccurate information</li>
              <li><strong>Delete:</strong> Request deletion of your personal data (with some exceptions)</li>
              <li><strong>Opt-out:</strong> Opt-out of marketing communications</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Object:</strong> Object to processing of your personal data</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at privacy@bookyourservice.com. We'll respond within 
              30 days as required by law.
            </p>
          </CardContent>
        </Card>

        {/* 7. Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">7. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>We retain your data for as long as necessary to:</p>
            <ul>
              <li>Provide services and maintain your account</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Fraud prevention and security purposes</li>
            </ul>
            <p className="mt-4">
              <strong>Typical Retention Periods:</strong>
            </p>
            <ul>
              <li>Account information: While account is active + 7 years</li>
              <li>Booking records: 7 years for legal and tax purposes</li>
              <li>Payment records: 7 years as per tax regulations</li>
              <li>Support communications: 2 years</li>
              <li>Analytics data: Aggregated and anonymized after 2 years</li>
            </ul>
          </CardContent>
        </Card>

        {/* 8. Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">8. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              BookYourService is not intended for children under 18 years of age. We do not knowingly 
              collect personal information from children. If we become aware that we have collected 
              personal information from a child under 18, we will take steps to delete such information 
              immediately. Parents and guardians can contact us with any concerns.
            </p>
          </CardContent>
        </Card>

        {/* 9. International Data Transfers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              9. International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your data is stored and processed primarily on servers located in India. We may transfer 
              data to other countries for processing, storage, or as required by law. We ensure adequate 
              protection through standard contractual clauses and comply with applicable data transfer regulations.
            </p>
          </CardContent>
        </Card>

        {/* 10. Updates to Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">10. Updates to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant 
              changes by posting a notice on the platform or sending you an email. Your continued use 
              of the platform after changes constitutes acceptance of the updated policy.
            </p>
            <p className="mt-4 text-sm">
              <strong>Last Updated:</strong> February 2025
            </p>
          </CardContent>
        </Card>

        {/* 11. Contact Us */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">11. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              For privacy-related questions or concerns, please contact our Data Protection Officer:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> privacy@bookyourservice.com</p>
              <p><strong>Phone:</strong> +91 1800-123-4567</p>
              <p><strong>Address:</strong> 123 Business Tower, Tech City, Bangalore, Karnataka - 560001</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              We will respond to your privacy inquiries within 30 days as required by law.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="mt-8 bg-primary/5">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            For more information about your rights and how we handle disputes, please also review our 
            <Link href="/terms" className="text-primary hover:underline ml-1">Terms of Service</Link> and 
            <Link href="/dispute-handling" className="text-primary hover:underline ml-1">Dispute Handling Policy</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
