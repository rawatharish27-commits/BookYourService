import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Verified,
  LocationOn,
  AccessTime,
  Phone,
  Chat,
  Star,
  Work,
  School,
  ThumbUp,
  ThumbDown,
  Share,
  Favorite,
  FavoriteBorder,
  Report,
} from '@mui/icons-material';

interface Provider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experience: number;
  completedJobs: number;
  responseTime: string;
  location: string;
  phone: string;
  isVerified: boolean;
  isOnline: boolean;
  specialties: string[];
  languages: string[];
  about: string;
  hourlyRate: string;
  serviceArea: string[];
}

interface Review {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  date: string;
  serviceType: string;
  helpful: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ProviderProfile: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Mock provider data
  const provider: Provider = {
    id: '1',
    name: 'Rajesh Kumar',
    avatar: '/api/placeholder/150/150',
    rating: 4.8,
    reviewCount: 245,
    experience: 8,
    completedJobs: 1250,
    responseTime: '< 30 mins',
    location: 'Mumbai, Maharashtra',
    phone: '+91 98765 43210',
    isVerified: true,
    isOnline: true,
    specialties: ['Home Cleaning', 'Deep Cleaning', 'Office Cleaning', 'Carpet Cleaning'],
    languages: ['English', 'Hindi', 'Marathi'],
    about: 'Professional cleaner with 8+ years of experience. I provide thorough, reliable cleaning services for homes and offices. All work is guaranteed and I use eco-friendly products.',
    hourlyRate: '₹299',
    serviceArea: ['Mumbai', 'Thane', 'Navi Mumbai'],
  };

  const reviews: Review[] = [
    {
      id: '1',
      customerName: 'Priya Sharma',
      customerAvatar: '/api/placeholder/40/40',
      rating: 5,
      comment: 'Excellent service! Rajesh was very professional and thorough. My house has never been cleaner. Highly recommended!',
      date: '2024-01-15',
      serviceType: 'Home Cleaning',
      helpful: 12,
    },
    {
      id: '2',
      customerName: 'Amit Patel',
      customerAvatar: '/api/placeholder/40/40',
      rating: 4,
      comment: 'Good service overall. Arrived on time and did a decent job. Would book again.',
      date: '2024-01-10',
      serviceType: 'Deep Cleaning',
      helpful: 8,
    },
    {
      id: '3',
      customerName: 'Sneha Gupta',
      customerAvatar: '/api/placeholder/40/40',
      rating: 5,
      comment: 'Very satisfied with the service. Rajesh is punctual, professional, and uses good quality cleaning products.',
      date: '2024-01-08',
      serviceType: 'Office Cleaning',
      helpful: 15,
    },
  ];

  const portfolio = [
    { id: '1', image: '/api/placeholder/200/150', title: 'Home Cleaning' },
    { id: '2', image: '/api/placeholder/200/150', title: 'Office Cleaning' },
    { id: '3', image: '/api/placeholder/200/150', title: 'Deep Cleaning' },
    { id: '4', image: '/api/placeholder/200/150', title: 'Carpet Cleaning' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar src={review.customerAvatar} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">{review.customerName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {review.date}
              </Typography>
            </Box>
            <Rating value={review.rating} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Service: {review.serviceType}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" paragraph>
          {review.comment}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button size="small" startIcon={<ThumbUp />}>
            Helpful ({review.helpful})
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Provider Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: provider.isOnline ? 'success.main' : 'grey.400',
                        border: '2px solid white',
                      }}
                    />
                  }
                >
                  <Avatar
                    src={provider.avatar}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  />
                </Badge>
                <Typography variant="h5" gutterBottom>
                  {provider.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Rating value={provider.rating} readOnly size="small" />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {provider.rating} ({provider.reviewCount} reviews)
                  </Typography>
                </Box>
                {provider.isVerified && (
                  <Chip
                    icon={<Verified />}
                    label="Verified Provider"
                    color="success"
                    size="small"
                  />
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {provider.experience}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Years Exp.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {provider.completedJobs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jobs Done
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {provider.responseTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Response
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {provider.hourlyRate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Starting
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" fullWidth={isMobile}>
                  Book Now
                </Button>
                <Button variant="outlined" startIcon={<Chat />} size="large">
                  Message
                </Button>
                <Button variant="outlined" startIcon={<Phone />} size="large">
                  Call
                </Button>
                <IconButton onClick={() => setIsFavorited(!isFavorited)}>
                  {isFavorited ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
                <IconButton>
                  <Share />
                </IconButton>
                <IconButton>
                  <Report />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Provider Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body1" paragraph>
                {provider.about}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Specialties
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {provider.specialties.map((specialty) => (
                  <Chip key={specialty} label={specialty} size="small" />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Languages
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {provider.languages.map((language) => (
                  <Chip key={language} label={language} size="small" variant="outlined" />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Service Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Location"
                    secondary={provider.location}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Service Area"
                    secondary={provider.serviceArea.join(', ')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Phone"
                    secondary={provider.phone}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Response Time"
                    secondary={provider.responseTime}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Reviews, Portfolio, etc. */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Reviews" />
            <Tab label="Portfolio" />
            <Tab label="Availability" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Customer Reviews ({reviews.length})
          </Typography>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="outlined">Load More Reviews</Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Portfolio
          </Typography>
          <Grid container spacing={2}>
            {portfolio.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card>
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.title}
                    sx={{ width: '100%', height: 150, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ py: 1 }}>
                    <Typography variant="body2" align="center">
                      {item.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Availability
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Availability calendar and booking slots will be displayed here.
          </Typography>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ProviderProfile;