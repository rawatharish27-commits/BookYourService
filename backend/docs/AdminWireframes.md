# 👑 ADMIN DASHBOARD - COMPLETE PAGE-BY-PAGE WIREFRAMES (SENIOR DEV LEVEL)
# ============================================
# Purpose: Define UI Structure for every Admin Page
# Stack: React + Tailwind + Existing UI Components
# Type: Production-Grade (Wireframes)
# 
# IMPORTANT:
# 1. These wireframes are "Text-Based Blueprints" for Frontend Devs.
# 2. They define exact Layout (Sidebar/Header), Components (Card, Table), and Data (KPIs, Lists).
# 3. They reuse existing "Atomic Components" (Button, Input, Badge, etc.) created earlier.
# 4. They are implementation-ready (Copy-paste structure).
# ============================================

# ============================================
# GLOBAL LAYOUT (BASE)
# ============================================

## 📋 LAYOUT COMPONENT: AdminLayout

### **Structure:**
```
┌─────────────────────────────────┐
│ AdminSidebar (Left)   AdminHeader (Top)  │
├─────────────────────────────────┤
│             MAIN CONTENT AREA            │
│  (Dynamic Pages Render Here)            │
│                                   │
└─────────────────────────────────┘
```

### **Sidebar Items (Navigation):**
- Dashboard (`/admin/dashboard`)
- Users (`/admin/users`)
- Providers (`/admin/providers`)
- Bookings (`/admin/bookings`)
- Payments (`/admin/payments`)
- Analytics (`/admin/analytics`)
- Reports (`/admin/reports`)
- Settings (`/admin/settings`)
- Logout

### **Header Items:**
- Logo ("BookYourService")
- User Profile (Avatar + Name)
- Notification Bell
- Search Bar
- Dropdown (Theme, Logout)

### **Main Content Area:**
- Max Width: 1440px
- Background: Gray-50
- Padding: 24px (Top), 32px (Bottom)

### **Reusable Components Used:**
- `Layout` (`AdminLayout`)
- `Sidebar` (`AdminSidebar` - To be created)
- `Header` (`AdminHeader` - To be created)
- `Card` (StatCard, DataTable, FilterCard)
- `Button` (Primary, Secondary, Ghost)
- `Badge` (Status: Active, Suspended, etc.)
- `Input` (Search, Date Range)
- `Table` (DataTable)
- `Modal` (Delete Confirmation)

---

# ============================================
# PAGE 1: ADMIN DASHBOARD
# ============================================

## 📊 PAGE: DASHBOARD (`/admin/dashboard`)

### **Purpose:**
- Show high-level platform metrics (KPI Cards).
- Show recent activity (Audit Logs, Alerts).

### **Layout:**
```
┌─────────────────────────────────┐
│ Sidebar  │  Header (Search + Bell + Profile)  │
├─────────────────────────────────┤
│                                   │
│  SECTION 1: KPI CARDS (Grid)    │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐│
│  │ Users   │ Providers│ Revenue  │Total Bookings│           │
│  │ 1,234  │ 567     │ ₹5.2L   │1,456          │
│  │ +5%     │ +2%     │ +8%     │+3%           │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘│
│                                   │
│  SECTION 2: RECENT ACTIVITY     │
│  ┌───────────────────────────────────┐│
│  │ [Audit Logs] [Booking Cancellations] ││
│  └───────────────────────────────────┘│
│                                   │
└─────────────────────────────────────────┘
```

### **Components Required:**
- `Layout`: `AdminLayout`
- `Card`: `StatCard` (x4)
  - Icon
  - Title
  - Value (Formatted: e.g., 1,234)
  - Trend (Up Arrow / Down Arrow, Green / Red)
- `Card`: `ActivityCard` (x2)
  - Title
  - List of Recent Items (Date, Action, User)
  - "View All" Link

### **Data Required:**
- **KPIs:**
  - Total Users (Count)
  - Total Providers (Count)
  - Total Revenue (Money)
  - Total Bookings (Count)
- **Recent Activity:**
  - Audit Logs (Action, Actor, Timestamp)
  - Booking Cancellations (Customer, Reason, Timestamp)

### **API Endpoints Used:**
- `GET /api/v1/analytics/kpis` (Fetch KPIs)
- `GET /api/v1/audit-logs?limit=5` (Fetch Recent Logs)
- `GET /api/v1/bookings?limit=5` (Fetch Recent Bookings)

### **Props for Developer:**
```typescript
const KPIs = {
  totalUsers: number;
  totalProviders: number;
  totalRevenue: number;
  totalBookings: number;
};

const AuditLog = {
  id: string;
  action: string;
  actor: string; // Email or Name
  timestamp: Date;
};
```

---

# ============================================
# PAGE 2: USERS MANAGEMENT
# ============================================

## 📋 PAGE: USERS (`/admin/users`)

### **Purpose:**
- List all users (Customers + Providers).
- Filter by Role (Customer / Provider).
- Search by Email/Phone.
- View Details.
- Edit / Delete (Soft Delete).

### **Layout:**
```
┌─────────────────────────────────┐
│ Sidebar  │  Header (Search + Bell + Profile)  │
├─────────────────────────────────┤
│                                   │
│  SECTION 1: FILTERS (Top)       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐│
│  │ Search   │ Role     │ Status  ││
│  │ [Input]  │ [Select]  │ [Select] ││
│  └──────────┴──────────┴──────────┴──────────┘│
│                                   │
│  SECTION 2: USERS TABLE (Full Width)│
│  ┌───────────────────────────────────┐│
│  │ Checkbox | Email | Role | Status ││
│  ├───────────┼────────┼────────┼────────┤│
│  │ [ ]       | john@..  │ Active  ││
│  │ [x]       | jane@..  │ Blocked ││
│  │ [ ]       | bob@...   │ Suspended││
│  ├───────────┼────────┼────────┼────────┤│
│  │ [ ]       | alice@.. │ Active  ││
│  └───────────┴────────┴──────────┴─────────┘│
│                                   │
│  SECTION 3: PAGINATION (Bottom)      │
│  ┌───────────────────────────────────┐│
│  │ <  Previous  [ 1  2  3 ]  Next > ││
│  └───────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### **Components Required:**
- `Layout`: `AdminLayout`
- `Card`: `FilterCard` (Search Input + Role Select + Status Select)
- `Table`: `DataTable`
  - Columns: Checkbox (Select All), Email, Role, Status, Actions
  - Rows: User Data
- `Button`: "Add User" (Secondary), "Delete Selected" (Primary - Red)
- `Badge`: Role Badge (Customer / Provider), Status Badge (Active / Blocked / Suspended)

### **Data Required:**
- **Users List:**
  - ID
  - Email / Phone
  - Role (Customer / Provider)
  - Status (Active / Blocked / Suspended)
  - Created At
- **Filters:**
  - Search String (Email / Phone)
  - Role Filter (All / Customer / Provider)
  - Status Filter (All / Active / Blocked / Suspended)

### **API Endpoints Used:**
- `GET /api/v1/admin/users` (With Query Params: `?search=...&role=...&status=...`)
- `DELETE /api/v1/admin/users/:id` (Soft Delete)

### **Props for Developer:**
```typescript
interface User {
  id: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'PROVIDER';
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  createdAt: Date;
}

