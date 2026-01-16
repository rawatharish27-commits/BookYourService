import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Rating,
  TextField,
  InputAdornment,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  LocationOn,
  FilterList,
  Sort,
  Star,
  AccessTime,
  LocalOffer,
  Verified,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';

interface Service {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: string;
  image: string;
  provider: {
    name: string;
    avatar: string;
    verified: boolean;
    experience: number;
  };
  distance: number;
  estimatedTime: string;
  discount?: number;
  isPopular?: boolean;
  tags: string[];
}

interface FilterOptions {
  priceRange: [number, number];
  rating: number | null;
  distance: number;
  availability: string;
  verifiedOnly: boolean;
  sortBy: string;
}

const CategoryBrowse: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 2000],
    rating: null,
    distance: 10,
    availability: 'any',
    verifiedOnly: false,
    sortBy: 'rating',
  });

  // Mock categories
  const categories = [
    {
      id: 'home-cleaning',
      name: 'Home Cleaning',
      icon: '🧹',
      serviceCount: 45,
      description: 'Professional cleaning services for your home',
      color: '#4CAF50',
    },
    {
      id: 'plumbing',
      name: 'Plumbing',
      icon: '🔧',
      serviceCount: 32,
      description: 'Expert plumbing repair and installation',
      color: '#2196F3',
    },
    {
      id: 'electrical',
      name: 'Electrical',
      icon: '⚡',
      serviceCount: 28,
      description: 'Electrical repairs and installations',
      color: '#FF9800',
    },
    {
      id: 'painting',
      name: 'Painting',
      icon: '🎨',
      serviceCount: 24,
      description: 'Interior and exterior painting services',
      color: '#9C27B0',
    },
    {
      id: 'carpentry',
      name: 'Carpentry',
      icon: '🔨',
      serviceCount: 19,
      description: 'Woodwork and furniture repair',
      color: '#795548',
    },
    {
      id: 'appliance-repair',
      name: 'Appliance Repair',
      icon: '🔌',
      serviceCount: 35,
      description: 'Repair household appliances',
      color: '#607D8B',
    },
    {
      id: 'gardening',
      name: 'Gardening',
      icon: '🌱',
      serviceCount: 16,
      description: 'Garden maintenance and landscaping',
      color: '#8BC34A',
    },
    {
      id: 'pest-control',
      name: 'Pest Control',
      icon: '🐛',
      serviceCount: 22,
      description: 'Pest elimination and prevention',
      color: '#F44336',
    },
  ];

  // Mock services for selected category
  const services: Service[] = [
    {
      id: '1',
      name: 'Deep Home Cleaning',
      category: 'Home Cleaning',
      rating: 4.8,
      reviewCount: 245,
      price: '₹599',
      image: '/api/placeholder/200/150',
      provider: {
        name: 'Rajesh Kumar',
        avatar: '/api/placeholder/40/40',
        verified: true,
        experience: 8,
      },
      distance: 2.5,
      estimatedTime: '3-4 hours',
      discount: 15,
      isPopular: true,
      tags: ['deep-clean', 'eco-friendly', 'professional'],
    },
    {
      id: '2',
      name: 'Regular House Cleaning',
      category: 'Home Cleaning',
      rating: 4.6,
      reviewCount: 189,
      price: '₹399',
      image: '/api/placeholder/200/150',
      provider: {
        name: 'Priya Sharma',
        avatar: '/api/placeholder/40/40',
        verified: true,
        experience: 5,
      },
      distance: 1.8,
      estimatedTime: '2-3 hours',
      tags: ['regular', 'weekly', 'monthly'],
    },
    {
      id: '3',
      name: 'Move-in/Move-out Cleaning',
      category: 'Home Cleaning',
      rating: 4.9,
      reviewCount: 156,
      price: '₹899',
      image: '/api/placeholder/200/150',
      provider: {
        name: 'Amit Singh',
        avatar: '/api/placeholder/40/40',
        verified: true,
        experience: 6,
      },
      distance: 3.2,
      estimatedTime: '4-6 hours',
      discount: 10,
      tags: ['move-in', 'move-out', 'deep-clean'],
    },
  ];

  const filteredServices = services.filter(service => {
    if (selectedCategory && service.category.toLowerCase().replace(/\s+/g, '-') !== selectedCategory) {
      return false;
    }
    if (searchQuery && !service.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.verifiedOnly && !service.provider.verified) {
      return false;
    }
    if (filters.rating && service.rating < filters.rating) {
      return false;
    }
    if (service.distance > filters.distance) {
      return false;
    }
    return true;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return parseInt(a.price.replace('₹', '')) - parseInt(b.price.replace('₹', ''));
      case 'price-high':
        return parseInt(b.price.replace('₹', '')) - parseInt(a.price.replace('₹', ''));
      case 'distance':
        return a.distance - b.distance;
      default:
        return 0;
    }
  });

  const CategoryCard: React.FC<{ category: typeof categories[0] }> = ({ category }) => (
    <Card
      sx={{
        cursor: 'pointer',
        height: '100%',
        border: selectedCategory === category.id ? 2 : 1,
        borderColor: selectedCategory === category.id ? 'primary.main' : 'divider',
        '&:hover': { boxShadow: 3 },
      }}
      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box
          sx={{
            fontSize: '3rem',
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {category.icon}
        </Box>
        <Typography variant="h6" gutterBottom>
          {category.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {category.description}
        </Typography>
        <Chip
          label={`${category.serviceCount} services`}
          size="small"
          sx={{ bgcolor: category.color, color: 'white' }}
        />
      </CardContent>
    </Card>
  );

  const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
    <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={service.image}
          alt={service.name}
          sx={{ width: '100%', height: 140, objectFit: 'cover' }}
        />
        {service.discount && (
          <Chip
            label={`${service.discount}% OFF`}
            color="error"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}
        {service.isPopular && (
          <Chip
            label="Popular"
            color="primary"
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />
        )}
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar src={service.provider.avatar} sx={{ mr: 2, width: 50, height: 50 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {service.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {service.provider.name}
              </Typography>
              {service.provider.verified && (
                <Verified sx={{ ml: 0.5, fontSize: 16, color: 'primary.main' }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={service.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {service.rating} ({service.reviewCount})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {service.distance} km
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {service.estimatedTime}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {service.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            {service.price}
          </Typography>
          <Button variant="contained" size="small">
            Book Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const FilterPanel: React.FC = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
          </Typography>
          <Slider
            value={filters.priceRange}
            onChange={(_, newValue) => setFilters(prev => ({ ...prev, priceRange: newValue as [number, number] }))}
            valueLabelDisplay="auto"
            min={0}
            max={2000}
            step={50}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormLabel component="legend">Minimum Rating</FormLabel>
          <RadioGroup
            value={filters.rating || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value ? parseFloat(e.target.value) : null }))}
          >
            <FormControlLabel value="" control={<Radio />} label="Any Rating" />
            <FormControlLabel value="4.5" control={<Radio />} label="4.5+ Stars" />
            <FormControlLabel value="4.0" control={<Radio />} label="4.0+ Stars" />
            <FormControlLabel value="3.5" control={<Radio />} label="3.5+ Stars" />
          </RadioGroup>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Maximum Distance: {filters.distance} km
          </Typography>
          <Slider
            value={filters.distance}
            onChange={(_, newValue) => setFilters(prev => ({ ...prev, distance: newValue as number }))}
            valueLabelDisplay="auto"
            min={1}
            max={50}
            step={1}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormLabel component="legend">Availability</FormLabel>
          <RadioGroup
            value={filters.availability}
            onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
          >
            <FormControlLabel value="any" control={<Radio />} label="Any Time" />
            <FormControlLabel value="today" control={<Radio />} label="Available Today" />
            <FormControlLabel value="tomorrow" control={<Radio />} label="Available Tomorrow" />
            <FormControlLabel value="weekend" control={<Radio />} label="Available This Weekend" />
          </RadioGroup>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
            />
          }
          label="Verified Providers Only"
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Browse Services by Category
        </Typography>

        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                fullWidth
              >
                Filters
              </Button>
              <FormControl fullWidth>
                <TextField
                  select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  InputProps={{
                    startAdornment: <Sort sx={{ mr: 1 }} />,
                  }}
                >
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="distance">Nearest First</MenuItem>
                </TextField>
              </FormControl>
            </Box>
          </Grid>
        </Grid>

        {/* Filters Panel */}
        {showFilters && <FilterPanel />}
      </Box>

      {/* Categories Grid */}
      {!selectedCategory && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Choose a Category
          </Typography>
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                <CategoryCard category={category} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Services Grid */}
      {selectedCategory && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              {categories.find(c => c.id === selectedCategory)?.name} Services
            </Typography>
            <Button variant="outlined" onClick={() => setSelectedCategory(null)}>
              Back to Categories
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {sortedServices.length} services found
          </Typography>

          <Grid container spacing={3}>
            {sortedServices.map((service) => (
              <Grid item xs={12} md={6} lg={4} key={service.id}>
                <ServiceCard service={service} />
              </Grid>
            ))}
          </Grid>

          {sortedServices.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No services found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or search criteria
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CategoryBrowse;