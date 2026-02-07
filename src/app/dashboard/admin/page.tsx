'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  Eye,
  Check,
  X,
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  totalBookings: number;
  trustScore: number;
}

interface Service {
  id: string;
  title: string;
  status: string;
  averageRating: number;
  totalBookings: number;
  createdAt: string;
  provider: {
    name: string | null;
  };
}

export default function AdminDashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalServices: 0,
    totalBookings: 0,
    pendingServices: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    if (user && user.role === 'ADMIN') {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      // Fetch users and services
      const [usersRes, servicesRes] = await Promise.all([
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => ({ ok: false })),
        fetch('/api/services', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsers(usersData.data);
          setStats(prev => ({
            ...prev,
            totalUsers: usersData.data.length,
            totalProviders: usersData.data.filter((u: User) => u.role === 'PROVIDER').length,
          }));
        }
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        if (servicesData.success) {
          setServices(servicesData.data);
          setStats(prev => ({
            ...prev,
            totalServices: servicesData.data.length,
            pendingServices: servicesData.data.filter((s: Service) => s.status === 'PENDING_APPROVAL').length,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; variant: any }> = {
      CLIENT: { label: 'Client', variant: 'secondary' },
      PROVIDER: { label: 'Provider', variant: 'default' },
      ADMIN: { label: 'Admin', variant: 'destructive' },
    };
    const badge = config[role] || { label: role, variant: 'secondary' };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: any }> = {
      ACTIVE: { label: 'Active', variant: 'default' },
      SUSPENDED: { label: 'Suspended', variant: 'destructive' },
      PENDING_VERIFICATION: { label: 'Pending', variant: 'secondary' },
      PENDING_APPROVAL: { label: 'Pending', variant: 'secondary' },
      INACTIVE: { label: 'Inactive', variant: 'outline' },
    };
    const badge = config[status] || { label: status, variant: 'secondary' };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Overview and management of the platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalProviders} providers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingServices} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground mt-1">All systems go</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.length > 0 ? (
                  users.slice(0, 10).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{user.name || 'Unnamed User'}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Moderation</CardTitle>
              <CardDescription>Review and approve pending services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.length > 0 ? (
                  services.slice(0, 10).map((service) => (
                    <div key={service.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{service.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          By {service.provider.name || 'Unknown Provider'}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                          <span>{service.totalBookings} bookings</span>
                          {service.totalReviews > 0 && (
                            <span>★ {service.averageRating.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(service.status)}
                        {service.status === 'PENDING_APPROVAL' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-1">
                              <Check className="w-3 h-3" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="gap-1">
                              <X className="w-3 h-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No services found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Overview</CardTitle>
              <CardDescription>Monitor all platform bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Booking management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Comprehensive platform insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Detailed analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
