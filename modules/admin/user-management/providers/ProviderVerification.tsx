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
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
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
  PictureAsPdf,
  Image,
  Download,
  Check,
  Close,
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
    documents?: {
      idProof?: string;
      addressProof?: string;
      businessLicense?: string;
      gstCertificate?: string;
      bankStatement?: string;
    };
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ProviderVerification: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
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
    const allProviders = allUsers.filter(user => user.role === 'PROVIDER');
    setProviders(allProviders);
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
      filtered = filtered.filter(provider => provider.verificationStatus === statusFilter);
    }

    setFilteredProviders(filtered);
  };

  const handleVerifyDocument = async (providerId: string, documentType: string, approved: boolean) => {
    try {
      // In a real app, you'd update the document verification status
      setSnackbar({
        open: true,
        message: `Document ${approved ? 'approved' : 'rejected'} successfully!`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update document status', severity: 'error' });
    }
  };

  const handleViewVerification = (provider: Provider) => {
    setSelectedProvider(provider);
    setVerificationDialog(true);
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'KYC_PENDING': return 'warning';
      case 'REGISTERED': return 'info';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const paginatedProviders = filteredProviders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const documents = [
    { key: 'idProof', label: 'ID Proof', required: true },
    { key: 'addressProof', label: 'Address Proof', required: true },
    { key: 'businessLicense', label: 'Business License', required: true },
    { key: 'gstCertificate', label: 'GST Certificate', required: false },
    { key: 'bankStatement', label: 'Bank Statement', required: true },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Provider Verification & KYC
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
            <InputLabel>Verification Status</InputLabel>
            <Select
              value={statusFilter}
              label="Verification Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="REGISTERED">Registered</MenuItem>
              <MenuItem value="KYC_PENDING">KYC Pending</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
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
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Verification
              </Typography>
              <Typography variant="h4">
                {providers.filter(p => p.verificationStatus === 'KYC_PENDING').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Verified
              </Typography>
              <Typography variant="h4">
                {providers.filter(p => p.verificationStatus === 'ACTIVE').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Documents Missing
              </Typography>
              <Typography variant="h4">
                {providers.filter(p => !p.kycDetails?.documentsUploaded).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Providers
              </Typography>
              <Typography variant="h4">
                {providers.length}
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
                <TableCell>Verification Status</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Last Updated</TableCell>
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
                          {provider.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {provider.businessName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {provider.category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={provider.verificationStatus.replace('_', ' ')}
                      color={getVerificationStatusColor(provider.verificationStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle
                        color={provider.kycDetails?.documentsUploaded ? 'success' : 'disabled'}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {provider.kycDetails?.documentsUploaded ? 'Uploaded' : 'Pending'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => handleViewVerification(provider)}
                    >
                      Review
                    </Button>
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

      {/* Verification Dialog */}
      <Dialog
        open={verificationDialog}
        onClose={() => setVerificationDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Document Verification - {selectedProvider?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProvider && (
            <Box>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Provider Details" />
                <Tab label="Document Verification" />
                <Tab label="Verification History" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
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
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>Document Verification</Typography>
                <List>
                  {documents.map((doc) => (
                    <ListItem key={doc.key} divider>
                      <ListItemIcon>
                        {doc.key.includes('pdf') ? <PictureAsPdf /> : <Image />}
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.label}
                        secondary={doc.required ? 'Required' : 'Optional'}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Download />}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          startIcon={<Check />}
                          onClick={() => handleVerifyDocument(selectedProvider.id, doc.key, true)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="contained"
                          startIcon={<Close />}
                          onClick={() => handleVerifyDocument(selectedProvider.id, doc.key, false)}
                        >
                          Reject
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>Verification History</Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Account Created"
                      secondary={`Date: ${new Date(selectedProvider.createdAt).toLocaleString()}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Documents Uploaded"
                      secondary={`Status: ${selectedProvider.kycDetails?.documentsUploaded ? 'Completed' : 'Pending'}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Verification Status"
                      secondary={`Current: ${selectedProvider.verificationStatus}`}
                    />
                  </ListItem>
                </List>
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>Close</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              // Complete verification process
              setSnackbar({ open: true, message: 'Provider verification completed!', severity: 'success' });
              setVerificationDialog(false);
              loadProviders();
            }}
          >
            Complete Verification
          </Button>
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

export default ProviderVerification;