
import React, { useState, useEffect } from 'react';
import { PITCH_SLIDES } from '../constants';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  MonetizationOn,
  Business,
  Timeline,
  Assessment,
  Email,
  Phone,
  LocationOn,
  Star,
  CheckCircle,
  Schedule,
  AttachMoney,
  Analytics,
  Group,
  Lightbulb,
} from '@mui/icons-material';

interface InvestmentMetrics {
  marketSize: string;
  currentRevenue: string;
  projectedRevenue: string;
  customerGrowth: string;
  providerGrowth: string;
  fundingRaised: string;
  burnRate: string;
  runway: string;
}

interface TeamMember {
  name: string;
  role: string;
  experience: string;
  avatar: string;
  linkedin?: string;
}

interface InvestmentHighlight {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

const InvestorModule: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [currentSlide, setCurrentSlide] = useState(0);
  const [contactDialog, setContactDialog] = useState(false);
  const [investmentInterest, setInvestmentInterest] = useState({
    name: '',
    email: '',
    company: '',
    investmentAmount: '',
    message: '',
  });

  const slide = PITCH_SLIDES[currentSlide];

  const investmentMetrics: InvestmentMetrics = {
    marketSize: '$10B',
    currentRevenue: '$2.1M',
    projectedRevenue: '$45M',
    customerGrowth: '156%',
    providerGrowth: '203%',
    fundingRaised: '$8.5M',
    burnRate: '$180K/month',
    runway: '24 months',
  };

  const teamMembers: TeamMember[] = [
    {
      name: 'Rajesh Kumar',
      role: 'CEO & Co-Founder',
      experience: '15+ years in enterprise software',
      avatar: '/api/placeholder/60/60',
    },
    {
      name: 'Priya Sharma',
      role: 'CTO & Co-Founder',
      experience: '12+ years in AI/ML',
      avatar: '/api/placeholder/60/60',
    },
    {
      name: 'Amit Patel',
      role: 'CPO & Co-Founder',
      experience: '10+ years in marketplace platforms',
      avatar: '/api/placeholder/60/60',
    },
    {
      name: 'Sneha Reddy',
      role: 'Head of Operations',
      experience: '8+ years in service industries',
      avatar: '/api/placeholder/60/60',
    },
  ];

  const investmentHighlights: InvestmentHighlight[] = [
    {
      title: 'Monthly Revenue',
      value: '$2.1M',
      change: '+156%',
      icon: <MonetizationOn />,
      color: 'success.main',
    },
    {
      title: 'Active Customers',
      value: '125K',
      change: '+203%',
      icon: <People />,
      color: 'primary.main',
    },
    {
      title: 'Verified Providers',
      value: '45K',
      change: '+89%',
      icon: <Business />,
      color: 'secondary.main',
    },
    {
      title: 'Market Share',
      value: '2.3%',
      change: '+0.8%',
      icon: <TrendingUp />,
      color: 'info.main',
    },
  ];

  const handleContactSubmit = () => {
    // Handle form submission
    console.log('Investment interest submitted:', investmentInterest);
    setContactDialog(false);
    // Reset form
    setInvestmentInterest({
      name: '',
      email: '',
      company: '',
      investmentAmount: '',
      message: '',
    });
  };

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % PITCH_SLIDES.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + PITCH_SLIDES.length) % PITCH_SLIDES.length);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Investor Relations
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Revolutionizing India's $200B Service Industry
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => setContactDialog(true)}>
              Express Investment Interest
            </Button>
            <Button variant="outlined" size="large" startIcon={<Assessment />}>
              Download Pitch Deck
            </Button>
          </Box>
        </Box>

        {/* Investment Highlights */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {investmentHighlights.map((highlight, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: highlight.color, mx: 'auto', mb: 2 }}>
                    {highlight.icon}
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {highlight.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {highlight.title}
                  </Typography>
                  <Chip
                    label={highlight.change}
                    color={highlight.change.startsWith('+') ? 'success' : 'error'}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Key Metrics */}
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Key Investment Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Market Opportunity
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {investmentMetrics.marketSize}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Addressable Market
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    Current Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {investmentMetrics.currentRevenue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Recurring Revenue
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                    Projected Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {investmentMetrics.projectedRevenue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Year 3 Projection
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    Growth Metrics
                  </Typography>
                  <Typography variant="body2">
                    Customer Growth: {investmentMetrics.customerGrowth} YoY
                  </Typography>
                  <Typography variant="body2">
                    Provider Growth: {investmentMetrics.providerGrowth} YoY
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Pitch Deck Preview */}
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Pitch Deck Preview
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={prevSlide} disabled={currentSlide === 0}>
                  Previous
                </Button>
                <Button onClick={nextSlide} disabled={currentSlide === PITCH_SLIDES.length - 1}>
                  Next
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={((currentSlide + 1) / PITCH_SLIDES.length) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Slide {slide.id} of {PITCH_SLIDES.length}: {slide.title}
              </Typography>
            </Box>

            <Paper sx={{ p: 4, backgroundColor: '#f1f5f9', minHeight: 300 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {slide.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                {slide.content}
              </Typography>
              {slide.keyMetrics && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Key Metrics:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {slide.keyMetrics.map((metric, index) => (
                      <Chip key={index} label={metric} variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Leadership Team
            </Typography>
            <Grid container spacing={3}>
              {teamMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar
                        src={member.avatar}
                        sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="primary.main" sx={{ mb: 1 }}>
                        {member.role}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.experience}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Investment Thesis */}
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Investment Thesis
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', mb: 2 }}>
                    <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Massive Market Opportunity
                  </Typography>
                  <Typography variant="body2">
                    India's service industry is worth $200B+ with 80% still unorganized. We're capturing the high-value segment through technology.
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
                    AI-First Platform
                  </Typography>
                  <Typography variant="body2">
                    Proprietary AI algorithms for matching, pricing, and operations give us unbeatable efficiency and user experience.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 2 }}>
                    <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Proven Traction
                  </Typography>
                  <Typography variant="body2">
                    125K active customers, 45K verified providers, and $2.1M monthly revenue with 156% YoY growth.
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main', mb: 2 }}>
                    <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Experienced Team
                  </Typography>
                  <Typography variant="body2">
                    Leadership team with 15+ years combined experience in AI, marketplaces, and service industries.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Invest in the Future of Services?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Join us in revolutionizing India's $200B service industry
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setContactDialog(true)}
              sx={{ px: 4, py: 2 }}
            >
              Express Interest
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Email />}
              sx={{ px: 4, py: 2 }}
            >
              Schedule Call
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Contact Dialog */}
      <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Investment Interest Form
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Thank you for your interest! Please provide your details and we'll get back to you within 24 hours.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={investmentInterest.name}
                onChange={(e) => setInvestmentInterest(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={investmentInterest.email}
                onChange={(e) => setInvestmentInterest(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company/Organization"
                value={investmentInterest.company}
                onChange={(e) => setInvestmentInterest(prev => ({ ...prev, company: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Investment Amount Range"
                value={investmentInterest.investmentAmount}
                onChange={(e) => setInvestmentInterest(prev => ({ ...prev, investmentAmount: e.target.value }))}
                placeholder="e.g., $500K - $2M"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message (Optional)"
                value={investmentInterest.message}
                onChange={(e) => setInvestmentInterest(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us about your investment thesis or any specific questions..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setContactDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleContactSubmit} size="large">
            Submit Interest
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvestorModule;
