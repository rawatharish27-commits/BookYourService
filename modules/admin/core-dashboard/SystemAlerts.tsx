import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tabs,
  Tab,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Error,
  Warning,
  Info,
  CheckCircle,
  Notifications,
  NotificationsOff,
  Settings,
  Refresh,
  Security,
  Memory,
  Storage,
  NetworkCheck,
  Timer,
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

const SystemAlerts: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert);
    setAlertDialogOpen(true);
  };

  const activeAlerts = [
    {
      id: 1,
      type: 'error',
      title: 'High Error Rate Detected',
      message: 'API error rate exceeded 5% threshold in the last 10 minutes',
      timestamp: '2024-01-15 14:30:00',
      affected: 'Payment Gateway API',
      severity: 'Critical',
      status: 'Active',
      actions: ['Restart Service', 'Check Logs', 'Contact Support'],
    },
    {
      id: 2,
      type: 'warning',
      title: 'Provider Queue Backlog',
      message: '156 providers pending verification for more than 24 hours',
      timestamp: '2024-01-15 13:45:00',
      affected: 'Provider Onboarding',
      severity: 'High',
      status: 'Active',
      actions: ['Review Queue', 'Send Reminders', 'Escalate'],
    },
    {
      id: 3,
      type: 'info',
      title: 'Peak Load Detected',
      message: 'System load at 85% - peak hours detected',
      timestamp: '2024-01-15 12:00:00',
      affected: 'All Services',
      severity: 'Medium',
      status: 'Monitoring',
      actions: ['Scale Resources', 'Monitor Performance'],
    },
  ];

  const resolvedAlerts = [
    {
      id: 4,
      type: 'error',
      title: 'Database Connection Timeout',
      message: 'Database connection pool exhausted',
      timestamp: '2024-01-15 10:15:00',
      resolved: '2024-01-15 10:45:00',
      resolution: 'Auto-scaled database instances',
    },
    {
      id: 5,
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage exceeded 90%',
      timestamp: '2024-01-15 09:30:00',
      resolved: '2024-01-15 09:45:00',
      resolution: 'Garbage collection completed',
    },
  ];

  const systemMetrics = [
    {
      name: 'CPU Usage',
      value: 68,
      status: 'normal',
      threshold: 80,
      icon: <Memory />,
    },
    {
      name: 'Memory Usage',
      value: 72,
      status: 'normal',
      threshold: 85,
      icon: <Memory />,
    },
    {
      name: 'Disk Usage',
      value: 45,
      status: 'normal',
      threshold: 90,
      icon: <Storage />,
    },
    {
      name: 'Network Latency',
      value: 23,
      status: 'warning',
      threshold: 50,
      unit: 'ms',
      icon: <NetworkCheck />,
    },
    {
      name: 'Response Time',
      value: 145,
      status: 'normal',
      threshold: 200,
      unit: 'ms',
      icon: <Timer />,
    },
    {
      name: 'Error Rate',
      value: 2.3,
      status: 'normal',
      threshold: 5,
      unit: '%',
      icon: <Error />,
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
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

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            System Alerts & Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time system health monitoring and alert management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Auto-refresh"
          />
          <Button variant="outlined" startIcon={<Settings />}>
            Configure Alerts
          </Button>
          <Button variant="contained" startIcon={<Refresh />}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* System Status Overview */}
      <Alert
        severity="success"
        sx={{ mb: 3 }}
        icon={<CheckCircle />}
      >
        <Typography variant="body2">
          <strong>System Status:</strong> All critical systems operational • Last health check: {new Date().toLocaleTimeString()}
        </Typography>
      </Alert>

      {/* System Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {systemMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ pb: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Avatar sx={{ bgcolor: `${getMetricStatusColor(metric.status)}.main`, width: 32, height: 32 }}>
                    {metric.icon}
                  </Avatar>
                  <Chip
                    label={metric.status}
                    color={getMetricStatusColor(metric.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="h6" component="div">
                  {metric.value}{metric.unit || '%'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {metric.name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(metric.value / metric.threshold) * 100}
                  color={metric.value > metric.threshold * 0.8 ? 'warning' : 'success'}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Alerts Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label={`Active Alerts (${activeAlerts.length})`}
              icon={<Notifications />}
              iconPosition="start"
            />
            <Tab
              label={`Resolved (${resolvedAlerts.length})`}
              icon={<CheckCircle />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <List>
            {activeAlerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleAlertClick(alert)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'background.paper' }}>
                      {getAlertIcon(alert.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {alert.title}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                        <Chip
                          label={alert.status}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {alert.message}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {alert.timestamp} • {alert.affected}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {alert.actions.slice(0, 2).map((action) => (
                              <Button key={action} size="small" variant="outlined">
                                {action}
                              </Button>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < activeAlerts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {resolvedAlerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircle />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {alert.title}
                        </Typography>
                        <Chip
                          label="Resolved"
                          color="success"
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Reported: {alert.timestamp} • Resolved: {alert.resolved}
                        </Typography>
                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                          Resolution: {alert.resolution}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < resolvedAlerts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog
        open={alertDialogOpen}
        onClose={() => setAlertDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedAlert && getAlertIcon(selectedAlert.type)}
            {selectedAlert?.title}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" paragraph>
                  {selectedAlert.message}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip label={`Severity: ${selectedAlert.severity}`} color={getSeverityColor(selectedAlert.severity)} />
                  <Chip label={`Status: ${selectedAlert.status}`} color="primary" variant="outlined" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Timestamp:</strong> {selectedAlert.timestamp}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Affected Service:</strong> {selectedAlert.affected}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Available Actions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedAlert.actions.map((action: string) => (
                  <Button key={action} variant="outlined">
                    {action}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>Close</Button>
          <Button variant="contained" color="primary">
            Take Action
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemAlerts;