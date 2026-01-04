import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  Star,
  Verified,
  ExpandMore,
  Favorite,
  FavoriteBorder,
  Share,
  LocalOffer,
  CheckCircle,
  Info,
  Photo,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';

interface ServiceDetail {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
  inclusions: string[];
  exclusions: string[];
  requirements: string[];
  providers: Array<{
    id: string;
    name: string;
    avatar: string;
    rating: number;
    completedJobs: number;
    price: number;
    distance: string;
    available: boolean;
  }>;
}

interface ServiceDetailPageProps {
  serviceId?: string;
  onBookNow?: (providerId: string) => void;
  onAddToFavorites?: () => void;
  onShare?: () => void;
}

const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceId = 'SVC001',
  onBookNow,
  onAddToFavorites,
  onShare,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock service data
  const service: ServiceDetail = {
    id: serviceId,
    name: 'Professional Home Cleaning',
    category: 'Home Services',
    description: 'Comprehensive home cleaning service including dusting, vacuuming, mopping, and bathroom/kitchen deep cleaning. Our professional cleaners use eco-friendly products and follow strict hygiene protocols.',
    price: 599,
    duration: '2-3 hours',
    rating: 4.8,
    reviewCount: 1250,
    images: [
      '/api/placeholder/400/300',
      '/api/placeholder/400/300',
      '/api/placeholder/400/300',
      '/api/placeholder/400/300',
    ],
    features: [
      'Eco-friendly cleaning products',
      'Trained & verified professionals',
      'Satisfaction guarantee',
      'Flexible scheduling',
      'Real-time tracking',
    ],
    inclusions: [
      'Dusting and wiping all surfaces',
      'Vacuuming carpets and floors',
      'Mopping hard floors',
      'Bathroom deep cleaning',
      'Kitchen cleaning',
      'Trash removal',
    ],
    exclusions: [
      'Wall painting',
      'Carpet shampooing',
      'Window exterior cleaning',
      'Major repairs',
    ],
    requirements: [
      'Access to all rooms',
      'Water and electricity available',
      'Pets secured if applicable',
      'Valuables secured',
    ],
    providers: [
      {
        id: 'P001',
        name: 'Rajesh Kumar',
        avatar: '/api/placeholder/60/60',
        rating: 4.9,
        completedJobs: 450,
        price: 599,
        distance: '2.3 km',
        available: true,
      },
      {
        id: 'P002',
        name: 'Priya Sharma',
        avatar: '/api/placeholder/60/60',
        rating: 4.7,
        completedJobs: 320,
        price: 649,
        distance: '3.1 km',
        available: true,
      },
      {
        id: 'P003',
        name: 'Amit Singh',
        avatar: '/api/placeholder/60/60',
        rating: 4.6,
        completedJobs: 280,
        price: 579,
        distance: '4.2 km',
        available: false,
      },
    ],
  };

  const handleBookNow = (providerId: string) => {
    setSelectedProvider(providerId);
    onBookNow?.(providerId);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onAddToFavorites?.();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: service.description,
        url: window.location.href,
      });
    }
    onShare?.();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {service.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip label={service.category} color="primary" size="small" />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={service.rating} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {service.rating} ({service.reviewCount} reviews)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <AccessTime sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {service.duration}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {service.description}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <IconButton onClick={handleToggleFavorite}>
                  {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  ₹{service.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Starting price
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Service Gallery
          </Typography>
          <Grid container spacing={2}>
            {service.images.map((image, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper
                  sx={{
                    height: 150,
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Photo sx={{ color: 'white', fontSize: 40, opacity: 0.7 }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
        >
          <Tab label="Providers" />
          <Tab label="Details" />
          <Tab label="Reviews" />
        </Tabs>

        {/* Providers Tab */}
        {selectedTab === 0 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Available Providers
            </Typography>
            <List>
              {service.providers.map((provider) => (
                <ListItem key={provider.id} divider sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <Box sx={{ display: 'flex', width: '100%', mb: 2 }}>
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          provider.available ? (
                            <CheckCircle sx={{ bgcolor: 'white', borderRadius: '50%', fontSize: 16 }} color="success" />
                          ) : null
                        }
                      >
                        <Avatar src={provider.avatar} sx={{ width: 60, height: 60 }} />
                      </Badge>
                    </ListItemAvatar>
                    <Box sx={{ flex: 1, ml: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6">{provider.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Rating value={provider.rating} readOnly size="small" />
                            <Typography variant="body2">({provider.completedJobs} jobs)</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                            {provider.distance} away
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            ₹{provider.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.duration}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={!provider.available}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleBookNow(provider.id)}
                      disabled={!provider.available}
                    >
                      {provider.available ? 'Book Now' : 'Unavailable'}
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        )}

        {/* Details Tab */}
        {selectedTab === 1 && (
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  What's Included
                </Typography>
                <List dense>
                  {service.inclusions.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <CheckCircle color="success" />
                      </ListItemAvatar>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  What's Not Included
                </Typography>
                <List dense>
                  {service.exclusions.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Info color="warning" />
                      </ListItemAvatar>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <List dense>
              {service.requirements.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Key Features
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {service.features.map((feature, index) => (
                <Chip key={index} label={feature} variant="outlined" />
              ))}
            </Box>
          </CardContent>
        )}

        {/* Reviews Tab */}
        {selectedTab === 2 && (
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                Customer Reviews
              </Typography>
              <Rating value={service.rating} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {service.rating} out of 5 ({service.reviewCount} reviews)
              </Typography>
            </Box>

            {/* Mock reviews */}
            {[1, 2, 3].map((review) => (
              <Card key={review} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">Customer Name</Typography>
                        <Rating value={5} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        2 days ago
                      </Typography>
                      <Typography variant="body2">
                        Excellent service! The cleaner was professional, thorough, and used eco-friendly products.
                        Highly recommended for anyone looking for quality home cleaning services.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <IconButton size="small">
                          <ThumbUp fontSize="small" />
                        </IconButton>
                        <Typography variant="caption">12</Typography>
                        <IconButton size="small">
                          <ThumbDown fontSize="small" />
                        </IconButton>
                        <Typography variant="caption">0</Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => handleBookNow(service.providers[0].id)}>
              Book Now
            </Button>
            <Button variant="outlined" size="large">
              Compare Providers
            </Button>
            <Button variant="outlined" size="large">
              View on Map
            </Button>
            <Button variant="outlined" size="large">
              Contact Support
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ServiceDetailPage;