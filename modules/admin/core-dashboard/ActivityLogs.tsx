import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Timeline,
  Person,
  Business,
  Payment,
  Security,
  Error,
  Warning,
  Info,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';

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

const ActivityLogs: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [page, setPage] = useState(1);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const systemLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:32:15',
      level: 'info',
      category: 'authentication',
      user: 'admin@bookyourservice.com',
      action: 'User login successful',
      details: 'Admin user logged in from IP 192.168.1.100',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:30:45',
      level: 'warning',
      category: 'payment',
      user: 'user123@example.com',
      action: 'Payment failed',
      details: 'Payment gateway timeout for booking #BK123456',
      ip: '10.0.0.50',
      userAgent: 'Mobile App v2.1.0',
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:28:22',
      level: 'error',
      category: 'api',
      user: 'system',
      action: 'API rate limit exceeded',
      details: 'Client exceeded 1000 requests per minute from IP 203.0.113.1',
      ip: '203.0.113.1',
      userAgent: 'API Client v1.0',
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:25:10',
      level: 'info',
      category: 'booking',
      user: 'customer456@example.com',
      action: 'Booking created',
      details: 'New booking #BK123457 for Home Cleaning service',
      ip: '192.168.1.200',
      userAgent: 'Web Browser',
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:22:33',
      level: 'info',
      category: 'provider',
      user: 'provider789@example.com',
      action: 'Provider status updated',
      details: 'Provider marked as available for new bookings',
      ip: '10.0.0.75',
      userAgent: 'Provider App v2.0.1',
    },
  ];

  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:15:00',
      user: 'admin@bookyourservice.com',
      action: 'User role modified',
      target: 'user123@example.com',
      details: 'Changed role from customer to premium_customer',
      ip: '192.168.1.100',
      result: 'success',
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:10:30',
      user: 'system',
      action: 'Automated cleanup',
      target: 'expired_sessions',
      details: 'Removed 156 expired user sessions',
      ip: '127.0.0.1',
      result: 'success',
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:05:15',
      user: 'admin@bookyourservice.com',
      action: 'Configuration updated',
      target: 'payment_settings',
      details: 'Updated Stripe API keys for production environment',
      ip: '192.168.1.100',
      result: 'success',
    },
    {
      id: 4,
      timestamp: '2024-01-15 13:58:45',
      user: 'moderator@bookyourservice.com',
      action: 'Content flagged',
      target: 'service_listing_123',
      details: 'Flagged service listing for inappropriate content',
      ip: '10.0.0.25',
      result: 'pending_review',
    },
  ];

  const errorLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:45',
      error: 'PaymentGatewayTimeout',
      message: 'Payment processing timeout after 30 seconds',
      stack: 'at PaymentService.processPayment (/app/services/payment.js:145)',
      context: { bookingId: 'BK123456', amount: 1500, gateway: 'stripe' },
      severity: 'high',
      resolved: false,
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:28:22',
      error: 'RateLimitExceeded',
      message: 'API rate limit exceeded for client',
      stack: 'at ApiGateway.checkRateLimit (/app/gateway/ratelimit.js:78)',
      context: { clientId: 'client_abc123', limit: 1000, window: '1m' },
      severity: 'medium',
      resolved: true,
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:15:10',
      error: 'DatabaseConnectionError',
      message: 'Connection pool exhausted',
      stack: 'at DatabasePool.getConnection (/app/db/pool.js:234)',
      context: { poolSize: 20, activeConnections: 20, waiting: 5 },
      severity: 'critical',
      resolved: true,
    },
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      case 'success':
        return <CheckCircle color="success" />;
      default:
        return <Info />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <Security />;
      case 'payment':
        return <Payment />;
      case 'booking':
        return <Business />;
      case 'provider':
        return <Person />;
      case 'api':
        return <Timeline />;
      default:
        return <Info />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredLogs = systemLogs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = logLevel === 'all' || log.level === logLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Activity Logs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive system activity monitoring and audit trails
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Download />}>
            Export Logs
          </Button>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search logs..."
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
                <InputLabel>Log Level</InputLabel>
                <Select
                  value={logLevel}
                  label="Log Level"
                  onChange={(e) => setLogLevel(e.target.value)}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="outlined" startIcon={<FilterList />} fullWidth>
                Advanced Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Log Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`System Logs (${systemLogs.length})`} />
            <Tab label={`Audit Logs (${auditLogs.length})`} />
            <Tab label={`Error Logs (${errorLogs.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.slice((page - 1) * 10, page * 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getLogIcon(log.level)}
                        label={log.level}
                        color={log.level === 'error' ? 'error' : log.level === 'warning' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                          {getCategoryIcon(log.category)}
                        </Avatar>
                        <Typography variant="body2">{log.category}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.details}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredLogs.length / 10)}
              page={page}
              onChange={(e, value) => setPage(value)}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.target}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.details}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.result}
                        color={log.result === 'success' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <List>
            {errorLogs.map((error, index) => (
              <React.Fragment key={error.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <Error />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {error.error}
                        </Typography>
                        <Chip
                          label={error.severity}
                          color={getSeverityColor(error.severity)}
                          size="small"
                        />
                        <Chip
                          label={error.resolved ? 'Resolved' : 'Active'}
                          color={error.resolved ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {error.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {error.stack}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Context: {JSON.stringify(error.context, null, 2)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {new Date(error.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < errorLogs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ActivityLogs;