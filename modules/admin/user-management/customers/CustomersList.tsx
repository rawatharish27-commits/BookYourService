import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  FilterList,
  Person,
  Verified,
  Block,
  Edit,
  Delete,
  Email,
  Phone,
  LocationOn,
  Star,
  AccessTime,
  ShoppingCart,
  Payment,
  Support,
  Security,
} from '@mui/icons-material';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  joinDate: string;
  lastActive: string;
  totalBookings: number;
  totalSpent: number;
  rating: number;
  city: string;
  walletBalance: number;
}

const CustomersList: React.FC = () => {
  const [customers] = useState<Customer[]>([
    {
      id: 'C001',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91-9876543210',
      status: 'active',
      verificationStatus: 'verified',
      joinDate: '2024-01-15',
      lastActive: '2024-01-20',
      totalBookings: 45,
      totalSpent: 12500,
      rating: 4.8,
      city: 'Mumbai',
      walletBalance: 500,
    },
    {
      id: 'C002',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91-9876543211',
      status: 'active',
      verificationStatus: 'verified',
      joinDate: '2024-01-10',
      lastActive: '2024-01-19',
      totalBookings: 32,
      totalSpent: 8900,
      rating: 4.6,
      city: 'Delhi',
      walletBalance: 200,
    },
    {
      id: 'C003',
      name: 'Amit Singh',
      email: 'amit@example.com',
      phone: '+91-9876543212',
      status: 'suspended',
      verificationStatus: 'pending',
      joinDate: '2024-01-05',
      lastActive: '2024-01-18',
      totalBookings: 12,
      totalSpent: 3400,
      rating: 3.2,
      city: 'Bangalore',
      walletBalance: 0,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || customer.verificationStatus === verificationFilter;

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Customers List
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all registered customers and their account details
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Person />}>
          Add New Customer
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {customers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {customers.filter(c => c.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {customers.filter(c => c.verificationStatus === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Verification</InputLabel>
                <Select
                  value={verificationFilter}
                  label="Verification"
                  onChange={(e) => setVerificationFilter(e.target.value)}
                >
                  <MenuItem value="all">All Verification</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="outlined" startIcon={<FilterList />} fullWidth>
                More Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell>Bookings</TableCell>
                <TableCell>Total Spent</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.slice((page - 1) * 10, page * 10).map((customer) => (
                <TableRow
                  key={customer.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleCustomerClick(customer)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {customer.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {customer.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{customer.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {customer.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.status}
                      color={getStatusColor(customer.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.verificationStatus}
                      color={getVerificationColor(customer.verificationStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{customer.totalBookings}</TableCell>
                  <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                      <Typography variant="body2">{customer.rating}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<Edit />}>
                        Edit
                      </Button>
                      <Button size="small" color="error" startIcon={<Block />}>
                        Suspend
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination
            count={Math.ceil(filteredCustomers.length / 10)}
            page={page}
            onChange={(e, value) => setPage(value)}
          />
        </Box>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Customer Details - {selectedCustomer?.name}
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedCustomer.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedCustomer.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedCustomer.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>City:</strong> {selectedCustomer.city}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Account Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShoppingCart sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Total Bookings:</strong> {selectedCustomer.totalBookings}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Payment sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Total Spent:</strong> ₹{selectedCustomer.totalSpent.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="body2">
                        <strong>Rating:</strong> {selectedCustomer.rating}/5
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Payment sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2">
                        <strong>Wallet Balance:</strong> ₹{selectedCustomer.walletBalance}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained">Edit Customer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersList;