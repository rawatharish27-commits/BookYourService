'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  CreditCard,
  Settings,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  service: {
    id: string;
    title: string;
    basePrice: number;
    durationMinutes: number;
    images: string;
  };
  provider: {
    id: string;
    name: string | null;
    avatar: string | null;
    businessName: string | null;
  };
}

export default function ClientDashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'CLIENT')) {
      router.push('/login');
      return;
    }
    if (user && user.role === 'CLIENT') {
      fetchBookings();
    }
  }, [user, authLoading]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: 'Pending', variant: 'secondary' },
      ACCEPTED: { label: 'Accepted', variant: 'default' },
      IN_PROGRESS: { label: 'In Progress', variant: 'default' },
      COMPLETED: { label: 'Completed', variant: 'outline' },
      CANCELLED: { label: 'Cancelled', variant: 'destructive' },
      REJECTED: { label: 'Rejected', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter(b => ['CANCELLED', 'REJECTED'].includes(b.status));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-muted-foreground">Manage your bookings and profile</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{bookings
                .filter(b => b.paymentStatus === 'PAID')
                .reduce((sum, b) => sum + b.totalAmount, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>Track and manage your service bookings</CardDescription>
            </div>
            <Link href="/bookings">
              <Button variant="outline">
                View All
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              {activeBookings.length > 0 ? (
                activeBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active bookings
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {completedBookings.length > 0 ? (
                completedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No completed bookings
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4 mt-4">
              {cancelledBookings.length > 0 ? (
                cancelledBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No cancelled bookings
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link href="/services">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Browse Services</h3>
                <p className="text-sm text-muted-foreground">Find new services to book</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Edit Profile</h3>
                <p className="text-sm text-muted-foreground">Update your personal information</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const images = JSON.parse(booking.service.images) || [];
  
  return (
    <Link href={`/bookings/${booking.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={booking.service.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📷</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{booking.service.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {booking.provider.businessName || booking.provider.name}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(booking.scheduledDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {booking.scheduledTime}
                </div>
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  ₹{booking.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
