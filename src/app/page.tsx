'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MapPin, Clock, ArrowRight, Sparkles, Shield, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  _count?: {
    services?: number;
  };
}

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  currency: string;
  durationMinutes: number;
  city: string | null;
  averageRating: number;
  totalReviews: number;
  provider: {
    id: string;
    name: string | null;
    avatar: string | null;
    trustScore: number;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function HomePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        fetch('/api/categories?includeInactive=false'),
        fetch('/api/services?featured=true&limit=6'),
      ]);

      const [categoriesData, servicesData] = await Promise.all([
        categoriesRes.json(),
        servicesRes.json(),
      ]);

      if (categoriesData.success) {
        setCategories(categoriesData.data.slice(0, 8));
      }

      if (servicesData.success) {
        setFeaturedServices(servicesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/services?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Trusted by 10,000+ customers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find & Book Professional{' '}
            <span className="text-primary">Services</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with verified professionals for all your needs. Quality service, transparent pricing, and complete peace of mind.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Search for services, providers..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button size="lg" onClick={handleSearch} className="h-12 px-8">
              Search
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5K+</div>
              <div className="text-sm text-muted-foreground">Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4.9</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Verified Providers</CardTitle>
                <CardDescription>
                  All providers undergo strict verification to ensure quality and trustworthiness
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Quality Assured</CardTitle>
                <CardDescription>
                  Read genuine reviews and ratings from verified customers to make informed decisions
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>
                  Get help whenever you need it with our dedicated customer support team
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Categories</h2>
              <p className="text-muted-foreground">Browse services by category</p>
            </div>
            <Link href="/categories">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="animate-pulse h-32" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">{category.icon || '🏠'}</span>
                      </div>
                      <h3 className="font-semibold">{category.name}</h3>
                      {category._count?.services && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {category._count.services} services
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <p className="text-muted-foreground">No categories available yet</p>
                <Link href="/categories">
                  <Button variant="outline" className="mt-4">
                    Create First Category
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Services</h2>
              <p className="text-muted-foreground">Top-rated services from trusted providers</p>
            </div>
            <Link href="/services">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse h-80" />
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary">{service.category.name}</Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{service.averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({service.totalReviews})</span>
                        </div>
                      </div>
                      <CardTitle className="line-clamp-1">{service.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {service.city || 'Location not specified'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {service.durationMinutes} minutes
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-2xl font-bold">₹{service.basePrice.toLocaleString()}</span>
                        </div>
                        <Button size="sm">Book Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <p className="text-muted-foreground">No featured services available yet</p>
                {user?.role === 'PROVIDER' && (
                  <Link href="/services/create">
                    <Button className="mt-4">
                      Add Your First Service
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12 space-y-6">
              <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg opacity-90">
                Join thousands of satisfied customers and trusted providers on BookYourService
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/services">
                    <Button size="lg" variant="secondary">
                      Browse Services
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" variant="secondary">
                        Create Account
                      </Button>
                    </Link>
                    <Link href="/services">
                      <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground">
                        Explore Services
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