interface Filters {
  search: string;
  role: 'ALL' | 'CUSTOMER' | 'PROVIDER';
  status: 'ALL' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
}
```

---

# ============================================
# PAGE 3: PROVIDERS MANAGEMENT
# ============================================

## 📋 PAGE: PROVIDERS (`/admin/providers`)

### **Purpose:**
- List all providers.
- Approve / Reject new providers (KYC Review).
- View provider details (Business, KYC Docs, Skills).
- Block / Unblock.
- Payout (Release Earnings).

### **Layout:**
```
┌─────────────────────────────────┐
│ Sidebar  │  Header (Search + Bell + Profile)  │
├─────────────────────────────────┤
│                                   │
│  SECTION 1: FILTERS (Top)       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐│
│  │ Search   │ City     │ Status  ││
│  │ [Input]  │ [Select]  │ [Select] ││
│  └──────────┴──────────┴──────────┴──────────┘│
│                                   │
│  SECTION 2: PROVIDERS TABLE (Full)  │
│  ┌───────────────────────────────────┐│
│  │ Provider │ Rating │ Bookings│ Earnings│Status │ Actions  │
│  ├───────────┼────────┼────────┼────────┼────────┤│
│  │ [Avatar]  │ 4.8 ⭐  │ 234     │ ₹1.2L   │Active   │[View][Block]│
│  └───────────┼────────┼────────┼────────┼────────┤│
│  │ [Avatar]  │ 4.5 ⭐  │ 567     │ ₹0.5L   │Active   │[View][Block]│
│  └───────────┼────────┼────────┼────────┼────────┤│
│  │ [Avatar]  │ 4.2 ⭐  │ 123     │ ₹0.0L   │Pending  │[Approve][Reject]│
│  └───────────┴────────┴────────┴────────┴───────────┤
│  └───────────────────────────────────┘│
│                                   │
│  SECTION 3: PAGINATION (Bottom)      │
│  ┌───────────────────────────────────┐│
│  │ <  Previous  [ 1  2  3 ]  Next > ││
│  └───────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### **Components Required:**
- `Layout`: `AdminLayout`
- `Card`: `FilterCard` (Search Input + City Select + Status Select)
- `Table`: `DataTable`
  - Columns: Avatar, Name, Rating, Bookings, Earnings, Status, Actions
  - Rows: Provider Data
- `Avatar`: `ProviderAvatar` (Rounded, Initials)
- `Badge`: Status Badge (Pending KYC, Under Review, Approved, Blocked, Suspended)
- `Button`: "Payout" (Secondary), "Block" (Ghost - Red)

### **Data Required:**
- **Providers List:**
  - ID
  - Business Name
  - Rating (1-5 Stars)
  - Total Bookings
  - Total Earnings
  - Status (Pending KYC, Under Review, Approved, Blocked, Suspended)
  - City

### **API Endpoints Used:**
- `GET /api/v1/admin/providers` (With Query Params: `?search=...&city=...&status=...`)
- `GET /api/v1/admin/providers/:id` (Fetch Details)
- `PUT /api/v1/admin/providers/:id/approve` (Approve KYC)
- `PUT /api/v1/admin/providers/:id/block` (Block)
- `PUT /api/v1/admin/providers/:id/unblock` (Unblock)

### **Props for Developer:**
```typescript
interface Provider {
  id: string;
  businessName: string;
  rating: number;
  totalBookings: number;
  totalEarnings: number;
  status: 'PENDING_KYC' | 'UNDER_REVIEW' | 'APPROVED' | 'BLOCKED' | 'SUSPENDED';
  city: string;
}

interface Filters {
  search: string;
  city: string;
  status: 'ALL' | 'PENDING_KYC' | 'UNDER_REVIEW' | 'APPROVED' | 'BLOCKED' | 'SUSPENDED';
}
```

---

# ============================================
# PAGE 4: BOOKINGS MANAGEMENT
# ============================================

## 📋 PAGE: BOOKINGS (`/admin/bookings`)

### **Purpose:**
- List all bookings (Customer + Provider).
- View booking details (Timeline, Status, Provider).
- Cancel / Reassign (Admin Override).
- Refund.

### **Layout:**
```
┌─────────────────────────────────┐
│ Sidebar  │  Header (Search + Bell + Profile)  │
├─────────────────────────────────┤
│                                   │
│  SECTION 1: FILTERS (Top)       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐│
│  │ Search   │ Status   │ Date     ││
│  │ [Input]  │ [Select]  │ [Date]   ││
│  └──────────┴──────────┴──────────┴──────────┘│
│                                   │
│  SECTION 2: BOOKINGS TABLE (Full)  │
│  ┌───────────────────────────────────┐│
│  │ Customer │ Service│ Provider│ Date   │ Status   │Actions│
│  ├───────────┼────────┼────────┼────────┼────────┼────────┤│
│  │ [Avatar] │ Home    │ [Avatar] │ 12/01  │ Completed│[View]  │
│  ├───────────┼────────┼────────┼────────┼────────┼────────┤│
│  │ [Avatar] │ Cleaning│ [Avatar] │ 15/01  │ Canceled │[Reassign]│
│  └───────────┼────────┼────────┼────────┼────────┼────────┤│
│  └───────────┴────────┴────────┴────────┴─────────┤
│  └───────────────────────────────────┘│
│                                   │
│  SECTION 3: PAGINATION (Bottom)      │
│  ┌───────────────────────────────────┐│
│  │ <  Previous  [ 1  2  3 ]  Next > ││
│  └───────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### **Components Required:**
- `Layout`: `AdminLayout`
- `Card`: `FilterCard` (Search Input + Status Select + Date Range)
- `Table`: `DataTable`
  - Columns: Customer, Service, Provider, Date, Status, Actions
  - Rows: Booking Data
- `Avatar`: `CustomerAvatar`, `ProviderAvatar`
- `Badge`: Status Badge (Draft, Pending, Assigned, Confirmed, In Progress, Completed, Cancelled, Failed)
- `Button`: "View Details" (Secondary), "Cancel" (Ghost - Red), "Reassign" (Secondary)

### **Data Required:**
- **Bookings List:**
  - ID
  - Customer ID
  - Customer Name
  - Service Title
  - Provider ID
  - Provider Name
  - Scheduled Date
  - Status (Draft, Pending, Assigned, Confirmed, In Progress, Completed, Cancelled, Failed)

### **API Endpoints Used:**
- `GET /api/v1/admin/bookings` (With Query Params: `?search=...&status=...&dateFrom=...&dateTo=...`)
- `GET /api/v1/admin/bookings/:id` (Fetch Details)
- `PUT /api/v1/admin/bookings/:id/cancel` (Admin Cancel)
- `POST /api/v1/admin/bookings/:id/reassign` (Reassign to Provider)

### **Props for Developer:**
```typescript
interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  serviceTitle: string;
  providerId: string;
  providerName: string;
  scheduledDate: Date;
  status: 'DRAFT' | 'REQUESTED' | 'ASSIGNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
}
```

---

# ============================================
# PAGE 5: PAYMENTS MANAGEMENT
# ============================================

## 📋 PAGE: PAYMENTS (`/admin/payments`)

### **Purpose:**
- List all payments.
- View payment details (Gateway, Status, Amount).
- Process Refunds.
- Download Report (CSV).

### **Layout:**
```
┌─────────────────────────────────┐
│ Sidebar  │  Header (Search + Bell + Profile)  │
├─────────────────────────────────┤
│                                   │
│  SECTION 1: FILTERS (Top)       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐│
│  │ Gateway  │ Status   │ Date     ││
│  │ [Select]  │ [Select]  │ [Date]   ││
│  └──────────┴──────────┴──────────┴──────────┘│
│                                   │
│  SECTION 2: PAYMENTS TABLE (Full)  │
│  ┌───────────────────────────────────┐│
│  │ Booking   │ Customer │ Gateway │ Amount  │ Status  │ Actions    │
│  ├───────────┼────────┼────────┼────────┼────────┼────────┤│
│  │ B123      │ [Avatar] │ Razorpay │ ₹500   │ Completed│[Refund][View]│
│  ├───────────┼────────┼────────┼────────┼────────┼────────┤│
│  │ B124      │ [Avatar] │ Stripe   │ ₹1200  │ Failed    │[Retry]    │
│  └───────────┼────────┼────────┼────────┼────────┼────────┤│
│  └───────────┴────────┴────────┴────────┴───────────┤
│  └───────────────────────────────────┘│
│                                   │
│  SECTION 3: ACTIONS (Top Right)   │
│  ┌───────────────────────────────────┐│
│  │ [Download Report CSV] [Refund Selected]││
│  └───────────────────────────────────┘│
│                                   │
│  SECTION 4: PAGINATION (Bottom)      │
│  ┌───────────────────────────────────┐│
│  │ <  Previous  [ 1  2  3 ]  Next > ││
│  └───────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### **Components Required:**
- `Layout`: `AdminLayout`
- `Card`: `FilterCard` (Gateway Select + Status Select + Date Range)
- `Table`: `DataTable`
  - Columns: Booking ID, Customer, Gateway, Amount, Status, Actions
  - Rows: Payment Data
- `Badge`: Status Badge (Pending, Completed, Failed, Refunded, Chargeback)
- `Button`: "Download Report" (Secondary), "Refund Selected" (Primary - Red)

### **Data Required:**
- **Payments List:**
  - ID
  - Booking ID
  - Customer ID
  - Gateway (Razorpay, Stripe, etc.)
  - Amount
  - Status (Pending, Completed, Failed, Refunded, Chargeback)
  - Created At

### **API Endpoints Used:**
- `GET /api/v1/admin/payments` (With Query Params: `?gateway=...&status=...&dateFrom=...&dateTo=...`)
- `GET /api/v1/admin/payments/download-csv` (Download Report)
- `POST /api/v1/admin/payments/:paymentId/refund` (Process Refund)

### **Props for Developer:**
```typescript
interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  gateway: 'RAZORPAY' | 'STRIPE' | 'PAYPAL' | 'CASH';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CHARGEBACK';
  createdAt: Date;
}
```

---

# ============================================
# PAGE 6: SETTINGS
# ============================================

## 📋 PAGE: SETTINGS (`/admin/settings`)

### **Purpose:**
- Configure environment variables.
- Manage feature flags (Maintenance Mode, New Features).
- View System Status.

### **Layout:**
```
┌─────────────────────────────────┐
│ Sidebar  │  Header (Search + Bell + Profile)  │
├─────────────────────────────────┤
│                                   │
│  SECTION 1: SYSTEM STATUS (Top)   │
│  ┌───────────────────────────────────┐│
│  │ API Status: [🟢 Operational]  ││
│  │ DB Status:   [🟢 Operational]  ││
│  │ Uptime:      [99.95%]            ││
│  └───────────────────────────────────┘│
│                                   │
│  SECTION 2: CONFIGURATION FORMS    │
│  ┌───────────────────────────────────┐│
│  │ Environment Variables           ││
│  ├──────────────────────────────────┤│
│  │ Key: JWT_SECRET               ││
│  │ Value: [******************]    ││
│  │ [Update]                      ││
│  ├──────────────────────────────────┤│
│  │ Key: DATABASE_URL             ││
│  │ Value: postgres://user...     ││
│  │ [Update]                      ││
│  └──────────────────────────────────┘│
│                                   │
│  SECTION 3: FEATURE FLAGS         │
│  ┌───────────────────────────────────┐│
│  │ Maintenance Mode: [Toggle]    ││
│  │ New Feature:      [Toggle]    ││
│  └───────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### **Components Required:**
- `Layout`: `AdminLayout`
- `Card`: `SystemStatusCard` (API Status, DB Status, Uptime)
- `Card`: `EnvVarCard` (Key, Masked Value, Update Button)
- `Card`: `FeatureFlagCard` (Name, Description, Toggle Switch)
- `Input`: Hidden Input for Env Vars (Update Only)
- `Button`: "Update" (Primary), "Save" (Secondary)

### **Data Required:**
- **System Status:**
  - API Status (Operational / Down)
  - DB Status (Operational / Down)
  - Uptime (Percentage)
- **Environment Variables:**
  - JWT_SECRET (Masked for display)
  - DATABASE_URL (Masked for display)
  - STRIPE_SECRET_KEY (Masked for display)
- **Feature Flags:**
  - Name
  - Description
  - Enabled (Boolean)
  - Rollout Percentage (0-100)

### **API Endpoints Used:**
- `GET /api/v1/admin/settings/env` (Fetch Env Vars)
- `PUT /api/v1/admin/settings/env` (Update Env Var)
- `GET /api/v1/admin/settings/features` (Fetch Feature Flags)
- `PUT /api/v1/admin/settings/features` (Toggle Feature)

### **Props for Developer:**
```typescript
interface EnvVar {
  key: string;
  value: string; // Display masked
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number;
}
```

---

# ============================================
# GLOBAL COMPONENTS (REUSED ACROSS PAGES)
# ============================================

## 🧱 COMPONENT: ADMIN SIDEBAR

### **Purpose:**
- Navigation menu for all admin pages.
- Highlights active page.
- Collapsible (Mobile).

### **Structure:**
```
┌─────────────────┐
│ Navigation     │
├─────────────────┤
│ Dashboard     │
│ Users         │
│ Providers     │
│ Bookings      │
│ Payments      │
│ Analytics     │
│ Reports       │
│ Settings      │
│ Logout        │
└─────────────────┘
```

---

## 🧱 COMPONENT: ADMIN HEADER

### **Purpose:**
- Global header for all admin pages.
- Displays user profile (Avatar + Name).
- Displays search bar.
- Displays notification bell.
- Displays dropdown (Theme, Logout).

### **Structure:**
```
┌─────────────────────────────────┐
│ Logo: BYS       [🔔] [Profile]       │
└─────────────────────────────────┘
```

---

## 🧱 COMPONENT: STAT CARD

### **Purpose:**
- Displays single metric (Users, Revenue, etc.).
- Shows trend (Up / Down Arrow, Green / Red).
- Shows percentage change.

### **Structure:**
```
┌─────────────────┐
│ 👤 Users      │
│ 1,234       │
│ +5% this month│
│ ↑            │
└─────────────────┘
```

---

## 🧱 COMPONENT: DATA TABLE

### **Purpose:**
- Displays list of items (Users, Providers, Bookings, etc.).
- Supports sorting, filtering, pagination.
- Supports row selection (Checkbox).

### **Structure:**
```
┌─────────────────────────────────────────┐
│ Checkbox | Col 1 | Col 2 | ... | Actions │
├───────────┼────────┼────────┼─────┼────────┤
│ [ ]      | Item 1  | Data 1  | ...   │
│ [x]      | Item 2  | Data 2  | ...   │
│ [ ]      | Item 3  | Data 3  | ...   │
└───────────┴────────┴────────┴─────────┴─────────┤
│  [Select All]                   < Prev  [ 1  2  3 ]  Next > │
└─────────────────────────────────────────────────┘
```

---

# ============================================
# ROUTES SUMMARY (ALL PAGES)
# ============================================

| Route | Page | Components |
|-------|------|------------|
| `/admin/dashboard` | Dashboard | `AdminLayout`, `StatCard` (x4), `ActivityCard` (x2) |
| `/admin/users` | Users | `AdminLayout`, `FilterCard`, `DataTable`, `Badge` (x3) |
| `/admin/providers` | Providers | `AdminLayout`, `FilterCard`, `DataTable`, `Badge` (x2), `Avatar` |
| `/admin/bookings` | Bookings | `AdminLayout`, `FilterCard`, `DataTable`, `Badge` (x3), `Avatar` |
| `/admin/payments` | Payments | `AdminLayout`, `FilterCard`, `DataTable`, `Badge` (x4) |
| `/admin/settings` | Settings | `AdminLayout`, `SystemStatusCard`, `EnvVarCard`, `FeatureFlagCard` |

---

# ============================================
# FINAL STATUS (SENIOR DEV / CTO LEVEL)
# ============================================

> **अब मैं यह सब Admin Dashboard Pages का Exact Wireframe बना दिया है!**
> **Frontend Developer इसे या पाँस कभी copy-paste नहीं चाहिए!**
> **सब कुछ "Atomic Components" reuse हो रहे हैं!**

**Status:** 🟢 **WIREFRAMES COMPLETE**
**Version:** 1.0.0
**Next:** Commit to GitHub.

---

