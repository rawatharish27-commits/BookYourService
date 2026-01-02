import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Slider,
  Button,
  Chip,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Calculate,
  Info,
  ExpandMore,
  LocalOffer,
  Schedule,
  LocationOn,
  Person,
  Star,
} from '@mui/icons-material';

interface ServicePricing {
  basePrice: number;
  hourlyRate: number;
  travelFee: number;
  materialCost: number;
  discount: number;
  taxRate: number;
  currency: string;
}

interface BookingDetails {
  serviceType: string;
  duration: number; // in hours
  distance: number; // in km
  urgency: 'normal' | 'urgent' | 'emergency';
  providerLevel: 'basic' | 'standard' | 'premium';
  materials: boolean;
  couponCode?: string;
}

const PriceCalculator: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    serviceType: 'home-cleaning',
    duration: 2,
    distance: 5,
    urgency: 'normal',
    providerLevel: 'standard',
    materials: false,
  });

  const [pricing, setPricing] = useState<ServicePricing>({
    basePrice: 500,
    hourlyRate: 250,
    travelFee: 50,
    materialCost: 200,
    discount: 0,
    taxRate: 18,
    currency: '₹',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Mock pricing data based on service type
  const servicePricingData: Record<string, Partial<ServicePricing>> = {
    'home-cleaning': { basePrice: 500, hourlyRate: 250, materialCost: 200 },
    'plumbing': { basePrice: 300, hourlyRate: 400, materialCost: 150 },
    'electrical': { basePrice: 400, hourlyRate: 350, materialCost: 100 },
    'carpentry': { basePrice: 600, hourlyRate: 300, materialCost: 250 },
    'painting': { basePrice: 800, hourlyRate: 280, materialCost: 500 },
    'gardening': { basePrice: 400, hourlyRate: 200, materialCost: 150 },
  };

  useEffect(() => {
    // Update pricing based on service type
    const servicePricing = servicePricingData[bookingDetails.serviceType] || {};
    setPricing(prev => ({
      ...prev,
      ...servicePricing,
    }));
  }, [bookingDetails.serviceType]);

  const calculateTotal = () => {
    const { basePrice, hourlyRate, travelFee, materialCost, discount, taxRate } = pricing;
    const { duration, distance, urgency, providerLevel, materials } = bookingDetails;

    // Base calculation
    let subtotal = basePrice + (hourlyRate * duration);

    // Travel fee (₹50 per km)
    subtotal += travelFee * distance;

    // Material cost
    if (materials) {
      subtotal += materialCost;
    }

    // Provider level multiplier
    const levelMultiplier = {
      basic: 0.8,
      standard: 1.0,
      premium: 1.3,
    };
    subtotal *= levelMultiplier[providerLevel];

    // Urgency multiplier
    const urgencyMultiplier = {
      normal: 1.0,
      urgent: 1.2,
      emergency: 1.5,
    };
    subtotal *= urgencyMultiplier[urgency];

    // Apply coupon discount
    if (appliedCoupon) {
      subtotal -= appliedCoupon.discount;
    }

    // Apply general discount
    subtotal -= discount;

    // Calculate tax
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return {
      subtotal: Math.max(0, subtotal),
      taxAmount,
      total: Math.max(0, total),
      savings: discount + (appliedCoupon?.discount || 0),
    };
  };

  const handleApplyCoupon = () => {
    // Mock coupon validation
    const mockCoupons: Record<string, number> = {
      'WELCOME10': 100,
      'FIRSTBOOK': 150,
      'SAVE20': 200,
      'SPECIAL50': 500,
    };

    if (mockCoupons[couponCode]) {
      setAppliedCoupon({ code: couponCode, discount: mockCoupons[couponCode] });
      setCouponCode('');
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const { subtotal, taxAmount, total, savings } = calculateTotal();

  const breakdownItems = [
    { label: 'Base Price', value: pricing.basePrice },
    { label: `Hourly Rate (${bookingDetails.duration} hrs)`, value: pricing.hourlyRate * bookingDetails.duration },
    { label: `Travel Fee (${bookingDetails.distance} km)`, value: pricing.travelFee * bookingDetails.distance },
    ...(bookingDetails.materials ? [{ label: 'Material Cost', value: pricing.materialCost }] : []),
    { label: 'Provider Level Adjustment', value: 0, note: bookingDetails.providerLevel },
    { label: 'Urgency Adjustment', value: 0, note: bookingDetails.urgency },
    ...(appliedCoupon ? [{ label: `Coupon (${appliedCoupon.code})`, value: -appliedCoupon.discount }] : []),
    ...(pricing.discount > 0 ? [{ label: 'Discount', value: -pricing.discount }] : []),
    { label: `Tax (${pricing.taxRate}%)`, value: taxAmount },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Price Calculator
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Calculate the estimated cost for your service booking. Prices may vary based on actual requirements and provider availability.
      </Alert>

      <Grid container spacing={3}>
        {/* Service Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Service Type"
                    value={bookingDetails.serviceType}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, serviceType: e.target.value }))}
                  >
                    <MenuItem value="home-cleaning">🏠 Home Cleaning</MenuItem>
                    <MenuItem value="plumbing">🔧 Plumbing</MenuItem>
                    <MenuItem value="electrical">⚡ Electrical</MenuItem>
                    <MenuItem value="carpentry">🔨 Carpentry</MenuItem>
                    <MenuItem value="painting">🎨 Painting</MenuItem>
                    <MenuItem value="gardening">🌱 Gardening</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>Duration: {bookingDetails.duration} hours</Typography>
                  <Slider
                    value={bookingDetails.duration}
                    onChange={(_, value) => setBookingDetails(prev => ({ ...prev, duration: value as number }))}
                    min={1}
                    max={8}
                    step={0.5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>Distance: {bookingDetails.distance} km</Typography>
                  <Slider
                    value={bookingDetails.distance}
                    onChange={(_, value) => setBookingDetails(prev => ({ ...prev, distance: value as number }))}
                    min={1}
                    max={50}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Urgency"
                    value={bookingDetails.urgency}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, urgency: e.target.value as BookingDetails['urgency'] }))}
                  >
                    <MenuItem value="normal">Normal (24-48 hrs)</MenuItem>
                    <MenuItem value="urgent">Urgent (6-24 hrs)</MenuItem>
                    <MenuItem value="emergency">Emergency (1-6 hrs)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Provider Level"
                    value={bookingDetails.providerLevel}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, providerLevel: e.target.value as BookingDetails['providerLevel'] }))}
                  >
                    <MenuItem value="basic">Basic Provider</MenuItem>
                    <MenuItem value="standard">Standard Provider</MenuItem>
                    <MenuItem value="premium">Premium Provider</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id="materials"
                      checked={bookingDetails.materials}
                      onChange={(e) => setBookingDetails(prev => ({ ...prev, materials: e.target.checked }))}
                    />
                    <label htmlFor="materials" style={{ marginLeft: 8 }}>
                      Include materials and supplies
                    </label>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Price Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Price Breakdown
              </Typography>

              <Box sx={{ mb: 2 }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {breakdownItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item.label}
                            {item.note && (
                              <Chip
                                label={item.note}
                                size="small"
                                sx={{ ml: 1 }}
                                color={item.note === 'premium' ? 'primary' : item.note === 'emergency' ? 'error' : 'default'}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {item.value >= 0 ? '+' : ''}{pricing.currency}{Math.abs(item.value).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Subtotal:</Typography>
                <Typography variant="h6">{pricing.currency}{subtotal.toFixed(2)}</Typography>
              </Box>

              {savings > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                  <Typography>You Save:</Typography>
                  <Typography>-{pricing.currency}{savings.toFixed(2)}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  {pricing.currency}{total.toFixed(2)}
                </Typography>
              </Box>

              {/* Coupon Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Have a coupon code?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {appliedCoupon ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip
                        label={`${appliedCoupon.code} (-${pricing.currency}${appliedCoupon.discount})`}
                        color="success"
                        onDelete={handleRemoveCoupon}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        fullWidth
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode}
                      >
                        Apply
                      </Button>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Important Notes
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Info color="info" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Final prices may vary based on actual service requirements and material usage.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Schedule color="info" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Emergency services attract additional charges for immediate response.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOn color="info" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Travel fees are calculated based on distance from provider's location.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Person color="info" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Premium providers offer specialized skills and equipment.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PriceCalculator;