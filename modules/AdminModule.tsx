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
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  Category,
  EventNote,
  Payment,
  Support,
  Settings,
  ExpandLess,
  ExpandMore,
  Menu,
  Notifications,
  AccountCircle,
  ChevronLeft,
  Assessment,
  Map,
  Warning,
  HealthAndSafety,
  History,
  VerifiedUser,
  Timeline,
  AccountBalanceWallet,
  ContactSupport,
  Security,
  LocationCity,
  AttachMoney,
  Receipt,
  Gavel,
  Build,
  VpnKey,
  Backup,
  Analytics,
  TrendingUp,
  Error,
  CheckCircle,
  Schedule,
  Assignment,
  Work,
  ShoppingCart,
  RateReview,
  Block,
  Flag,
  Report,
  MonetizationOn,
  AccountBalance,
  CreditCard,
  LocalAtm,
  PieChart,
  BarChart,
  ShowChart,
  TableChart,
  BubbleChart,
  DonutLarge,
  MultilineChart,
  ScatterPlot,
  StackedBarChart,
  LocationOn,
  Star,
  Group,
  Search,
  Chat,
  Add,
  Storage,
} from '@mui/icons-material';

// Import user management components
import {
  CustomersList,
  CustomerProfiles,
  CustomerVerification,
  CustomerActivity,
  CustomerWallet,
  CustomerSupport,
  CustomerRisk,
  CustomerGdpr,
  CustomerLoyalty,
  CustomerSegments,
} from './admin/user-management/customers';

import {
  ProviderQueue,
  ProvidersList,
  ProviderProfiles,
  ProviderVerification,
  ProviderPerformance,
  ProviderWallet,
  ProviderSettlements,
  ProviderBlacklist,
  ProviderContracts,
  ProviderSla,
  ProviderAnalytics,
  ProviderSupport,
} from './admin/user-management/providers';

// Import core dashboard components
import {
  SystemOverview,
  AnalyticsKPIs,
  UsageHeatmap,
  SystemAlerts,
  HealthMonitoring,
  ActivityLogs,
} from './admin/core-dashboard';

const DRAWER_WIDTH = 280;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
}

const AdminModule: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['core-dashboard']);

  const navigation: NavigationItem[] = [
    {
      id: 'core-dashboard',
      label: 'Core Dashboard',
      icon: <Dashboard />,
      children: [
        { id: 'system-overview', label: 'System Overview', icon: <Dashboard /> },
        { id: 'analytics-kpis', label: 'Analytics & KPIs', icon: <Analytics /> },
        { id: 'usage-heatmap', label: 'Usage Heatmap', icon: <Map /> },
        { id: 'system-alerts', label: 'System Alerts', icon: <Warning /> },
        { id: 'system-health', label: 'System Health', icon: <HealthAndSafety /> },
        { id: 'activity-logs', label: 'Activity Logs', icon: <History /> },
        { id: 'notification-center', label: 'Notification Center', icon: <Notifications /> },
        { id: 'api-usage', label: 'API Usage', icon: <Assessment /> },
        { id: 'error-logs', label: 'Error Logs', icon: <Error /> },
        { id: 'sla-monitoring', label: 'SLA Monitoring', icon: <Schedule /> },
        { id: 'emergency-controls', label: 'Emergency Controls', icon: <Security /> },
        { id: 'audit-snapshot', label: 'Audit Snapshot', icon: <Assignment /> },
      ],
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: <People />,
      children: [
        // Customers Section
        {
          id: 'customers',
          label: 'Customers',
          icon: <People />,
          children: [
            { id: 'customers-list', label: 'Customers List', icon: <People /> },
            { id: 'customer-profiles', label: 'Customer Profiles', icon: <People /> },
            { id: 'customer-verification', label: 'Verification Status', icon: <VerifiedUser /> },
            { id: 'customer-activity', label: 'Activity History', icon: <Timeline /> },
            { id: 'customer-wallet', label: 'Wallet Management', icon: <AccountBalanceWallet /> },
            { id: 'customer-support', label: 'Support History', icon: <ContactSupport /> },
            { id: 'customer-risk', label: 'Risk Assessment', icon: <Security /> },
            { id: 'customer-gdpr', label: 'GDPR Compliance', icon: <Security /> },
            { id: 'customer-loyalty', label: 'Loyalty Management', icon: <Star /> },
            { id: 'customer-segments', label: 'Customer Segments', icon: <Group /> },
          ],
        },
        // Service Providers Section
        {
          id: 'providers',
          label: 'Service Providers',
          icon: <Business />,
          children: [
            { id: 'provider-queue', label: 'Provider Queue', icon: <Business /> },
            { id: 'providers-list', label: 'Providers List', icon: <Business /> },
            { id: 'provider-profiles', label: 'Provider Profiles', icon: <Business /> },
            { id: 'provider-verification', label: 'Document Verification', icon: <VerifiedUser /> },
            { id: 'provider-performance', label: 'Performance Metrics', icon: <TrendingUp /> },
            { id: 'provider-wallet', label: 'Provider Wallets', icon: <AccountBalanceWallet /> },
            { id: 'provider-settlements', label: 'Settlements', icon: <Payment /> },
            { id: 'provider-blacklist', label: 'Blacklist Management', icon: <Block /> },
            { id: 'provider-contracts', label: 'Contract Management', icon: <Assignment /> },
            { id: 'provider-sla', label: 'SLA Management', icon: <Schedule /> },
            { id: 'provider-analytics', label: 'Provider Analytics', icon: <Analytics /> },
            { id: 'provider-support', label: 'Provider Support', icon: <ContactSupport /> },
          ],
        },
      ],
    },
    {
      id: 'service-catalog',
      label: 'Service & Catalog',
      icon: <Category />,
      children: [
        { id: 'service-categories', label: 'Service Categories', icon: <Category /> },
        { id: 'service-attributes', label: 'Service Attributes', icon: <Settings /> },
        { id: 'pricing-rules', label: 'Pricing Rules', icon: <AttachMoney /> },
        { id: 'commission-rules', label: 'Commission Rules', icon: <MonetizationOn /> },
        { id: 'dynamic-pricing', label: 'Dynamic Pricing', icon: <TrendingUp /> },
        { id: 'area-availability', label: 'Area Availability', icon: <LocationOn /> },
        { id: 'service-lifecycle', label: 'Service Lifecycle', icon: <Timeline /> },
        { id: 'content-moderation', label: 'Content Moderation', icon: <Flag /> },
        { id: 'service-analytics', label: 'Service Analytics', icon: <Analytics /> },
        { id: 'demand-heatmap', label: 'Demand Heatmap', icon: <Map /> },
        { id: 'service-seo', label: 'Service SEO', icon: <Search /> },
        { id: 'abuse-reports', label: 'Abuse Reports', icon: <Report /> },
      ],
    },
    {
      id: 'bookings-operations',
      label: 'Bookings & Operations',
      icon: <EventNote />,
      children: [
        { id: 'all-bookings', label: 'All Bookings', icon: <EventNote /> },
        { id: 'live-bookings', label: 'Live Bookings', icon: <Schedule /> },
        { id: 'booking-disputes', label: 'Booking Disputes', icon: <Gavel /> },
        { id: 'reassignment', label: 'Reassignment', icon: <Assignment /> },
        { id: 'emergency-override', label: 'Emergency Override', icon: <Warning /> },
        { id: 'sla-monitoring-ops', label: 'SLA Monitoring', icon: <Schedule /> },
        { id: 'completion-verification', label: 'Completion Verification', icon: <CheckCircle /> },
        { id: 'bulk-operations', label: 'Bulk Operations', icon: <Work /> },
        { id: 'geo-tracking', label: 'Geo Tracking', icon: <Map /> },
        { id: 'manual-booking', label: 'Manual Booking', icon: <Add /> },
        { id: 'time-slot-control', label: 'Time Slot Control', icon: <Schedule /> },
        { id: 'booking-analytics', label: 'Booking Analytics', icon: <Analytics /> },
      ],
    },
    {
      id: 'payments-finance',
      label: 'Payments & Finance',
      icon: <Payment />,
      children: [
        { id: 'transactions', label: 'Transactions', icon: <Payment /> },
        { id: 'failed-payments', label: 'Failed Payments', icon: <Error /> },
        { id: 'refunds', label: 'Refunds', icon: <AccountBalance /> },
        { id: 'provider-settlements-finance', label: 'Provider Settlements', icon: <Payment /> },
        { id: 'commission-reports', label: 'Commission Reports', icon: <Receipt /> },
        { id: 'gst-reports', label: 'GST Reports', icon: <Receipt /> },
        { id: 'revenue-analytics', label: 'Revenue Analytics', icon: <Analytics /> },
        { id: 'bank-reconciliation', label: 'Bank Reconciliation', icon: <AccountBalance /> },
        { id: 'wallet-ledger', label: 'Wallet Ledger', icon: <AccountBalanceWallet /> },
        { id: 'payout-scheduling', label: 'Payout Scheduling', icon: <Schedule /> },
        { id: 'tax-reports', label: 'Tax Reports', icon: <Receipt /> },
        { id: 'financial-audit', label: 'Financial Audit', icon: <Assignment /> },
      ],
    },
    {
      id: 'complaints-support',
      label: 'Complaints & Support',
      icon: <Support />,
      children: [
        { id: 'ticket-inbox', label: 'Ticket Inbox', icon: <Support /> },
        { id: 'priority-queue', label: 'Priority Queue', icon: <Warning /> },
        { id: 'escalation', label: 'Escalation', icon: <TrendingUp /> },
        { id: 'auto-resolution', label: 'Auto Resolution', icon: <Build /> },
        { id: 'chat-history', label: 'Chat History', icon: <Chat /> },
        { id: 'refund-recommendations', label: 'Refund Recommendations', icon: <MonetizationOn /> },
        { id: 'closure-reports', label: 'Closure Reports', icon: <Assignment /> },
        { id: 'satisfaction-scores', label: 'Satisfaction Scores', icon: <RateReview /> },
        { id: 'support-analytics', label: 'Support Analytics', icon: <Analytics /> },
        { id: 'penalty-management', label: 'Penalty Management', icon: <Gavel /> },
      ],
    },
    {
      id: 'system-config',
      label: 'System & Configuration',
      icon: <Settings />,
      children: [
        { id: 'roles-permissions', label: 'Roles & Permissions', icon: <VpnKey /> },
        { id: 'feature-toggles', label: 'Feature Toggles', icon: <Settings /> },
        { id: 'city-config', label: 'City Configuration', icon: <LocationCity /> },
        { id: 'pricing-config', label: 'Pricing Config', icon: <AttachMoney /> },
        { id: 'notification-templates', label: 'Notification Templates', icon: <Notifications /> },
        { id: 'api-management', label: 'API Management', icon: <Settings /> },
        { id: 'audit-logs-config', label: 'Audit Logs', icon: <History /> },
        { id: 'backup-config', label: 'Backup Config', icon: <Backup /> },
        { id: 'data-retention', label: 'Data Retention', icon: <Storage /> },
        { id: 'app-version-control', label: 'Version Control', icon: <Build /> },
        { id: 'kill-switch', label: 'Kill Switch', icon: <Security /> },
        { id: 'system-maintenance', label: 'System Maintenance', icon: <Build /> },
      ],
    },
  ];
        { id: 'provider-verification', label: 'Document Verification', icon: <Business /> },
        { id: 'provider-performance', label: 'Performance Metrics', icon: <Business /> },
        { id: 'provider-wallet', label: 'Provider Wallets', icon: <Business /> },
        { id: 'provider-settlements', label: 'Settlements', icon: <Business /> },
        { id: 'provider-blacklist', label: 'Blacklist Management', icon: <Business /> },
      ],
    },
    {
      id: 'service-catalog',
      label: 'Service & Catalog',
      icon: <Category />,
      children: [
        { id: 'categories', label: 'Categories', icon: <Category /> },
        { id: 'services', label: 'Services', icon: <Category /> },
        { id: 'pricing-rules', label: 'Pricing Rules', icon: <Category /> },
        { id: 'commission-rules', label: 'Commission Rules', icon: <Category /> },
        { id: 'service-areas', label: 'Service Areas', icon: <Category /> },
        { id: 'service-moderation', label: 'Content Moderation', icon: <Category /> },
        { id: 'service-analytics', label: 'Service Analytics', icon: <Category /> },
        { id: 'category-demand', label: 'Demand Heatmap', icon: <Category /> },
      ],
    },
    {
      id: 'bookings-operations',
      label: 'Bookings & Operations',
      icon: <EventNote />,
      children: [
        { id: 'all-bookings', label: 'All Bookings', icon: <EventNote /> },
        { id: 'live-bookings', label: 'Live Bookings', icon: <EventNote /> },
        { id: 'booking-disputes', label: 'Disputes', icon: <EventNote /> },
        { id: 'booking-reassignment', label: 'Reassignment', icon: <EventNote /> },
        { id: 'emergency-override', label: 'Emergency Override', icon: <EventNote /> },
        { id: 'sla-monitoring', label: 'SLA Monitoring', icon: <EventNote /> },
        { id: 'completion-verification', label: 'Completion Verification', icon: <EventNote /> },
        { id: 'bulk-operations', label: 'Bulk Operations', icon: <EventNote /> },
      ],
    },
    {
      id: 'payments-finance',
      label: 'Payments & Finance',
      icon: <Payment />,
      children: [
        { id: 'transactions', label: 'Transactions', icon: <Payment /> },
        { id: 'failed-payments', label: 'Failed Payments', icon: <Payment /> },
        { id: 'refunds', label: 'Refunds', icon: <Payment /> },
        { id: 'provider-settlements', label: 'Provider Settlements', icon: <Payment /> },
        { id: 'commission-reports', label: 'Commission Reports', icon: <Payment /> },
        { id: 'gst-reports', label: 'GST Reports', icon: <Payment /> },
        { id: 'revenue-analytics', label: 'Revenue Analytics', icon: <Payment /> },
        { id: 'bank-reconciliation', label: 'Bank Reconciliation', icon: <Payment /> },
      ],
    },
    {
      id: 'complaints-support',
      label: 'Complaints & Support',
      icon: <Support />,
      children: [
        { id: 'ticket-inbox', label: 'Ticket Inbox', icon: <Support /> },
        { id: 'priority-queue', label: 'Priority Queue', icon: <Support /> },
        { id: 'escalation', label: 'Escalation', icon: <Support /> },
        { id: 'auto-resolution', label: 'Auto Resolution', icon: <Support /> },
        { id: 'chat-history', label: 'Chat History', icon: <Support /> },
        { id: 'refund-recommendations', label: 'Refund Recommendations', icon: <Support /> },
        { id: 'closure-reports', label: 'Closure Reports', icon: <Support /> },
      ],
    },
    {
      id: 'system-config',
      label: 'System & Configuration',
      icon: <Settings />,
      children: [
        { id: 'roles-permissions', label: 'Roles & Permissions', icon: <Settings /> },
        { id: 'feature-toggles', label: 'Feature Toggles', icon: <Settings /> },
        { id: 'city-config', label: 'City Configuration', icon: <Settings /> },
        { id: 'pricing-config', label: 'Pricing Config', icon: <Settings /> },
        { id: 'notification-templates', label: 'Notification Templates', icon: <Settings /> },
        { id: 'api-management', label: 'API Management', icon: <Settings /> },
        { id: 'audit-logs', label: 'Audit Logs', icon: <Settings /> },
        { id: 'backup-config', label: 'Backup Config', icon: <Settings /> },
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
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              backgroundColor: currentPage === item.id ? theme.palette.action.selected : 'transparent',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
        <Typography variant="body2" color="text.secondary">
          BookYourService
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {navigation.map(item => renderNavigationItem(item))}
        </List>
      </Box>
    </Box>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      // Core Dashboard
      case 'system-overview':
        return <SystemOverview />;
      case 'analytics-kpis':
        return <AnalyticsKPIs />;
      case 'usage-heatmap':
        return <UsageHeatmap />;
      case 'system-alerts':
        return <SystemAlerts />;
      case 'system-health':
        return <HealthMonitoring />;
      case 'activity-logs':
        return <ActivityLogs />;
      case 'notification-center':
      case 'api-usage':
      case 'error-logs':
      case 'sla-monitoring':
      case 'emergency-controls':
      case 'audit-snapshot':

      // User Management - Customers
      case 'customers-list':
        return <CustomersList />;
      case 'customer-profiles':
      case 'customer-verification':
      case 'customer-activity':
      case 'customer-wallet':
      case 'customer-support':
      case 'customer-risk':
      case 'customer-gdpr':
      case 'customer-loyalty':
      case 'customer-segments':

      // User Management - Providers
      case 'provider-queue':
      case 'providers-list':
        return <ProvidersList />;
      case 'provider-profiles':
      case 'provider-verification':
      case 'provider-performance':
      case 'provider-wallet':
      case 'provider-settlements':
      case 'provider-blacklist':
      case 'provider-contracts':
      case 'provider-sla':
      case 'provider-analytics':
      case 'provider-support':

      // Service & Catalog
      case 'service-categories':
      case 'service-attributes':
      case 'pricing-rules':
      case 'commission-rules':
      case 'dynamic-pricing':
      case 'area-availability':
      case 'service-lifecycle':
      case 'content-moderation':
      case 'service-analytics':
      case 'demand-heatmap':
      case 'service-seo':
      case 'abuse-reports':

      // Bookings & Operations
      case 'all-bookings':
      case 'live-bookings':
      case 'booking-disputes':
      case 'reassignment':
      case 'emergency-override':
      case 'sla-monitoring-ops':
      case 'completion-verification':
      case 'bulk-operations':
      case 'geo-tracking':
      case 'manual-booking':
      case 'time-slot-control':
      case 'booking-analytics':

      // Payments & Finance
      case 'transactions':
      case 'failed-payments':
      case 'refunds':
      case 'provider-settlements-finance':
      case 'commission-reports':
      case 'gst-reports':
      case 'revenue-analytics':
      case 'bank-reconciliation':
      case 'wallet-ledger':
      case 'payout-scheduling':
      case 'tax-reports':
      case 'financial-audit':

      // Complaints & Support
      case 'ticket-inbox':
      case 'priority-queue':
      case 'escalation':
      case 'auto-resolution':
      case 'chat-history':
      case 'refund-recommendations':
      case 'closure-reports':
      case 'satisfaction-scores':
      case 'support-analytics':
      case 'penalty-management':

      // System & Configuration
      case 'roles-permissions':
      case 'feature-toggles':
      case 'city-config':
      case 'pricing-config':
      case 'notification-templates':
      case 'api-management':
      case 'audit-logs-config':
      case 'backup-config':
      case 'data-retention':
      case 'app-version-control':
      case 'kill-switch':
      case 'system-maintenance':

      // Legacy pages (keeping for backward compatibility)
      case 'overview':
        return <SystemOverview />;
      case 'analytics':
        return <AnalyticsKPIs />;
      case 'heatmap':
        return <UsageHeatmap />;
      case 'alerts':
        return <SystemAlerts />;
      case 'health':
        return <HealthMonitoring />;
      case 'activity-log':
        return <ActivityLogs />;
      case 'users':
        return <AdminUserManagement />;
      case 'providers':
        return <AdminProviderManagement />;
      case 'bookings':
        return <AdminBookingManagement />;
      case 'finance':
        return <AdminFinancialReports />;
      case 'system':
        return <AdminSystemConfig />;
      default:
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
              Part of the comprehensive 500+ feature BookYourService admin dashboard
            </Typography>
          </Box>
        );
    }
  };

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
            <Menu />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>

          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Notifications />
          </IconButton>

          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
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

export default AdminModule;
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-2">Page Under Development</h2>
              <p className="text-slate-600">This feature is coming soon!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-[#0A2540] text-white p-8 overflow-y-auto">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Admin<br/><span className="text-blue-500">Panel</span></h1>
          <p className="text-[8px] font-black text-blue-300 uppercase tracking-[0.4em] opacity-60 mt-2">Governance Hub</p>
        </div>

        <nav className="space-y-2">
          {navigation.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-12 pt-8 border-t border-white/20">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full bg-red-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-red-700 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default AdminModule;