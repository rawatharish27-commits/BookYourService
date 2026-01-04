import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search,
  Send,
  Notifications,
  Email,
  Sms,
  PushNotification,
  Schedule,
  Group,
  Person,
  Business,
  CheckCircle,
  Cancel,
  History,
  Add,
} from '@mui/icons-material';

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'alert' | 'promotion' | 'maintenance';
  targetAudience: 'all' | 'customers' | 'providers' | 'specific_users';
  channels: ('email' | 'sms' | 'push')[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledDate?: string;
  sentDate?: string;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  createdBy: string;
  createdAt: string;
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

const NotificationBroadcast: React.FC = () => {
  const [messages, setMessages] = useState<BroadcastMessage[]>([
    {
      id: '1',
      title: 'System Maintenance Notice',
      message: 'We will be performing system maintenance on Sunday from 2-4 AM IST.',
      type: 'maintenance',
      targetAudience: 'all',
      channels: ['email', 'push'],
      status: 'sent',
      sentDate: '2024-01-15T10:00:00Z',
      recipientCount: 12543,
      openRate: 78,
      clickRate: 12,
      createdBy: 'Admin User',
      createdAt: '2024-01-14T15:00:00Z',
    },
    {
      id: '2',
      title: 'New Feature: Instant Booking',
      message: 'Try our new instant booking feature for faster service requests!',
      type: 'announcement',
      targetAudience: 'customers',
      channels: ['push', 'email'],
      status: 'scheduled',
      scheduledDate: '2024-01-20T09:00:00Z',
      recipientCount: 8756,
      createdBy: 'Admin User',
      createdAt: '2024-01-16T11:00:00Z',
    },
  ]);

  const [filteredMessages, setFilteredMessages] = useState<BroadcastMessage[]>(messages);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement' as BroadcastMessage['type'],
    targetAudience: 'all' as BroadcastMessage['targetAudience'],
    channels: [] as BroadcastMessage['channels'],
    scheduledDate: '',
    sendNow: true,
  });

  React.useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter, typeFilter]);

  const filterMessages = () => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(message => message.type === typeFilter);
    }

    setFilteredMessages(filtered);
  };

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      message: '',
      type: 'announcement',
      targetAudience: 'all',
      channels: [],
      scheduledDate: '',
      sendNow: true,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChannelToggle = (channel: 'email' | 'sms' | 'push') => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleSend = () => {
    const newMessage: BroadcastMessage = {
      id: Date.now().toString(),
      title: formData.title,
      message: formData.message,
      type: formData.type,
      targetAudience: formData.targetAudience,
      channels: formData.channels,
      status: formData.sendNow ? 'sent' : 'scheduled',
      sentDate: formData.sendNow ? new Date().toISOString() : undefined,
      scheduledDate: !formData.sendNow ? formData.scheduledDate : undefined,
      recipientCount: formData.targetAudience === 'all' ? 12543 :
                     formData.targetAudience === 'customers' ? 8756 : 3787,
      createdBy: 'Admin User',
      createdAt: new Date().toISOString(),
    };

    setMessages([newMessage, ...messages]);
    setSnackbar({
      open: true,
      message: formData.sendNow ? 'Message sent successfully!' : 'Message scheduled successfully!',
      severity: 'success'
    });
    handleCloseDialog();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'scheduled': return 'info';
      case 'draft': return 'default';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'primary';
      case 'alert': return 'error';
      case 'promotion': return 'secondary';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Email />;
      case 'sms': return <Sms />;
      case 'push': return <PushNotification />;
      default: return <Notifications />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Notification & Broadcast Messages
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Create Broadcast
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search messages..."
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
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="announcement">Announcement</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="promotion">Promotion</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Messages
              </Typography>
              <Typography variant="h4">
                {messages.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sent This Month
              </Typography>
              <Typography variant="h4">
                {messages.filter(m => m.status === 'sent').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Scheduled
              </Typography>
              <Typography variant="h4">
                {messages.filter(m => m.status === 'scheduled').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Open Rate
              </Typography>
              <Typography variant="h4">
                {Math.round(messages.filter(m => m.openRate).reduce((sum, m) => sum + (m.openRate || 0), 0) / messages.filter(m => m.openRate).length) || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Messages Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Target Audience</TableCell>
                <TableCell>Channels</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Open Rate</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {message.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {message.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={message.type}
                      color={getTypeColor(message.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {message.targetAudience === 'all' && <Group sx={{ mr: 1 }} />}
                      {message.targetAudience === 'customers' && <Person sx={{ mr: 1 }} />}
                      {message.targetAudience === 'providers' && <Business sx={{ mr: 1 }} />}
                      <Typography variant="body2">
                        {message.targetAudience.replace('_', ' ')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {message.channels.map(channel => (
                        <Chip
                          key={channel}
                          icon={getChannelIcon(channel)}
                          label={channel.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={message.status}
                      color={getStatusColor(message.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{message.recipientCount.toLocaleString()}</TableCell>
                  <TableCell>
                    {message.openRate ? `${message.openRate}%` : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(message.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Broadcast Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create Broadcast Message</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message Content"
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Message Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Message Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as BroadcastMessage['type'] })}
                >
                  <MenuItem value="announcement">Announcement</MenuItem>
                  <MenuItem value="alert">Alert</MenuItem>
                  <MenuItem value="promotion">Promotion</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={formData.targetAudience}
                  label="Target Audience"
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as BroadcastMessage['targetAudience'] })}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="customers">Customers Only</MenuItem>
                  <MenuItem value="providers">Providers Only</MenuItem>
                  <MenuItem value="specific_users">Specific Users</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormLabel component="legend">Delivery Channels</FormLabel>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                {[
                  { key: 'email', label: 'Email', icon: <Email /> },
                  { key: 'sms', label: 'SMS', icon: <Sms /> },
                  { key: 'push', label: 'Push Notification', icon: <PushNotification /> },
                ].map(({ key, label, icon }) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={formData.channels.includes(key as any)}
                        onChange={() => handleChannelToggle(key as any)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {icon}
                        <Typography sx={{ ml: 1 }}>{label}</Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Send Options</FormLabel>
                <RadioGroup
                  value={formData.sendNow ? 'now' : 'schedule'}
                  onChange={(e) => setFormData({ ...formData, sendNow: e.target.value === 'now' })}
                >
                  <FormControlLabel value="now" control={<Radio />} label="Send Immediately" />
                  <FormControlLabel value="schedule" control={<Radio />} label="Schedule for Later" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {!formData.sendNow && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Scheduled Date & Time"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={!formData.title || !formData.message || formData.channels.length === 0}
          >
            {formData.sendNow ? 'Send Now' : 'Schedule'}
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

export default NotificationBroadcast;