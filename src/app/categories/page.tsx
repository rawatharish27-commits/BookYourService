'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, MapPin, Star, TrendingUp, Filter, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  description: string | null;
  _count?: {
    services?: number;
  };
  subCategories?: Array<{
    id: string;
    name: string;
  }>;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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

  const displayedCategories = showAll ? filteredCategories : filteredCategories.slice(0, 12);
  const hasMore = filteredCategories.length > 12;

  const totalServices = categories.reduce((sum, cat) => sum + (cat._count?.services || 0), 0);

  const popularCategories = categories.slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 px-4">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto max-w-6xl text-center relative">
          <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            {categories.length} Categories with {totalServices}+ Services
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Explore All Service Categories
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse through 32+ comprehensive service categories with 640+ specialized subcategories
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories (e.g., Home Maintenance, Beauty & Wellness)..."
              className="pl-12 h-14 text-base border-2 shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex gap-2">
              <kbd className="px-2 py-1 text-xs bg-muted rounded border">⌘ K</kbd>
            </div>
          </div>
        </div>

        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl"></div>
      </section>

      {/* Popular Categories Section */}
      {!searchQuery && !showAll && (
        <section className="py-12 px-4 border-b bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <h2 className="text-2xl font-bold whitespace-nowrap">Most Popular Categories</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {popularCategories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="group hover:shadow-xl transition-all border-2 hover:border-primary/40 cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <span className="text-4xl">{category.icon || '📦'}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Badge */}
                        {category._count?.services && (
                          <Badge variant="secondary" className="absolute bottom-2 right-2 z-10">
                            {category._count.services}
                          </Badge>
                        )}
                      </div>

                      {/* Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/60 p-3">
                        <h3 className="text-white text-sm font-semibold text-center line-clamp-1">
                          {category.name}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Categories Section */}
      <section className="py-12 px-4 flex-1">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {searchQuery ? `Search Results (${filteredCategories.length})` : 'All Categories'}
              </h2>
              <p className="text-muted-foreground">
                {hasMore && !showAll ? `Showing 12 of ${filteredCategories.length} categories` : `Showing all ${filteredCategories.length} categories`}
              </p>
            </div>
            {hasMore && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAll(!showAll)}
                className="shadow-sm hover:shadow-md transition-all"
              >
                {showAll ? 'Show Less' : `View All ${filteredCategories.length} Categories`}
                <ChevronRight className={`ml-2 w-5 h-5 transition-transform ${!showAll && 'rotate-90'}`} />
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((i) => (
                <Card key={i} className="animate-pulse h-40 border-2" />
              ))}
            </div>
          ) : displayedCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayedCategories.map((category, index) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card
                    className="group hover:shadow-xl transition-all border-2 hover:border-primary/40 cursor-pointer overflow-hidden"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <CardContent className="p-0 h-full">
                      <div className="h-full relative flex flex-col">
                        {/* Image Section */}
                        <div className="aspect-square relative overflow-hidden">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className={`w-full h-full object-cover transition-transform duration-300 ${hoveredCategory === category.id ? 'scale-110' : ''}`}
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center transition-transform duration-300 ${hoveredCategory === category.id ? 'scale-110' : ''}`}>
                              <span className="text-4xl">{category.icon || '📦'}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          {/* Icon Badge */}
                          <Badge className="absolute top-2 left-2 z-10 bg-primary/90 backdrop-blur-sm">
                            {category.icon}
                          </Badge>

                          {/* Service Count Badge */}
                          {category._count?.services && (
                            <Badge variant="secondary" className="absolute bottom-2 right-2 z-10">
                              {category._count.services}
                            </Badge>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-4 flex-1 flex flex-col justify-between bg-background">
                          <div className="space-y-2">
                            <h3 className="font-bold text-lg line-clamp-2 min-h-[2.8rem]">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {category.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {category.subCategories && category.subCategories.length > 0 && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Filter className="w-4 h-4" />
                                    {category.subCategories.length} subcategories
                                  </span>
                                </>
                              )}
                              {category._count?.services && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {category._count.services} services
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-primary">
                              Explore
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center p-16">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold">No categories found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or browse all categories
                  </p>
                  <Button
                    size="lg"
                    onClick={() => {
                      setSearchQuery('');
                      setShowAll(false);
                    }}
                    className="mt-4"
                  >
                    Browse All Categories
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
