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
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search,
  FilterList,
  Business,
  CheckCircle,
  Cancel,
  Visibility,
  Email,
  Phone,
  LocationOn,
  Star,
  AccessTime,
  Work,
  Payment,
  Assignment,
  Schedule,
  VerifiedUser,
  Description,
  Person,
} from '@mui/icons-material';
import { db } from '../../../services/DatabaseService';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  address: string;
  category: string;
  status: string;
  verificationStatus: string;
  city: string;
  createdAt: string;
  kycDetails?: {
    documentsUploaded: boolean;
  };
}

const ProviderQueue: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const itemsPerPage = 10;

  React.useEffect(() => {
    loadProviders();
  }, []);

  React.useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, statusFilter]);

  const loadProviders = () => {
    const allUsers = db.getUsers();
    const pendingProviders = allUsers.filter(user =>
      user.role === 'PROVIDER' &&
      (user.status === 'UNDER_REVIEW' || user.status === 'PENDING')
    );
    setProviders(pendingProviders);
  };

  const filterProviders = () => {
    let filtered = providers;

    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.businessName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(provider => provider.status === statusFilter);
    }

    setFilteredProviders(filtered);
  };

  const handleApprove = async (providerId: string) => {
    try {
      const result = await db.approveProvider(providerId);
      if (result.success) {
        setSnackbar({ open: true, message: 'Provider approved successfully!', severity: 'success' });
        loadProviders();
      } else {
        setSnackbar({ open: true, message: result.message, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to approve provider', severity: 'error' });
    }
  };

  const handleReject = async (providerId: string) => {
    try {
      // In a real app, you'd have a reject method
      const users = db.getUsers();
      const user = users.find(u => u.id === providerId);
      if (user) {
        user.status = 'REJECTED';
        await db.upsertUser(user);
        setSnackbar({ open: true, message: 'Provider rejected', severity: 'success' });
        loadProviders();
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to reject provider', severity: 'error' });
    }
  };

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider);
    setDetailsDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNDER_REVIEW': return 'warning';
      case 'PENDING': return 'info';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const paginatedProviders = filteredProviders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Provider Approval Queue
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
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
              <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            fullWidth
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Approval
              </Typography>
              <Typography variant="h4">
                {providers.filter(p => p.status === 'UNDER_REVIEW').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total in Queue
              </Typography>
              <Typography variant="h4">
                {providers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved Today
              </Typography>
              <Typography variant="h4">
                {providers.filter(p => p.status === 'APPROVED').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Providers Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Provider</TableCell>
                <TableCell>Business</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {provider.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {provider.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {provider.businessName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {provider.address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <Email sx={{ fontSize: 16, mr: 0.5 }} />
                      {provider.email}
                    </Typography>
                    <Typography variant="body2">
                      <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                      {provider.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={provider.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={provider.status.replace('_', ' ')}
                      color={getStatusColor(provider.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(provider)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(provider.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleReject(provider.id)}
                      >
                        Reject
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
            count={Math.ceil(filteredProviders.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Card>

      {/* Provider Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Provider Details - {selectedProvider?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProvider && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Typography><strong>Name:</strong> {selectedProvider.name}</Typography>
                <Typography><strong>Email:</strong> {selectedProvider.email}</Typography>
                <Typography><strong>Phone:</strong> {selectedProvider.phone}</Typography>
                <Typography><strong>City:</strong> {selectedProvider.city}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Business Information</Typography>
                <Typography><strong>Business Name:</strong> {selectedProvider.businessName}</Typography>
                <Typography><strong>Category:</strong> {selectedProvider.category}</Typography>
                <Typography><strong>Address:</strong> {selectedProvider.address}</Typography>
                <Typography><strong>Status:</strong> {selectedProvider.status}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Verification Status</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    icon={<VerifiedUser />}
                    label={`KYC: ${selectedProvider.kycDetails?.documentsUploaded ? 'Completed' : 'Pending'}`}
                    color={selectedProvider.kycDetails?.documentsUploaded ? 'success' : 'warning'}
                  />
                  <Chip
                    icon={<Description />}
                    label={`Documents: ${selectedProvider.kycDetails?.documentsUploaded ? 'Uploaded' : 'Pending'}`}
                    color={selectedProvider.kycDetails?.documentsUploaded ? 'success' : 'warning'}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Applied on: {new Date(selectedProvider.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          {selectedProvider && (
            <>
              <Button
                color="error"
                onClick={() => {
                  handleReject(selectedProvider.id);
                  setDetailsDialog(false);
                }}
              >
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={() => {
                  handleApprove(selectedProvider.id);
                  setDetailsDialog(false);
                }}
              >
                Approve Provider
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProviderQueue;