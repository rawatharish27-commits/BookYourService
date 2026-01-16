import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Chip,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  Payment,
  Smartphone,
  Add,
  Delete,
  CheckCircle,
  Security,
  Lock,
  Verified,
} from '@mui/icons-material';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
  isVerified: boolean;
}

interface PaymentDetails {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
}

const PaymentOptions: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'HDFC Credit Card',
      details: '**** **** **** 1234',
      isDefault: true,
      isVerified: true,
    },
    {
      id: '2',
      type: 'upi',
      name: 'Google Pay',
      details: 'user@okhdfcbank',
      isDefault: false,
      isVerified: true,
    },
    {
      id: '3',
      type: 'wallet',
      name: 'Paytm Wallet',
      details: 'Balance: ₹1,250',
      isDefault: false,
      isVerified: true,
    },
  ]);

  const [paymentDetails] = useState<PaymentDetails>({
    amount: 1200,
    currency: '₹',
    description: 'Home Cleaning Service - 2 hours',
    orderId: 'BK2024001',
  });

  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddUPI, setShowAddUPI] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    saveCard: true,
  });

  const [newUPI, setNewUPI] = useState({
    id: '',
    saveUPI: true,
  });

  const processingSteps = [
    'Initializing payment',
    'Processing with bank',
    'Verifying transaction',
    'Completing payment',
  ];

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);

    // Simulate payment processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsProcessing(false);
    alert('Payment successful! Your booking is confirmed.');
  };

  const handleAddCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name) {
      alert('Please fill all card details');
      return;
    }

    const cardMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      name: `${newCard.name}'s Card`,
      details: `**** **** **** ${newCard.number.slice(-4)}`,
      isDefault: false,
      isVerified: true,
    };

    setPaymentMethods(prev => [...prev, cardMethod]);
    setNewCard({ number: '', expiry: '', cvv: '', name: '', saveCard: true });
    setShowAddCard(false);
  };

  const handleAddUPI = () => {
    if (!newUPI.id) {
      alert('Please enter UPI ID');
      return;
    }

    const upiMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'upi',
      name: 'UPI',
      details: newUPI.id,
      isDefault: false,
      isVerified: true,
    };

    setPaymentMethods(prev => [...prev, upiMethod]);
    setNewUPI({ id: '', saveUPI: true });
    setShowAddUPI(false);
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    if (selectedPaymentMethod === id) {
      setSelectedPaymentMethod('');
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard />;
      case 'upi':
        return <Smartphone />;
      case 'netbanking':
        return <AccountBalance />;
      case 'wallet':
        return <Payment />;
      default:
        return <Payment />;
    }
  };

  const PaymentMethodCard: React.FC<{ method: PaymentMethod }> = ({ method }) => (
    <Card
      sx={{
        mb: 2,
        border: selectedPaymentMethod === method.id ? '2px solid' : '1px solid',
        borderColor: selectedPaymentMethod === method.id ? 'primary.main' : 'divider',
        cursor: 'pointer',
      }}
      onClick={() => setSelectedPaymentMethod(method.id)}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              {getPaymentIcon(method.type)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {method.name}
                </Typography>
                {method.isDefault && (
                  <Chip label="Default" size="small" color="primary" />
                )}
                {method.isVerified && (
                  <Verified color="success" sx={{ ml: 1 }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {method.details}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Radio
              checked={selectedPaymentMethod === method.id}
              onChange={() => setSelectedPaymentMethod(method.id)}
              value={method.id}
              color="primary"
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePaymentMethod(method.id);
              }}
              color="error"
              sx={{ ml: 1 }}
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payment Options
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Choose your preferred payment method. All transactions are secured with 256-bit SSL encryption.
      </Alert>

      {/* Payment Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Order ID:</Typography>
            <Typography variant="body1" fontWeight="medium">{paymentDetails.orderId}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Description:</Typography>
            <Typography variant="body2">{paymentDetails.description}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total Amount:</Typography>
            <Typography variant="h6" color="primary">
              {paymentDetails.currency}{paymentDetails.amount.toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Saved Payment Methods */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Saved Payment Methods</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CreditCard />}
                onClick={() => setShowAddCard(true)}
              >
                Add Card
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Smartphone />}
                onClick={() => setShowAddUPI(true)}
              >
                Add UPI
              </Button>
            </Box>
          </Box>

          {paymentMethods.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No saved payment methods. Add one to get started.
            </Typography>
          ) : (
            <Box>
              {paymentMethods.map((method) => (
                <PaymentMethodCard key={method.id} method={method} />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Other Payment Options */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Other Payment Options
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  border: selectedPaymentMethod === 'netbanking' ? '2px solid' : '1px solid',
                  borderColor: selectedPaymentMethod === 'netbanking' ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedPaymentMethod('netbanking')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <AccountBalance sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>Net Banking</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pay using your bank account
                  </Typography>
                  <Radio
                    checked={selectedPaymentMethod === 'netbanking'}
                    onChange={() => setSelectedPaymentMethod('netbanking')}
                    value="netbanking"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  border: selectedPaymentMethod === 'cod' ? '2px solid' : '1px solid',
                  borderColor: selectedPaymentMethod === 'cod' ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedPaymentMethod('cod')}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Payment sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>Cash on Delivery</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pay when service is completed
                  </Typography>
                  <Radio
                    checked={selectedPaymentMethod === 'cod'}
                    onChange={() => setSelectedPaymentMethod('cod')}
                    value="cod"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 1 }} />
          <Typography variant="body2">
            Your payment information is secured with bank-level encryption. We never store your card details.
          </Typography>
        </Box>
      </Alert>

      {/* Pay Now Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handlePayment}
        disabled={!selectedPaymentMethod || isProcessing}
        startIcon={isProcessing ? <CircularProgress size={24} /> : <Lock />}
      >
        {isProcessing ? 'Processing Payment...' : `Pay ${paymentDetails.currency}${paymentDetails.amount.toLocaleString()}`}
      </Button>

      {/* Processing Dialog */}
      <Dialog open={isProcessing} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Processing Payment
          </Typography>
          <Stepper activeStep={processingStep} sx={{ mt: 2 }}>
            {processingSteps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={showAddCard} onClose={() => setShowAddCard(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Card</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={newCard.number}
                onChange={(e) => setNewCard(prev => ({ ...prev, number: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                placeholder="MM/YY"
                value={newCard.expiry}
                onChange={(e) => setNewCard(prev => ({ ...prev, expiry: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                type="password"
                value={newCard.cvv}
                onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                value={newCard.name}
                onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddCard(false)}>Cancel</Button>
          <Button onClick={handleAddCard} variant="contained">
            Add Card
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add UPI Dialog */}
      <Dialog open={showAddUPI} onClose={() => setShowAddUPI(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add UPI ID</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="UPI ID"
              placeholder="user@bankname"
              value={newUPI.id}
              onChange={(e) => setNewUPI(prev => ({ ...prev, id: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddUPI(false)}>Cancel</Button>
          <Button onClick={handleAddUPI} variant="contained">
            Add UPI
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentOptions;