import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Home,
  Work,
  LocationOn,
  Check,
  Close,
  MyLocation,
} from '@mui/icons-material';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const AddressManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      label: 'Home',
      name: 'John Doe',
      phone: '+91 98765 43210',
      street: '123 Main Street, Apartment 4B',
      area: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      landmark: 'Near Bandra Station',
      isDefault: true,
    },
    {
      id: '2',
      type: 'work',
      label: 'Office',
      name: 'John Doe',
      phone: '+91 98765 43210',
      street: '456 Business Park, Tower A',
      area: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400059',
      landmark: 'Opposite Metro Station',
      isDefault: false,
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    label: '',
    name: '',
    phone: '',
    street: '',
    area: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
  });

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        type: 'home',
        label: '',
        name: '',
        phone: '',
        street: '',
        area: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '',
        landmark: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAddress(null);
    setFormData({});
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev =>
        prev.map(addr =>
          addr.id === editingAddress.id
            ? { ...formData, id: addr.id } as Address
            : addr
        )
      );
    } else {
      // Add new address
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
        isDefault: addresses.length === 0, // First address is default
      } as Address;
      setAddresses(prev => [...prev, newAddress]);
    }
    handleCloseDialog();
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
  };

  const handleDetectLocation = () => {
    // In real app, this would use geolocation API
    setFormData(prev => ({
      ...prev,
      street: 'Detected Location: 123 Sample Street',
      area: 'Sample Area',
      pincode: '400001',
    }));
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home />;
      case 'work':
        return <Work />;
      default:
        return <LocationOn />;
    }
  };

  const AddressCard: React.FC<{ address: Address }> = ({ address }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {getAddressIcon(address.type)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {address.label}
                </Typography>
                {address.isDefault && (
                  <Chip label="Default" color="primary" size="small" />
                )}
              </Box>

              <Typography variant="body1" fontWeight="medium" gutterBottom>
                {address.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                {address.street}, {address.area}
                <br />
                {address.city}, {address.state} - {address.pincode}
                {address.landmark && (
                  <>
                    <br />
                    Landmark: {address.landmark}
                  </>
                )}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                📞 {address.phone}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(address)}
              color="primary"
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteAddress(address.id)}
              color="error"
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>

        {!address.isDefault && (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleSetDefault(address.id)}
            >
              Set as Default
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Manage Addresses</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Address
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage your delivery and service addresses. You can add multiple addresses for home, work, or other locations.
      </Alert>

      {/* Address List */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No addresses added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add your first address to get started with bookings
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </Box>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Address Type</InputLabel>
                <Select
                  value={formData.type || 'home'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Address['type'] }))}
                >
                  <MenuItem value="home">🏠 Home</MenuItem>
                  <MenuItem value="work">💼 Work</MenuItem>
                  <MenuItem value="other">📍 Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Label"
                placeholder="e.g., Home, Office, Parents' House"
                value={formData.label || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  label="Street Address"
                  placeholder="House/Flat number, Street name"
                  value={formData.street || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                />
                <IconButton
                  sx={{ ml: 1 }}
                  onClick={handleDetectLocation}
                  color="primary"
                >
                  <MyLocation />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Click the location icon to auto-detect your address
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area/Locality"
                value={formData.area || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                placeholder="Near a famous place or landmark"
                value={formData.landmark || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pincode"
                value={formData.pincode || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveAddress}
            variant="contained"
            disabled={!formData.name || !formData.phone || !formData.street || !formData.pincode}
          >
            {editingAddress ? 'Update' : 'Save'} Address
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddressManagement;