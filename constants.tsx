
import { Category, Problem, SLATier, StateConfig, PSUTypeConfig, ProblemCategoryCoverage, WeeklyChecklist, RiskLevel, Addon, SOPItem, ExpansionChecklist, RegionConfig } from './types';

export const PLATFORM_FEE = 10;
export const VISIT_CHARGE = 100;

export const REGIONS: RegionConfig[] = [
  { id: 'IN', name: 'India', currency: '₹', platformFee: 10, taxRate: 18, timezone: 'IST', status: 'ACTIVE', infraCostPerBooking: 2.5 },
  { id: 'UAE', name: 'United Arab Emirates', currency: 'AED', platformFee: 5, taxRate: 5, timezone: 'GST', status: 'PILOT', infraCostPerBooking: 4.2 },
  { id: 'KSA', name: 'Saudi Arabia', currency: 'SAR', platformFee: 10, taxRate: 15, timezone: 'AST', status: 'PLANNED', infraCostPerBooking: 0 }
];

export const CATEGORIES: Category[] = [
  { id: 'ELECTRICAL', name: 'Electrical', icon: '⚡', providerType: 'Electrician' },
  { id: 'PLUMBING', name: 'Plumbing', icon: '🚰', providerType: 'Plumber' },
  { id: 'AC', name: 'AC & Cooling', icon: '❄️', providerType: 'AC Technician' },
  { id: 'APPLIANCE', name: 'Home Appliances', icon: '📺', providerType: 'Appliance Repair' },
  { id: 'MOBILE', name: 'Mobile & Laptop', icon: '📱', providerType: 'Technician' },
  { id: 'NETWORKING', name: 'Internet & Network', icon: '🌐', providerType: 'Network Engineer' },
  { id: 'SECURITY', name: 'CCTV & Security', icon: '📹', providerType: 'Security Tech' },
  { id: 'RO_WATER', name: 'RO & Water', icon: '💧', providerType: 'RO Technician' },
  { id: 'CARPENTER', name: 'Carpenter', icon: '🪚', providerType: 'Carpenter' },
  { id: 'PAINTING', name: 'Painting & Renovation', icon: '🎨', providerType: 'Painter' },
  { id: 'CLEANING', name: 'Cleaning', icon: '🧹', providerType: 'House Cleaner' },
  { id: 'PEST_CONTROL', name: 'Pest Control', icon: '🐜', providerType: 'Pest Expert' },
  { id: 'MECHANIC', name: 'Vehicle Repair', icon: '🔧', providerType: 'Mechanic' },
  { id: 'GAS_KITCHEN', name: 'Gas & Kitchen', icon: '🔥', providerType: 'Gas Technician' },
  { id: 'PACKERS', name: 'Home Shifting', icon: '📦', providerType: 'Packers & Movers' },
  { id: 'HANDYMAN', name: 'Interior Small Works', icon: '🛠️', providerType: 'Handyman' },
  { id: 'IOT_SMART', name: 'Smart Devices', icon: '🤖', providerType: 'IoT Technician' },
  { id: 'SOLAR', name: 'Solar & Power', icon: '☀️', providerType: 'Solar Tech' },
  { id: 'FURNITURE', name: 'Furniture Assembly', icon: '🛋️', providerType: 'Assembler' },
  { id: 'EVENTS', name: 'Event Support', icon: '🎉', providerType: 'Event Helper' },
  { id: 'BEAUTY', name: 'Personal Care @Home', icon: '💅', providerType: 'Beautician' },
  { id: 'HEALTH', name: 'Health @Home', icon: '🏥', providerType: 'Nurse' },
  { id: 'DELIVERY', name: 'Delivery Support', icon: '🚲', providerType: 'Pickup Agent' },
  { id: 'GOVT_FIELD', name: 'Government Form Help', icon: '📄', providerType: 'Field Agent' },
  { id: 'EMERGENCY', name: 'Misc Emergency', icon: '🚨', providerType: 'Rapid Response' },
];

const PROBLEM_VARIANTS = [
  "Repair & Fix", "Installation Service", "Maintenance Check", "Replacement Service",
  "Urgent Diagnostics", "Deep Inspection", "Part Faulty", "Periodic Servicing"
];

export const generateProblems = (): Problem[] => {
  const problems: Problem[] = [];
  let globalIdCounter = 1;

  CATEGORIES.forEach(cat => {
    for (let i = 1; i <= 80; i++) {
      const variant = PROBLEM_VARIANTS[i % PROBLEM_VARIANTS.length];
      const basePrice = 200 + (Math.floor(Math.random() * 50) * 10);
      
      problems.push({
        id: `PROB_${globalIdCounter.toString().padStart(4, '0')}`,
        ontologyId: `${cat.id.slice(0, 3)}_${i.toString().padStart(3, '0')}`,
        category: cat.name,
        subCategory: i <= 40 ? 'Residential' : 'Commercial',
        title: `${cat.name} ${variant} #${i}`,
        basePrice,
        maxPrice: basePrice + 1000,
        addons: [
          { id: `add_${globalIdCounter}_1`, name: "Premium Spare Parts", price: 350 },
          { id: `add_${globalIdCounter}_2`, name: "Consumable Materials", price: 150 },
          { id: `add_${globalIdCounter}_3`, name: "Express Completion", price: 99 }
        ],
        description: `Certified doorstep support for all ${cat.name.toLowerCase()} related issues. Professional tools and standardized pricing applied.`,
        providerRole: cat.providerType,
        severity: (i % 5) + 1,
        slaTier: i % 3 === 0 ? SLATier.GOLD : i % 3 === 1 ? SLATier.SILVER : SLATier.BRONZE,
      });
      globalIdCounter++;
    }
  });

  return problems;
};

export const PITCH_SLIDES = [
  { id: 1, title: 'The Problem', content: 'Local services in India are chaotic. Price cheating, low quality, and lack of trust make simple household repairs a nightmare.' },
  { id: 2, title: 'The Solution', content: 'DoorStep Pro: A price-controlled, problem-based booking platform. We use "Problem Ontologies" to lock pricing before the provider arrives.' },
  { id: 3, title: 'Product Suite', content: 'Native-feel User App for booking, Provider App for execution/billing, and an Omniscient Admin Panel for governance.' },
  { id: 4, title: 'Standardized Flow', content: 'User selects a specific problem -> Nearest Provider is matched -> Fixed Base Price is locked -> Transparent Billing through App.' },
  { id: 5, title: 'Unique Moat', content: 'Anti-Cheat Billing: Providers cannot manually enter prices. They select from pre-approved material add-ons with system-enforced caps.' },
  { id: 6, title: 'Market Opportunity', content: 'The Indian home services market is valued at $50B+ and is highly fragmented. Digitization is the only way to scale.' },
  { id: 7, title: 'Revenue Model', content: 'Flat ₹10 platform fee per booking. Featured provider subscriptions. B2B AMC contracts for residential societies.' },
  { id: 8, title: 'Unit Economics', content: 'High frequency, low customer acquisition cost via hyperlocal density. Profitable from the first city launch.' },
  { id: 9, title: 'Unmatched Scalability', content: 'Starting with 25 categories and 2000 problems. Engineered to scale to 100+ categories using AI-driven problem taxonomy.' },
  { id: 10, title: 'Trust & Safety', content: 'Mandatory KYC for providers, call masking, and evidence-based dispute resolution engine.' },
  { id: 11, title: 'Growth Roadmap', content: 'Phase 1: 5 Tier-1 Cities. Phase 2: National expansion. Phase 3: AI-driven predictive maintenance services.' },
  { id: 12, title: 'The Ask', content: 'Seeking Seed Funding to optimize the matching engine, scale the problem registry, and launch in the first 3 metro cities.' }
];

export const SOP_LIST: SOPItem[] = [
  {
    id: 'SOP_001',
    title: 'Daily Operations (9:00 AM)',
    category: 'Ops',
    content: 'Checklist to ensure node stability and city-wide performance every morning.',
    steps: [
      'Backend health check via /health endpoint verification.',
      'Review yesterday\'s bookings vs SLA breach records.',
      'Identify unassigned bookings from night shift.',
      'Check provider online count against city density target.'
    ]
  },
  {
    id: 'SOP_002',
    title: 'Provider Price Violation',
    category: 'Billing',
    content: 'Protocols to follow when a provider attempts to charge more than the system-calculated Max Price.',
    steps: [
      'Automatic Flagging: System locks the billing module if total exceeds Max Price.',
      'Manual Review: Admin contacts the provider to verify if unexpected material was used.',
      'Resolution: If valid, admin can increase the limit temporarily; otherwise, provider is warned or banned.'
    ]
  },
  {
    id: 'SOP_003',
    title: 'Provider Onboarding Rule',
    category: 'Ops',
    content: 'Standard verification flow for field boys onboarding new service partners.',
    steps: [
      'Identity Check: Mobile OTP verification + Phone Number validation.',
      'Skill Verification: Selection of core categories (Max 3).',
      'Test Booking: Send a mock job to verify GPS and arrival workflow.',
      'Final Approval: Switch status from PENDING to ACTIVE.'
    ]
  },
  {
    id: 'SOP_004',
    title: 'Emergency Response Protocol',
    category: 'Ops',
    content: 'How to handle Critical Severity jobs that are stalled in the "ASSIGNED" status for >30 mins.',
    steps: [
      'Identify critical leads in the Command Center.',
      'Call the assigned provider immediately to check arrival status.',
      'If provider is unresponsive, force reassign the job to the next nearest Gold-tier partner.'
    ]
  },
  {
    id: 'SOP_005',
    title: 'Customer Refund Policy',
    category: 'Support',
    content: 'Handling refund requests for failed or unsatisfactory services.',
    steps: [
      'Verify service completion status and payment proof (UPI/COD).',
      'For UPI failures, initiate automated refund via Payment Gateway Node.',
      'For poor quality, offer free re-service or platform credit via Wallet Module.'
    ]
  }
];

export const EXPANSION_ROADMAP: ExpansionChecklist[] = [
  {
    phase: 'Phase 1: City Launch',
    days: '0-30 Days',
    focus: 'Onboarding & Supply',
    tasks: [
      'Hire 2 field boys for ground onboarding.',
      'Visit local electrical/plumbing wholesale hubs.',
      'Onboard first 30 verified providers with ₹0 platform fee hook.',
      'Launch Society WhatsApp marketing campaign.'
    ]
  },
  {
    phase: 'Phase 2: Scale Node',
    days: '30-60 Days',
    focus: 'Demand & Trust',
    tasks: [
      'Reach 150 bookings/day milestone.',
      'Implement trust-score based provider dispatch.',
      'Roll out "Price Locked" promise in local Facebook groups.',
      'Enable automated wallet settlements for partners.'
    ]
  },
  {
    phase: 'Phase 3: Stabilization',
    days: '60-90 Days',
    focus: 'Efficiency & Margin',
    tasks: [
      'Enforce flat ₹10 platform fee across all jobs.',
      'Identify and prune low-performing providers (<3.5 stars).',
      'Optimize AI dispatch for reduced ETA.',
      'Prepare playbook for City 2 expansion.'
    ]
  }
];

export const MASTER_PROBLEM_CATEGORIES: ProblemCategoryCoverage[] = CATEGORIES.map(cat => ({
  id: cat.id,
  name: cat.name,
  problemCount: 80,
  solvedPercentage: 92 + Math.floor(Math.random() * 8),
  impact: `Direct impact on daily ${cat.name.toLowerCase()} efficiency.`
}));

export const EXECUTION_CHECKLIST: WeeklyChecklist[] = [
  { week: 1, focus: 'Engine Design', tasks: ['Booking Engine', 'Billing Logic', 'Wallet API'], status: 'COMPLETED' },
  { week: 2, focus: 'Problem Seeding', tasks: ['2000 Problem Taxonomy', 'Price Caps Implementation'], status: 'COMPLETED' },
  { week: 3, focus: 'Quality Control', tasks: ['Dispute Dashboard', 'Provider Banning System'], status: 'IN_PROGRESS' }
];

export const STATE_CONFIGS: StateConfig[] = [
  { id: 'DL', name: 'Delhi NCR', slaModifiers: { [SLATier.GOLD]: 30, [SLATier.SILVER]: 120, [SLATier.BRONZE]: 480 }, pricingCaps: { 'Electrical': 2000 }, language: 'Hindi/English', complianceLevel: 'STANDARD' }
];

export const PSU_TYPES: PSUTypeConfig[] = [
  { id: 'MUNI', name: 'Municipal Services', focus: 'MUNICIPAL', customMetrics: ['Cleanliness Index'] }
];
