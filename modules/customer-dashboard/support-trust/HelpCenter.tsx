import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  Help,
  ContactSupport,
  Article,
  LiveHelp,
  Phone,
  Email,
  Chat,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  tags: string[];
}

interface ContactMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  available: boolean;
}

const HelpCenter: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);

  // Mock FAQ data
  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I book a service?',
      answer: 'To book a service, search for the service you need, select a provider, choose your preferred date and time, and complete the payment. You will receive a confirmation SMS and email.',
      category: 'booking',
      helpful: 245,
      tags: ['booking', 'how-to'],
    },
    {
      id: '2',
      question: 'What should I do if the provider is late?',
      answer: 'If your provider is running late, you will receive notifications. You can contact the provider directly through the app or call our support team for assistance.',
      category: 'booking',
      helpful: 189,
      tags: ['delay', 'provider'],
    },
    {
      id: '3',
      question: 'How do I cancel or reschedule a booking?',
      answer: 'You can cancel or reschedule a booking through the app up to 2 hours before the scheduled time. Go to your active bookings and select the appropriate option.',
      category: 'booking',
      helpful: 156,
      tags: ['cancel', 'reschedule'],
    },
    {
      id: '4',
      question: 'What is the refund policy?',
      answer: 'Refunds are processed within 5-7 business days for cancelled bookings. The refund amount depends on the cancellation timing and service type.',
      category: 'payment',
      helpful: 134,
      tags: ['refund', 'cancellation'],
    },
    {
      id: '5',
      question: 'How do I add or change my payment method?',
      answer: 'Go to your profile settings and select "Saved Cards" to add, edit, or remove payment methods. We accept credit cards, debit cards, UPI, and wallet payments.',
      category: 'payment',
      helpful: 98,
      tags: ['payment', 'cards'],
    },
    {
      id: '6',
      question: 'What should I do if I\'m not satisfied with the service?',
      answer: 'If you\'re not satisfied, contact our support team immediately. We offer service guarantees and will work to resolve any issues. You can also leave a review and request a refund if applicable.',
      category: 'support',
      helpful: 87,
      tags: ['complaint', 'satisfaction'],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Topics', count: faqs.length },
    { id: 'booking', label: 'Booking', count: faqs.filter(f => f.category === 'booking').length },
    { id: 'payment', label: 'Payment', count: faqs.filter(f => f.category === 'payment').length },
    { id: 'support', label: 'Support', count: faqs.filter(f => f.category === 'support').length },
  ];

  const contactMethods: ContactMethod[] = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <Chat />,
      action: 'Start Chat',
      available: true,
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      icon: <Phone />,
      action: 'Call Now',
      available: true,
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us a detailed query',
      icon: <Email />,
      action: 'Send Email',
      available: true,
    },
    {
      id: 'ticket',
      title: 'Submit Ticket',
      description: 'Create a support ticket for complex issues',
      icon: <ContactSupport />,
      action: 'Create Ticket',
      available: true,
    },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFAQChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  const handleHelpful = (faqId: string, isHelpful: boolean) => {
    // In real app, this would update the FAQ helpful count
    console.log(`FAQ ${faqId} marked as ${isHelpful ? 'helpful' : 'not helpful'}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Help Center
      </Typography>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search for help topics, FAQs, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Categories */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Browse by Category
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={`${category.label} (${category.count})`}
              onClick={() => setSelectedCategory(category.id)}
              color={selectedCategory === category.id ? 'primary' : 'default'}
              variant={selectedCategory === category.id ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Contact Methods */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Need Immediate Help?
          </Typography>
          <Grid container spacing={2}>
            {contactMethods.map((method) => (
              <Grid item xs={12} sm={6} md={3} key={method.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 2 },
                    opacity: method.available ? 1 : 0.6,
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                      {method.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {method.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {method.description}
                    </Typography>
                    <Button
                      variant="contained"
                      disabled={!method.available}
                      fullWidth={isMobile}
                    >
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Frequently Asked Questions
          </Typography>

          {filteredFAQs.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expandedFAQ === faq.id}
              onChange={handleFAQChange(faq.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  {faq.answer}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {faq.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {faq.helpful} people found this helpful
                    </Typography>
                    <Box>
                      <Button
                        size="small"
                        startIcon={<ThumbUp />}
                        onClick={() => handleHelpful(faq.id, true)}
                        sx={{ mr: 1 }}
                      >
                        Yes
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ThumbDown />}
                        onClick={() => handleHelpful(faq.id, false)}
                      >
                        No
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          {filteredFAQs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Help sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No FAQs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or browse different categories
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Still Need Help */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Still Need Help?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Can't find what you're looking for? Our support team is here to help.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<LiveHelp />}>
              Ask a Question
            </Button>
            <Button variant="outlined" startIcon={<Article />}>
              Browse Articles
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HelpCenter;