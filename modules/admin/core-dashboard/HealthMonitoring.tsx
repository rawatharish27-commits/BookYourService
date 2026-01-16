import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
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
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  Memory,
  Storage,
  NetworkCheck,
  Timer,
  Security,
  Database,
  Cloud,
  Settings,
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

const HealthMonitoring: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const runHealthCheck = () => {
    setIsRunningCheck(true);
    // Simulate health check
    setTimeout(() => {
      setIsRunningCheck(false);
    }, 3000);
  };

  const services = [
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '45ms',
      lastCheck: '2 minutes ago',
      location: 'us-east-1',
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: '12ms',
      lastCheck: '1 minute ago',
      location: 'us-east-1',
    },
    {
      name: 'Payment Service',
      status: 'warning',
      uptime: '98.5%',
      responseTime: '89ms',
      lastCheck: '5 minutes ago',
      location: 'us-west-2',
    },
    {
      name: 'Notification Service',
      status: 'healthy',
      uptime: '99.7%',
      responseTime: '34ms',
      lastCheck: '3 minutes ago',
      location: 'eu-west-1',
    },
    {
      name: 'File Storage',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '67ms',
      lastCheck: '2 minutes ago',
      location: 'us-east-1',
    },
    {
      name: 'Authentication',
      status: 'healthy',
      uptime: '99.6%',
      responseTime: '28ms',
      lastCheck: '1 minute ago',
      location: 'us-east-1',
    },
  ];

  const infrastructure = [
    {
      component: 'Load Balancer',
      status: 'healthy',
      metrics: { cpu: 45, memory: 62, connections: 1250 },
      region: 'us-east-1',
    },
    {
      component: 'Application Server 1',
      status: 'healthy',
      metrics: { cpu: 67, memory: 78, connections: 890 },
      region: 'us-east-1',
    },
    {
      component: 'Application Server 2',
      status: 'warning',
      metrics: { cpu: 89, memory: 92, connections: 654 },
      region: 'us-west-2',
    },
    {
      component: 'Database Primary',
      status: 'healthy',
      metrics: { cpu: 34, memory: 56, connections: 2340 },
      region: 'us-east-1',
    },
    {
      component: 'Database Replica',
      status: 'healthy',
      metrics: { cpu: 28, memory: 45, connections: 1876 },
      region: 'us-west-2',
    },
    {
      component: 'Cache Cluster',
      status: 'healthy',
      metrics: { cpu: 23, memory: 67, connections: 3456 },
      region: 'us-east-1',
    },
  ];

  const securityChecks = [
    {
      check: 'SSL Certificate',
      status: 'healthy',
      details: 'Valid until 2024-08-15',
      lastCheck: '1 hour ago',
    },
    {
      check: 'Firewall Rules',
      status: 'healthy',
      details: 'All rules up to date',
      lastCheck: '30 minutes ago',
    },
    {
      check: 'DDoS Protection',
      status: 'healthy',
      details: 'Active and monitoring',
      lastCheck: '15 minutes ago',
    },
    {
      check: 'Data Encryption',
      status: 'healthy',
      details: 'AES-256 encryption active',
      lastCheck: '1 hour ago',
    },
    {
      check: 'Access Control',
      status: 'warning',
      details: '2 failed login attempts detected',
      lastCheck: '10 minutes ago',
    },
    {
      check: 'Vulnerability Scan',
      status: 'healthy',
      details: 'Last scan: No critical issues',
      lastCheck: '24 hours ago',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHealthScore = () => {
    const healthyCount = services.filter(s => s.status === 'healthy').length +
                        infrastructure.filter(i => i.status === 'healthy').length +
                        securityChecks.filter(s => s.status === 'healthy').length;
    const totalCount = services.length + infrastructure.length + securityChecks.length;
    return Math.round((healthyCount / totalCount) * 100);
  };

  const healthScore = getHealthScore();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Health Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive system health checks and infrastructure monitoring
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={isRunningCheck ? <CircularProgress size={20} /> : <Refresh />}
          onClick={runHealthCheck}
          disabled={isRunningCheck}
        >
          {isRunningCheck ? 'Running Checks...' : 'Run Health Check'}
        </Button>
      </Box>

      {/* Overall Health Score */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                System Health Score
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Overall system health based on all monitored components
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {healthScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Health Score
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={healthScore}
              color={healthScore >= 95 ? 'success' : healthScore >= 85 ? 'warning' : 'error'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Health Check Results */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Services" />
            <Tab label="Infrastructure" />
            <Tab label="Security" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Service Health Status
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uptime</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Last Check</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.name}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                          <Settings sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {service.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(service.status)}
                        label={service.status}
                        color={getStatusColor(service.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{service.uptime}</TableCell>
                    <TableCell>{service.responseTime}</TableCell>
                    <TableCell>{service.lastCheck}</TableCell>
                    <TableCell>{service.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Infrastructure Monitoring
          </Typography>
          <Grid container spacing={3}>
            {infrastructure.map((component, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {component.component}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(component.status)}
                        label={component.status}
                        color={getStatusColor(component.status)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        CPU Usage: {component.metrics.cpu}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={component.metrics.cpu}
                        color={component.metrics.cpu > 80 ? 'warning' : 'success'}
                        sx={{ height: 6, borderRadius: 3, mb: 2 }}
                      />

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Memory Usage: {component.metrics.memory}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={component.metrics.memory}
                        color={component.metrics.memory > 85 ? 'warning' : 'success'}
                        sx={{ height: 6, borderRadius: 3, mb: 2 }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        Active Connections: {component.metrics.connections.toLocaleString()}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Region: {component.region}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Security Health Checks
          </Typography>
          <List>
            {securityChecks.map((check, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'background.paper' }}>
                      {getStatusIcon(check.status)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {check.check}
                        </Typography>
                        <Chip
                          label={check.status}
                          color={getStatusColor(check.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {check.details}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last checked: {check.lastCheck}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < securityChecks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Card>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh All Metrics
          </Button>
          <Button variant="outlined" startIcon={<Settings />}>
            Configure Monitoring
          </Button>
          <Button variant="outlined" startIcon={<Security />}>
            Security Audit
          </Button>
          <Button variant="outlined" startIcon={<Cloud />}>
            Infrastructure Status
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HealthMonitoring;