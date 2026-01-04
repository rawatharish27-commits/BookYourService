import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle,
  Payment,
  Receipt,
  Download,
  Share,
  Print,
  CreditCard,
  AccountBalanceWallet,
  LocalOffer,
  LocationOn,
  AccessTime,
  Person,
  Phone,
  Email,
  Close,
} from '@mui/icons-material';

interface PaymentSummaryProps {
  bookingId?: string;
  serviceName?: string;
  providerName?: string;
  providerImage?: string;
  bookingDate?: string;
  bookingTime?: string;
  serviceAddress?: string;
  subtotal?: number;
  discount?: number;
  couponDiscount?: number;
  gst?: number;
  platformFee?: number;
  total?: number;
  paymentMethod?: string;
  transactionId?: string;
  onDownloadInvoice?: () => void;
  onShareReceipt?: () => void;
  onPrintReceipt?: () => void;
  onClose?: () => void;
}

const PaymentSummaryScreen: React.FC<PaymentSummaryProps> = ({
  bookingId = 'BK2024001',
  serviceName = 'Home Cleaning Service',
  providerName = 'Rajesh Kumar',
  providerImage = '/api/placeholder/60/60',
  bookingDate = '2024-01-15',
  bookingTime = '10:00 AM',
  serviceAddress = '123 Main Street, Bandra West, Mumbai - 400050',
  subtotal = 500,
  discount = 50,
  couponDiscount = 25,
  gst = 45,
  platformFee = 20,
  total = 490,
  paymentMethod = 'Credit Card **** 1234',
  transactionId = 'TXN202400115001',
  onDownloadInvoice,
  onShareReceipt,
  onPrintReceipt,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showFullDetails, setShowFullDetails] = useState(false);

  const steps = [
    'Service Selected',
    'Booking Confirmed',
    'Payment Completed',
    'Service Scheduled',
  ];

  const handleDownloadInvoice = () => {
    // Mock download functionality
    const link = document.createElement('a');
    link.href = '#'; // In real app, this would be the invoice URL
    link.download = `invoice-${bookingId}.pdf`;
    link.click();
    onDownloadInvoice?.();
  };

  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Receipt',
        text: `Payment receipt for ${serviceName}`,
        url: window.location.href,
      });
    }
    onShareReceipt?.();
  };

  const handlePrintReceipt = () => {
    window.print();
    onPrintReceipt?.();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Success Header */}
      <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)` }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 64, color: theme.palette.success.main, mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
            Payment Successful!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your booking has been confirmed
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Booking ID: {bookingId}
          </Typography>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={2} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Service Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Service Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={providerImage} sx={{ width: 60, height: 60, mr: 2 }} />
                <Box>
                  <Typography variant="h6">{serviceName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    by {providerName}
                  </Typography>
                </Box>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <AccessTime />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Date & Time"
                    secondary={`${bookingDate} at ${bookingTime}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <LocationOn />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Service Address"
                    secondary={serviceAddress}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1 }} />
                Payment Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">₹{subtotal}</Typography>
                </Box>
                {discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="success.main">Discount</Typography>
                    <Typography variant="body2" color="success.main">-₹{discount}</Typography>
                  </Box>
                )}
                {couponDiscount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalOffer sx={{ fontSize: 16, mr: 0.5 }} />
                      Coupon Discount
                    </Typography>
                    <Typography variant="body2" color="success.main">-₹{couponDiscount}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">GST (9%)</Typography>
                  <Typography variant="body2">₹{gst}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Platform Fee</Typography>
                  <Typography variant="body2">₹{platformFee}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total Paid</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    ₹{total}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Method
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCard sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body2">{paymentMethod}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Transaction ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {transactionId}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Receipt Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadInvoice}
              sx={{ minWidth: 140 }}
            >
              Download Invoice
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShareReceipt}
              sx={{ minWidth: 140 }}
            >
              Share Receipt
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrintReceipt}
              sx={{ minWidth: 140 }}
            >
              Print Receipt
            </Button>
            {onClose && (
              <Button
                variant="text"
                startIcon={<Close />}
                onClick={onClose}
                sx={{ minWidth: 140 }}
              >
                Close
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Next Steps:</strong> Your service provider will contact you shortly before the scheduled time.
          You can track the service status in your bookings section.
        </Typography>
      </Alert>

      {/* Contact Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Need Help?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Call Support</Typography>
                  <Typography variant="body2" color="text.secondary">1800-XXX-XXXX</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Email Support</Typography>
                  <Typography variant="body2" color="text.secondary">support@bookyourservice.com</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chat sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Live Chat</Typography>
                  <Typography variant="body2" color="text.secondary">Available 24/7</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSummaryScreen;