import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Home,
  ShoppingCart,
  Person,
  Support,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';

// Import customer dashboard components
import { CustomerDashboard } from './customer-dashboard/home';
import { ServiceSearch, ProviderProfile, CategoryBrowse, Filters, ProviderComparison, AvailabilityCalendar, SlotSelection, AddressManagement, PriceCalculator, CouponApply, WalletUsage, PaymentOptions, BookingConfirmation, LiveTracking, PaymentSummaryScreen, ServiceDetailPage } from './customer-dashboard/booking-flow';
import { ProfileEdit, BookingHistory } from './customer-dashboard/profile-account';
import { HelpCenter } from './customer-dashboard/support-trust';

const DRAWER_WIDTH = 280;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
}

const CustomerModule: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [expandedSections, setExpandedSections] = useState<string[]>(['home']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigation: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home />,
      children: [
        { id: 'dashboard', label: 'Dashboard', icon: <Home /> },
        { id: 'popular-services', label: 'Popular Services', icon: <Home /> },
        { id: 'recommended', label: 'Recommended', icon: <Home /> },
        { id: 'offers', label: 'Offers & Deals', icon: <Home /> },
        { id: 'wallet-balance', label: 'Wallet Balance', icon: <Home /> },
        { id: 'active-bookings', label: 'Active Bookings', icon: <Home /> },
        { id: 'rebook', label: 'Rebook', icon: <Home /> },
        { id: 'emergency-booking', label: 'Emergency Booking', icon: <Home /> },
        { id: 'support-shortcut', label: 'Support Shortcut', icon: <Home /> },
        { id: 'notifications', label: 'Notifications', icon: <Home /> },
        { id: 'referral-banner', label: 'Referral Banner', icon: <Home /> },
        { id: 'loyalty-points', label: 'Loyalty Points', icon: <Home /> },
        { id: 'rating-reminders', label: 'Rating Reminders', icon: <Home /> },
        { id: 'recently-viewed', label: 'Recently Viewed', icon: <Home /> },
        { id: 'saved-providers', label: 'Saved Providers', icon: <Home /> },
        { id: 'service-reminders', label: 'Service Reminders', icon: <Home /> },
        { id: 'weather-suggestions', label: 'Weather Suggestions', icon: <Home /> },
        { id: 'time-based-offers', label: 'Time-based Offers', icon: <Home /> },
      ],
    },
    {
      id: 'booking-flow',
      label: 'Booking Flow',
      icon: <ShoppingCart />,
      children: [
        { id: 'service-search', label: 'Service Search', icon: <ShoppingCart /> },
        { id: 'service-detail-page', label: 'Service Detail Page', icon: <ShoppingCart /> },
        { id: 'category-browse', label: 'Category Browse', icon: <ShoppingCart /> },
        { id: 'filters', label: 'Filters', icon: <ShoppingCart /> },
        { id: 'provider-comparison', label: 'Provider Comparison', icon: <ShoppingCart /> },
        { id: 'provider-profile', label: 'Provider Profile', icon: <ShoppingCart /> },
        { id: 'availability-calendar', label: 'Availability Calendar', icon: <ShoppingCart /> },
        { id: 'slot-selection', label: 'Slot Selection', icon: <ShoppingCart /> },
        { id: 'address-management', label: 'Address Management', icon: <ShoppingCart /> },
        { id: 'price-calculator', label: 'Price Calculator', icon: <ShoppingCart /> },
        { id: 'coupon-apply', label: 'Coupon Apply', icon: <ShoppingCart /> },
        { id: 'wallet-usage', label: 'Wallet Usage', icon: <ShoppingCart /> },
        { id: 'payment-options', label: 'Payment Options', icon: <ShoppingCart /> },
        { id: 'payment-summary-screen', label: 'Payment Summary Screen', icon: <ShoppingCart /> },
        { id: 'booking-confirmation', label: 'Booking Confirmation', icon: <ShoppingCart /> },
        { id: 'live-tracking', label: 'Live Tracking', icon: <ShoppingCart /> },
        { id: 'provider-chat', label: 'Provider Chat', icon: <ShoppingCart /> },
        { id: 'call-provider', label: 'Call Provider', icon: <ShoppingCart /> },
        { id: 'cancel-booking', label: 'Cancel Booking', icon: <ShoppingCart /> },
        { id: 'reschedule', label: 'Reschedule', icon: <ShoppingCart /> },
        { id: 'upload-photos', label: 'Upload Photos', icon: <ShoppingCart /> },
        { id: 'otp-service-start', label: 'OTP Service Start', icon: <ShoppingCart /> },
        { id: 'otp-service-end', label: 'OTP Service End', icon: <ShoppingCart /> },
        { id: 'proof-upload', label: 'Proof Upload', icon: <ShoppingCart /> },
        { id: 'tip-provider', label: 'Tip Provider', icon: <ShoppingCart /> },
        { id: 'invoice-download', label: 'Invoice Download', icon: <ShoppingCart /> },
        { id: 'refund-request', label: 'Refund Request', icon: <ShoppingCart /> },
        { id: 'rebook-service', label: 'Rebook Service', icon: <ShoppingCart /> },
        { id: 'emergency-escalation', label: 'Emergency Escalation', icon: <ShoppingCart /> },
      ],
    },
    {
      id: 'profile-account',
      label: 'Profile & Account',
      icon: <Person />,
      children: [
        { id: 'profile-edit', label: 'Profile Edit', icon: <Person /> },
        { id: 'email-verify', label: 'Email Verify', icon: <Person /> },
        { id: 'phone-verify', label: 'Phone Verify', icon: <Person /> },
        { id: 'address-book', label: 'Address Book', icon: <Person /> },
        { id: 'saved-cards', label: 'Saved Cards', icon: <Person /> },
        { id: 'wallet-history', label: 'Wallet History', icon: <Person /> },
        { id: 'booking-history', label: 'Booking History', icon: <Person /> },
        { id: 'reviews-given', label: 'Reviews Given', icon: <Person /> },
        { id: 'complaints', label: 'Complaints', icon: <Person /> },
        { id: 'refund-history', label: 'Refund History', icon: <Person /> },
        { id: 'loyalty-points-account', label: 'Loyalty Points', icon: <Person /> },
        { id: 'referral-history', label: 'Referral History', icon: <Person /> },
        { id: 'device-history', label: 'Device History', icon: <Person /> },
        { id: 'login-history', label: 'Login History', icon: <Person /> },
        { id: 'password-change', label: 'Password Change', icon: <Person /> },
        { id: 'notification-prefs', label: 'Notification Prefs', icon: <Person /> },
        { id: 'language', label: 'Language', icon: <Person /> },
        { id: 'city-change', label: 'City Change', icon: <Person /> },
        { id: 'data-export', label: 'Data Export', icon: <Person /> },
        { id: 'account-delete', label: 'Account Delete', icon: <Person /> },
      ],
    },
    {
      id: 'support-trust',
      label: 'Support & Trust',
      icon: <Support />,
      children: [
        { id: 'help-center', label: 'Help Center', icon: <Support /> },
        { id: 'faqs', label: 'FAQs', icon: <Support /> },
        { id: 'ticket-raise', label: 'Ticket Raise', icon: <Support /> },
        { id: 'chat-support', label: 'Chat Support', icon: <Support /> },
        { id: 'call-support', label: 'Call Support', icon: <Support /> },
        { id: 'service-guarantee', label: 'Service Guarantee', icon: <Support /> },
        { id: 'safety-guidelines', label: 'Safety Guidelines', icon: <Support /> },
        { id: 'provider-rating-system', label: 'Provider Rating System', icon: <Support /> },
        { id: 'dispute-resolution', label: 'Dispute Resolution', icon: <Support /> },
        { id: 'sla-tracker', label: 'SLA Tracker', icon: <Support /> },
        { id: 'refund-rules', label: 'Refund Rules', icon: <Support /> },
        { id: 'abuse-report', label: 'Abuse Report', icon: <Support /> },
        { id: 'block-provider', label: 'Block Provider', icon: <Support /> },
        { id: 'trust-badge', label: 'Trust Badge', icon: <Support /> },
        { id: 'insurance-info', label: 'Insurance Info', icon: <Support /> },
        { id: 'emergency-sos', label: 'Emergency SOS', icon: <Support /> },
        { id: 'legal-policies', label: 'Legal Policies', icon: <Support /> },
        { id: 'feedback-form', label: 'Feedback Form', icon: <Support /> },
        { id: 'app-rating', label: 'App Rating', icon: <Support /> },
        { id: 'feature-request', label: 'Feature Request', icon: <Support /> },
      ],
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handlePageChange = (pageId: string) => {
    setCurrentPage(pageId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedSections.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <Box key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => hasChildren ? handleSectionToggle(item.id) : handlePageChange(item.id)}
            sx={{
              pl: level * 2 + 2,
              backgroundColor: currentPage === item.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const renderCurrentPage = () => {
    // Customer Dashboard pages - render actual components
    switch (currentPage) {
      case 'dashboard':
        return <CustomerDashboard />;
      case 'service-search':
        return <ServiceSearch />;
      case 'service-detail-page':
        return <ServiceDetailPage />;
      case 'category-browse':
        return <CategoryBrowse />;
      case 'filters':
        return <Filters />;
      case 'provider-comparison':
        return <ProviderComparison />;
      case 'provider-profile':
        return <ProviderProfile />;
      case 'availability-calendar':
        return <AvailabilityCalendar />;
      case 'slot-selection':
        return <SlotSelection />;
      case 'address-management':
        return <AddressManagement />;
      case 'price-calculator':
        return <PriceCalculator />;
      case 'coupon-apply':
        return <CouponApply />;
      case 'wallet-usage':
        return <WalletUsage />;
      case 'payment-options':
        return <PaymentOptions />;
      case 'payment-summary-screen':
        return <PaymentSummaryScreen />;
      case 'booking-confirmation':
        return <BookingConfirmation />;
      case 'live-tracking':
        return <LiveTracking
          bookingId="BK2024001"
          providerId="P001"
          providerName="Rajesh Kumar"
          providerPhone="+91 98765 43210"
          providerImage="/api/placeholder/40/40"
          providerRating={4.8}
          serviceAddress={{
            lat: 19.0760,
            lng: 72.8777,
            address: "123 Main Street, Bandra West, Mumbai"
          }}
        />;
      case 'profile-edit':
        return <ProfileEdit />;
      case 'booking-history':
        return <BookingHistory />;
      case 'help-center':
        return <HelpCenter />;
      default:
        // Placeholder for other pages
        const pageInfo = navigation.flatMap(section =>
          section.children ? section.children.flatMap(child =>
            child.children ? child.children : [child]
          ) : [section]
        ).find(item => item.id === currentPage);

        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {pageInfo?.label || 'Page Not Found'}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This page is under development. Feature ID: {currentPage}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Part of the comprehensive 150+ feature Customer Dashboard
            </Typography>
          </Box>
        );
    }
  };

  const drawer = (
    <Box>
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          BookYourService
        </Typography>
      </Box>
      <Divider />

      {/* Navigation */}
      <List sx={{ pt: 0 }}>
        {navigation.map(item => renderNavigationItem(item))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Customer Dashboard
          </Typography>

          <IconButton color="inherit">
            <Notifications />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <Person sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: '64px', // AppBar height
        }}
      >
        {renderCurrentPage()}
      </Box>
    </Box>
  );
};

export default CustomerModule;