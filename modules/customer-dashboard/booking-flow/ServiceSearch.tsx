import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  LocationOn,
  FilterList,
  Clear,
  Star,
  AccessTime,
  LocalOffer,
  TrendingUp,
} from '@mui/icons-material';

interface Service {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: string;
  image: string;
  description: string;
  estimatedTime: string;
  discount?: number;
  isTrending?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  serviceCount: number;
}

const ServiceSearch: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location, setLocation] = useState('Mumbai, Maharashtra');
  const [recentSearches] = useState([
    'Home Cleaning',
    'Plumbing Repair',
    'AC Service',
    'Car Wash',
  ]);

  // Mock data
  const categories: Category[] = [
    { id: 'home', name: 'Home Services', icon: '🏠', serviceCount: 25 },
    { id: 'vehicle', name: 'Vehicle Services', icon: '🚗', serviceCount: 12 },
    { id: 'beauty', name: 'Beauty & Wellness', icon: '💄', serviceCount: 18 },
    { id: 'health', name: 'Health & Fitness', icon: '🏃', serviceCount: 15 },
    { id: 'education', name: 'Education', icon: '📚', serviceCount: 8 },
    { id: 'events', name: 'Events', icon: '🎉', serviceCount: 10 },
    { id: 'repairs', name: 'Repairs', icon: '🔧', serviceCount: 20 },
    { id: 'others', name: 'Others', icon: '📦', serviceCount: 15 },
  ];

  const searchResults: Service[] = [
    {
      id: '1',
      name: 'Home Cleaning',
      category: 'Home Services',
      rating: 4.8,
      reviewCount: 1250,
      price: '₹299',
      image: '/api/placeholder/100/100',
      description: 'Professional home cleaning service with eco-friendly products',
      estimatedTime: '2-3 hours',
      discount: 20,
      isTrending: true,
    },
    {
      id: '2',
      name: 'Plumbing Repair',
      category: 'Home Services',
      rating: 4.6,
      reviewCount: 890,
      price: '₹199',
      image: '/api/placeholder/100/100',
      description: 'Expert plumbing repair and installation services',
      estimatedTime: '1-2 hours',
      isTrending: false,
    },
    {
      id: '3',
      name: 'AC Service & Repair',
      category: 'Home Services',
      rating: 4.7,
      reviewCount: 654,
      price: '₹399',
      image: '/api/placeholder/100/100',
      description: 'Complete AC maintenance, repair and installation',
      estimatedTime: '2-4 hours',
      discount: 15,
      isTrending: true,
    },
    {
      id: '4',
      name: 'Car Wash & Detailing',
      category: 'Vehicle Services',
      rating: 4.5,
      reviewCount: 432,
      price: '₹149',
      image: '/api/placeholder/100/100',
      description: 'Complete car washing and detailing service',
      estimatedTime: '1-1.5 hours',
      isTrending: false,
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In real app, this would trigger API call
    console.log('Searching for:', query);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    // In real app, this would filter services
  };

  const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
    <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            src={service.image}
            variant="rounded"
            sx={{ width: 60, height: 60, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {service.name}
              </Typography>
              {service.isTrending && (
                <Chip
                  label="Trending"
                  color="secondary"
                  size="small"
                  icon={<TrendingUp />}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {service.category}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={service.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {service.rating} ({service.reviewCount})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {service.estimatedTime}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {service.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
              {service.price}
              {service.discount && (
                <Typography variant="body2" color="error.main" sx={{ ml: 1 }}>
                  ({service.discount}% off)
                </Typography>
              )}
            </Typography>
          </Box>
          <Button variant="contained" size="small">
            Book Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Find Services
        </Typography>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">{location}</Typography>
          <Button size="small" sx={{ ml: 2 }}>
            Change
          </Button>
        </Box>

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search for services (e.g., cleaning, plumbing, AC repair...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Recent Searches */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Recent Searches:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {recentSearches.map((search) => (
                <Chip
                  key={search}
                  label={search}
                  onClick={() => handleSearch(search)}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              startIcon={<FilterList />}
              variant="outlined"
              size="small"
            >
              Filters
            </Button>
            <Typography variant="body2" color="text.secondary">
              {searchResults.length} services found
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Categories */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Browse by Category
        </Typography>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} key={category.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedCategory === category.id ? 2 : 1,
                  borderColor: selectedCategory === category.id ? 'primary.main' : 'divider',
                  '&:hover': { boxShadow: 2 },
                }}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    {category.icon}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.serviceCount} services
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Search Results */}
      <Box>
        <Typography variant="h5" gutterBottom>
          {searchQuery ? `Results for "${searchQuery}"` : 'Popular Services'}
        </Typography>
        <Grid container spacing={3}>
          {searchResults.map((service) => (
            <Grid item xs={12} md={6} key={service.id}>
              <ServiceCard service={service} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Load More */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="outlined" size="large">
          Load More Services
        </Button>
      </Box>
    </Box>
  );
};

export default ServiceSearch;