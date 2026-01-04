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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  IconButton,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  AccountBalanceWallet,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Payment,
  Receipt,
  Download,
  Refresh,
  CreditCard,
  AccountBalance,
  Schedule,
  CheckCircle,
  Pending,
  Info,
} from '@mui/icons-material';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

interface EarningsStats {
  totalEarned: number;
  availableBalance: number;
  pendingPayout: number;
  todaysEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
}

const EarningsWallet: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);

  const [earningsStats] = useState<EarningsStats>({
    totalEarned: 45250,
    availableBalance: 8750,
    pendingPayout: 1200,
    todaysEarnings: 1948,
    weeklyEarnings: 8750,
    monthlyEarnings: 32500,
  });

  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      type: 'credit',
      amount: 599,
      description: 'Home Cleaning Service - Rahul Sharma',
      date: '2024-01-15',
      status: 'completed',
      reference: 'JOB-2024-001',
    },
    {
      id: 'TXN002',
      type: 'credit',
      amount: 899,
      description: 'AC Repair Service - Priya Patel',
      date: '2024-01-15',
      status: 'completed',
      reference: 'JOB-2024-002',
    },
    {
      id: 'TXN003',
      type: 'debit',
      amount: 50,
      description: 'Platform Fee',
      date: '2024-01-15',
      status: 'completed',
      reference: 'FEE-2024-001',
    },
    {
      id: 'TXN004',
      type: 'credit',
      amount: 450,
      description: 'Plumbing Service - Amit Kumar',
      date: '2024-01-14',
      status: 'pending',
      reference: 'JOB-2024-003',
    },
    {
      id: 'TXN005',
      type: 'debit',
      amount: 25,
      description: 'Wallet Transfer to Bank',
      date: '2024-01-14',
      status: 'completed',
      reference: 'WDR-2024-001',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'pending': return <Pending fontSize="small" />;
      case 'failed': return <Info fontSize="small" />;
      default: return <Info fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Earnings & Wallet
      </Typography>

      {/* Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Available Balance</Typography>
                <AccountBalanceWallet sx={{ color: theme.palette.success.main }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.success.main, mb: 1 }}>
                ₹{earningsStats.availableBalance.toLocaleString()}
              </Typography>
              <Button variant="contained" size="small" sx={{ mt: 1 }}>
                Withdraw to Bank
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Pending Payout</Typography>
                <Schedule sx={{ color: theme.palette.warning.main }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                ₹{earningsStats.pendingPayout.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available in 2-3 business days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total Earned</Typography>
                <AttachMoney sx={{ color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                ₹{earningsStats.totalEarned.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +12% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Earnings Overview */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Earnings Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  ₹{earningsStats.todaysEarnings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Earnings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                  ₹{earningsStats.weeklyEarnings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                  ₹{earningsStats.monthlyEarnings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Month
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="All Transactions" />
              <Tab label="Earnings" />
              <Tab label="Withdrawals" />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Transaction History
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" startIcon={<Download />}>
                Export
              </Button>
              <Button variant="outlined" size="small" startIcon={<Refresh />}>
                Refresh
              </Button>
            </Box>
          </Box>

          {isMobile ? (
            // Mobile view - List
            <List>
              {transactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: transaction.type === 'credit' ? 'success.main' : 'error.main'
                      }}>
                        {transaction.type === 'credit' ? <AttachMoney /> : <Payment />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {transaction.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {transaction.date} • {transaction.reference}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 'bold',
                                color: transaction.type === 'credit' ? 'success.main' : 'error.main'
                              }}
                            >
                              {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                            </Typography>
                            <Chip
                              label={transaction.status}
                              size="small"
                              color={getStatusColor(transaction.status)}
                              icon={getStatusIcon(transaction.status)}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < transactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            // Desktop view - Table
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{
                            width: 24,
                            height: 24,
                            mr: 1,
                            bgcolor: transaction.type === 'credit' ? 'success.main' : 'error.main'
                          }}>
                            {transaction.type === 'credit' ? <AttachMoney fontSize="small" /> : <Payment fontSize="small" />}
                          </Avatar>
                          {transaction.description}
                        </Box>
                      </TableCell>
                      <TableCell>{transaction.reference}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            color: transaction.type === 'credit' ? 'success.main' : 'error.main'
                          }}
                        >
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          size="small"
                          color={getStatusColor(transaction.status)}
                          icon={getStatusIcon(transaction.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Payout Information */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Payout Schedule:</strong> Earnings are transferred to your bank account every Monday for the previous week's completed jobs.
          Minimum payout amount is ₹500. Processing time: 2-3 business days.
        </Typography>
      </Alert>
    </Box>
  );
};

export default EarningsWallet;