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
  ListItemAvatar,
  Divider,
  Rating,
} from '@mui/material';
import {
  Search,
  FilterList,
  Report,
  Gavel,
  CheckCircle,
  Cancel,
  Visibility,
  Message,
  Person,
  Business,
  AccessTime,
  PriorityHigh,
  Warning,
  Info,
  Chat,
} from '@mui/icons-material';

interface Complaint {
  id: string;
  type: 'customer_complaint' | 'provider_complaint' | 'booking_dispute' | 'payment_dispute';
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  complainant: {
    id: string;
    name: string;
    type: 'customer' | 'provider';
    email: string;
  };
  respondent?: {
    id: string;
    name: string;
    type: 'customer' | 'provider';
    email: string;
  };
  bookingId?: string;
  amount?: number;
  messages: {
    id: string;
    sender: string;
    senderType: 'customer' | 'provider' | 'admin';
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
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

const ComplaintsDisputesPanel: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      type: 'customer_complaint',
      title: 'Service not completed on time',
      description: 'The provider arrived late and did not complete the full service as promised.',
      status: 'investigating',
      priority: 'medium',
      complainant: {
        id: 'C001',
        name: 'John Smith',
        type: 'customer',
        email: 'john@example.com',
      },
      respondent: {
        id: 'P001',
        name: 'ABC Cleaning Services',
        type: 'provider',
        email: 'abc@cleaning.com',
      },
      bookingId: 'B001',
      amount: 150,
      messages: [
        {
          id: 'M001',
          sender: 'John Smith',
          senderType: 'customer',
          message: 'The service was not completed properly.',
          timestamp: '2024-01-15T10:00:00Z',
        },
      ],
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T14:00:00Z',
      assignedTo: 'Admin User',
    },
    {
      id: '2',
      type: 'payment_dispute',
      title: 'Incorrect charge on invoice',
      description: 'Customer was charged extra for services not rendered.',
      status: 'open',
      priority: 'high',
      complainant: {
        id: 'C002',
        name: 'Sarah Johnson',
        type: 'customer',
        email: 'sarah@example.com',
      },
      amount: 75,
      messages: [],
      createdAt: '2024-01-14T16:00:00Z',
      updatedAt: '2024-01-14T16:00:00Z',
    },
  ]);

  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>(complaints);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const itemsPerPage = 10;

  React.useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const filterComplaints = () => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complainant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    setFilteredComplaints(filtered);
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialog(true);
  };

  const handleStatusChange = (complaintId: string, newStatus: Complaint['status']) => {
    setComplaints(complaints.map(complaint =>
      complaint.id === complaintId
        ? { ...complaint, status: newStatus, updatedAt: new Date().toISOString() }
        : complaint
    ));
    setSnackbar({ open: true, message: `Complaint status updated to ${newStatus}!`, severity: 'success' });
  };

  const handleSendMessage = () => {
    if (!selectedComplaint || !newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: 'Admin User',
      senderType: 'admin' as const,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setComplaints(complaints.map(complaint =>
      complaint.id === selectedComplaint.id
        ? { ...complaint, messages: [...complaint.messages, message], updatedAt: new Date().toISOString() }
        : complaint
    ));

    setNewMessage('');
    setSnackbar({ open: true, message: 'Message sent successfully!', severity: 'success' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'investigating': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer_complaint': return <Report />;
      case 'provider_complaint': return <Business />;
      case 'booking_dispute': return <Gavel />;
      case 'payment_dispute': return <Payment />;
      default: return <Info />;
    }
  };

  const paginatedComplaints = filteredComplaints.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Complaints & Disputes Panel
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            placeholder="Search complaints..."
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
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="investigating">Investigating</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="customer_complaint">Customer Complaint</MenuItem>
              <MenuItem value="provider_complaint">Provider Complaint</MenuItem>
              <MenuItem value="booking_dispute">Booking Dispute</MenuItem>
              <MenuItem value="payment_dispute">Payment Dispute</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">All Priority</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
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
              setTypeFilter('all');
              setPriorityFilter('all');
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
                Open Complaints
              </Typography>
              <Typography variant="h4" color="error.main">
                {complaints.filter(c => c.status === 'open').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Under Investigation
              </Typography>
              <Typography variant="h4" color="warning.main">
                {complaints.filter(c => c.status === 'investigating').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved
              </Typography>
              <Typography variant="h4" color="success.main">
                {complaints.filter(c => c.status === 'resolved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Complaints
              </Typography>
              <Typography variant="h4">
                {complaints.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Complaints Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Complainant</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTypeIcon(complaint.type)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {complaint.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {complaint.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {complaint.bookingId && `Booking: ${complaint.bookingId}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, width: 24, height: 24 }}>
                        <Person sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{complaint.complainant.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {complaint.complainant.type}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={complaint.priority.toUpperCase()}
                      color={getPriorityColor(complaint.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={complaint.status.replace('_', ' ')}
                      color={getStatusColor(complaint.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(complaint)}
                      >
                        View
                      </Button>
                      {complaint.status === 'open' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          onClick={() => handleStatusChange(complaint.id, 'investigating')}
                        >
                          Investigate
                        </Button>
                      )}
                      {complaint.status === 'investigating' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStatusChange(complaint.id, 'resolved')}
                        >
                          Resolve
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination
            count={Math.ceil(filteredComplaints.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Card>

      {/* Complaint Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Complaint Details - {selectedComplaint?.title}
        </DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Box>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Details" />
                <Tab label="Messages" />
                <Tab label="Resolution" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Complaint Information</Typography>
                    <Typography><strong>Type:</strong> {selectedComplaint.type.replace('_', ' ')}</Typography>
                    <Typography><strong>Priority:</strong> {selectedComplaint.priority}</Typography>
                    <Typography><strong>Status:</strong> {selectedComplaint.status}</Typography>
                    <Typography><strong>Created:</strong> {new Date(selectedComplaint.createdAt).toLocaleString()}</Typography>
                    {selectedComplaint.amount && (
                      <Typography><strong>Amount:</strong> ${selectedComplaint.amount}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Parties Involved</Typography>
                    <Typography><strong>Complainant:</strong> {selectedComplaint.complainant.name} ({selectedComplaint.complainant.type})</Typography>
                    {selectedComplaint.respondent && (
                      <Typography><strong>Respondent:</strong> {selectedComplaint.respondent.name} ({selectedComplaint.respondent.type})</Typography>
                    )}
                    {selectedComplaint.assignedTo && (
                      <Typography><strong>Assigned To:</strong> {selectedComplaint.assignedTo}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Description</Typography>
                    <Typography>{selectedComplaint.description}</Typography>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>Message History</Typography>
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {selectedComplaint.messages.map((message) => (
                    <ListItem key={message.id} divider>
                      <ListItemAvatar>
                        <Avatar>
                          {message.senderType === 'admin' ? <Person /> :
                           message.senderType === 'customer' ? <Person /> : <Business />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {message.sender} ({message.senderType})
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(message.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={message.message}
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>Resolution</Typography>
                {selectedComplaint.resolution ? (
                  <Typography>{selectedComplaint.resolution}</Typography>
                ) : (
                  <Typography color="textSecondary">No resolution recorded yet.</Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Resolution Notes"
                    multiline
                    rows={4}
                    placeholder="Enter resolution details..."
                  />
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button variant="contained" color="success">
                      Mark as Resolved
                    </Button>
                    <Button variant="outlined">
                      Request More Information
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
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

export default ComplaintsDisputesPanel;