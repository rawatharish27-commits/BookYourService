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
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  Person,
  CheckCircle,
  Schedule,
  CalendarToday,
  Payment,
  ConfirmationNumber,
} from '@mui/icons-material';

interface TimeSlot {
  id: string;
  time: string;
  duration: string;
  price: string;
  available: boolean;
  popular?: boolean;
}

interface ServiceDetails {
  name: string;
  provider: {
    name: string;
    avatar: string;
    rating: number;
  };
  date: string;
  address: string;
}

const SlotSelection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);

  // Mock service details
  const serviceDetails: ServiceDetails = {
    name: 'Home Cleaning',
    provider: {
      name: 'Rajesh Kumar',
      avatar: '/api/placeholder/60/60',
      rating: 4.8,
    },
    date: 'Monday, January 15, 2024',
    address: '123 Main Street, Mumbai, Maharashtra',
  };

  // Mock time slots
  const timeSlots: TimeSlot[] = [
    {
      id: '1',
      time: '09:00 AM',
      duration: '2 hours',
      price: '₹299',
      available: true,
      popular: false,
    },
    {
      id: '2',
      time: '11:00 AM',
      duration: '2 hours',
      price: '₹299',
      available: true,
      popular: true,
    },
    {
      id: '3',
      time: '02:00 PM',
      duration: '2 hours',
      price: '₹299',
      available: false,
    },
    {
      id: '4',
      time: '04:00 PM',
      duration: '2 hours',
      price: '₹299',
      available: true,
    },
    {
      id: '5',
      time: '06:00 PM',
      duration: '2 hours',
      price: '₹299',
      available: true,
    },
    {
      id: '6',
      time: '08:00 AM',
      duration: '3 hours',
      price: '₹399',
      available: true,
    },
    {
      id: '7',
      time: '10:00 AM',
      duration: '3 hours',
      price: '₹399',
      available: true,
    },
    {
      id: '8',
      time: '01:00 PM',
      duration: '3 hours',
      price: '₹399',
      available: false,
    },
  ];

  const steps = ['Service Selection', 'Time Slot', 'Confirmation', 'Payment'];

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      setCurrentStep(1); // Move to confirmation step
    }
  };

  const selectedSlotData = timeSlots.find(slot => slot.id === selectedSlot);

  const SlotCard: React.FC<{ slot: TimeSlot }> = ({ slot }) => (
    <Paper
      sx={{
        p: 2,
        cursor: slot.available ? 'pointer' : 'not-allowed',
        border: selectedSlot === slot.id ? 2 : 1,
        borderColor: selectedSlot === slot.id ? 'primary.main' : 'divider',
        opacity: slot.available ? 1 : 0.5,
        '&:hover': slot.available ? { boxShadow: 3 } : {},
        position: 'relative',
      }}
      onClick={() => slot.available && handleSlotSelect(slot.id)}
    >
      {slot.popular && (
        <Chip
          label="Most Popular"
          color="secondary"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">{slot.time}</Typography>
        </Box>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {slot.price}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Duration: {slot.duration}
      </Typography>

      {!slot.available && (
        <Typography variant="body2" color="error.main">
          Not Available
        </Typography>
      )}

      {selectedSlot === slot.id && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="body2" color="success.main" fontWeight="medium">
            Selected
          </Typography>
        </Box>
      )}
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Select Time Slot
      </Typography>

      {/* Progress Indicator */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={currentStep} alternativeLabel={!isMobile}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {currentStep === 0 ? (
        <>
          {/* Service Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={serviceDetails.provider.avatar} sx={{ mr: 2, width: 50, height: 50 }} />
                    <Box>
                      <Typography variant="h6">{serviceDetails.name}</Typography>
                      <Typography variant="body1" color="text.secondary">
                        with {serviceDetails.provider.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          ⭐ {serviceDetails.provider.rating}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">{serviceDetails.date}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">{serviceDetails.address}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Starting from
                    </Typography>
                    <Typography variant="h4" color="primary">
                      ₹299
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      per 2 hours
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Time Slots
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                Select your preferred time slot. Prices may vary based on time and duration.
              </Alert>

              <Grid container spacing={2}>
                {timeSlots.map((slot) => (
                  <Grid item xs={12} sm={6} md={4} key={slot.id}>
                    <SlotCard slot={slot} />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              disabled={!selectedSlot}
              onClick={handleContinue}
              sx={{ minWidth: 200 }}
            >
              Continue to Confirmation
            </Button>
          </Box>
        </>
      ) : (
        /* Confirmation Step */
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
              Confirm Your Booking
            </Typography>

            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              {/* Booking Summary */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Person sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1" fontWeight="medium">
                        {serviceDetails.provider.name}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body1">{serviceDetails.date}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedSlotData?.time} ({selectedSlotData?.duration})
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">{serviceDetails.address}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {selectedSlotData?.price}
                  </Typography>
                </Box>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth={isMobile}
                  onClick={() => setCurrentStep(0)}
                >
                  Change Time Slot
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth={isMobile}
                  startIcon={<Payment />}
                >
                  Proceed to Payment
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                By proceeding, you agree to our terms and conditions
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SlotSelection;