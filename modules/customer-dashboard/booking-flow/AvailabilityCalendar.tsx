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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  Person,
  CheckCircle,
  Schedule,
  Today,
  DateRange,
} from '@mui/icons-material';

interface TimeSlot {
  time: string;
  available: boolean;
  price?: string;
  duration?: string;
}

interface DayAvailability {
  date: string;
  dayName: string;
  isToday: boolean;
  isAvailable: boolean;
  slots: TimeSlot[];
}

const AvailabilityCalendar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-15');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('rajesh');

  // Mock providers
  const providers = [
    {
      id: 'rajesh',
      name: 'Rajesh Kumar',
      avatar: '/api/placeholder/40/40',
      rating: 4.8,
      specialty: 'Home Cleaning',
    },
    {
      id: 'priya',
      name: 'Priya Sharma',
      avatar: '/api/placeholder/40/40',
      rating: 4.6,
      specialty: 'Regular Cleaning',
    },
  ];

  // Mock availability data
  const availabilityData: Record<string, DayAvailability[]> = {
    rajesh: [
      {
        date: '2024-01-15',
        dayName: 'Mon',
        isToday: true,
        isAvailable: true,
        slots: [
          { time: '09:00', available: true, price: '₹299', duration: '2h' },
          { time: '11:00', available: true, price: '₹299', duration: '2h' },
          { time: '14:00', available: false, duration: '2h' },
          { time: '16:00', available: true, price: '₹299', duration: '2h' },
          { time: '18:00', available: true, price: '₹299', duration: '2h' },
        ],
      },
      {
        date: '2024-01-16',
        dayName: 'Tue',
        isToday: false,
        isAvailable: true,
        slots: [
          { time: '10:00', available: true, price: '₹299', duration: '2h' },
          { time: '13:00', available: true, price: '₹299', duration: '2h' },
          { time: '15:00', available: false, duration: '2h' },
          { time: '17:00', available: true, price: '₹299', duration: '2h' },
        ],
      },
      {
        date: '2024-01-17',
        dayName: 'Wed',
        isToday: false,
        isAvailable: false,
        slots: [],
      },
      {
        date: '2024-01-18',
        dayName: 'Thu',
        isToday: false,
        isAvailable: true,
        slots: [
          { time: '09:00', available: true, price: '₹299', duration: '2h' },
          { time: '11:00', available: true, price: '₹299', duration: '2h' },
          { time: '14:00', available: true, price: '₹299', duration: '2h' },
        ],
      },
      {
        date: '2024-01-19',
        dayName: 'Fri',
        isToday: false,
        isAvailable: true,
        slots: [
          { time: '10:00', available: true, price: '₹299', duration: '2h' },
          { time: '12:00', available: true, price: '₹299', duration: '2h' },
          { time: '16:00', available: true, price: '₹299', duration: '2h' },
        ],
      },
    ],
    priya: [
      {
        date: '2024-01-15',
        dayName: 'Mon',
        isToday: true,
        isAvailable: true,
        slots: [
          { time: '08:00', available: true, price: '₹249', duration: '2h' },
          { time: '10:00', available: true, price: '₹249', duration: '2h' },
          { time: '15:00', available: false, duration: '2h' },
          { time: '17:00', available: true, price: '₹249', duration: '2h' },
        ],
      },
      {
        date: '2024-01-16',
        dayName: 'Tue',
        isToday: false,
        isAvailable: true,
        slots: [
          { time: '09:00', available: true, price: '₹249', duration: '2h' },
          { time: '11:00', available: true, price: '₹249', duration: '2h' },
          { time: '14:00', available: true, price: '₹249', duration: '2h' },
        ],
      },
    ],
  };

  const currentProvider = providers.find(p => p.id === selectedProvider);
  const currentAvailability = availabilityData[selectedProvider] || [];
  const selectedDayData = currentAvailability.find(day => day.date === selectedDate);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time selection when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const DayCard: React.FC<{ day: DayAvailability }> = ({ day }) => (
    <Card
      sx={{
        cursor: day.isAvailable ? 'pointer' : 'not-allowed',
        border: selectedDate === day.date ? 2 : 1,
        borderColor: selectedDate === day.date ? 'primary.main' : 'divider',
        opacity: day.isAvailable ? 1 : 0.5,
        '&:hover': day.isAvailable ? { boxShadow: 3 } : {},
      }}
      onClick={() => day.isAvailable && handleDateSelect(day.date)}
    >
      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {day.dayName}
        </Typography>
        <Typography variant="h6" sx={{ my: 1 }}>
          {new Date(day.date).getDate()}
        </Typography>
        {day.isToday && (
          <Chip label="Today" color="primary" size="small" />
        )}
        {!day.isAvailable && (
          <Typography variant="caption" color="text.secondary">
            Unavailable
          </Typography>
        )}
        {day.isAvailable && day.slots.length > 0 && (
          <Typography variant="caption" color="success.main">
            {day.slots.filter(slot => slot.available).length} slots
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const TimeSlotButton: React.FC<{ slot: TimeSlot }> = ({ slot }) => (
    <Button
      variant={selectedTime === slot.time ? 'contained' : 'outlined'}
      disabled={!slot.available}
      onClick={() => slot.available && handleTimeSelect(slot.time)}
      sx={{
        minWidth: 120,
        mb: 1,
        mr: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1,
      }}
    >
      <Typography variant="body2" fontWeight="medium">
        {slot.time}
      </Typography>
      {slot.price && (
        <Typography variant="caption" color="primary">
          {slot.price}
        </Typography>
      )}
      {slot.duration && (
        <Typography variant="caption" color="text.secondary">
          {slot.duration}
        </Typography>
      )}
    </Button>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Check Availability
      </Typography>

      {/* Provider Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Provider
          </Typography>
          <Grid container spacing={2}>
            {providers.map((provider) => (
              <Grid item xs={12} sm={6} key={provider.id}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: selectedProvider === provider.id ? 2 : 1,
                    borderColor: selectedProvider === provider.id ? 'primary.main' : 'divider',
                    '&:hover': { boxShadow: 2 },
                  }}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={provider.avatar} sx={{ mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {provider.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {provider.specialty}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          ⭐ {provider.rating}
                        </Typography>
                      </Box>
                    </Box>
                    {selectedProvider === provider.id && (
                      <CheckCircle color="primary" />
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarToday sx={{ mr: 1 }} />
            <Typography variant="h6">
              {currentProvider?.name}'s Availability
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {currentAvailability.slice(0, 7).map((day) => (
              <Grid item xs={6} sm={4} md={1.7} key={day.date}>
                <DayCard day={day} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDayData && selectedDayData.isAvailable && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTime sx={{ mr: 1 }} />
              <Typography variant="h6">
                Available Times for {formatDate(selectedDate)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {selectedDayData.slots.map((slot) => (
                <TimeSlotButton key={slot.time} slot={slot} />
              ))}
            </Box>

            {selectedDayData.slots.filter(slot => slot.available).length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No available slots for this date
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Summary */}
      {selectedTime && selectedDayData && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Booking Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {currentProvider?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {formatDate(selectedDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {selectedTime}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" color="primary">
                    {selectedDayData.slots.find(slot => slot.time === selectedTime)?.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {selectedDayData.slots.find(slot => slot.time === selectedTime)?.duration}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" fullWidth={isMobile}>
                Confirm Booking
              </Button>
              <Button variant="outlined" size="large" fullWidth={isMobile}>
                Change Selection
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AvailabilityCalendar;