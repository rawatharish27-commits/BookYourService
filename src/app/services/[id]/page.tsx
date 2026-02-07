'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  MapPin,
  Clock,
  Shield,
  Calendar,
  Loader2,
  User,
  MessageSquare,
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  currency: string;
  durationMinutes: number;
  city: string | null;
  location: string | null;
  averageRating: number;
  totalReviews: number;
  images: string;
  verified: boolean;
  provider: {
    id: string;
    name: string | null;
    avatar: string | null;
    businessName: string | null;
    trustScore: number;
    totalReviews: number;
    totalBookings: number;
    city: string | null;
    experienceYears: number | null;
    createdAt: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  availabilitySlots: any[];
  reviews: any[];
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: '',
    city: '',
    clientNotes: '',
  });

  useEffect(() => {
    fetchService();
  }, [params.id]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setService(data.data);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'CLIENT') {
      setBookingError('Only clients can book services');
      return;
    }

    setIsBooking(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: params.id,
          ...bookingData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/bookings/${data.data.id}`);
      } else {
        setBookingError(data.error?.message || 'Booking failed');
      }
    } catch (error) {
      setBookingError('An error occurred. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-muted-foreground text-lg mb-4">Service not found</p>
            <Link href="/services">
              <Button>Browse Services</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = JSON.parse(service.images) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardContent className="p-0">
              {images.length > 0 ? (
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                  <img
                    src={images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">No images available</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary">{service.category.name}</Badge>
                  {service.verified && (
                    <Badge variant="outline" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-lg">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{service.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({service.totalReviews} reviews)</span>
                </div>
              </div>
              <CardTitle className="text-3xl">{service.title}</CardTitle>
              <CardDescription className="text-base">
                by {service.provider.businessName || service.provider.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {service.city || 'Location not specified'}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {service.durationMinutes} minutes
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">About this service</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{service.description}</p>
              </div>

              {service.location && (
                <div>
                  <h3 className="font-semibold mb-2">Service Location</h3>
                  <p className="text-muted-foreground">{service.location}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provider Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                About the Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={service.provider.avatar || undefined} />
                  <AvatarFallback>
                    {service.provider.name?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {service.provider.businessName || service.provider.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{service.provider.trustScore.toFixed(1)}</span>
                    <span>•</span>
                    <span>{service.provider.totalBookings} bookings</span>
                    <span>•</span>
                    <span>{service.provider.city}</span>
                  </div>
                  {service.provider.experienceYears && (
                    <p className="text-sm text-muted-foreground">
                      {service.provider.experienceYears} years of experience
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Reviews ({service.reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {service.reviews.length > 0 ? (
                service.reviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.user.avatar || undefined} />
                        <AvatarFallback>
                          {review.user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{review.user.name}</h4>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <p className="font-medium text-sm mt-1">{review.title}</p>
                        )}
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-bold">₹{service.basePrice.toLocaleString()}</span>
                  <span className="text-muted-foreground">/session</span>
                </div>
              </div>
              <CardDescription>{service.durationMinutes} minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showBookingForm ? (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {bookingError && (
                    <Alert variant="destructive">
                      <AlertDescription>{bookingError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="date">Select Date</Label>
                    <Input
                      id="date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      required
                      value={bookingData.scheduledDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Select Time</Label>
                    <Input
                      id="time"
                      type="time"
                      required
                      value={bookingData.scheduledTime}
                      onChange={(e) => setBookingData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address (optional)</Label>
                    <Input
                      id="address"
                      placeholder="Service address"
                      value={bookingData.address}
                      onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements..."
                      value={bookingData.clientNotes}
                      onChange={(e) => setBookingData(prev => ({ ...prev, clientNotes: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isBooking}
                    >
                      {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Booking
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBookingForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>

                  <Alert>
                    <AlertDescription className="text-sm">
                      You'll be charged ₹{(service.basePrice + service.basePrice * 0.1).toFixed(2)} including 10% platform fee
                    </AlertDescription>
                  </Alert>
                </form>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (user) {
                      setShowBookingForm(true);
                    } else {
                      router.push('/login');
                    }
                  }}
                >
                  Book Now
                </Button>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Price</span>
                  <span>₹{service.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (10%)</span>
                  <span>₹{(service.basePrice * 0.1).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{(service.basePrice + service.basePrice * 0.1).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
