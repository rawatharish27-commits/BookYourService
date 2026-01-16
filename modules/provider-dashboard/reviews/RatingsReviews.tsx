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
  Rating,
  Divider,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Star,
  ThumbUp,
  ThumbDown,
  Reply,
  Flag,
  FilterList,
  TrendingUp,
  Person,
  AccessTime,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

interface Review {
  id: string;
  customerName: string;
  customerAvatar: string;
  serviceType: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  response?: string;
  responseDate?: string;
  verified: boolean;
  tags: string[];
}

interface RatingStats {
  overall: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  averageResponseTime: string;
  responseRate: number;
}

const RatingsReviews: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      customerName: 'Rahul Sharma',
      customerAvatar: '/api/placeholder/40/40',
      serviceType: 'Home Cleaning',
      rating: 5,
      comment: 'Excellent service! Rajesh was very professional and thorough. The house looks spotless. Highly recommended!',
      date: '2024-01-14',
      helpful: 12,
      verified: true,
      tags: ['Professional', 'Thorough', 'Punctual'],
    },
    {
      id: '2',
      customerName: 'Priya Patel',
      customerAvatar: '/api/placeholder/40/40',
      serviceType: 'AC Repair',
      rating: 4,
      comment: 'Good work on the AC repair. Fixed the issue quickly. Only minor delay in arrival but overall satisfied.',
      date: '2024-01-12',
      helpful: 8,
      response: 'Thank you for the feedback! We apologize for the slight delay and appreciate your understanding. We\'re glad we could fix your AC issue quickly.',
      responseDate: '2024-01-12',
      verified: true,
      tags: ['Quick Fix', 'Professional'],
    },
    {
      id: '3',
      customerName: 'Amit Kumar',
      customerAvatar: '/api/placeholder/40/40',
      serviceType: 'Plumbing',
      rating: 3,
      comment: 'Service was okay but took longer than expected. The work was done correctly though.',
      date: '2024-01-10',
      helpful: 3,
      verified: true,
      tags: ['Delayed', 'Correct Work'],
    },
  ]);

  const [ratingStats] = useState<RatingStats>({
    overall: 4.8,
    totalReviews: 156,
    breakdown: {
      5: 120,
      4: 25,
      3: 8,
      2: 2,
      1: 1,
    },
    averageResponseTime: '4.2 hours',
    responseRate: 92,
  });

  const [filter, setFilter] = useState('all');
  const [responseDialog, setResponseDialog] = useState({
    open: false,
    reviewId: '',
    response: '',
  });

  const handleRespondToReview = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    setResponseDialog({
      open: true,
      reviewId,
      response: review?.response || '',
    });
  };

  const handleSaveResponse = () => {
    setReviews(prev =>
      prev.map(review =>
        review.id === responseDialog.reviewId
          ? {
              ...review,
              response: responseDialog.response,
              responseDate: new Date().toISOString().split('T')[0],
            }
          : review
      )
    );
    setResponseDialog({ open: false, reviewId: '', response: '' });
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'responded') return review.response;
    if (filter === 'unresponded') return !review.response;
    return review.rating === parseInt(filter);
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Ratings & Reviews
      </Typography>

      {/* Rating Overview */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  {ratingStats.overall}
                </Typography>
                <Rating value={ratingStats.overall} readOnly precision={0.1} size="large" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Based on {ratingStats.totalReviews} reviews
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Rating Breakdown
              </Typography>
              {[5, 4, 3, 2, 1].map((stars) => (
                <Box key={stars} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 20 }}>
                    {stars}★
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(ratingStats.breakdown[stars as keyof typeof ratingStats.breakdown] / ratingStats.totalReviews) * 100}
                    sx={{ flexGrow: 1, mx: 2, height: 8, borderRadius: 4 }}
                    color={getRatingColor(stars)}
                  />
                  <Typography variant="body2" sx={{ minWidth: 30 }}>
                    {ratingStats.breakdown[stars as keyof typeof ratingStats.breakdown]}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {ratingStats.responseRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Response Rate
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {ratingStats.averageResponseTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Response Time
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  98%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer Satisfaction
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  4.6
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Service Quality
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Customer Reviews
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Reviews</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
                <MenuItem value="responded">Responded</MenuItem>
                <MenuItem value="unresponded">Unresponded</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <List>
            {filteredReviews.map((review, index) => (
              <React.Fragment key={review.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar src={review.customerAvatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {review.customerName}
                        </Typography>
                        {review.verified && (
                          <Chip label="Verified" size="small" color="success" icon={<CheckCircle />} />
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {review.serviceType}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(review.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {review.comment}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {review.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<ThumbUp />}
                            variant="outlined"
                          >
                            Helpful ({review.helpful})
                          </Button>
                          {!review.response && (
                            <Button
                              size="small"
                              startIcon={<Reply />}
                              variant="outlined"
                              onClick={() => handleRespondToReview(review.id)}
                            >
                              Respond
                            </Button>
                          )}
                          <IconButton size="small">
                            <Flag fontSize="small" />
                          </IconButton>
                        </Box>
                        {review.response && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, borderLeft: 4, borderColor: 'primary.main' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Your Response ({new Date(review.responseDate!).toLocaleDateString()}):
                            </Typography>
                            <Typography variant="body2">
                              {review.response}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredReviews.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {filteredReviews.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No reviews match the selected filter.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={responseDialog.open} onClose={() => setResponseDialog({ open: false, reviewId: '', response: '' })} maxWidth="md" fullWidth>
        <DialogTitle>
          Respond to Customer Review
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Your response will be visible to the customer and other potential customers. Keep it professional and helpful.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Response"
            value={responseDialog.response}
            onChange={(e) => setResponseDialog(prev => ({ ...prev, response: e.target.value }))}
            sx={{ mt: 2 }}
            placeholder="Thank you for your feedback. We're glad we could help..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog({ open: false, reviewId: '', response: '' })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveResponse}>
            Send Response
          </Button>
        </DialogActions>
      </Dialog>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Review Tips:</strong> Responding to reviews shows customers you care about their experience.
          Aim to respond within 24 hours for the best customer satisfaction scores.
        </Typography>
      </Alert>
    </Box>
  );
};

export default RatingsReviews;