import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  Timeline,
  People,
  Business,
  Payment,
  LocationOn,
  Star,
  AccessTime,
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

const AnalyticsKPIs: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const kpiMetrics = [
    {
      title: 'Total Revenue',
      value: '₹12,45,678',
      change: '+18.5%',
      trend: 'up',
      period: 'vs last month',
      icon: <Payment />,
      color: 'success',
    },
    {
      title: 'Active Customers',
      value: '8,932',
      change: '+12.3%',
      trend: 'up',
      period: 'vs last month',
      icon: <People />,
      color: 'primary',
    },
    {
      title: 'Provider Retention',
      value: '87.5%',
      change: '+2.1%',
      trend: 'up',
      period: 'vs last month',
      icon: <Business />,
      color: 'secondary',
    },
    {
      title: 'Avg Rating',
      value: '4.6',
      change: '+0.2',
      trend: 'up',
      period: 'vs last month',
      icon: <Star />,
      color: 'warning',
    },
  ];

  const topServices = [
    { name: 'Home Cleaning', bookings: 1245, revenue: '₹2,45,000', growth: '+15%' },
    { name: 'Plumbing', bookings: 987, revenue: '₹1,98,000', growth: '+8%' },
    { name: 'Electrical', bookings: 756, revenue: '₹1,67,000', growth: '+12%' },
    { name: 'AC Repair', bookings: 654, revenue: '₹1,45,000', growth: '+22%' },
    { name: 'Carpentry', bookings: 543, revenue: '₹1,23,000', growth: '+5%' },
  ];

  const topLocations = [
    { city: 'Mumbai', bookings: 2341, revenue: '₹4,56,000', growth: '+18%' },
    { city: 'Delhi', bookings: 1987, revenue: '₹3,89,000', growth: '+14%' },
    { city: 'Bangalore', bookings: 1654, revenue: '₹3,23,000', growth: '+16%' },
    { city: 'Chennai', bookings: 1432, revenue: '₹2,87,000', growth: '+11%' },
    { city: 'Pune', bookings: 1234, revenue: '₹2,45,000', growth: '+9%' },
  ];

  const performanceMetrics = [
    { metric: 'Booking Conversion Rate', value: '68.5%', target: '70%', status: 'near' },
    { metric: 'Customer Satisfaction', value: '4.6/5', target: '4.7/5', status: 'on-track' },
    { metric: 'Provider Utilization', value: '82.3%', target: '85%', status: 'behind' },
    { metric: 'Response Time (avg)', value: '12 min', target: '10 min', status: 'behind' },
    { metric: 'Cancellation Rate', value: '4.2%', target: '3%', status: 'behind' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'success';
      case 'near':
        return 'warning';
      case 'behind':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp /> : <TrendingDown />;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics & KPIs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive performance metrics and business intelligence
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${metric.color}.main` }}>
                    {metric.icon}
                  </Avatar>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(metric.trend)}
                    <Typography variant="body2" color={`${metric.color}.main`} sx={{ ml: 0.5 }}>
                      {metric.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {metric.period}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs for different analytics views */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<BarChart />} label="Performance" />
            <Tab icon={<PieChart />} label="Services" />
            <Tab icon={<LocationOn />} label="Locations" />
            <Tab icon={<Timeline />} label="Trends" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Key Performance Indicators
          </Typography>
          <Grid container spacing={3}>
            {performanceMetrics.map((metric, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {metric.metric}
                      </Typography>
                      <Chip
                        label={metric.status.replace('-', ' ')}
                        color={getStatusColor(metric.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">{metric.value}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Target: {metric.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(parseFloat(metric.value) / parseFloat(metric.target.replace(/[^\d.]/g, ''))) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Top Performing Services
          </Typography>
          <List>
            {topServices.map((service, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Business />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {service.name}
                        </Typography>
                        <Chip
                          label={service.growth}
                          color="success"
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {service.bookings} bookings
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {service.revenue}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < topServices.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Top Locations by Revenue
          </Typography>
          <List>
            {topLocations.map((location, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <LocationOn />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {location.city}
                        </Typography>
                        <Chip
                          label={location.growth}
                          color="success"
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {location.bookings} bookings
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {location.revenue}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < topLocations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Trend Analysis
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <BarChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Trend charts and historical data visualization will be implemented here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Integration with charting libraries like Chart.js or Recharts
            </Typography>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default AnalyticsKPIs;