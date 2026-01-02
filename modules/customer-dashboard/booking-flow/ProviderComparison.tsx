import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Checkbox,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Star,
  LocationOn,
  AccessTime,
  Verified,
  Work,
  School,
  ThumbUp,
  Compare,
  Clear,
  CheckCircle,
  Cancel,
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
  distance: number;
  hourlyRate: string;
  isVerified: boolean;
  isOnline: boolean;
  specialties: string[];
  languages: string[];
  availability: string;
  about: string;
  certifications: string[];
  insurance: boolean;
  backgroundCheck: boolean;
}

const ProviderComparison: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Mock providers data
  const providers: Provider[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      avatar: '/api/placeholder/80/80',
      rating: 4.8,
      reviewCount: 245,
      experience: 8,
      completedJobs: 1250,
      responseTime: '< 30 mins',
      distance: 2.5,
      hourlyRate: '₹299',
      isVerified: true,
      isOnline: true,
      specialties: ['Home Cleaning', 'Deep Cleaning', 'Office Cleaning'],
      languages: ['English', 'Hindi', 'Marathi'],
      availability: 'Available Today',
      about: 'Professional cleaner with 8+ years of experience. I provide thorough, reliable cleaning services.',
      certifications: ['Cleaning Certification', 'Safety Training'],
      insurance: true,
      backgroundCheck: true,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      avatar: '/api/placeholder/80/80',
      rating: 4.6,
      reviewCount: 189,
      experience: 5,
      completedJobs: 890,
      responseTime: '< 1 hour',
      distance: 1.8,
      hourlyRate: '₹249',
      isVerified: true,
      isOnline: false,
      specialties: ['Regular Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning'],
      languages: ['English', 'Hindi'],
      availability: 'Available Tomorrow',
      about: 'Experienced cleaner specializing in regular home maintenance and deep cleaning.',
      certifications: ['Cleaning Professional'],
      insurance: true,
      backgroundCheck: true,
    },
    {
      id: '3',
      name: 'Amit Singh',
      avatar: '/api/placeholder/80/80',
      rating: 4.9,
      reviewCount: 156,
      experience: 6,
      completedJobs: 756,
      responseTime: '< 45 mins',
      distance: 3.2,
      hourlyRate: '₹349',
      isVerified: true,
      isOnline: true,
      specialties: ['Deep Cleaning', 'Move-in Cleaning', 'Post-construction Cleaning'],
      languages: ['English', 'Hindi', 'Punjabi'],
      availability: 'Available Today',
      about: 'Specialized in deep cleaning and post-construction cleanup with premium service quality.',
      certifications: ['Deep Cleaning Specialist', 'Safety Certified'],
      insurance: true,
      backgroundCheck: true,
    },
    {
      id: '4',
      name: 'Sneha Patel',
      avatar: '/api/placeholder/80/80',
      rating: 4.4,
      reviewCount: 98,
      experience: 3,
      completedJobs: 234,
      responseTime: '< 2 hours',
      distance: 4.1,
      hourlyRate: '₹199',
      isVerified: false,
      isOnline: true,
      specialties: ['Regular Cleaning', 'Laundry'],
      languages: ['English', 'Hindi', 'Gujarati'],
      availability: 'Available This Week',
      about: 'Reliable cleaner offering affordable regular cleaning services for homes and apartments.',
      certifications: [],
      insurance: false,
      backgroundCheck: true,
    },
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : prev.length < 3 ? [...prev, providerId] : prev
    );
  };

  const removeProvider = (providerId: string) => {
    setSelectedProviders(prev => prev.filter(id => id !== providerId));
  };

  const selectedProviderData = providers.filter(provider =>
    selectedProviders.includes(provider.id)
  );

  const ProviderCard: React.FC<{ provider: Provider; isSelected: boolean }> = ({ provider, isSelected }) => (
    <Card
      sx={{
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 },
      }}
      onClick={() => handleProviderSelect(provider.id)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Checkbox
            checked={isSelected}
            onChange={() => handleProviderSelect(provider.id)}
            sx={{ mr: 1 }}
          />
          <Avatar src={provider.avatar} sx={{ width: 60, height: 60, mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">{provider.name}</Typography>
              {provider.isVerified && (
                <Verified sx={{ ml: 1, color: 'primary.main' }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={provider.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {provider.rating} ({provider.reviewCount})
                </Typography>
              </Box>
              <Chip
                label={provider.isOnline ? 'Online' : 'Offline'}
                color={provider.isOnline ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Experience</Typography>
            <Typography variant="body1">{provider.experience} years</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Rate</Typography>
            <Typography variant="body1" color="primary">{provider.hourlyRate}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Distance</Typography>
            <Typography variant="body1">{provider.distance} km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Response</Typography>
            <Typography variant="body1">{provider.responseTime}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Specialties
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {provider.specialties.slice(0, 3).map((specialty) => (
              <Chip key={specialty} label={specialty} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>

        <Button
          variant={isSelected ? 'contained' : 'outlined'}
          fullWidth
          disabled={isSelected && selectedProviders.length >= 3 && !selectedProviders.includes(provider.id)}
        >
          {isSelected ? 'Selected' : 'Compare'}
        </Button>
      </CardContent>
    </Card>
  );

  const ComparisonTable: React.FC = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Provider</TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Avatar src={provider.avatar} sx={{ width: 40, height: 40, mr: 1 }} />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {provider.name}
                    </Typography>
                    <IconButton size="small" onClick={() => removeProvider(provider.id)}>
                      <Clear fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2" fontWeight="medium">Rating</Typography>
            </TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Rating value={provider.rating} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {provider.rating}
                  </Typography>
                </Box>
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2" fontWeight="medium">Experience</Typography>
            </TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                <Typography variant="body2">{provider.experience} years</Typography>
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2" fontWeight="medium">Hourly Rate</Typography>
            </TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                <Typography variant="body2" color="primary" fontWeight="medium">
                  {provider.hourlyRate}
                </Typography>
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2" fontWeight="medium">Distance</Typography>
            </TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                <Typography variant="body2">{provider.distance} km</Typography>
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2" fontWeight="medium">Response Time</Typography>
            </TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                <Typography variant="body2">{provider.responseTime}</Typography>
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2" fontWeight="medium">Verified</Typography>
            </TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                {provider.isVerified ? (
                  <CheckCircle color="success" />
                ) : (
                  <Cancel color="error" />
                )}
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2" fontWeight="medium">Insurance</Typography>
            </TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                {provider.insurance ? (
                  <CheckCircle color="success" />
                ) : (
                  <Cancel color="error" />
                )}
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2" fontWeight="medium">Languages</Typography>
            </TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                <Typography variant="body2">{provider.languages.join(', ')}</Typography>
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="body2" fontWeight="medium">Action</Typography>
            </TableCell>
            {selectedProviderData.map((provider) => (
              <TableCell key={provider.id} align="center">
                <Button variant="contained" size="small">
                  Book Now
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Compare Providers
      </Typography>

      {/* Instructions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" paragraph>
            Select up to 3 providers to compare their ratings, experience, pricing, and other key factors side by side.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label={`${selectedProviders.length}/3 selected`} color="primary" />
            <Typography variant="body2" color="text.secondary">
              Click on providers below to add them to comparison
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Selected Providers Summary */}
      {selectedProviders.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comparing {selectedProviders.length} Provider{selectedProviders.length > 1 ? 's' : ''}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedProviderData.map((provider) => (
                <Chip
                  key={provider.id}
                  avatar={<Avatar src={provider.avatar} />}
                  label={provider.name}
                  onDelete={() => removeProvider(provider.id)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                startIcon={<Compare />}
              >
                Switch to {viewMode === 'table' ? 'Card' : 'Table'} View
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Comparison View */}
      {selectedProviders.length > 0 ? (
        viewMode === 'table' ? (
          <ComparisonTable />
        ) : (
          <Grid container spacing={3}>
            {selectedProviderData.map((provider) => (
              <Grid item xs={12} md={4} key={provider.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Avatar src={provider.avatar} sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }} />
                      <Typography variant="h6">{provider.name}</Typography>
                      {provider.isVerified && (
                        <Chip icon={<Verified />} label="Verified" color="success" size="small" sx={{ mt: 1 }} />
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Rating</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={provider.rating} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {provider.rating}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Experience</Typography>
                        <Typography variant="body1">{provider.experience} years</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Rate</Typography>
                        <Typography variant="body1" color="primary">{provider.hourlyRate}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Distance</Typography>
                        <Typography variant="body1">{provider.distance} km</Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Specialties
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {provider.specialties.map((specialty) => (
                          <Chip key={specialty} label={specialty} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>

                    <Button variant="contained" fullWidth>
                      Book {provider.name}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        /* Provider Selection */
        <Box>
          <Typography variant="h5" gutterBottom>
            Select Providers to Compare
          </Typography>
          <Grid container spacing={3}>
            {providers.map((provider) => (
              <Grid item xs={12} md={6} lg={4} key={provider.id}>
                <ProviderCard
                  provider={provider}
                  isSelected={selectedProviders.includes(provider.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ProviderComparison;