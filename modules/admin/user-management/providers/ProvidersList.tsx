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
  Rating,
} from '@mui/material';
import {
  Search,
  FilterList,
  Business,
  Verified,
  Block,
  Edit,
  Delete,
  Email,
  Phone,
  LocationOn,
  Star,
  AccessTime,
  Work,
  Payment,
  Assignment,
  Schedule,
} from '@mui/icons-material';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  joinDate: string;
  lastActive: string;
  totalJobs: number;
  totalEarnings: number;
  rating: number;
  city: string;
  services: string[];
  completionRate: number;
  responseTime: string;
}

const ProvidersList: React.FC = () => {
  const [providers] = useState<Provider[]>([
    {
      id: 'P001',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91-9876543210',
      status: 'active',
      verificationStatus: 'verified',
      joinDate: '2024-01-10',
      lastActive: '2024-01-20',
      totalJobs: 156,
      totalEarnings: 45000,
      rating: 4.7,
      city: 'Mumbai',
      services: ['Home Cleaning', 'Carpet Cleaning'],
      completionRate: 98,
      responseTime: '15 min',
    },
    {
      id: 'P002',
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91-9876543211',
      status: 'active',
      verificationStatus: 'verified',
      joinDate: '2024-01-08',
      lastActive: '2024-01-19',
      totalJobs: 89,
      totalEarnings: 28500,
      rating: 4.9,
      city: 'Delhi',
      services: ['Plumbing', 'Electrical'],
      completionRate: 96,
      responseTime: '12 min',
    },
    {
      id: 'P003',
      name: 'Amit Kumar',
      email: 'amit@example.com',
      phone: '+91-9876543212',
      status: 'pending',
      verificationStatus: 'pending',
      joinDate: '2024-01-18',
      lastActive: '2024-01-18',
      totalJobs: 0,
      totalEarnings: 0,
      rating: 0,
      city: 'Bangalore',
      services: ['AC Repair'],
      completionRate: 0,
      responseTime: 'N/A',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'info';
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

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = searchTerm === '' ||
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.phone.includes(searchTerm) ||
      provider.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || provider.verificationStatus === verificationFilter;

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Providers List
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all registered service providers and their performance
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Business />}>
          Add New Provider
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {providers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Providers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {providers.filter(p => p.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Providers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {providers.filter(p => p.verificationStatus === 'pending').length}
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
                ₹{providers.reduce((sum, p) => sum + p.totalEarnings, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
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
                placeholder="Search providers..."
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
                  <MenuItem value="pending">Pending</MenuItem>
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

      {/* Providers Table */}
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Provider</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell>Jobs</TableCell>
                <TableCell>Earnings</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Completion Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProviders.slice((page - 1) * 10, page * 10).map((provider) => (
                <TableRow
                  key={provider.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleProviderClick(provider)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {provider.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {provider.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {provider.id}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {provider.services.slice(0, 2).map((service, index) => (
                            <Chip
                              key={index}
                              label={service}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{provider.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {provider.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={provider.status}
                      color={getStatusColor(provider.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={provider.verificationStatus}
                      color={getVerificationColor(provider.verificationStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{provider.totalJobs}</TableCell>
                  <TableCell>₹{provider.totalEarnings.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={provider.rating} readOnly size="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">({provider.rating})</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight="medium">
                      {provider.completionRate}%
                    </Typography>
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
            count={Math.ceil(filteredProviders.length / 10)}
            page={page}
            onChange={(e, value) => setPage(value)}
          />
        </Box>
      </Card>

      {/* Provider Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Provider Details - {selectedProvider?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProvider && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Business sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedProvider.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedProvider.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedProvider.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>City:</strong> {selectedProvider.city}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Work sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Services:</strong> {selectedProvider.services.join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Work sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Total Jobs:</strong> {selectedProvider.totalJobs}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Payment sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Total Earnings:</strong> ₹{selectedProvider.totalEarnings.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="body2">
                        <strong>Rating:</strong> {selectedProvider.rating}/5
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Assignment sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2">
                        <strong>Completion Rate:</strong> {selectedProvider.completionRate}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="body2">
                        <strong>Response Time:</strong> {selectedProvider.responseTime}
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
          <Button variant="contained">Edit Provider</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProvidersList;