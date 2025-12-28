
# DoorStep Pro: Enterprise Service Platform

A comprehensive UrbanClap-style platform connecting users with local service providers for daily-life problems. This platform features a systematic "Problem Ontology" engine with 2,000+ pre-defined services and strict price controls.

## 🚀 Key Features
- **Problem-Based Booking**: Users select from 2,000+ specific daily problems rather than generic categories.
- **Strict Pricing Engine**: Automated billing based on system-locked base prices and material add-ons.
- **Multi-Role Governance**: 
  - **User App**: Booking, live tracking, and UPI/COD payments.
  - **Provider App**: Lead management, arrival scheduling, and anti-cheat billing.
  - **Admin Panel**: Revenue monitoring, price control, and provider banning.
- **Platform Economics**: Automatic ₹10 fee deduction per completed service.
- **Investor Pitch Deck**: Integrated 12-slide pitch deck for funding purposes.

## 🛠️ Tech Stack
- **Frontend**: React (v19) with Tailwind CSS.
- **State Management**: React Hooks & Context pattern.
- **Database**: LocalStorage-based simulated Database Service (Sync-Ready).
- **Intelligence**: Rule-based AI risk assessment and SLA tracking.
- **Visualization**: Recharts for revenue and categorical analytics.

## 📦 File Structure
```
/
├── types.ts              # Core TypeScript Interfaces
├── constants.tsx        # 2000 Problem Taxonomy & Static Data
├── App.tsx              # Main Application Controller
├── AuthService.ts       # RBAC & Session Management
├── DatabaseService.ts   # Persistent Data Layer Simulation
├── PaymentService.ts    # UPI & COD Payment Flow Simulation
├── AIIntelligenceService.ts # Proactive Risk & Priority AI
├── components/          # Role-Specific UI Modules
│   ├── UserModule.tsx
│   ├── ProviderModule.tsx
│   ├── AdminModule.tsx
│   └── PitchModule.tsx
└── README.md            # Project Documentation
```

## 🏗️ Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run start`.
4. Login with default credentials:
   - **Admin**: `admin@doorstep.gov.in` (Pass: `password123`)
   - **Provider**: `rajesh@provider.com` (Pass: `password123`)

## 🏙️ Launch Strategy (First 30 Days)
1. **Week 1 (Supply)**: Ground-level onboarding of electricians/plumbers via local wholesale stores.
2. **Week 2 (Demand)**: Hyper-local marketing in residential societies with "Fixed Price" hooks.
3. **Week 3 (Ops)**: Verify SLA adherence and settle provider wallets daily.

---
*Developed for Enterprise Scale by DoorStep Pro Governance v3.5.*
