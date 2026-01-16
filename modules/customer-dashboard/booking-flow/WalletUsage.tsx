import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Slider,
  Chip,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  Remove,
  History,
  Payment,
  CheckCircle,
  Error,
  Info,
  TrendingUp,
  CreditCard,
} from '@mui/icons-material';

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletBalance {
  available: number;
  pending: number;
  total: number;
  currency: string;
}

const WalletUsage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    available: 2500,
    pending: 300,
    total: 2800,
    currency: '₹',
  });

  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [bookingAmount, setBookingAmount] = useState(1200); // Mock booking amount
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [transactions] = useState<WalletTransaction[]>([
    {
      id: '1',
      type: 'credit',
      amount: 500,
      description: 'Referral bonus',
      date: '2024-01-15',
      reference: 'REF123456',
      status: 'completed',
    },
    {
      id: '2',
      type: 'debit',
      amount: 800,
      description: 'Home cleaning service',
      date: '2024-01-12',
      reference: 'BK123456',
      status: 'completed',
    },
    {
      id: '3',
      type: 'credit',
      amount: 200,
      description: 'Cashback reward',
      date: '2024-01-10',
      reference: 'CB123456',
      status: 'completed',
    },
    {
      id: '4',
      type: 'debit',
      amount: 300,
      description: 'Plumbing service',
      date: '2024-01-08',
      reference: 'BK123457',
      status: 'pending',
    },
  ]);

  const handleWalletToggle = (checked: boolean) => {
    setUseWallet(checked);
    if (checked) {
      // Auto-set maximum usable amount
      const maxUsable = Math.min(walletBalance.available, bookingAmount);
      setWalletAmount(maxUsable);
    } else {
      setWalletAmount(0);
    }
  };

  const handleWalletAmountChange = (amount: number) => {
    const maxUsable = Math.min(walletBalance.available, bookingAmount);
    setWalletAmount(Math.min(amount, maxUsable));
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount < 100) {
      alert('Minimum add amount is ₹100');
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setWalletBalance(prev => ({
      ...prev,
      available: prev.available + amount,
      total: prev.total + amount,
    }));

    setShowAddMoney(false);
    setAddAmount('');
    setIsProcessing(false);
  };

  const remainingAmount = bookingAmount - walletAmount;
  const walletPercentage = walletBalance.available > 0 ? (walletAmount / walletBalance.available) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Wallet & Payment
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Use your wallet balance to pay for services and earn rewards on every booking. Save up to 10% with wallet payments!
      </Alert>

      <Grid container spacing={3}>
        {/* Wallet Balance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AccountBalanceWallet />
                </Avatar>
                <Box>
                  <Typography variant="h6">Wallet Balance</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Available to spend
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h4" color="primary" gutterBottom>
                {walletBalance.currency}{walletBalance.available.toLocaleString()}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Available:
                </Typography>
                <Typography variant="body2">
                  {walletBalance.currency}{walletBalance.available.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Pending:
                </Typography>
                <Typography variant="body2" color="warning.main">
                  {walletBalance.currency}{walletBalance.pending.toLocaleString()}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setShowAddMoney(true)}
              >
                Add Money
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Breakdown */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Breakdown
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Booking Amount: {walletBalance.currency}{bookingAmount.toLocaleString()}
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={useWallet}
                      onChange={(e) => handleWalletToggle(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Use wallet balance"
                  sx={{ mb: 2 }}
                />

                {useWallet && (
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>
                      Wallet Amount: {walletBalance.currency}{walletAmount.toLocaleString()}
                      ({walletPercentage.toFixed(1)}% of available balance)
                    </Typography>
                    <Slider
                      value={walletAmount}
                      onChange={(_, value) => handleWalletAmountChange(value as number)}
                      min={0}
                      max={Math.min(walletBalance.available, bookingAmount)}
                      step={50}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${walletBalance.currency}${value}`}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Adjust the slider to choose how much wallet balance to use
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Wallet Payment:</Typography>
                  <Typography variant="body1" color="success.main">
                    -{walletBalance.currency}{walletAmount.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Remaining Amount:</Typography>
                  <Typography variant="body1" color="primary">
                    {walletBalance.currency}{remainingAmount.toLocaleString()}
                  </Typography>
                </Box>

                {remainingAmount > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pay remaining amount via:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip icon={<CreditCard />} label="Credit/Debit Card" variant="outlined" />
                      <Chip icon={<Payment />} label="UPI" variant="outlined" />
                      <Chip icon={<AccountBalanceWallet />} label="Net Banking" variant="outlined" />
                    </Box>
                  </Box>
                )}
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                💰 You'll save {walletBalance.currency}{(walletAmount * 0.1).toFixed(0)} with wallet payment (10% bonus)
              </Alert>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={remainingAmount < 0}
              >
                Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Transactions
            </Typography>
            <Button variant="text" startIcon={<History />}>
              View All
            </Button>
          </Box>

          <List>
            {transactions.map((transaction) => (
              <ListItem key={transaction.id}>
                <ListItemAvatar>
                  <Avatar sx={{
                    bgcolor: transaction.type === 'credit' ? 'success.main' : 'error.main'
                  }}>
                    {transaction.type === 'credit' ? <TrendingUp /> : <Remove />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        {transaction.description}
                      </Typography>
                      <Chip
                        label={transaction.status}
                        size="small"
                        color={
                          transaction.status === 'completed' ? 'success' :
                          transaction.status === 'pending' ? 'warning' : 'error'
                        }
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {transaction.date} • {transaction.reference}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Typography
                    variant="body1"
                    color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}{walletBalance.currency}{transaction.amount}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Wallet Benefits */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎁 Wallet Benefits
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Earn 10% bonus on every wallet top-up
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Get cashback rewards on completed bookings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Instant payments with zero processing fees
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Secure and encrypted wallet transactions
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Money Dialog */}
      <Dialog
        open={showAddMoney}
        onClose={() => !isProcessing && setShowAddMoney(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Money to Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              placeholder="Enter amount (min ₹100)"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              disabled={isProcessing}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>{walletBalance.currency}</Typography>,
              }}
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick amounts:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[500, 1000, 2000, 5000].map((amount) => (
                  <Chip
                    key={amount}
                    label={`${walletBalance.currency}${amount}`}
                    onClick={() => setAddAmount(amount.toString())}
                    variant="outlined"
                    disabled={isProcessing}
                  />
                ))}
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              You'll earn {walletBalance.currency}{(parseFloat(addAmount) * 0.1).toFixed(0)} bonus on this top-up!
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddMoney(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleAddMoney}
            variant="contained"
            disabled={isProcessing || !addAmount || parseFloat(addAmount) < 100}
            startIcon={isProcessing ? <CircularProgress size={20} /> : <Add />}
          >
            {isProcessing ? 'Processing...' : 'Add Money'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletUsage;