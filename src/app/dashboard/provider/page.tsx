'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  DollarSign,
  Star,
  Briefcase,
  Users,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  totalAmount: number;
  currency: string;
  client: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  service: {
    id: string;
    title: string;
  };
}

interface Service {
  id: string;
  title: string;
  basePrice: number;
  totalBookings: number;
  totalReviews: number;
  averageRating: number;
  status: string;
  isAvailable: boolean;
}

export default function ProviderDashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'PROVIDER')) {
      router.push('/login');
      return;
    }
    if (user && user.role === 'PROVIDER') {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/services', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const [bookingsData, servicesData] = await Promise.all([
        bookingsRes.json(),
        servicesRes.json(),
      ]);

      if (bookingsData.success) {
        setBookings(bookingsData.data);
      }

      if (servicesData.success) {
        setServices(servicesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const activeBookings = bookings.filter(b => ['ACCEPTED', 'IN_PROGRESS'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const earnings = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.totalAmount * 0.9), 0); // Provider gets 90% (10% platform fee)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your services and bookings</p>
        </div>
        <Link href="/services/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.trustScore.toFixed(1) || '0.0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.floor(earnings).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings and Services */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Manage your booking requests</CardDescription>
              </div>
              <Link href="/bookings">
                <Button variant="outline" size="sm">
                  View All
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList>
                <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingBookings.length > 0 ? (
                  pendingBookings.slice(0, 5).map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending bookings
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4 mt-4">
                {activeBookings.length > 0 ? (
                  activeBookings.slice(0, 5).map((booking) => (
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
                  completedBookings.slice(0, 5).map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed bookings
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Services</CardTitle>
                <CardDescription>Manage your service listings</CardDescription>
              </div>
              <Link href="/services/create">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add New
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {services.length > 0 ? (
              <div className="space-y-4">
                {services.slice(0, 5).map((service) => (
                  <Link key={service.id} href={`/services/${service.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate mb-1">{service.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ₹{service.basePrice.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {service.totalBookings} bookings
                              </div>
                              {service.totalReviews > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  {service.averageRating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(service.status)}
                            {service.isAvailable ? (
                              <Badge variant="outline" className="text-xs">Active</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No services yet</p>
                <Link href="/services/create">
                  <Button>Create Your First Service</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Link href={`/bookings/${booking.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{booking.service.title}</h4>
              <p className="text-sm text-muted-foreground">{booking.client.name || booking.client.email}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(booking.scheduledDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-current opacity-50" />
              {booking.scheduledTime}
            </div>
            <div className="flex items-center gap-1 font-semibold text-foreground">
              ₹{booking.totalAmount.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
