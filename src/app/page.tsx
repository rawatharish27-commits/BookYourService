'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MapPin, Clock, ArrowRight, Sparkles, Shield, Users, TrendingUp, Award, CheckCircle2, Zap, Globe, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  description?: string | null;
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
  verified: boolean;
  featured: boolean;
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
        fetch('/api/categories?includeInactive=false&limit=32'),
        fetch('/api/services?featured=true&limit=6'),
      ]);

      const [categoriesData, servicesData] = await Promise.all([
        categoriesRes.json(),
        servicesRes.json(),
      ]);

      if (categoriesData.success) {
        setCategories(categoriesData.data.slice(0, 16));
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

  const totalServices = categories.reduce((sum, cat) => sum + (cat._count?.services || 0), 0);

  return (
    <div className="flex flex-col">
      {/* Hero Section with Enhanced Graphics */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-background">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto max-w-7xl text-center space-y-8 relative py-20 px-4">
          {/* Trust Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 50,000+ customers across India
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Find & Book{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Professional</span>
              <br />
              Services
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Connect with 32+ service categories, 640+ subcategories, and{' '}
              <span className="text-primary font-semibold">200+ verified services</span>{' '}
              from trusted providers across India
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto pt-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search for AC repair, cleaning, plumbing, and 500+ services..."
                className="pl-12 h-14 text-base border-2 focus-visible:ring-2 shadow-lg group-focus-within:ring-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex gap-2">
                <kbd className="px-2 py-1 text-xs bg-muted rounded border">⌘ K</kbd>
              </div>
            </div>
            <Button size="lg" onClick={handleSearch} className="h-14 px-8 text-base shadow-lg hover:shadow-xl transition-shadow">
              <Search className="w-5 h-5 mr-2" />
              Search Services
            </Button>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-4xl mx-auto">
            <div className="group">
              <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">200+</div>
                  <div className="text-sm font-medium text-muted-foreground">Services</div>
                </CardContent>
              </Card>
            </div>
            <div className="group">
              <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">32+</div>
                  <div className="text-sm font-medium text-muted-foreground">Categories</div>
                </CardContent>
              </Card>
            </div>
            <div className="group">
              <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">640+</div>
                  <div className="text-sm font-medium text-muted-foreground">Subcategories</div>
                </CardContent>
              </Card>
            </div>
            <div className="group">
              <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Star className="w-6 h-6 text-primary fill-yellow-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">4.9</div>
                  <div className="text-sm font-medium text-muted-foreground">Avg Rating</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl"></div>
      </section>

      {/* Trust Features Section */}
      <section className="py-16 px-4 bg-muted/50 border-y">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose BookYourService?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of service booking with our cutting-edge platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-lg">Verified Providers</CardTitle>
                <CardDescription className="text-base">
                  All providers undergo strict verification including ID proof, address verification, and skill assessment
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-lg">Quality Assured</CardTitle>
                <CardDescription className="text-base">
                  Read genuine reviews and ratings from verified customers to make informed decisions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-lg">Instant Booking</CardTitle>
                <CardDescription className="text-base">
                  Book services instantly with real-time availability and instant confirmation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-lg">24/7 Support</CardTitle>
                <CardDescription className="text-base">
                  Get help whenever you need it with our dedicated customer support team
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-lg">Secure Payments</CardTitle>
                <CardDescription className="text-base">
                  Multiple payment options with secure transactions and money-back guarantee
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-lg">Best Prices</CardTitle>
                <CardDescription className="text-base">
                  Compare prices from multiple providers and choose the best value for your budget
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-lg">Pan India Coverage</CardTitle>
                <CardDescription className="text-base">
                  Services available in all major cities across India with local expertise
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-lg">Large Network</CardTitle>
                <CardDescription className="text-base">
                  Join thousands of satisfied customers and trusted providers on our platform
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Explore Categories</h2>
              <p className="text-muted-foreground">
                Browse 32+ categories with 640+ specialized services
              </p>
            </div>
            <Link href="/categories">
              <Button variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-all">
                View All 32+ Categories
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((i) => (
                <Card key={i} className="animate-pulse h-40 border-2" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {categories.map((category, index) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40 cursor-pointer h-full overflow-hidden">
                    <CardContent className="p-0 h-full">
                      <div className="relative h-full flex flex-col">
                        {/* Icon/Image */}
                        <div className="h-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center relative overflow-hidden">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <span className="text-4xl transform group-hover:scale-110 transition-transform">
                              {category.icon || '🏠'}
                            </span>
                          )}
                          {/* Hover effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col justify-center text-center">
                          <h3 className="font-semibold text-base mb-1 line-clamp-2 min-h-[2.5rem]">
                            {category.name}
                          </h3>
                          {category._count?.services && (
                            <Badge variant="secondary" className="text-xs inline-flex">
                              {category._count.services} services
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <p className="text-muted-foreground text-lg mb-4">No categories available yet</p>
                <Link href="/categories">
                  <Button size="lg">Explore All Services</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Services</h2>
              <p className="text-muted-foreground">
                Top-rated services from verified providers
              </p>
            </div>
            <Link href="/services">
              <Button variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-all">
                View All Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse h-96 border-2" />
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40 h-full flex flex-col overflow-hidden">
                    {/* Image */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                      <div className="absolute inset-0 flex items-center justify-center z-0">
                        {service.category.name && (
                          <Badge variant="secondary" className="z-20">
                            {service.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant={service.verified ? "default" : "secondary"} className="gap-1">
                          {service.verified && <CheckCircle2 className="w-3 h-3" />}
                          {service.featured && <Sparkles className="w-3 h-3" />}
                          Verified
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm">{service.averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-sm">({service.totalReviews})</span>
                        </div>
                      </div>

                      <div>
                        <CardTitle className="line-clamp-2 text-xl">{service.title}</CardTitle>
                        <CardDescription className="line-clamp-3 text-base mt-2">
                          {service.description}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {service.city || 'Location not specified'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.durationMinutes} minutes
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t-2 mt-auto">
                        <div>
                          <span className="text-3xl font-bold">₹{service.basePrice.toLocaleString()}</span>
                        </div>
                        <Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <p className="text-muted-foreground text-lg mb-4">No featured services available yet</p>
                {user?.role === 'PROVIDER' && (
                  <Link href="/services/create">
                    <Button size="lg">Add Your First Service</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-2 shadow-2xl hover:shadow-3xl transition-all">
            <CardContent className="p-12 space-y-8 text-center">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
                <p className="text-xl opacity-90 max-w-3xl mx-auto">
                  Join 50,000+ satisfied customers and 1,000+ trusted providers on BookYourService
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Instant Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Verified Providers</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">24/7 Support</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Best Prices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Money Back</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {user ? (
                  <Link href="/services" className="flex-1">
                    <Button size="lg" variant="secondary" className="w-full shadow-md hover:shadow-lg">
                      <Search className="w-5 h-5 mr-2" />
                      Browse Services
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup" className="flex-1">
                      <Button size="lg" variant="secondary" className="w-full shadow-md hover:shadow-lg">
                        Create Account
                      </Button>
                    </Link>
                    <Link href="/services" className="flex-1">
                      <Button size="lg" variant="outline" className="w-full border-2 border-primary-foreground/20 hover:border-primary-foreground/40">
                        <Globe className="w-5 h-5 mr-2" />
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

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/50 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">BookYourService</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                India's leading service marketplace connecting customers with verified professionals
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Browse Services</Link>
                <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</Link>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-sm">
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="/refund" className="text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>support@bookyourservice.com</p>
                <p>+91 98765 43210</p>
                <p className="pt-2">Available 24/7</p>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 BookYourService. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
