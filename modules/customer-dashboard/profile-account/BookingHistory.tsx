import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Avatar,
  Rating,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  FilterList,
  Star,
  AccessTime,
  LocationOn,
  Receipt,
  Refresh,
  ThumbUp,
  ThumbDown,
  Chat,
} from '@mui/icons-material';

interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  providerAvatar: string;
  date: string;
  time: string;
  status: 'completed' | 'cancelled' | 'refunded' | 'in-progress' | 'scheduled';
  price: string;
  rating?: number;
  review?: string;
  location: string;
  category: string;
  bookingId: string;
}

const BookingHistory: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Mock booking history data
  const bookings: Booking[] = [
    {
      id: '1',
      serviceName: 'Home Cleaning',
      providerName: 'Rajesh Kumar',
      providerAvatar: '/api/placeholder/40/40',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'completed',
      price: '₹299',
      rating: 5,
      review: 'Excellent service! Very professional and thorough.',
      location: 'Mumbai, Maharashtra',
      category: 'Home Services',
      bookingId: 'BK001234',
    },
    {
      id: '2',
      serviceName: 'Plumbing Repair',
      providerName: 'Amit Singh',
      providerAvatar: '/api/placeholder/40/40',
      date: '2024-01-10',
      time: '2:00 PM',
      status: 'completed',
      price: '₹199',
      rating: 4,
      review: 'Good work, fixed the leak quickly.',
      location: 'Mumbai, Maharashtra',
      category: 'Home Services',
      bookingId: 'BK001235',
    },
    {
      id: '3',
      serviceName: 'AC Service',
      providerName: 'Vikram Patel',
      providerAvatar: '/api/placeholder/40/40',
      date: '2024-01-08',
      time: '11:00 AM',
      status: 'cancelled',
      price: '₹399',
      location: 'Mumbai, Maharashtra',
      category: 'Home Services',
      bookingId: 'BK001236',
    },
    {
      id: '4',
      serviceName: 'Car Wash',
      providerName: 'Suresh Sharma',
      providerAvatar: '/api/placeholder/40/40',
      date: '2024-01-05',
      time: '9:00 AM',
      status: 'refunded',
      price: '₹149',
      location: 'Mumbai, Maharashtra',
      category: 'Vehicle Services',
      bookingId: 'BK001237',
    },
    {
      id: '5',
      serviceName: 'Electrical Repair',
      providerName: 'Ravi Kumar',
      providerAvatar: '/api/placeholder/40/40',
      date: '2024-01-20',
      time: '3:00 PM',
      status: 'scheduled',
      price: '₹249',
      location: 'Mumbai, Maharashtra',
      category: 'Home Services',
      bookingId: 'BK001238',
    },
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'refunded': return 'warning';
      case 'in-progress': return 'info';
      case 'scheduled': return 'primary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      case 'in-progress': return 'In Progress';
      case 'scheduled': return 'Scheduled';
      default: return status;
    }
  };

  const BookingRow: React.FC<{ booking: Booking }> = ({ booking }) => (
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={booking.providerAvatar} sx={{ mr: 2, width: 40, height: 40 }} />
          <Box>
            <Typography variant="body1" fontWeight="medium">
              {booking.serviceName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.providerName}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{booking.date}</Typography>
        <Typography variant="body2" color="text.secondary">{booking.time}</Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={getStatusLabel(booking.status)}
          color={getStatusColor(booking.status) as any}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Typography variant="body1" fontWeight="medium">{booking.price}</Typography>
      </TableCell>
      <TableCell>
        {booking.rating ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating value={booking.rating} readOnly size="small" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {booking.rating}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">-</Typography>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<Receipt />}>
            Invoice
          </Button>
          {booking.status === 'completed' && !booking.rating && (
            <Button size="small" variant="outlined" startIcon={<Star />}>
              Rate
            </Button>
          )}
          {booking.status === 'scheduled' && (
            <Button size="small" variant="outlined" startIcon={<Refresh />}>
              Reschedule
            </Button>
          )}
          <Button size="small" variant="outlined" startIcon={<Chat />}>
            Chat
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );

  const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={booking.providerAvatar} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6">{booking.serviceName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {booking.providerName}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={getStatusLabel(booking.status)}
            color={getStatusColor(booking.status) as any}
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Date & Time</Typography>
            <Typography variant="body1">{booking.date} at {booking.time}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Price</Typography>
            <Typography variant="body1" fontWeight="medium">{booking.price}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Location</Typography>
            <Typography variant="body1">{booking.location}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Booking ID</Typography>
            <Typography variant="body1">{booking.bookingId}</Typography>
          </Grid>
        </Grid>

        {booking.rating && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your Rating
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={booking.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {booking.rating}/5
              </Typography>
            </Box>
            {booking.review && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{booking.review}"
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" startIcon={<Receipt />}>
            Download Invoice
          </Button>
          {booking.status === 'completed' && !booking.rating && (
            <Button size="small" variant="contained" startIcon={<Star />}>
              Rate & Review
            </Button>
          )}
          {booking.status === 'scheduled' && (
            <Button size="small" variant="outlined" startIcon={<Refresh />}>
              Reschedule
            </Button>
          )}
          <Button size="small" variant="outlined" startIcon={<Chat />}>
            Contact Provider
          </Button>
          {booking.status === 'completed' && (
            <Button size="small" variant="outlined" startIcon={<Refresh />}>
              Book Again
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Booking History
      </Typography>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by service, provider, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={<FilterList sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">All Bookings</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Booking List */}
      {isMobile ? (
        // Mobile view - cards
        <Box>
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </Box>
      ) : (
        // Desktop view - table
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service & Provider</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filteredBookings.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}

      {/* Load More */}
      {filteredBookings.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="outlined" size="large">
            Load More Bookings
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BookingHistory;