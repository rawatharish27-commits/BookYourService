import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  LocalOffer,
  CheckCircle,
  Error,
  Delete,
  Info,
  AccessTime,
  CardGiftcard,
} from '@mui/icons-material';

interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
  maxUsage: number;
  applicableServices: string[];
}

interface AppliedCoupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

const CouponApply: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([
    {
      code: 'WELCOME10',
      description: '10% off on your first booking',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrder: 500,
      expiryDate: '2024-12-31',
      isActive: true,
      usageCount: 0,
      maxUsage: 1,
      applicableServices: ['all'],
    },
    {
      code: 'SAVE200',
      description: '₹200 off on orders above ₹1000',
      discountType: 'fixed',
      discountValue: 200,
      minimumOrder: 1000,
      maximumDiscount: 200,
      expiryDate: '2024-12-31',
      isActive: true,
      usageCount: 0,
      maxUsage: 5,
      applicableServices: ['home-cleaning', 'plumbing', 'electrical'],
    },
    {
      code: 'FLASH50',
      description: '50% off on urgent bookings',
      discountType: 'percentage',
      discountValue: 50,
      minimumOrder: 300,
      maximumDiscount: 1000,
      expiryDate: '2024-06-30',
      isActive: true,
      usageCount: 2,
      maxUsage: 10,
      applicableServices: ['urgent', 'emergency'],
    },
  ]);

  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  const validateCoupon = async (code: string): Promise<{ valid: boolean; coupon?: Coupon; message: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const coupon = availableCoupons.find(c => c.code.toLowerCase() === code.toLowerCase());

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'This coupon is no longer active' };
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, message: 'This coupon has expired' };
    }

    if (coupon.usageCount >= coupon.maxUsage) {
      return { valid: false, message: 'This coupon has reached its usage limit' };
    }

    // Check if already applied
    if (appliedCoupons.some(ac => ac.code.toLowerCase() === code.toLowerCase())) {
      return { valid: false, message: 'This coupon is already applied' };
    }

    return { valid: true, coupon, message: 'Coupon applied successfully!' };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setValidationMessage({ type: 'error', message: 'Please enter a coupon code' });
      return;
    }

    setIsValidating(true);
    setValidationMessage(null);

    try {
      const result = await validateCoupon(couponCode.trim());

      if (result.valid && result.coupon) {
        const discount = result.coupon.discountType === 'percentage'
          ? Math.min((result.coupon.discountValue / 100) * 1000, result.coupon.maximumDiscount || Infinity) // Assuming ₹1000 order
          : Math.min(result.coupon.discountValue, result.coupon.maximumDiscount || result.coupon.discountValue);

        const appliedCoupon: AppliedCoupon = {
          code: result.coupon.code,
          discount,
          type: result.coupon.discountType,
        };

        setAppliedCoupons(prev => [...prev, appliedCoupon]);
        setCouponCode('');
        setValidationMessage({ type: 'success', message: result.message });

        // Update usage count
        setAvailableCoupons(prev =>
          prev.map(c =>
            c.code === result.coupon!.code
              ? { ...c, usageCount: c.usageCount + 1 }
              : c
          )
        );
      } else {
        setValidationMessage({ type: 'error', message: result.message });
      }
    } catch (error) {
      setValidationMessage({ type: 'error', message: 'Failed to validate coupon. Please try again.' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = (code: string) => {
    setAppliedCoupons(prev => prev.filter(c => c.code !== code));
    setValidationMessage(null);
  };

  const handleApplyAvailableCoupon = async (coupon: Coupon) => {
    setCouponCode(coupon.code);
    await handleApplyCoupon();
  };

  const totalDiscount = appliedCoupons.reduce((sum, coupon) => sum + coupon.discount, 0);

  const CouponCard: React.FC<{ coupon: Coupon; onApply: () => void }> = ({ coupon, onApply }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CardGiftcard sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="primary">
                {coupon.code}
              </Typography>
              {coupon.usageCount >= coupon.maxUsage && (
                <Chip label="Used" size="small" color="error" sx={{ ml: 1 }} />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              {coupon.description}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Chip
                size="small"
                label={`${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} off`}
                color="success"
              />
              <Chip
                size="small"
                label={`Min order: ₹${coupon.minimumOrder}`}
                variant="outlined"
              />
              {coupon.maximumDiscount && (
                <Chip
                  size="small"
                  label={`Max discount: ₹${coupon.maximumDiscount}`}
                  variant="outlined"
                />
              )}
            </Box>

            <Typography variant="caption" color="text.secondary">
              Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
              {' • '}
              Used {coupon.usageCount}/{coupon.maxUsage} times
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={onApply}
            disabled={coupon.usageCount >= coupon.maxUsage || appliedCoupons.some(ac => ac.code === coupon.code)}
            sx={{ ml: 2 }}
          >
            Apply
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Apply Coupons
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Save more on your bookings with our exclusive coupons and offers. Apply multiple coupons for maximum savings!
      </Alert>

      {/* Applied Coupons */}
      {appliedCoupons.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Applied Coupons
            </Typography>
            <List>
              {appliedCoupons.map((coupon) => (
                <ListItem key={coupon.code}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle color="success" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">{coupon.code}</Typography>
                        <Chip
                          label={`${coupon.type === 'percentage' ? 'Percentage' : 'Fixed'} Discount`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={`Discount: ₹${coupon.discount.toFixed(2)}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveCoupon(coupon.code)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total Savings:</Typography>
              <Typography variant="h6" color="success.main">
                ₹{totalDiscount.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Apply New Coupon */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Apply New Coupon
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Enter Coupon Code"
                placeholder="e.g., WELCOME10, SAVE200"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isValidating}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyCoupon();
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleApplyCoupon}
                disabled={isValidating || !couponCode.trim()}
                startIcon={isValidating ? <CircularProgress size={20} /> : <LocalOffer />}
              >
                {isValidating ? 'Validating...' : 'Apply Coupon'}
              </Button>
            </Grid>
          </Grid>

          {validationMessage && (
            <Alert
              severity={validationMessage.type}
              sx={{ mt: 2 }}
              icon={validationMessage.type === 'success' ? <CheckCircle /> : <Error />}
            >
              {validationMessage.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Coupons */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Available Coupons
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
            >
              {showAvailableCoupons ? 'Hide' : 'Show'} Coupons
            </Button>
          </Box>

          {showAvailableCoupons && (
            <Box>
              {availableCoupons.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No coupons available at the moment
                </Typography>
              ) : (
                availableCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.code}
                    coupon={coupon}
                    onApply={() => handleApplyAvailableCoupon(coupon)}
                  />
                ))
              )}
            </Box>
          )}

          {!showAvailableCoupons && (
            <Typography variant="body2" color="text.secondary">
              Click "Show Coupons" to view all available offers and discounts.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Coupon Tips */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💡 Coupon Tips
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Info color="info" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Multiple coupons can be applied to the same booking for maximum savings.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <AccessTime color="info" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Check expiry dates and usage limits before applying coupons.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocalOffer color="info" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  Some coupons are service-specific. Make sure they apply to your booking.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CheckCircle color="info" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body2">
                  New user coupons are automatically applied to your first booking.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CouponApply;