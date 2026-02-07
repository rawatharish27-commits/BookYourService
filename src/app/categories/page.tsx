'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  image: string | null;
  _count?: {
    services?: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeInactive=false');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Browse Categories</h1>
        <p className="text-xl text-muted-foreground">
          Find the perfect service for your needs
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-48" />
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">{category.icon || '📁'}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  {category._count?.services !== undefined && (
                    <Badge variant="secondary" className="mb-4">
                      {category._count.services} services
                    </Badge>
                  )}
                  <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
                    Explore Services
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-muted-foreground text-lg mb-4">
              No categories found matching "{searchQuery}"
            </p>
            <Button onClick={() => setSearchQuery('')} variant="outline">
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
