import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  IconButton,
  Badge,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocationOn,
  Search,
  Star,
  AccessTime,
  LocalOffer,
  AccountBalanceWallet,
  Notifications,
  Support,
  Emergency,
  Favorite,
  Share,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';

interface Service {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: string;
  image: string;
  discount?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
}

interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  status: 'confirmed' | 'in-progress' | 'completed';
  date: string;
  time: string;
  price: string;
  providerImage: string;
}

const CustomerDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [location, setLocation] = useState('Detecting location...');
  const [walletBalance, setWalletBalance] = useState(250.00);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);

  // Mock data - in real app, this would come from API
  const popularServices: Service[] = [
    {
      id: '1',
      name: 'Home Cleaning',
      category: 'Home Services',
      rating: 4.8,
      reviewCount: 1250,
      price: '₹299',
      image: '/api/placeholder/150/150',
      discount: 20,
      isPopular: true,
    },
    {
      id: '2',
      name: 'Plumbing Repair',
      category: 'Home Services',
      rating: 4.6,
      reviewCount: 890,
      price: '₹199',
      image: '/api/placeholder/150/150',
      isPopular: true,
    },
    {
      id: '3',
      name: 'Electrical Work',
      category: 'Home Services',
      rating: 4.7,
      reviewCount: 654,
      price: '₹249',
      image: '/api/placeholder/150/150',
      discount: 15,
      isPopular: true,
    },
    {
      id: '4',
      name: 'Car Wash',
      category: 'Vehicle Services',
      rating: 4.5,
      reviewCount: 432,
      price: '₹149',
      image: '/api/placeholder/150/150',
      isPopular: true,
    },
  ];

  const recommendedServices: Service[] = [
    {
      id: '5',
      name: 'AC Repair',
      category: 'Home Services',
      rating: 4.9,
      reviewCount: 567,
      price: '₹399',
      image: '/api/placeholder/150/150',
      isRecommended: true,
    },
    {
      id: '6',
      name: 'Pest Control',
      category: 'Home Services',
      rating: 4.4,
      reviewCount: 321,
      price: '₹349',
      image: '/api/placeholder/150/150',
      isRecommended: true,
    },
  ];

  const activeBookings: Booking[] = [
    {
      id: '1',
      serviceName: 'Home Cleaning',
      providerName: 'Rajesh Kumar',
      status: 'confirmed',
      date: 'Today',
      time: '2:00 PM',
      price: '₹299',
      providerImage: '/api/placeholder/50/50',
    },
    {
      id: '2',
      serviceName: 'Plumbing Repair',
      providerName: 'Amit Singh',
      status: 'in-progress',
      date: 'Tomorrow',
      time: '10:00 AM',
      price: '₹199',
      providerImage: '/api/placeholder/50/50',
    },
  ];

  const offers = [
    {
      id: '1',
      title: 'First Booking Discount',
      description: 'Get 30% off on your first booking',
      code: 'FIRST30',
      validUntil: '2024-12-31',
    },
    {
      id: '2',
      title: 'Weekend Special',
      description: 'Extra 15% off on weekend bookings',
      code: 'WEEKEND15',
      validUntil: '2024-12-31',
    },
  ];

  useEffect(() => {
    // Simulate location detection
    setTimeout(() => {
      setLocation('Mumbai, Maharashtra');
    }, 1000);
  }, []);

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
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" gutterBottom>
          {service.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {service.category}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={service.rating} readOnly size="small" />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {service.rating} ({service.reviewCount})
          </Typography>
        </Box>
        <Typography variant="h6" color="primary">
          {service.price}
        </Typography>
      </CardContent>
    </Card>
  );

  const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={booking.providerImage} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{booking.serviceName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.providerName}
            </Typography>
          </Box>
          <Chip
            label={booking.status}
            color={
              booking.status === 'confirmed' ? 'success' :
              booking.status === 'in-progress' ? 'warning' : 'default'
            }
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {booking.date} at {booking.time}
            </Typography>
            <Typography variant="h6" color="primary">
              {booking.price}
            </Typography>
          </Box>
          <Box>
            <Button size="small" variant="outlined" sx={{ mr: 1 }}>
              Track
            </Button>
            <Button size="small" variant="outlined">
              Chat
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, John!
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">{location}</Typography>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Wallet Balance
                  </Typography>
                  <Typography variant="h5" color="primary">
                    ₹{walletBalance.toFixed(2)}
                  </Typography>
                </Box>
                <AccountBalanceWallet color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Loyalty Points
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {loyaltyPoints.toLocaleString()}
                  </Typography>
                </Box>
                <Star color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Bookings
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {activeBookings.length}
                  </Typography>
                </Box>
                <AccessTime color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    ₹2,450
                  </Typography>
                </Box>
                <LocalOffer color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Search />}
          sx={{ height: 56, justifyContent: 'flex-start' }}
        >
          Search for services...
        </Button>
      </Card>

      {/* Popular Services */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Popular Services</Typography>
          <Button variant="text">View All</Button>
        </Box>
        <Grid container spacing={3}>
          {popularServices.map((service) => (
            <Grid item xs={12} sm={6} md={3} key={service.id}>
              <ServiceCard service={service} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recommended Services */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Recommended for You</Typography>
          <Button variant="text">View All</Button>
        </Box>
        <Grid container spacing={3}>
          {recommendedServices.map((service) => (
            <Grid item xs={12} sm={6} md={3} key={service.id}>
              <ServiceCard service={service} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Active Bookings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Active Bookings
        </Typography>
        {activeBookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </Box>

      {/* Offers & Deals */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Offers & Deals
        </Typography>
        <Grid container spacing={3}>
          {offers.map((offer) => (
            <Grid item xs={12} md={6} key={offer.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {offer.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {offer.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={offer.code} color="primary" />
                    <Button variant="contained" size="small">
                      Apply
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Emergency />}
              sx={{ height: 80, flexDirection: 'column' }}
            >
              Emergency
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Support />}
              sx={{ height: 80, flexDirection: 'column' }}
            >
              Support
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Favorite />}
              sx={{ height: 80, flexDirection: 'column' }}
            >
              Favorites
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Share />}
              sx={{ height: 80, flexDirection: 'column' }}
            >
              Refer
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CustomerDashboard;