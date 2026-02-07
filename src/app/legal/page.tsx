import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, FileText, Shield, Globe, Gavel, AlertTriangle, Building2, UserCheck, CheckCircle, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legal Information - BookYourService',
  description: 'Legal information, compliance, and regulatory details for BookYourService platform',
};

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Scale className="w-4 h-4" />
          <span className="text-sm font-medium">Fully Compliant & Regulated</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Legal Information</h1>
        <p className="text-xl text-muted-foreground">
          Complete legal and regulatory compliance details
        </p>
      </div>

      {/* Company Legal Details */}
      <Card className="mb-8 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Company Legal Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">BookYourService Technologies Pvt. Ltd.</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CIN Number</p>
                <p className="font-medium">U72900KA2020PTC123456</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GSTIN</p>
                <p className="font-medium">29AAAAA0000A1Z5</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Registered Address</p>
                <p className="font-medium text-sm">
                  123 Business Tower, Tech City,<br />
                  Electronic City Phase 1,<br />
                  Bangalore, Karnataka - 560100
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Incorporation Date</p>
                <p className="font-medium">March 15, 2020</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance & Certifications */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Compliance & Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Regulatory Compliance</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Ministry of Corporate Affairs (MCA) registered</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>GST compliant (18% tax)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>TDS deduction as per Income Tax Act</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>PF & ESIC compliance for employees</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Consumer Protection Act, 2019 compliant</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Security & Privacy</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>ISO 27001:2013 certified</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>SOC 2 Type II compliant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>PCI-DSS Level 1 compliant payments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>GDPR compliant data practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>DPDP Act 2023 compliant</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Policies */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Legal Documents & Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/terms">
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Terms of Service</h4>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  User agreement and platform usage terms
                </p>
              </div>
            </Link>

            <Link href="/privacy">
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Privacy Policy</h4>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Data collection and protection policies
                </p>
              </div>
            </Link>

            <Link href="/refund-policy">
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Refund Policy</h4>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Cancellation and refund terms
                </p>
              </div>
            </Link>

            <Link href="/dispute-handling">
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Dispute Handling</h4>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Dispute resolution process
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Provider Legal */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            Provider Legal Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Mandatory Documents</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Aadhaar Card (for identity verification)</li>
                <li>• PAN Card (for tax compliance)</li>
                <li>• Bank Account (for payouts)</li>
                <li>• Service-specific licenses (where applicable)</li>
                <li>• Address proof (electricity bill, rent agreement, etc.)</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Tax Compliance</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• TDS deducted at source (1% with PAN, 20% without)</li>
                <li>• Form 16A provided annually</li>
                <li>• GST registration required for annual income above ₹40L</li>
                <li>• Income tax filing is provider's responsibility</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Independent Contractor Status</h4>
              <p className="text-sm text-muted-foreground">
                All service providers on BookYourService are independent contractors, not employees. 
                Providers are responsible for their own taxes, insurance, equipment, and compliance 
                with local laws and regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Protection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Data Protection & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Data Localization</h4>
                <p className="text-sm text-muted-foreground">
                  All user data is stored on servers located in India, complying with 
                  data localization requirements under DPDP Act 2023.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">User Rights</h4>
                <p className="text-sm text-muted-foreground">
                  Users have the right to access, correct, delete, and export their personal data. 
                  Requests can be made through privacy@bookyourservice.com.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Data Breach Notification</h4>
                <p className="text-sm text-muted-foreground">
                  In the unlikely event of a data breach, affected users will be notified 
                  within 72 hours as required by law.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Intellectual Property Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>BookYourService IP:</strong> All trademarks, logos, designs, software, content, 
              and intellectual property associated with BookYourService are owned by BookYourService 
              Technologies Pvt. Ltd. Unauthorized use is prohibited.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Provider IP:</strong> Providers retain ownership of their service techniques, 
              customer lists (excluding those acquired through the platform), and proprietary methods. 
              By joining the platform, providers grant BookYourService a license to display their 
              services and profile information.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>User Content:</strong> Users retain ownership of reviews, photos, and content they 
              submit. By submitting content, users grant BookYourService a worldwide, royalty-free 
              license to use, display, and distribute the content.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Jurisdiction */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-purple-600" />
            Jurisdiction & Governing Law
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Governing Law:</strong> These terms and your use of BookYourService are governed 
              by the laws of India, excluding conflict of law principles.
            </p>
            <p>
              <strong>Jurisdiction:</strong> Any disputes, claims, or controversies arising from or 
              relating to these terms or the use of the platform shall be subject to the exclusive 
              jurisdiction of the courts in Bangalore, Karnataka.
            </p>
            <p>
              <strong>Arbitration:</strong> BookYourService offers voluntary arbitration for dispute 
              resolution as an alternative to court proceedings. Arbitration is conducted in 
              Bangalore in accordance with the Arbitration and Conciliation Act, 1996.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Notices */}
      <Card className="mb-8 bg-yellow-50 dark:bg-yellow-950/10 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Important Legal Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>BookYourService is an intermediary platform and not a provider of services</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>All service providers are independent contractors, not our employees</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>We are not liable for the quality of services provided by third-party providers</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>Users must comply with all applicable laws while using the platform</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>We reserve the right to modify these policies with prior notice</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact Legal Team */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Legal Inquiries</h2>
          <p className="text-lg mb-6 opacity-90">
            For legal questions, partnership inquiries, or regulatory matters
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="secondary" asChild>
              <a href="mailto:legal@bookyourservice.com">
                Email Legal Team
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/20" asChild>
              <a href="tel:+9118001234567">
                Call Us
              </a>
            </Button>
          </div>
          <p className="mt-4 text-sm opacity-75">
            legal@bookyourservice.com | +91 1800-123-4567
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
