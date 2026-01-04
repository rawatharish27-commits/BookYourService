import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Today,
  AttachMoney,
  Work,
  Schedule,
  LocationOn,
  Phone,
  Message,
  CheckCircle,
  Pending,
  Cancel,
  TrendingUp,
  AccountBalanceWallet,
  Star,
  AccessTime,
} from '@mui/icons-material';

interface TodaysJob {
  id: string;
  customerName: string;
  customerAvatar: string;
  service: string;
  time: string;
  location: string;
  amount: number;
  status: 'upcoming' | 'in-progress' | 'completed';
  customerPhone: string;
}

interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
  available: number;
}

const ProviderDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [todaysJobs, setTodaysJobs] = useState<TodaysJob[]>([
    {
      id: 'JOB001',
      customerName: 'Rahul Sharma',
      customerAvatar: '/api/placeholder/40/40',
      service: 'Home Cleaning',
      time: '10:00 AM',
      location: 'Andheri West, Mumbai',
      amount: 599,
      status: 'upcoming',
      customerPhone: '+91 98765 43210',
    },
    {
      id: 'JOB002',
      customerName: 'Priya Patel',
      customerAvatar: '/api/placeholder/40/40',
      service: 'AC Repair',
      time: '2:00 PM',
      location: 'Bandra East, Mumbai',
      amount: 899,
      status: 'upcoming',
      customerPhone: '+91 87654 32109',
    },
    {
      id: 'JOB003',
      customerName: 'Amit Kumar',
      customerAvatar: '/api/placeholder/40/40',
      service: 'Plumbing',
      time: '4:30 PM',
      location: 'Juhu, Mumbai',
      amount: 450,
      status: 'in-progress',
      customerPhone: '+91 76543 21098',
    },
  ]);

  const [earnings, setEarnings] = useState<EarningsSummary>({
    today: 1948,
    thisWeek: 8750,
    thisMonth: 32500,
    pending: 1200,
    available: 8750,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Schedule />;
      case 'in-progress': return <Work />;
      case 'completed': return <CheckCircle />;
      default: return <Pending />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Provider Dashboard
      </Typography>

      {/* Earnings Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                    ₹{earnings.today}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Earnings
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ₹{earnings.available}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Balance
                  </Typography>
                </Box>
                <AccountBalanceWallet sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ₹{earnings.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Payout
                  </Typography>
                </Box>
                <Pending sx={{ fontSize: 40, color: theme.palette.warning.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {todaysJobs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Jobs
                  </Typography>
                </Box>
                <Work sx={{ fontSize: 40, color: theme.palette.info.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Jobs */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              <Today sx={{ mr: 1, verticalAlign: 'middle' }} />
              Today's Schedule
            </Typography>
            <Button variant="outlined" size="small">
              View Calendar
            </Button>
          </Box>

          <List>
            {todaysJobs.map((job, index) => (
              <React.Fragment key={job.id}>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Chip
                          label={job.status}
                          size="small"
                          color={getStatusColor(job.status)}
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      }
                    >
                      <Avatar src={job.customerAvatar} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">{job.customerName}</Typography>
                        {getStatusIcon(job.status)}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {job.service} • {job.time}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          {job.location}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                      ₹{job.amount}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <IconButton size="small" color="primary">
                        <Phone fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <Message fontSize="small" />
                      </IconButton>
                      {job.status === 'upcoming' && (
                        <Button size="small" variant="outlined">
                          Start Job
                        </Button>
                      )}
                      {job.status === 'in-progress' && (
                        <Button size="small" variant="contained" color="success">
                          Complete
                        </Button>
                      )}
                    </Box>
                  </Box>
                </ListItem>
                {index < todaysJobs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Work />}
                    sx={{ py: 2 }}
                  >
                    New Requests
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Schedule />}
                    sx={{ py: 2 }}
                  >
                    Set Availability
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountBalanceWallet />}
                    sx={{ py: 2 }}
                  >
                    View Earnings
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Star />}
                    sx={{ py: 2 }}
                  >
                    My Reviews
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Performance This Week
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Jobs Completed</Typography>
                  <Typography variant="body2">12/15</Typography>
                </Box>
                <LinearProgress variant="determinate" value={80} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Customer Rating</Typography>
                  <Typography variant="body2">4.8/5.0</Typography>
                </Box>
                <LinearProgress variant="determinate" value={96} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Response Time</Typography>
                  <Typography variant="body2">< 5 min</Typography>
                </Box>
                <LinearProgress variant="determinate" value={95} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProviderDashboard;