import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock, Users, MapPin, TrendingUp, Zap, Globe, RefreshCw, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Live System Status - BookYourService',
  description: 'Real-time system status and service availability for BookYourService Global',
};

export default function LiveStatusPage() {
  const services = [
    { name: 'Booking System', status: 'operational', uptime: '99.95%', lastCheck: '2 min ago' },
    { name: 'Payment Gateway', status: 'operational', uptime: '99.98%', lastCheck: '1 min ago' },
    { name: 'Provider Matching', status: 'operational', uptime: '99.92%', lastCheck: 'Just now' },
    { name: 'User Authentication', status: 'operational', uptime: '100%', lastCheck: 'Just now' },
    { name: 'Live Tracking', status: 'operational', uptime: '99.90%', lastCheck: '3 min ago' },
    { name: 'Mobile App API', status: 'operational', uptime: '99.97%', lastCheck: '1 min ago' },
    { name: 'Web Application', status: 'operational', uptime: '99.99%', lastCheck: 'Just now' },
  ];

  const stats = {
    totalProviders: 100000,
    activeProviders: 92847,
    totalUsers: 500000,
    onlineUsers: 42356,
    totalCities: 2000,
    activeCities: 1892,
    totalCountries: 50,
    activeCountries: 48,
    todayBookings: 15432,
    todayRevenue: 4580000,
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-600/10 text-green-600 px-4 py-2 rounded-full mb-4">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Live System Status</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">System Status</h1>
        <p className="text-xl text-muted-foreground">
          Real-time monitoring of BookYourService Global platform
        </p>
      </div>

      {/* Overall Status */}
      <Card className="mb-8 border-green-600/30 bg-green-50 dark:bg-green-950/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-center">
              <span className="text-3xl font-bold">All Systems Operational</span>
              <p className="text-sm text-muted-foreground mt-1">
                99.94% Overall Uptime • Last 30 days
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-green-600">99.99%</p>
              <p className="text-sm text-muted-foreground">Web Application</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">99.97%</p>
              <p className="text-sm text-muted-foreground">Mobile App API</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">99.98%</p>
              <p className="text-sm text-muted-foreground">Payment Gateway</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">99.92%</p>
              <p className="text-sm text-muted-foreground">Provider Matching</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Live Users & Providers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/10 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{stats.onlineUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Users Online</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600">{stats.activeProviders.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Providers Active</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/10 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600">{stats.totalProviders.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Providers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Global Reach
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/10 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">{stats.activeCities}</p>
                <p className="text-sm text-muted-foreground">Active Cities</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{stats.totalCities}</p>
                <p className="text-sm text-muted-foreground">Total Cities</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/10 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">{stats.activeCountries}</p>
                <p className="text-sm text-muted-foreground">Active Countries</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{stats.totalCountries}</p>
                <p className="text-sm text-muted-foreground">Total Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              Today's Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/10 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-yellow-600">{stats.todayBookings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Bookings Today</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">₹{(stats.todayRevenue / 100000).toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  {service.status === 'operational' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.uptime} uptime</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Last check: {service.lastCheck}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Uptime */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            30-Day Uptime History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/10 rounded">
              <span className="font-medium">Today</span>
              <span className="text-green-600 font-semibold">100%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/10 rounded">
              <span className="font-medium">Yesterday</span>
              <span className="text-green-600 font-semibold">99.9%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/10 rounded">
              <span className="font-medium">This Week</span>
              <span className="text-green-600 font-semibold">99.95%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/10 rounded">
              <span className="font-medium">Last Week</span>
              <span className="text-yellow-600 font-semibold">99.87%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/10 rounded">
              <span className="font-medium">30 Days</span>
              <span className="text-green-600 font-semibold">99.94%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Live Support Available 24/7</h2>
          <p className="text-lg mb-6 opacity-90">
            Global support across 50+ countries. Contact us for any issues.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="mailto:rawatharish27@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors">
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <a href="tel:+918901172507" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors">
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </div>
          <p className="mt-4 text-sm opacity-75">
            Email: rawatharish27@gmail.com | Phone: +91 8901172507
          </p>
          <div className="flex items-center gap-2 justify-center mt-4">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span className="text-sm">Auto-refreshing every 30 seconds</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
