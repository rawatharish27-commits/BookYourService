import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  CheckCircle,
  Cancel,
  Edit,
  Add,
  Delete,
  Schedule,
  Today,
  DateRange,
} from '@mui/icons-material';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilitySettings {
  isOnline: boolean;
  autoAccept: boolean;
  maxJobsPerDay: number;
  advanceBookingDays: number;
  workingRadius: number;
}

const AvailabilityCalendar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings>({
    isOnline: true,
    autoAccept: false,
    maxJobsPerDay: 5,
    advanceBookingDays: 7,
    workingRadius: 10,
  });

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', day: 'Monday', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { id: '2', day: 'Tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { id: '3', day: 'Wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { id: '4', day: 'Thursday', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { id: '5', day: 'Friday', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { id: '6', day: 'Saturday', startTime: '10:00', endTime: '16:00', isAvailable: true },
    { id: '7', day: 'Sunday', startTime: '10:00', endTime: '14:00', isAvailable: false },
  ]);

  const [editDialog, setEditDialog] = useState({
    open: false,
    slot: null as TimeSlot | null,
  });

  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '18:00',
    isAvailable: true,
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleToggleAvailability = (slotId: string) => {
    setTimeSlots(prev =>
      prev.map(slot =>
        slot.id === slotId
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    );
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditDialog({ open: true, slot });
    setNewSlot({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
    });
  };

  const handleSaveSlot = () => {
    if (editDialog.slot) {
      // Edit existing slot
      setTimeSlots(prev =>
        prev.map(slot =>
          slot.id === editDialog.slot!.id
            ? { ...slot, ...newSlot }
            : slot
        )
      );
    } else {
      // Add new slot
      const newId = Date.now().toString();
      setTimeSlots(prev => [...prev, { id: newId, ...newSlot }]);
    }
    setEditDialog({ open: false, slot: null });
  };

  const handleDeleteSlot = (slotId: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  const getDaySlots = (day: string) => {
    return timeSlots.filter(slot => slot.day === day);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Availability & Calendar
      </Typography>

      {/* Current Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Current Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={availabilitySettings.isOnline ? 'Online' : 'Offline'}
                  color={availabilitySettings.isOnline ? 'success' : 'default'}
                  icon={<CheckCircle />}
                />
                <Typography variant="body2" color="text.secondary">
                  You are currently {availabilitySettings.isOnline ? 'visible to customers' : 'invisible to customers'}
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={availabilitySettings.isOnline}
                  onChange={(e) => setAvailabilitySettings(prev => ({
                    ...prev,
                    isOnline: e.target.checked
                  }))}
                  color="primary"
                />
              }
              label="Go Online"
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Quick Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={availabilitySettings.autoAccept}
                      onChange={(e) => setAvailabilitySettings(prev => ({
                        ...prev,
                        autoAccept: e.target.checked
                      }))}
                    />
                  }
                  label="Auto-accept bookings"
                />
                <TextField
                  label="Max jobs per day"
                  type="number"
                  size="small"
                  value={availabilitySettings.maxJobsPerDay}
                  onChange={(e) => setAvailabilitySettings(prev => ({
                    ...prev,
                    maxJobsPerDay: parseInt(e.target.value) || 1
                  }))}
                />
                <TextField
                  label="Advance booking (days)"
                  type="number"
                  size="small"
                  value={availabilitySettings.advanceBookingDays}
                  onChange={(e) => setAvailabilitySettings(prev => ({
                    ...prev,
                    advanceBookingDays: parseInt(e.target.value) || 1
                  }))}
                />
                <TextField
                  label="Working radius (km)"
                  type="number"
                  size="small"
                  value={availabilitySettings.workingRadius}
                  onChange={(e) => setAvailabilitySettings(prev => ({
                    ...prev,
                    workingRadius: parseInt(e.target.value) || 1
                  }))}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Today's Schedule
              </Typography>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  <Today sx={{ mr: 1, verticalAlign: 'middle' }} />
                  January 15, 2024
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Home Cleaning - Rahul Sharma" secondary="10:00 AM - 12:00 PM" />
                    <Chip label="Confirmed" size="small" color="success" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="AC Repair - Priya Patel" secondary="2:00 PM - 3:30 PM" />
                    <Chip label="Confirmed" size="small" color="success" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Available" secondary="4:00 PM - 6:00 PM" />
                    <Chip label="Available" size="small" variant="outlined" />
                  </ListItem>
                </List>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              <DateRange sx={{ mr: 1, verticalAlign: 'middle' }} />
              Weekly Schedule
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setEditDialog({ open: true, slot: null })}
            >
              Add Time Slot
            </Button>
          </Box>

          <Grid container spacing={2}>
            {daysOfWeek.map((day) => {
              const daySlots = getDaySlots(day);
              return (
                <Grid item xs={12} md={6} lg={4} key={day}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      {day}
                    </Typography>
                    {daySlots.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No slots configured
                      </Typography>
                    ) : (
                      <List dense>
                        {daySlots.map((slot) => (
                          <ListItem key={slot.id} sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AccessTime sx={{ fontSize: 16 }} />
                                  <Typography variant="body2">
                                    {slot.startTime} - {slot.endTime}
                                  </Typography>
                                  <Chip
                                    label={slot.isAvailable ? 'Available' : 'Unavailable'}
                                    size="small"
                                    color={slot.isAvailable ? 'success' : 'default'}
                                    variant="outlined"
                                  />
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton size="small" onClick={() => handleEditSlot(slot)}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleToggleAvailability(slot.id)}>
                                {slot.isAvailable ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteSlot(slot.id)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Upcoming Bookings */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
            Upcoming Bookings
          </Typography>

          <List>
            <ListItem divider>
              <ListItemText
                primary="Home Cleaning - Rahul Sharma"
                secondary="Tomorrow, 10:00 AM - 12:00 PM • Andheri West"
              />
              <Chip label="Confirmed" size="small" color="success" />
            </ListItem>
            <ListItem divider>
              <ListItemText
                primary="AC Repair - Priya Patel"
                secondary="Tomorrow, 2:00 PM - 3:30 PM • Bandra East"
              />
              <Chip label="Confirmed" size="small" color="success" />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Plumbing - Amit Kumar"
                secondary="Jan 16, 9:00 AM - 9:45 AM • Juhu"
              />
              <Chip label="Pending" size="small" color="warning" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Edit/Add Slot Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, slot: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editDialog.slot ? 'Edit Time Slot' : 'Add Time Slot'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Day"
                value={newSlot.day}
                onChange={(e) => setNewSlot(prev => ({ ...prev, day: e.target.value }))}
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newSlot.isAvailable}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  />
                }
                label="Available for bookings"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, slot: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveSlot} variant="contained">
            {editDialog.slot ? 'Update' : 'Add'} Slot
          </Button>
        </DialogActions>
      </Dialog>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Availability Tips:</strong> Keep your schedule updated to receive more booking requests.
          Customers can only book during your available time slots.
        </Typography>
      </Alert>
    </Box>
  );
};

export default AvailabilityCalendar;