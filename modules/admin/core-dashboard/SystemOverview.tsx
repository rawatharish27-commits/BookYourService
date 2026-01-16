import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  EventNote,
  Payment,
  Warning,
  CheckCircle,
  Error,
  Info,
  Timeline,
  LocationOn,
  Notifications,
  Security,
} from '@mui/icons-material';

const SystemOverview: React.FC = () => {
  const kpis = [
    {
      title: 'Active Users',
      value: '12,456',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: <People />,
      color: 'primary',
    },
    {
      title: 'Total Providers',
      value: '3,421',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <Business />,
      color: 'secondary',
    },
    {
      title: 'Today Bookings',
      value: '1,234',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: <EventNote />,
      color: 'success',
    },
    {
      title: 'Revenue Today',
      value: '₹2,45,678',
      change: '+22.1%',
      changeType: 'positive' as const,
      icon: <Payment />,
      color: 'warning',
    },
  ];

  const systemAlerts = [
    {
      type: 'error' as const,
      title: 'High Error Rate',
      message: 'API error rate exceeded 5% threshold',
      time: '2 minutes ago',
    },
    {
      type: 'warning' as const,
      title: 'Provider Queue',
      message: '156 providers pending verification',
      time: '15 minutes ago',
    },
    {
      type: 'info' as const,
      title: 'Peak Hours',
      message: 'System load at 85% - peak hours detected',
      time: '1 hour ago',
    },
  ];

  const recentActivity = [
    {
      action: 'New provider registered',
      user: 'Rajesh Kumar',
      time: '5 min ago',
      type: 'provider',
    },
    {
      action: 'Booking completed',
      user: 'Priya Sharma',
      time: '12 min ago',
      type: 'booking',
    },
    {
      action: 'Payment failed',
      user: 'Amit Singh',
      time: '18 min ago',
      type: 'payment',
    },
    {
      action: 'Support ticket resolved',
      user: 'System',
      time: '25 min ago',
      type: 'support',
    },
  ];

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'success.main';
      case 'negative':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'provider':
        return <Business sx={{ fontSize: 20 }} />;
      case 'booking':
        return <EventNote sx={{ fontSize: 20 }} />;
      case 'payment':
        return <Payment sx={{ fontSize: 20 }} />;
      case 'support':
        return <CheckCircle sx={{ fontSize: 20 }} />;
      default:
        return <Info sx={{ fontSize: 20 }} />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time dashboard monitoring all platform activities
        </Typography>
      </Box>

      {/* System Status Alert */}
      <Alert
        severity="success"
        sx={{ mb: 3 }}
        icon={<CheckCircle />}
      >
        <Typography variant="body2">
          <strong>System Status:</strong> All systems operational • Last updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Alert>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette[kpi.color].main}15, ${theme.palette[kpi.color].main}05)`,
                border: (theme) => `1px solid ${theme.palette[kpi.color].main}20`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${kpi.color}.main`,
                      mr: 2,
                    }}
                  >
                    {kpi.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {kpi.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {kpi.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ fontSize: 16, color: getChangeColor(kpi.changeType), mr: 0.5 }} />
                  <Typography variant="body2" color={getChangeColor(kpi.changeType)}>
                    {kpi.change} from yesterday
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* System Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  System Alerts
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {systemAlerts.map((alert, index) => (
                  <Alert
                    key={index}
                    severity={alert.type}
                    variant="outlined"
                    sx={{ '& .MuiAlert-message': { width: '100%' } }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {alert.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.time}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timeline sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Recent Activity
                  </Typography>
                </Box>
                <Button variant="outlined" size="small">
                  View All
                </Button>
              </Box>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {activity.action}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.user} • {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button variant="contained" startIcon={<Security />}>
                  Emergency Freeze
                </Button>
                <Button variant="outlined" startIcon={<Warning />}>
                  Send Alert
                </Button>
                <Button variant="outlined" startIcon={<LocationOn />}>
                  View Heatmap
                </Button>
                <Button variant="outlined" startIcon={<Timeline />}>
                  System Logs
                </Button>
                <Button variant="outlined" startIcon={<CheckCircle />}>
                  Health Check
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemOverview;