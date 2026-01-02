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
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  Star,
  Schedule,
  LocationOn,
  Payment,
  Notifications,
} from '@mui/icons-material';
import { useAuthStore } from '../../store';
import { UserRole } from '../../types';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Total Bookings',
      value: '1,234',
      change: '+12%',
      icon: <Schedule />,
      color: 'primary',
    },
    {
      title: 'Active Providers',
      value: '567',
      change: '+8%',
      icon: <People />,
      color: 'secondary',
    },
    {
      title: 'Revenue',
      value: '₹45,678',
      change: '+15%',
      icon: <Payment />,
      color: 'success',
    },
    {
      title: 'Rating',
      value: '4.8',
      change: '+0.2',
      icon: <Star />,
      color: 'warning',
    },
  ];

  const recentBookings = [
    {
      id: '1',
      service: 'Home Cleaning',
      provider: 'CleanPro Services',
      date: '2024-01-15',
      status: 'confirmed',
      amount: '₹1,200',
    },
    {
      id: '2',
      service: 'Plumbing Repair',
      provider: 'QuickFix Plumbing',
      date: '2024-01-14',
      status: 'completed',
      amount: '₹800',
    },
    {
      id: '3',
      service: 'Electrical Work',
      provider: 'PowerTech Solutions',
      date: '2024-01-13',
      status: 'pending',
      amount: '₹1,500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';

    if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
    } else if (hour >= 17) {
      greeting = 'Good evening';
    }

    return `${greeting}, ${user?.name || 'User'}!`;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getWelcomeMessage()}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your account today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette[stat.color].main}15, ${theme.palette[stat.color].main}05)`,
                border: (theme) => `1px solid ${theme.palette[stat.color].main}20`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}.main`,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    {stat.change} from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Recent Bookings
                </Typography>
                <Button variant="outlined" size="small">
                  View All
                </Button>
              </Box>
              <List>
                {recentBookings.map((booking, index) => (
                  <React.Fragment key={booking.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Business />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {booking.service}
                            </Typography>
                            <Chip
                              label={booking.status}
                              size="small"
                              color={getStatusColor(booking.status) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {booking.provider} • {booking.date}
                            </Typography>
                            <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                              {booking.amount}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentBookings.length - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Notifications */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" fullWidth>
                  Book a Service
                </Button>
                <Button variant="outlined" fullWidth>
                  Find Providers
                </Button>
                <Button variant="outlined" fullWidth>
                  View Profile
                </Button>
                {user?.role === UserRole.PROVIDER && (
                  <Button variant="outlined" fullWidth>
                    Manage Services
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Notifications
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Booking Confirmed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your home cleaning service is confirmed for tomorrow
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Payment Received
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₹1,200 has been added to your wallet
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    New Provider Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Premium cleaning services now available in your area
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;