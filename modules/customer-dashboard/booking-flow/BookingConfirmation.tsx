import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  LocationOn,
  Person,
  Payment,
  Star,
  AccessTime,
  Phone,
  Email,
  Home,
  Receipt,
  Print,
  Share,
} from '@mui/icons-material';

interface BookingDetails {
  id: string;
  serviceType: string;
  serviceName: string;
  providerName: string;
  providerRating: number;
  providerImage: string;
  date: string;
  time: string;
  duration: number;
  address: {
    name: string;
    street: string;
    area: string;
    city: string;
    phone: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  paymentMethod: string;
  specialInstructions?: string;
  status: 'confirmed' | 'pending' | 'completed';
}

const BookingConfirmation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [booking] = useState<BookingDetails>({
    id: 'BK2024001',
    serviceType: 'home-cleaning',
    serviceName: 'Home Cleaning Service',
    providerName: 'Rajesh Kumar',
    providerRating: 4.8,
    providerImage: '/api/placeholder/40/40',
    date: '2024-01-20',
    time: '10:00 AM',
    duration: 2,
    address: {
      name: 'John Doe',
      street: '123 Main Street, Apartment 4B',
      area: 'Bandra West',
      city: 'Mumbai, Maharashtra',
      phone: '+91 98765 43210',
    },
    pricing: {
      subtotal: 1000,
      discount: 100,
      tax: 90,
      total: 990,
      currency: '₹',
    },
    paymentMethod: 'HDFC Credit Card (****1234)',
    specialInstructions: 'Please bring eco-friendly cleaning products. Focus on kitchen and bathroom.',
    status: 'confirmed',
  });

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const bookingSteps = [
    'Service Requested',
    'Provider Assigned',
    'Payment Confirmed',
    'Service Scheduled',
  ];

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    // Simulate cancellation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCancelling(false);
    setShowCancelDialog(false);
    alert('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Service Booking',
        text: `Booking confirmed for ${booking.serviceName} on ${booking.date} at ${booking.time}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Booking ID: ${booking.id}\nService: ${booking.serviceName}\nDate: ${booking.date}\nTime: ${booking.time}`);
      alert('Booking details copied to clipboard!');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar sx={{ bgcolor: 'success.main', width: 80, height: 80, mx: 'auto', mb: 2 }}>
          <CheckCircle sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h4" color="success.main" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your service has been successfully booked
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Booking ID: <strong>{booking.id}</strong>
        </Typography>
      </Box>

      {/* Booking Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Booking Progress
          </Typography>
          <Stepper activeStep={3} alternativeLabel={!isMobile}>
            {bookingSteps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Service Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Details
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Avatar
                  src={booking.providerImage}
                  sx={{ width: 60, height: 60, mr: 2 }}
                >
                  {booking.providerName.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {booking.serviceName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body1">
                      {booking.providerName}
                    </Typography>
                    <Star sx={{ ml: 2, mr: 0.5, color: 'warning.main' }} />
                    <Typography variant="body2">
                      {booking.providerRating}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body1">
                        {booking.date} at {booking.time}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body1">
                        {booking.duration} hours
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {booking.specialInstructions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Special Instructions:
                  </Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    "{booking.specialInstructions}"
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Service Address */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Address
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Home color="primary" sx={{ mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="body1" fontWeight="medium" gutterBottom>
                    {booking.address.name}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {booking.address.street}
                    <br />
                    {booking.address.area}
                    <br />
                    {booking.address.city}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      {booking.address.phone}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{booking.pricing.currency}{booking.pricing.subtotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="success.main">Discount:</Typography>
                  <Typography color="success.main">-{booking.pricing.currency}{booking.pricing.discount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax:</Typography>
                  <Typography>{booking.pricing.currency}{booking.pricing.tax}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total Paid:</Typography>
                  <Typography variant="h6" color="primary">
                    {booking.pricing.currency}{booking.pricing.total}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2">
                  Paid via {booking.paymentMethod}
                </Typography>
                <Chip label="Paid" color="success" size="small" sx={{ ml: 2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What's Next?
              </Typography>

              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <Email />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Confirmation Email"
                    secondary="Check your email for booking details"
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <Phone />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Provider Contact"
                    secondary="Provider will call you 30 mins before service"
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircle />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Service Completion"
                    secondary="Rate and review after service is done"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={handlePrintReceipt}
                >
                  Print Receipt
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShareBooking}
                >
                  Share Booking
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                >
                  Track Service
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                >
                  Reschedule
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel Booking
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Important Notes */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Please ensure someone is available at the service address during the scheduled time.
          If you need to make changes, contact us at least 2 hours before the service time.
        </Typography>
      </Alert>

      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
          <Alert severity="warning">
            Cancellation Policy: Free cancellation up to 2 hours before service. Late cancellations may incur charges.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Keep Booking</Button>
          <Button
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
            disabled={isCancelling}
            startIcon={isCancelling ? <CircularProgress size={20} /> : null}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingConfirmation;