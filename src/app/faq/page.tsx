import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, HelpCircle, Search, Tag } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ - BookYourService',
  description: 'Frequently Asked Questions about BookYourService platform, services, booking, payments, and more',
};

export default function FAQPage() {
  const categories = [
    {
      name: 'General',
      icon: HelpCircle,
      questions: [
        {
          q: 'What is BookYourService?',
          a: 'BookYourService is India\'s leading online marketplace that connects customers with verified professional service providers. We offer 500+ services across 32 categories including home maintenance, beauty & wellness, appliances, and more. All providers on our platform are background-verified and trained to ensure quality service delivery.'
        },
        {
          q: 'How do I get started with BookYourService?',
          a: 'Getting started is easy! Simply create a free account, browse through our services or categories, select the service you need, choose your preferred date and time, and complete the booking. You can pay securely using multiple payment options including UPI, cards, net banking, and wallet.'
        },
        {
          q: 'Is BookYourService available in my city?',
          a: 'BookYourService currently operates in 500+ cities across India. We are rapidly expanding to new locations. Enter your pincode during service search to check availability in your area.'
        }
      ]
    },
    {
      name: 'Booking',
      icon: Search,
      questions: [
        {
          q: 'How do I book a service?',
          a: '1. Search for the service you need\n2. Select your preferred provider and service package\n3. Choose your preferred date and time slot\n4. Provide location details and any special instructions\n5. Confirm and complete payment\n\nYou\'ll receive an instant confirmation with booking details and provider information.'
        },
        {
          q: 'Can I reschedule or cancel my booking?',
          a: 'Yes! You can reschedule or cancel your booking up to 4 hours before the scheduled service time. Free cancellation is available if done 24+ hours before the booking. Late cancellations may incur a nominal fee. Go to My Bookings in your dashboard to manage your reservations.'
        },
        {
          q: 'What happens if the provider doesn\'t show up?',
          a: 'In the rare event that a provider doesn\'t arrive or cancels, we immediately assign an alternative provider or offer a full refund with additional compensation. Our 24/7 support team is always available to assist you. Provider no-shows are tracked and repeat offenders are removed from the platform.'
        },
        {
          q: 'Can I request the same provider again?',
          a: 'Absolutely! If you\'re satisfied with a provider, you can add them to your favorites and request them specifically for future bookings. While we cannot guarantee their availability, we make every effort to match you with your preferred provider.'
        }
      ]
    },
    {
      name: 'Payments',
      icon: Tag,
      questions: [
        {
          q: 'What payment methods are accepted?',
          a: 'We accept multiple payment methods for your convenience:\n• UPI (Google Pay, PhonePe, Paytm, BHIM)\n• Credit/Debit Cards (Visa, MasterCard, RuPay)\n• Net Banking (all major banks)\n• BookYourService Wallet\n• Cash on Service (select locations)\n\nAll transactions are secured with 256-bit SSL encryption.'
        },
        {
          q: 'Is my payment information safe?',
          a: 'Yes, your payment security is our top priority. We use industry-standard PCI-DSS compliant payment gateways (Razorpay, Stripe) with 256-bit SSL encryption. We never store your card details on our servers. All payments are processed through secure banking channels.'
        },
        {
          q: 'How does the refund policy work?',
          a: 'Refunds are processed within 5-7 business days:\n• Cancellations 24+ hours before booking: 100% refund\n• Cancellations 4-24 hours before: 75% refund\n• Cancellations within 4 hours: No refund\n• Service not completed or cancelled by provider: 100% refund + compensation\n\nRefunds are credited to the original payment method or your BookYourService wallet.'
        },
        {
          q: 'What is the platform fee?',
          a: 'BookYourService charges a transparent platform fee of 5-10% on the service price, which is included in the total price you see at checkout. This fee covers payment processing, provider verification, customer support, and platform maintenance. There are no hidden charges.'
        }
      ]
    },
    {
      name: 'Provider Related',
      icon: HelpCircle,
      questions: [
        {
          q: 'How are providers verified?',
          a: 'All providers undergo a comprehensive 7-step verification process:\n1. Government ID verification (Aadhaar, PAN)\n2. Address verification\n3. Criminal background check\n4. Skill assessment and training\n5. Reference checks\n6. In-person interview\n7. Trial service evaluation\n\nOnly providers who pass all checks are listed on our platform.'
        },
        {
          q: 'Can I become a service provider?',
          a: 'Yes! We welcome skilled professionals to join our platform. To become a provider:\n1. Register at /become-provider\n2. Complete your profile with skills and experience\n3. Upload verification documents\n4. Pay the one-time registration fee of ₹50\n5. Pass our skill assessment\n6. Start receiving bookings!\n\nProviders can earn ₹15,000 - ₹50,000+ monthly based on services and ratings.'
        },
        {
          q: 'How are providers assigned to bookings?',
          a: 'Our smart algorithm assigns providers based on:\n• Geographic proximity to customer\n• Provider availability at requested time\n• Provider ratings and reviews\n• Category specialization\n• Past performance with similar bookings\n\nThis ensures optimal matching for both customers and providers. You can also request a preferred provider if they\'re available.'
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about BookYourService. Can't find what you're looking for? 
          <Link href="/contact" className="text-primary hover:underline ml-1">
            Contact our support team
          </Link>
        </p>
      </div>

      {/* Quick Links */}
      <Card className="mb-8 bg-primary/5">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/refund-policy">
              <Button variant="outline" size="sm">
                Refund Policy
              </Button>
            </Link>
            <Link href="/dispute-handling">
              <Button variant="outline" size="sm">
                Dispute Handling
              </Button>
            </Link>
            <Link href="/platform-fees">
              <Button variant="outline" size="sm">
                Platform Fees
              </Button>
            </Link>
            <Link href="/legal">
              <Button variant="outline" size="sm">
                Legal Information
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {categories.map((category, idx) => {
          const Icon = category.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon className="w-6 h-6 text-primary" />
                  {category.name}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((item, qIdx) => (
                    <details 
                      key={qIdx} 
                      className="group border rounded-lg overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors select-none">
                        <span className="font-medium pr-4">{item.q}</span>
                        <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0" />
                      </summary>
                      <div className="px-4 pb-4 text-muted-foreground whitespace-pre-line">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <Card className="mt-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg mb-6 opacity-90">
            Our support team is available 24/7 to help you
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Contact Support
              </Button>
            </Link>
            <Link href="/live-chat">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/20">
                Start Live Chat
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm opacity-75">
            Call us toll-free: +91 1800-123-4567
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
