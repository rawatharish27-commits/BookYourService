import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Help2Earn',
  description: 'Terms of Service for Help2Earn platform',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Terms of Service
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-600 mb-8">
                <strong>Last updated:</strong> {new Date().toLocaleDateString('en-IN')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using the Help2Earn platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 mb-4">
                  Help2Earn is a peer-to-peer marketplace that connects people who need help with everyday tasks with those willing to provide assistance for monetary compensation. Our platform facilitates secure communication, payment processing, and trust-based interactions between users.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Eligibility</h2>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>You must be at least 18 years old to use our service</li>
                  <li>You must provide accurate and complete registration information</li>
                  <li>You must maintain the accuracy of your account information</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You agree to notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
                <p className="text-gray-700 mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Post false, inaccurate, or misleading information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Engage in fraudulent or deceptive practices</li>
                  <li>Interfere with the proper functioning of the platform</li>
                  <li>Use the service for any commercial purpose without authorization</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Share your account credentials with others</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Trust & Safety</h2>
                <p className="text-gray-700 mb-4">
                  Help2Earn implements a trust score system to ensure safe interactions. Users are expected to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Complete agreed-upon tasks honestly and professionally</li>
                  <li>Communicate clearly and respond promptly</li>
                  <li>Rate and review interactions accurately</li>
                  <li>Report suspicious or inappropriate behavior</li>
                  <li>Maintain appropriate boundaries in all interactions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>All payments are processed through secure third-party providers</li>
                  <li>Users must maintain active subscriptions to post help requests</li>
                  <li>Payment disputes must be reported within 48 hours of service completion</li>
                  <li>Help2Earn reserves the right to hold payments in case of disputes</li>
                  <li>Refunds are processed according to our refund policy</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Content and Intellectual Property</h2>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>You retain ownership of content you post on the platform</li>
                  <li>You grant Help2Earn a license to use, display, and distribute your content</li>
                  <li>You agree not to post copyrighted material without permission</li>
                  <li>Help2Earn reserves the right to remove inappropriate content</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
                <p className="text-gray-700 mb-4">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
                <p className="text-gray-700 mb-4">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  In no event shall Help2Earn, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
                <p className="text-gray-700 mb-4">
                  These Terms shall be interpreted and governed by the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p className="text-gray-700 mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700"><strong>Email:</strong> legal@help2earn.com</p>
                  <p className="text-gray-700"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                  <p className="text-gray-700"><strong>Address:</strong> [Company Address], India</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
