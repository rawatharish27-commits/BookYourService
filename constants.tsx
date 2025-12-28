
import { Category, Problem, SLATier, SOPItem } from './types';

export const PLATFORM_FEE = 10;
export const VISIT_CHARGE = 100;
export const PROBATION_JOB_LIMIT = 5;
export const SLA_MINS_THRESHOLD = 60;

export const BUSINESS_MODEL_STRATEGY = [
  { id: 'BM01', point: 'Marketplace + Managed Ops Model', impact: 'Ensures platform control while maintaining scalability.' },
  { id: 'BM02', point: 'Facilitation Only', impact: 'Platform does not perform service; mitigates direct liability.' },
  { id: 'BM03', point: 'Revenue via Platform Fees', impact: 'Clear, predictable unit economics per transaction.' },
  { id: 'BM04', point: 'City-wise P&L Ownership', impact: 'Decentralized financial responsibility for faster scaling.' },
  { id: 'BM05', point: 'Category Margin Tracking', impact: 'Identifies high-value categories for targeted marketing.' },
  { id: 'BM06', point: 'Repeat Usage Focus', impact: 'Customer LTV optimized over one-time acquisition.' },
  { id: 'BM07', point: 'Trust > Growth', impact: 'Early phase focus on quality to build long-term moat.' },
  { id: 'BM08', point: 'Supply Quality Priority', impact: 'Better to have 10 high-rated providers than 100 poor ones.' },
  { id: 'BM09', point: 'Universal Standardization', impact: 'Ontology-based problems remove ambiguity in field ops.' },
  { id: 'BM10', point: 'Price Transparency', impact: 'Locked base pricing as the core customer promise.' },
  { id: 'BM11', point: 'Fraud as Ops Cost', impact: 'Initial fraud losses accepted as part of market penetration.' },
  { id: 'BM12', point: 'Ops + Tech Symbiosis', impact: 'Code solves trust; Field Boys solve execution.' },
  { id: 'BM13', point: 'City Launch Playbooks', impact: 'Standardized expansion blueprints for multi-city scale.' },
  { id: 'BM14', point: 'Dynamic Price Normalization', impact: 'Gradual margin adjustment after establishing market trust.' },
  { id: 'BM15', point: 'Predictable Economics', impact: 'Goal: Profitable unit economics from Month 3 of launch.' }
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
        isEnabled: true // Section 4.8 - Enable/Disable toggle
      });
      globalIdCounter++;
    }
  });

  return problems;
};

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
  }
];

// Fix missing PITCH_SLIDES export
export const PITCH_SLIDES = [
  { id: 1, title: 'Fragmented Market', content: 'The home service market in India is massive but highly fragmented with no standard pricing or quality guarantee.' },
  { id: 2, title: 'Managed Marketplace', content: 'We move beyond a simple discovery platform to a fully managed marketplace that owns the service experience.' },
  { id: 3, title: 'Ontology-based Pricing', content: 'Our unique problem ontology ensures fixed pricing for every service, eliminating stressful bargaining.' },
  { id: 4, title: 'Automated Operations', content: 'Proprietary algorithms handle dispatch, SLA monitoring, and settlement with minimal manual intervention.' },
  { id: 5, title: 'Fraud Prevention', content: 'Our AI risk engine detects multi-accounting and price tampering in real-time to protect platform integrity.' },
  { id: 6, title: 'Provider Success', content: 'Standardized SOPs and predictable payouts ensure high retention and quality from our service partners.' },
  { id: 7, title: 'Scalability', content: 'The node-based architecture allows us to launch in new cities in as little as 14 days.' },
  { id: 8, title: 'Unit Economics', content: 'Healthy platform fees and low customer acquisition costs lead to strong EBITDA margins per city.' },
  { id: 9, title: 'Managed Quality', content: 'Mandatory feedback loops and probation periods for new partners ensure elite service standards.' },
  { id: 10, title: 'SLA Guarantee', content: 'We offer the industry\'s first standardized SLA guarantee with automated penalties for breaches.' },
  { id: 11, title: 'Governance Node', content: 'Real-time auditing of all field activities provides unmatched transparency for stakeholders.' },
  { id: 12, title: 'The Vision', content: 'Becoming India\'s most trusted infrastructure for home services through deep tech and operational excellence.' }
];
