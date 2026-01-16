import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  TextField,
  Divider,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Badge,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Verified,
  Edit,
  CameraAlt,
  Business,
  Star,
  CheckCircle,
  Warning,
  Upload,
  Badge as BadgeIcon,
  Work,
  Description,
  AccountBalance,
  Cancel,
  Help,
} from '@mui/icons-material';

interface ProviderProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  services: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  location: string;
  languages: string[];
  certifications: string[];
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: {
    idProof: boolean;
    addressProof: boolean;
    businessLicense: boolean;
    insurance: boolean;
  };
}

interface VerificationDocument {
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  notes?: string;
}

const ProviderProfileVerification: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [profile, setProfile] = useState<ProviderProfile>({
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    avatar: '/api/placeholder/150/150',
    bio: 'Experienced home service professional with 8+ years in plumbing, electrical, and home repairs. Committed to providing reliable and quality service.',
    services: ['Plumbing', 'Electrical', 'Home Repairs', 'AC Repair'],
    experience: 8,
    rating: 4.8,
    totalReviews: 156,
    location: 'Mumbai, Maharashtra',
    languages: ['English', 'Hindi', 'Marathi'],
    certifications: ['Licensed Electrician', 'Certified Plumber'],
    isVerified: false,
    verificationStatus: 'pending',
    documents: {
      idProof: true,
      addressProof: true,
      businessLicense: false,
      insurance: true,
    },
  });

  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState<ProviderProfile>(profile);
  const [uploadDialog, setUploadDialog] = useState({
    open: false,
    documentType: '',
  });

  const verificationDocuments: VerificationDocument[] = [
    {
      type: 'Government ID Proof',
      status: 'approved',
      submittedDate: '2024-01-10',
    },
    {
      type: 'Address Proof',
      status: 'approved',
      submittedDate: '2024-01-10',
    },
    {
      type: 'Business License',
      status: 'pending',
      submittedDate: '2024-01-12',
      notes: 'Under review by our verification team',
    },
    {
      type: 'Insurance Certificate',
      status: 'approved',
      submittedDate: '2024-01-10',
    },
  ];

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setEditMode(false);
  };

  const handleUploadDocument = (documentType: string) => {
    // In a real app, this would handle file upload
    console.log(`Uploading ${documentType}`);
    setUploadDialog({ open: false, documentType: '' });
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'pending': return <Warning />;
      case 'rejected': return <Cancel />;
      default: return <Help />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Provider Profile & Verification
      </Typography>

      {/* Profile Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    profile.isVerified ? (
                      <Verified sx={{ color: 'success.main', bgcolor: 'white', borderRadius: '50%', p: 0.5 }} />
                    ) : (
                      <Warning sx={{ color: 'warning.main', bgcolor: 'white', borderRadius: '50%', p: 0.5 }} />
                    )
                  }
                >
                  <Avatar
                    src={profile.avatar}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  />
                </Badge>
                <IconButton sx={{ position: 'relative', top: -60, right: -40 }}>
                  <CameraAlt />
                </IconButton>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {profile.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <Rating value={profile.rating} readOnly precision={0.1} size="small" />
                  <Typography variant="body2">
                    {profile.rating} ({profile.totalReviews} reviews)
                  </Typography>
                </Box>
                <Chip
                  label={profile.isVerified ? 'Verified Provider' : 'Verification Pending'}
                  color={profile.isVerified ? 'success' : 'warning'}
                  icon={profile.isVerified ? <Verified /> : <Warning />}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Profile Information
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>

              {editMode ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={editProfile.email}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={editProfile.location}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Bio"
                      value={editProfile.bio}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" onClick={handleSaveProfile}>
                        Save Changes
                      </Button>
                      <Button variant="outlined" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Email color="action" />
                      <Typography variant="body1">{profile.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Phone color="action" />
                      <Typography variant="body1">{profile.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationOn color="action" />
                      <Typography variant="body1">{profile.location}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Work color="action" />
                      <Typography variant="body1">{profile.experience} years experience</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Business color="action" />
                      <Typography variant="body1">{profile.services.join(', ')}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      "{profile.bio}"
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Services & Skills */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Services & Skills
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Services Offered
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.services.map((service) => (
                  <Chip key={service} label={service} variant="outlined" />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Languages
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.languages.map((language) => (
                  <Chip key={language} label={language} variant="outlined" />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Certifications
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.certifications.map((cert) => (
                  <Chip key={cert} label={cert} color="primary" />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              <BadgeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Verification Status
            </Typography>
            <Chip
              label={profile.verificationStatus.charAt(0).toUpperCase() + profile.verificationStatus.slice(1)}
              color={getVerificationStatusColor(profile.verificationStatus)}
              icon={getVerificationStatusIcon(profile.verificationStatus)}
            />
          </Box>

          <Alert severity={profile.isVerified ? 'success' : 'warning'} sx={{ mb: 3 }}>
            {profile.isVerified
              ? 'Your profile is fully verified. You can accept bookings and receive payments.'
              : 'Complete your verification to unlock all platform features and build customer trust.'
            }
          </Alert>

          <Typography variant="subtitle1" gutterBottom>
            Document Verification
          </Typography>
          <List>
            {verificationDocuments.map((doc, index) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  {getVerificationStatusIcon(doc.status)}
                </ListItemIcon>
                <ListItemText
                  primary={doc.type}
                  secondary={
                    <>
                      Status: {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)} •
                      Submitted: {new Date(doc.submittedDate).toLocaleDateString()}
                      {doc.notes && (
                        <>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {doc.notes}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  {doc.status === 'rejected' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Upload />}
                      onClick={() => setUploadDialog({ open: true, documentType: doc.type })}
                    >
                      Re-upload
                    </Button>
                  )}
                  {doc.status === 'pending' && (
                    <Chip label="Under Review" size="small" color="warning" />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Performance Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  4.8
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  156
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reviews
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                  98%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  24h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Response Time
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialog.open} onClose={() => setUploadDialog({ open: false, documentType: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload {uploadDialog.documentType}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please upload a clear, readable copy of your {uploadDialog.documentType.toLowerCase()}.
            Supported formats: PDF, JPG, PNG (Max size: 5MB)
          </Typography>
          <Box sx={{ mt: 2, p: 3, border: '2px dashed', borderColor: 'primary.main', borderRadius: 1, textAlign: 'center' }}>
            <Upload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Drag and drop your file here, or click to browse
            </Typography>
            <Button variant="outlined" sx={{ mt: 1 }}>
              Choose File
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog({ open: false, documentType: '' })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => handleUploadDocument(uploadDialog.documentType)}>
            Upload Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderProfileVerification;