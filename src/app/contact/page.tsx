import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - BookYourService',
  description: 'Get in touch with BookYourService support team for any questions or assistance',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground">
          Have questions? We're here to help you 24/7
        </p>
      </div>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you as soon as possible
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="How can we help you?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Tell us more about your inquiry..."
                className="min-h-[150px]"
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full gap-2">
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email Us</h3>
            <p className="text-sm text-muted-foreground mb-4">
              support@bookyourservice.com
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:support@bookyourservice.com">
                Send Email
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-sm text-muted-foreground mb-4">
              +91 1800-123-4567
            </p>
            <p className="text-xs text-muted-foreground">
              Available 24/7
            </p>
            <Button variant="outline" className="w-full">
              Call Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Visit Us</h3>
            <p className="text-sm text-muted-foreground mb-2">
              BookYourService HQ
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              123 Business Street<br />
              Tech City, India 400001
            </p>
            <Button variant="outline" className="w-full">
              Get Directions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Office Hours */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Office Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Monday - Friday</h4>
              <p className="text-muted-foreground">9:00 AM - 6:00 PM</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Saturday</h4>
              <p className="text-muted-foreground">10:00 AM - 4:00 PM</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sunday</h4>
              <p className="text-muted-foreground">Closed</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Support</h4>
              <p className="text-muted-foreground">Available 24/7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
