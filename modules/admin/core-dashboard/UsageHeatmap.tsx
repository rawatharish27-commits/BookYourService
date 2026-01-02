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
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  TrendingUp,
  People,
  Business,
  EventNote,
} from '@mui/icons-material';

const UsageHeatmap: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('bookings');

  const heatmapData = [
    { time: '00:00', bookings: 12, users: 45, providers: 8 },
    { time: '01:00', bookings: 8, users: 32, providers: 5 },
    { time: '02:00', bookings: 5, users: 18, providers: 3 },
    { time: '03:00', bookings: 3, users: 12, providers: 2 },
    { time: '04:00', bookings: 2, users: 8, providers: 1 },
    { time: '05:00', bookings: 4, users: 15, providers: 3 },
    { time: '06:00', bookings: 15, users: 67, providers: 12 },
    { time: '07:00', bookings: 28, users: 123, providers: 22 },
    { time: '08:00', bookings: 45, users: 189, providers: 35 },
    { time: '09:00', bookings: 67, users: 245, providers: 48 },
    { time: '10:00', bookings: 89, users: 312, providers: 62 },
    { time: '11:00', bookings: 95, users: 345, providers: 68 },
    { time: '12:00', bookings: 112, users: 423, providers: 78 },
    { time: '13:00', bookings: 108, users: 398, providers: 75 },
    { time: '14:00', bookings: 98, users: 367, providers: 69 },
    { time: '15:00', bookings: 87, users: 334, providers: 61 },
    { time: '16:00', bookings: 76, users: 298, providers: 55 },
    { time: '17:00', bookings: 92, users: 356, providers: 67 },
    { time: '18:00', bookings: 118, users: 445, providers: 82 },
    { time: '19:00', bookings: 134, users: 498, providers: 91 },
    { time: '20:00', bookings: 145, users: 523, providers: 98 },
    { time: '21:00', bookings: 132, users: 487, providers: 89 },
    { time: '22:00', bookings: 98, users: 367, providers: 68 },
    { time: '23:00', bookings: 67, users: 245, providers: 45 },
  ];

  const locationData = [
    { city: 'Mumbai', bookings: 2341, activeUsers: 1892, activeProviders: 456, peakHour: '20:00' },
    { city: 'Delhi', bookings: 1987, activeUsers: 1654, activeProviders: 387, peakHour: '19:00' },
    { city: 'Bangalore', bookings: 1654, activeUsers: 1432, activeProviders: 298, peakHour: '18:00' },
    { city: 'Chennai', bookings: 1432, activeUsers: 1234, activeProviders: 267, peakHour: '21:00' },
    { city: 'Pune', bookings: 1234, activeUsers: 1087, activeProviders: 234, peakHour: '19:00' },
    { city: 'Hyderabad', bookings: 987, activeUsers: 876, activeProviders: 198, peakHour: '20:00' },
    { city: 'Kolkata', bookings: 756, activeUsers: 654, activeProviders: 145, peakHour: '18:00' },
    { city: 'Ahmedabad', bookings: 654, activeUsers: 543, activeProviders: 123, peakHour: '17:00' },
  ];

  const getHeatmapColor = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity < 0.2) return '#e3f2fd'; // Light blue
    if (intensity < 0.4) return '#bbdefb';
    if (intensity < 0.6) return '#90caf9';
    if (intensity < 0.8) return '#64b5f6';
    return '#42a5f5'; // Dark blue
  };

  const getMaxValue = (metric: string) => {
    return Math.max(...heatmapData.map(d => d[metric as keyof typeof d] as number));
  };

  const currentMax = getMaxValue(selectedMetric);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Usage Heatmap
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time platform usage patterns and geographic distribution
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Metric</InputLabel>
            <Select
              value={selectedMetric}
              label="Metric"
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <MenuItem value="bookings">Bookings</MenuItem>
              <MenuItem value="users">Active Users</MenuItem>
              <MenuItem value="providers">Active Providers</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Hourly Heatmap */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hourly Activity Heatmap
              </Typography>
              <Box sx={{ overflowX: 'auto', mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 800 }}>
                  {/* Time labels */}
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <Box sx={{ width: 60, mr: 1 }} /> {/* Spacer for time column */}
                    {heatmapData.map((data, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 30,
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                        }}
                      >
                        {data.time}
                      </Box>
                    ))}
                  </Box>

                  {/* Heatmap row */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 60,
                        mr: 1,
                        fontSize: '0.875rem',
                        fontWeight: 'medium',
                        textAlign: 'right',
                      }}
                    >
                      {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
                    </Box>
                    {heatmapData.map((data, index) => {
                      const value = data[selectedMetric as keyof typeof data] as number;
                      return (
                        <Box
                          key={index}
                          sx={{
                            width: 30,
                            height: 40,
                            backgroundColor: getHeatmapColor(value, currentMax),
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'medium',
                            color: value > currentMax * 0.6 ? 'white' : 'text.primary',
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8,
                            },
                          }}
                          title={`${data.time}: ${value} ${selectedMetric}`}
                        >
                          {value}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  Low
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity) => (
                    <Box
                      key={intensity}
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: getHeatmapColor(currentMax * intensity, currentMax),
                        border: '1px solid #e0e0e0',
                        borderRadius: 0.5,
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  High
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours Summary */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Peak Hours Summary
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="medium">
                    Peak Booking Hour: 20:00 (145 bookings)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="body1" fontWeight="medium">
                    Peak User Activity: 20:00 (523 users)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body1" fontWeight="medium">
                    Peak Provider Activity: 20:00 (98 providers)
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Today's Highlights
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                  label="Evening Rush: 18:00 - 22:00"
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label="Morning Peak: 08:00 - 12:00"
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label="Low Activity: 02:00 - 05:00"
                  color="default"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Geographic Distribution */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Geographic Distribution
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>City</TableCell>
                      <TableCell align="right">Total Bookings</TableCell>
                      <TableCell align="right">Active Users</TableCell>
                      <TableCell align="right">Active Providers</TableCell>
                      <TableCell align="right">Peak Hour</TableCell>
                      <TableCell align="right">Activity Level</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {locationData.map((row) => (
                      <TableRow key={row.city}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" fontWeight="medium">
                              {row.city}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{row.bookings.toLocaleString()}</TableCell>
                        <TableCell align="right">{row.activeUsers.toLocaleString()}</TableCell>
                        <TableCell align="right">{row.activeProviders.toLocaleString()}</TableCell>
                        <TableCell align="right">{row.peakHour}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={
                              row.bookings > 1500 ? 'High' :
                              row.bookings > 1000 ? 'Medium' : 'Low'
                            }
                            color={
                              row.bookings > 1500 ? 'success' :
                              row.bookings > 1000 ? 'warning' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UsageHeatmap;