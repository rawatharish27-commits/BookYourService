import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  Navigation,
  Phone,
  Message,
  AccessTime,
  Directions,
  MyLocation,
  Refresh,
  CheckCircle,
  Warning,
  Info,
  Call,
  Chat,
} from '@mui/icons-material';

interface ProviderLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

interface ServiceStatus {
  status: 'en-route' | 'arrived' | 'in-progress' | 'completed';
  estimatedArrival: number; // minutes
  actualArrival?: number;
  startedAt?: number;
  completedAt?: number;
  progress: number; // 0-100
}

interface LiveTrackingProps {
  bookingId: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  providerImage: string;
  providerRating: number;
  serviceAddress: {
    lat: number;
    lng: number;
    address: string;
  };
}

const LiveTracking: React.FC<LiveTrackingProps> = ({
  bookingId,
  providerId,
  providerName,
  providerPhone,
  providerImage,
  providerRating,
  serviceAddress,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [providerLocation, setProviderLocation] = useState<ProviderLocation>({
    lat: 19.0760,
    lng: 72.8777,
    accuracy: 10,
    timestamp: Date.now(),
    speed: 25,
    heading: 45,
  });

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    status: 'en-route',
    estimatedArrival: 15,
    progress: 65,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Simulate real-time location updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate provider movement
      setProviderLocation(prev => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
        timestamp: Date.now(),
        speed: 20 + Math.random() * 10,
      }));

      // Update service status
      setServiceStatus(prev => {
        const newProgress = Math.min(100, prev.progress + Math.random() * 2);
        let newStatus = prev.status;

        if (newProgress >= 100) {
          newStatus = 'completed';
        } else if (newProgress >= 80) {
          newStatus = 'in-progress';
        } else if (newProgress >= 20) {
          newStatus = 'arrived';
        }

        return {
          ...prev,
          status: newStatus,
          progress: newProgress,
          estimatedArrival: Math.max(0, prev.estimatedArrival - 1),
        };
      });

      setLastUpdated(Date.now());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleCallProvider = () => {
    window.location.href = `tel:${providerPhone}`;
  };

  const handleMessageProvider = () => {
    // In real app, this would open chat
    alert('Chat feature would open here');
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${serviceAddress.lat},${serviceAddress.lng}`;
    window.open(url, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en-route':
        return 'warning';
      case 'arrived':
        return 'info';
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en-route':
        return <Navigation />;
      case 'arrived':
        return <LocationOn />;
      case 'in-progress':
        return <AccessTime />;
      case 'completed':
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  const getStatusMessage = (status: string, estimatedArrival: number) => {
    switch (status) {
      case 'en-route':
        return `Provider is on the way. Estimated arrival: ${estimatedArrival} mins`;
      case 'arrived':
        return 'Provider has arrived at your location';
      case 'in-progress':
        return 'Service is in progress';
      case 'completed':
        return 'Service completed successfully';
      default:
        return 'Tracking service active';
    }
  };

  const calculateDistance = () => {
    // Simple distance calculation (in real app, use proper geolocation)
    const R = 6371; // Earth's radius in km
    const dLat = (serviceAddress.lat - providerLocation.lat) * Math.PI / 180;
    const dLng = (serviceAddress.lng - providerLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(providerLocation.lat * Math.PI / 180) * Math.cos(serviceAddress.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c * 1000).toFixed(0); // Distance in meters
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Live Tracking</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={isRefreshing ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Directions />}
            onClick={handleGetDirections}
          >
            Get Directions
          </Button>
        </Box>
      </Box>

      {/* Status Alert */}
      <Alert
        severity={serviceStatus.status === 'completed' ? 'success' : 'info'}
        sx={{ mb: 3 }}
        icon={getStatusIcon(serviceStatus.status)}
      >
        <Typography variant="body1" fontWeight="medium">
          {getStatusMessage(serviceStatus.status, serviceStatus.estimatedArrival)}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Provider Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Provider
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={providerImage}
                  sx={{ width: 60, height: 60, mr: 2 }}
                >
                  {providerName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{providerName}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      ⭐ {providerRating}
                    </Typography>
                    <Chip
                      label={serviceStatus.status.replace('-', ' ')}
                      size="small"
                      color={getStatusColor(serviceStatus.status) as any}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                📞 {providerPhone}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                <Button
                  fullWidth={isMobile}
                  variant="contained"
                  startIcon={<Call />}
                  onClick={handleCallProvider}
                  color="primary"
                >
                  Call Provider
                </Button>
                <Button
                  fullWidth={isMobile}
                  variant="outlined"
                  startIcon={<Chat />}
                  onClick={handleMessageProvider}
                >
                  Message
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Map Placeholder */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Live Location
              </Typography>

              {/* Map Placeholder */}
              <Box
                sx={{
                  height: 300,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  🗺️ Interactive Map
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  (Map integration would go here)
                </Typography>

                {/* Provider Location Indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '60%',
                    width: 20,
                    height: 20,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    border: '3px solid white',
                    boxShadow: 2,
                    animation: 'pulse 2s infinite',
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {calculateDistance()}m
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Distance
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {providerLocation.speed?.toFixed(0)} km/h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Speed
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {serviceStatus.estimatedArrival}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ETA (mins)
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      ±{providerLocation.accuracy}m
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Progress */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Service Progress
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Progress</Typography>
              <Typography variant="body2">{serviceStatus.progress.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={serviceStatus.progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Service Address
                  </Typography>
                  <Typography variant="body2">
                    {serviceAddress.address}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Booking ID
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {bookingId}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Safety & Support */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Safety First:</strong> If you feel uncomfortable at any point, please contact our emergency support at
          <strong> +91-1800-XXX-XXXX</strong> or use the SOS button in case of emergency.
        </Typography>
      </Alert>
    </Box>
  );
};

export default LiveTracking;