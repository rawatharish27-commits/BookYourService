'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Star, MapPin, Clock, Filter } from 'lucide-react';

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
    businessName: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const search = searchParams.get('search');

  useEffect(() => {
    fetchServices(1);
  }, [category, city, search]);

  const fetchServices = async (pageNum: number) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
      });

      if (category) params.append('categoryId', category);
      if (city) params.append('city', city);
      if (search) params.append('search', search);

      const response = await fetch(`/api/services?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
        setPage(data.meta.page);
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Services</h1>
        <p className="text-muted-foreground">
          {total} services available
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="search"
            placeholder="Search services..."
            className="pl-10"
            defaultValue={search || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.location.href = `/services?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`;
              }
            }}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Active Filters */}
      {(category || city || search) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {category && (
            <Badge variant="secondary">Category</Badge>
          )}
          {city && (
            <Badge variant="secondary">{city}</Badge>
          )}
          {search && (
            <Badge variant="secondary">Search: "{search}"</Badge>
          )}
          <Link href="/services">
            <Badge variant="outline" className="cursor-pointer">
              Clear all
            </Badge>
          </Link>
        </div>
      )}

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => fetchServices(page - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => fetchServices(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => fetchServices(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-muted-foreground text-lg mb-4">No services found</p>
            <Link href="/">
              <Button>Browse Categories</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
