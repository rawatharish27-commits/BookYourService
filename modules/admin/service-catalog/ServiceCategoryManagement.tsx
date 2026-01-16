import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Category,
  Business,
  Settings,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  parentCategory?: string;
  subcategories: string[];
  providerCount: number;
  bookingCount: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

const ServiceCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([
    {
      id: '1',
      name: 'Home Services',
      description: 'Cleaning, repairs, and maintenance services',
      icon: 'home',
      isActive: true,
      subcategories: ['Cleaning', 'Plumbing', 'Electrical'],
      providerCount: 245,
      bookingCount: 1250,
      commissionRate: 15,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Professional Services',
      description: 'Consulting and professional expertise',
      icon: 'business',
      isActive: true,
      subcategories: ['Legal', 'Financial', 'IT Support'],
      providerCount: 89,
      bookingCount: 567,
      commissionRate: 20,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-14',
    },
    {
      id: '3',
      name: 'Health & Wellness',
      description: 'Medical and wellness services',
      icon: 'health',
      isActive: false,
      subcategories: ['Medical', 'Fitness', 'Therapy'],
      providerCount: 156,
      bookingCount: 892,
      commissionRate: 18,
      createdAt: '2024-01-03',
      updatedAt: '2024-01-13',
    },
  ]);

  const [filteredCategories, setFilteredCategories] = useState<ServiceCategory[]>(categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true,
    commissionRate: 15,
    subcategories: '',
  });

  React.useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, statusFilter]);

  const filterCategories = () => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(category =>
        statusFilter === 'active' ? category.isActive : !category.isActive
      );
    }

    setFilteredCategories(filtered);
  };

  const handleOpenDialog = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon,
        isActive: category.isActive,
        commissionRate: category.commissionRate,
        subcategories: category.subcategories.join(', '),
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        icon: '',
        isActive: true,
        commissionRate: 15,
        subcategories: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSave = () => {
    const categoryData: ServiceCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      isActive: formData.isActive,
      subcategories: formData.subcategories.split(',').map(s => s.trim()),
      providerCount: editingCategory?.providerCount || 0,
      bookingCount: editingCategory?.bookingCount || 0,
      commissionRate: formData.commissionRate,
      createdAt: editingCategory?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingCategory) {
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? categoryData : cat
      ));
      setSnackbar({ open: true, message: 'Category updated successfully!', severity: 'success' });
    } else {
      setCategories([...categories, categoryData]);
      setSnackbar({ open: true, message: 'Category created successfully!', severity: 'success' });
    }

    handleCloseDialog();
  };

  const handleDelete = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    setSnackbar({ open: true, message: 'Category deleted successfully!', severity: 'success' });
  };

  const handleToggleStatus = (categoryId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive, updatedAt: new Date().toISOString() } : cat
    ));
    setSnackbar({ open: true, message: 'Category status updated!', severity: 'success' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Service Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search categories..."
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
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" color="textSecondary">
            Total Categories: {categories.length}
          </Typography>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Categories
              </Typography>
              <Typography variant="h4">
                {categories.filter(c => c.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Providers
              </Typography>
              <Typography variant="h4">
                {categories.reduce((sum, cat) => sum + cat.providerCount, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Bookings
              </Typography>
              <Typography variant="h4">
                {categories.reduce((sum, cat) => sum + cat.bookingCount, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Commission
              </Typography>
              <Typography variant="h4">
                {Math.round(categories.reduce((sum, cat) => sum + cat.commissionRate, 0) / categories.length)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Subcategories</TableCell>
                <TableCell>Providers</TableCell>
                <TableCell>Bookings</TableCell>
                <TableCell>Commission</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Category sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {category.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {category.icon}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {category.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {category.subcategories.slice(0, 2).map((sub, index) => (
                        <Chip key={index} label={sub} size="small" variant="outlined" />
                      ))}
                      {category.subcategories.length > 2 && (
                        <Chip label={`+${category.subcategories.length - 2}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{category.providerCount}</TableCell>
                  <TableCell>{category.bookingCount}</TableCell>
                  <TableCell>{category.commissionRate}%</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={category.isActive}
                          onChange={() => handleToggleStatus(category.id)}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(category)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(category.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., home, business, health"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Commission Rate (%)"
                type="number"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subcategories (comma-separated)"
                value={formData.subcategories}
                onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                placeholder="e.g., Cleaning, Plumbing, Electrical"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceCategoryManagement;</content>
<parameter name="filePath">/workspaces/BookYourService/modules/admin/service-catalog/ServiceCategoryManagement.tsx