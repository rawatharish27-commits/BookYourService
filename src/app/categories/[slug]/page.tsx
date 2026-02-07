'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Clock, Star } from 'lucide-react';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
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
    businessName: string | null;
    trustScore: number;
  };
}

export default function CategoryDetailPage() {
  const params = useParams();
  const [category, setCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  useEffect(() => {
    if (params.slug) {
      fetchCategoryData();
    }
  }, [params.slug]);

  const fetchCategoryData = async () => {
    try {
      const catResponse = await fetch(`/api/categories/${params.slug}`);
      const catData = await catResponse.json();

      if (catData.success) {
        setCategory(catData.data);
        setSubCategories(catData.data.subCategories || []);
      }

      await fetchServices();
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const urlParams = new URLSearchParams();
      urlParams.append('limit', '12');

      if (selectedSubCategory) {
        urlParams.append('subCategoryId', selectedSubCategory);
      }

      if (searchQuery) {
        urlParams.append('search', searchQuery);
      }

      const response = await fetch(`/api/services?${urlParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedSubCategory, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm text-muted-foreground">
        <Link href="/categories" className="hover:text-primary">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-foreground">
          {category?.name || 'Loading...'}
        </span>
      </nav>

      {isLoading ? (
        <div className="space-y-6">
          <Card className="h-32 animate-pulse" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Card key={i} className="h-64 animate-pulse" />)}
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{category?.name}</h1>
            {category?.description && (
              <p className="text-xl text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>

          {/* Subcategories & Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Subcategories */}
                <div className="flex-1">
                  <h3 className="font-semibold mb-4">Subcategories</h3>
                  <div className="space-y-2">
                    <Button
                      variant={selectedSubCategory === '' ? 'default' : 'outline'}
                      onClick={() => setSelectedSubCategory('')}
                      className="w-full justify-start"
                    >
                      All Services
                    </Button>
                    {subCategories.map((sub) => (
                      <Button
                        key={sub.id}
                        variant={selectedSubCategory === sub.id ? 'default' : 'outline'}
                        onClick={() => setSelectedSubCategory(sub.id)}
                        className="w-full justify-start"
                      >
                        {sub.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="md:block w-px-8"></div>

                {/* Search */}
                <div className="w-full md:w-80">
                  <h3 className="font-semibold mb-4">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Grid */}
          {services.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
                    <CardContent className="p-0">
                      {/* Service Image */}
                      <div className="aspect-video w-full bg-muted relative overflow-hidden">
                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary flex items-center justify-center">
                          <span className="text-6xl">📋</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold line-clamp-1 flex-1">
                            {service.title}
                          </h3>
                          {service.averageRating > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {service.averageRating.toFixed(1)}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {service.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{service.durationMinutes} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{service.city || 'Location'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <span className="text-2xl font-bold">₹{service.basePrice.toLocaleString()}</span>
                          </div>
                          <Button size="sm">
                            Book Now
                          </Button>
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
                <p className="text-muted-foreground text-lg mb-4">
                  No services found in this category
                </p>
                <Link href="/categories">
                  <Button>
                    Browse All Categories
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
