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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  useTheme,
  useMediaQuery,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Work,
  LocationOn,
  AccessTime,
  AttachMoney,
  CheckCircle,
  Cancel,
  Message,
  Phone,
  Star,
  Schedule,
  Person,
  Info,
} from '@mui/icons-material';

interface JobRequest {
  id: string;
  customerName: string;
  customerAvatar: string;
  customerRating: number;
  service: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  amount: number;
  distance: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  specialInstructions?: string;
  customerPhone: string;
  requestedAt: string;
}

const NewJobRequests: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([
    {
      id: 'REQ001',
      customerName: 'Rahul Sharma',
      customerAvatar: '/api/placeholder/50/50',
      customerRating: 4.5,
      service: 'Home Cleaning',
      description: 'Deep cleaning of 2BHK apartment including kitchen and bathrooms',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Andheri West, Mumbai - 400058',
      amount: 599,
      distance: '2.3 km',
      urgency: 'normal',
      specialInstructions: 'Please bring eco-friendly cleaning products',
      customerPhone: '+91 98765 43210',
      requestedAt: '2024-01-14T18:30:00Z',
    },
    {
      id: 'REQ002',
      customerName: 'Priya Patel',
      customerAvatar: '/api/placeholder/50/50',
      customerRating: 4.8,
      service: 'AC Repair',
      description: 'Split AC not cooling properly, making strange noise',
      date: '2024-01-15',
      time: '2:00 PM',
      duration: '1.5 hours',
      location: 'Bandra East, Mumbai - 400051',
      amount: 899,
      distance: '4.1 km',
      urgency: 'urgent',
      customerPhone: '+91 87654 32109',
      requestedAt: '2024-01-14T20:15:00Z',
    },
    {
      id: 'REQ003',
      customerName: 'Amit Kumar',
      customerAvatar: '/api/placeholder/50/50',
      customerRating: 4.2,
      service: 'Plumbing',
      description: 'Kitchen sink clogged, water not draining',
      date: '2024-01-16',
      time: '9:00 AM',
      duration: '45 minutes',
      location: 'Juhu, Mumbai - 400049',
      amount: 450,
      distance: '6.2 km',
      urgency: 'normal',
      customerPhone: '+91 76543 21098',
      requestedAt: '2024-01-14T22:45:00Z',
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'accept' | 'reject' | null; request: JobRequest | null }>({
    open: false,
    action: null,
    request: null,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'error';
      case 'urgent': return 'warning';
      case 'normal': return 'info';
      default: return 'default';
    }
  };

  const handleAcceptReject = (request: JobRequest, action: 'accept' | 'reject') => {
    setActionDialog({ open: true, action, request });
  };

  const confirmAction = () => {
    if (!actionDialog.request || !actionDialog.action) return;

    const { request, action } = actionDialog;

    // Remove from requests list
    setJobRequests(prev => prev.filter(req => req.id !== request.id));

    // Show success message
    setSnackbar({
      open: true,
      message: `Job request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`,
      severity: 'success',
    });

    setActionDialog({ open: false, action: null, request: null });
  };

  const handleViewDetails = (request: JobRequest) => {
    setSelectedRequest(request);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        New Job Requests
      </Typography>

      <Grid container spacing={3}>
        {/* Job Requests List */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Pending Requests ({jobRequests.length})
              </Typography>

              {jobRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Work sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No new job requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New requests will appear here when customers book your services
                  </Typography>
                </Box>
              ) : (
                <List>
                  {jobRequests.map((request, index) => (
                    <React.Fragment key={request.id}>
                      <ListItem sx={{ px: 0, py: 3, flexDirection: 'column', alignItems: 'stretch' }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', width: '100%', mb: 2 }}>
                          <ListItemAvatar>
                            <Avatar src={request.customerAvatar} sx={{ width: 50, height: 50 }} />
                          </ListItemAvatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6">{request.customerName}</Typography>
                              <Rating value={request.customerRating} readOnly size="small" />
                              <Chip
                                label={request.urgency}
                                size="small"
                                color={getUrgencyColor(request.urgency)}
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Requested {new Date(request.requestedAt).toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                              ₹{request.amount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.distance}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Service Details */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {request.service}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {request.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {request.date} at {request.time} ({request.duration})
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {request.location}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Special Instructions */}
                        {request.specialInstructions && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Special Instructions:</strong> {request.specialInstructions}
                            </Typography>
                          </Alert>
                        )}

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" color="primary">
                              <Phone fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="primary">
                              <Message fontSize="small" />
                            </IconButton>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewDetails(request)}
                            >
                              View Details
                            </Button>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleAcceptReject(request, 'reject')}
                            >
                              Reject
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleAcceptReject(request, 'accept')}
                            >
                              Accept
                            </Button>
                          </Box>
                        </Box>
                      </ListItem>
                      {index < jobRequests.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Today's Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">New Requests</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{jobRequests.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Accepted Today</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>3</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Response Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>95%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Avg Response Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>4 min</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Response Tips
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Respond quickly to increase your acceptance rate and customer satisfaction.
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Pro Tip:</strong> Accepting urgent requests can boost your earnings by 20-30%.
                </Typography>
              </Alert>
              <Button variant="outlined" fullWidth>
                View Response Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, action: null, request: null })}>
        <DialogTitle>
          {actionDialog.action === 'accept' ? 'Accept Job Request' : 'Reject Job Request'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {actionDialog.action} this job request?
          </Typography>
          {actionDialog.request && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2">{actionDialog.request.service}</Typography>
              <Typography variant="body2" color="text.secondary">
                {actionDialog.request.customerName} • {actionDialog.request.date} at {actionDialog.request.time}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                ₹{actionDialog.request.amount}
              </Typography>
            </Box>
          )}
          {actionDialog.action === 'reject' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Reason for rejection (optional)"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, action: null, request: null })}>
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={actionDialog.action === 'accept' ? 'success' : 'error'}
          >
            {actionDialog.action === 'accept' ? 'Accept' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default NewJobRequests;