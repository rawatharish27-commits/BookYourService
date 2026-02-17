import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Help2Earn',
  description: 'Privacy Policy for Help2Earn platform',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Privacy Policy
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-600 mb-8">
                <strong>Last updated:</strong> {new Date().toLocaleDateString('en-IN')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 mb-4">
                  Help2Earn ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
                </p>
                <p className="text-gray-700 mb-4">
                  Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

                <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Account Information:</strong> Phone number, name, age verification status</li>
                  <li><strong>Location Data:</strong> GPS coordinates, location text, IP address</li>
                  <li><strong>Payment Information:</strong> Payment method details (processed securely by third parties)</li>
                  <li><strong>Communication Data:</strong> Messages, feedback, reviews</li>
                  <li><strong>Device Information:</strong> Device fingerprint, browser type, operating system</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Usage Information</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Pages visited and features used</li>
                  <li>Time spent on the platform</li>
                  <li>Click patterns and user interactions</li>
                  <li>Trust scores and activity metrics</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">We use collected information for:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Service Provision:</strong> Connecting helpers with those seeking help</li>
                  <li><strong>Trust & Safety:</strong> Maintaining trust scores and preventing fraud</li>
                  <li><strong>Payment Processing:</strong> Facilitating secure transactions</li>
                  <li><strong>Communication:</strong> Enabling direct contact between users</li>
                  <li><strong>Platform Improvement:</strong> Analyzing usage patterns and enhancing features</li>
                  <li><strong>Legal Compliance:</strong> Meeting regulatory requirements</li>
                  <li><strong>Customer Support:</strong> Resolving issues and providing assistance</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
                <p className="text-gray-700 mb-4">We may share your information in the following circumstances:</p>

                <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 With Other Users</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Phone numbers for direct communication (with user consent)</li>
                  <li>Trust scores and basic profile information</li>
                  <li>Location data for proximity-based matching</li>
                  <li>Reviews and feedback (anonymized where possible)</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 With Service Providers</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Payment processors (Razorpay, Stripe)</li>
                  <li>Cloud hosting providers</li>
                  <li>Analytics and monitoring services</li>
                  <li>Customer support platforms</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3">4.3 Legal Requirements</h3>
                <p className="text-gray-700 mb-4">
                  We may disclose information if required by law, court order, or government request, or to protect our rights, property, or safety, or that of our users.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Regular backup and disaster recovery procedures</li>
                  <li>Employee training on data protection</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-700 mb-4">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law. Specifically:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Account Data:</strong> Retained while account is active and for 3 years after deactivation</li>
                  <li><strong>Transaction Data:</strong> Retained for 7 years for tax and legal compliance</li>
                  <li><strong>Communication Data:</strong> Retained for 2 years or until dispute resolution</li>
                  <li><strong>Analytics Data:</strong> Aggregated and anonymized after 2 years</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights (GDPR Compliance)</h2>
                <p className="text-gray-700 mb-4">Under applicable data protection laws, you have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
                <p className="text-gray-700 mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Cookie Categories:</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li><strong>Essential:</strong> Required for platform functionality</li>
                    <li><strong>Analytics:</strong> Help us understand user behavior</li>
                    <li><strong>Marketing:</strong> Used for targeted communications</li>
                    <li><strong>Preferences:</strong> Remember your settings and choices</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-700 mb-4">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers, including standard contractual clauses and adequacy decisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
                <p className="text-gray-700 mb-4">
                  Our service is not intended for children under 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700"><strong>Data Protection Officer:</strong> privacy@help2earn.com</p>
                  <p className="text-gray-700"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                  <p className="text-gray-700"><strong>Address:</strong> [Company Address], India</p>
                  <p className="text-gray-700"><strong>Response Time:</strong> We aim to respond within 30 days</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Complaints</h2>
                <p className="text-gray-700 mb-4">
                  If you are not satisfied with how we handle your personal data or our response to your concerns, you have the right to lodge a complaint with the relevant data protection authority in your country.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
