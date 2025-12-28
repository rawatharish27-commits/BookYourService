import { Category, Problem, SLATier, StateConfig, PSUTypeConfig } from './types';

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
  { id: 'PAINTING', name: 'Painting', icon: '🎨', providerType: 'Painter' },
  { id: 'CLEANING', name: 'Cleaning', icon: '🧹', providerType: 'House Cleaner' },
  { id: 'PEST_CONTROL', name: 'Pest Control', icon: '🐜', providerType: 'Pest Expert' },
  { id: 'MECHANIC', name: 'Vehicle Repair', icon: '🔧', providerType: 'Mechanic' },
  { id: 'GAS_KITCHEN', name: 'Gas & Kitchen', icon: '🔥', providerType: 'Gas Technician' },
  { id: 'PACKERS', name: 'Home Shifting', icon: '📦', providerType: 'Packers & Movers' },
  { id: 'HANDYMAN', name: 'Handyman', icon: '🛠️', providerType: 'Handyman' },
  { id: 'IOT_SMART', name: 'Smart Devices', icon: '🤖', providerType: 'IoT Technician' },
  { id: 'SOLAR', name: 'Solar & Power', icon: '☀️', providerType: 'Solar Tech' },
  { id: 'FURNITURE', name: 'Furniture Assembly', icon: '🛋️', providerType: 'Assembler' },
  { id: 'EVENTS', name: 'Event Support', icon: '🎉', providerType: 'Event Helper' },
  { id: 'BEAUTY', name: 'Personal Care', icon: '💅', providerType: 'Beautician' },
  { id: 'HEALTH', name: 'Health @Home', icon: '🏥', providerType: 'Nurse' },
  { id: 'DELIVERY', name: 'Pickup Agent', icon: '🚲', providerType: 'Pickup Agent' },
  { id: 'GOVT_FIELD', name: 'Field Agent', icon: '📄', providerType: 'Field Agent' },
  { id: 'EMERGENCY', name: 'Rapid Response', icon: '🚨', providerType: 'Emergency Pro' },
];

export const STATE_CONFIGS: StateConfig[] = [
  {
    id: 'UP',
    name: 'Uttar Pradesh',
    slaModifiers: { [SLATier.GOLD]: 360, [SLATier.SILVER]: 720, [SLATier.BRONZE]: 1440 },
    pricingCaps: { 'Electrical': 500, 'Plumbing': 400 },
    language: 'Hindi',
    complianceLevel: 'STRICT'
  },
  {
    id: 'MH',
    name: 'Maharashtra',
    slaModifiers: { [SLATier.GOLD]: 240, [SLATier.SILVER]: 480, [SLATier.BRONZE]: 1000 },
    pricingCaps: { 'Electrical': 700, 'Plumbing': 600 },
    language: 'Marathi',
    complianceLevel: 'SOVEREIGN'
  },
  {
    id: 'GJ',
    name: 'Gujarat',
    slaModifiers: { [SLATier.GOLD]: 180, [SLATier.SILVER]: 360, [SLATier.BRONZE]: 720 },
    pricingCaps: { 'Electrical': 450, 'Plumbing': 350 },
    language: 'Gujarati',
    complianceLevel: 'STANDARD'
  }
];

export const TENDER_SAMPLES = {
  UP: {
    title: "UP DISCOM - Complaint Management & Workforce Automation",
    objectives: ["Resolution Time Reduction", "Grid Reliability", "Audit Readiness"],
    sla: { "Power Outage": "≤ 6h", "Transformer Fault": "≤ 6h", "Meter Issue": "≤ 24h" },
    focus: "Night crew mandatory, data residency within state."
  },
  MH: {
    title: "MAHAVITARAN - Union-Compliant Digital Ops",
    objectives: ["Union Compliance", "Night Shift Safety", "Marathi Language UI"],
    sla: { "Transformer": "≤ 4h", "Line Fault": "≤ 4h" },
    focus: "ISO 27001 alignment, strict vendor exit clause."
  },
  GJ: {
    title: "GUVNL - Predictive Infrastructure Pilot",
    objectives: ["Smart Meter Integration", "Preventive Maintenance", "Tech-first ROI"],
    sla: { "Transformer": "≤ 3h" },
    focus: "AI-assisted maintenance, high-velocity SLAs."
  }
};

export const ANNEXURE_D = [
  { id: '1', title: 'Applicability of State Laws', content: 'Contract governed by State Government Acts, Rules, and Notifications issued from time to time.' },
  { id: '2', title: 'Jurisdiction Clause', content: 'Courts within the State capital district shall have exclusive jurisdiction for all legal proceedings.' },
  { id: '3', title: 'SGST Compliance', content: 'Vendor must possess valid State GST registration. All tax structure changes borne per Govt norms.' },
  { id: '4', title: 'Sovereign Data Ownership', content: 'All logs, AI outputs, and analytics are exclusive property of State Govt. No off-shore transfer.' },
  { id: '5', title: 'Cyber Security Mandate', content: 'Aligned with State Cyber Policy, CERT-In, and DPDP Act 2023. MeitY-empanelled hosting only.' },
  { id: '6', title: 'Law Enforcement Confidentiality', content: 'Classified access protocols. NDA survives post-termination. Zero unauthorized subcontracting.' },
  { id: '7', title: 'Language & Training', content: 'UI and training manuals mandated in State Official Language. Mandatory on-site workshops.' },
  { id: '8', title: 'Force Majeure (State)', includes: 'State-declared emergencies, law & order situations, notified natural calamities.' },
  { id: '9', title: 'Termination & Blacklisting', content: 'Right to terminate without reasons. Breach leads to across-department blacklisting.' },
  { id: '10', title: 'Affidavit Undertaking', content: 'Vendor shall submit sworn Affidavit/Undertaking for absolute compliance with these clauses.' }
];

export const AI_MODEL_CARD = {
  name: 'Service Resilience & Forensic Node v1.0',
  type: 'Hybrid ML System (Rule-based + XGBoost + LSTM)',
  intendedUse: 'Forensics, Fraud Detection, Predictive Infrastructure Maintenance',
  inputs: ['CDR', 'IP Logs', 'Device Metadata', 'Transaction Records', 'Evidence Files'],
  explainability: 'SHAP-based feature importance provided for every output. No black-box decisions.',
  governance: 'AI-Driven suggestions; human-decided execution. Continuous bias auditing.',
  security: 'AES-256 at rest, TLS 1.3 in transit. RBAC and Immutable Logs.'
};

export const ROI_METRICS = [
  { parameter: 'Operational Savings', before: 'Manual/Fragmented', after: 'AI-Enforced', annualSaving: '₹14.2Cr' },
  { parameter: 'Leakage Prevention', before: '15% Audit Drift', after: '<0.5% Drift', annualSaving: '₹28.5Cr' },
  { parameter: 'Efficiency Gains', before: '24h Resolution', after: '4h-6h Resolution', annualSaving: 'Intangible/High' }
];

export const BOQ_DATA = [
  { id: 1, item: 'AI Service Platform (On-Prem)', qty: 1, unit: 'Lot', remarks: 'Perpetual Sovereign License' },
  { id: 2, item: 'Investigation Workstations', qty: 24, unit: 'Nos', remarks: 'High-spec Forensic PCs' },
  { id: 3, item: 'AI Processing Server', qty: 4, unit: 'Nos', remarks: 'Dual GPU enabled' },
  { id: 4, item: 'Secure Encrypted Storage', qty: 100, unit: 'TB', remarks: 'NAS/SAN Encrypted' },
  { id: 5, item: 'Network Security Suite', qty: 1, unit: 'Lot', remarks: 'Firewall + IDS/IPS' },
  { id: 6, item: 'Field Agent Licenses', qty: 2000, unit: 'Nos', remarks: 'Standard Enterprise Tier' },
  { id: 7, item: 'Training & Certification', qty: 1, unit: 'Lot', remarks: 'On-site State Capacity Building' },
  { id: 8, item: 'AMC (3 Years)', qty: 1, unit: 'Lot', remarks: 'Post-Warranty 24x7 SLA' },
  { id: 9, item: 'Installation & Commissioning', qty: 1, unit: 'Lot', remarks: 'Turnkey Handover' },
  { id: 10, item: 'Documentation & SOPs', qty: 1, unit: 'Lot', remarks: 'Regulatory/Audit compliant' }
];

export const AI_PRODUCTION_STAGES = [
  { id: 'P0', title: 'Data Readiness', timeline: '0-2 Mo', tasks: ['Historical Cleanup', 'Asset Normalization', 'Weather Tagging'] },
  { id: 'P1', title: 'Offline Models', timeline: '3-4 Mo', tasks: ['XGBoost Training', 'SLA Back-testing', 'SHAP Explainability'] },
  { id: 'P2', title: 'Shadow Mode', timeline: '5-6 Mo', tasks: ['Live Predictions', 'Officer Feedback Loop', 'False Positive Analysis'] },
  { id: 'P3', title: 'Human-in-Loop', timeline: '7-9 Mo', tasks: ['Manual Approvals', 'Threshold Alerts', 'Audit Trails'] },
  { id: 'P4', title: 'Limited Auto', timeline: 'Post-Approval', tasks: ['Low-risk Preventive', 'Draft Auto-creation', 'Bias Monitoring'] }
];

export const NATIONAL_BUDGET = [
  { head: 'Platform Dev', y1: 3.0, y2: 2.0, y3: 1.5 },
  { head: 'Cloud & Infra', y1: 1.5, y2: 2.5, y3: 4.0 },
  { head: 'Ops & Training', y1: 1.0, y2: 2.0, y3: 3.0 },
  { head: 'Security & Audit', y1: 0.5, y2: 1.0, y3: 1.5 },
  { head: 'AI & Analytics', y1: 0.5, y2: 1.5, y3: 2.5 }
];

export const CABINET_SLIDES = [
  { title: 'The Problem', points: ['Fragmented complaint ecosystem', 'Systemic SLA breaches', 'Lack of decision transparency', 'Heavy audit and leakage risk'] },
  { title: 'The Solution: DoorStep Pro', points: ['Unified Digital Sovereign Platform', 'SLA-based automated enforcement', 'Real-time Command & Control', 'Immutable Audit Trails'] },
  { title: 'Citizen & Nodal Impact', points: ['Guaranteed resolution velocity', 'Single source of truth for citizens', 'Officer safety via logged decisions', 'Reduced audit objections'] },
  { title: 'Governance & AI', points: ['AI suggests; Officers decide', 'Predictive infrastructure maintenance', 'Explainable risk scoring', 'Bias-free resource allocation'] },
  { title: 'National Rollout Budget', points: ['Year 1: ₹6.5 Cr (Foundation)', 'Year 2: ₹9.0 Cr (Expansion)', 'Year 3: ₹12.5 Cr (National)'] },
  { title: 'Risk & Mitigation', points: ['On-prem sovereign hosting', 'Manual kill-switch for automation', 'Independent security audits', 'Zero vendor lock-in'] },
  { title: 'The Ask', points: ['Approval for City-level Pilot', 'Nominate Nodal Monitoring Officer', 'Budgetary sanction for Phase 1', '90-day progress review mandate'] }
];

export const NEGOTIATION_PLAYBOOK = {
  mindset: "Pitch like infrastructure partner, not a startup.",
  powerPhrases: [
    "Reduces audit objections",
    "Officers safe, not exposed",
    "No vendor lock-in",
    "ISO/Regulatory compliance"
  ],
  strategies: [
    { step: "Pilot First", text: "Prove value in one circle/zone before scaling." },
    { step: "Officer Safety", text: "Every decision is logged, immutable, and auditable." },
    { step: "Neutrality", text: "System treats all wards and feeders equally." }
  ]
};

export const PSU_TYPES: PSUTypeConfig[] = [
  { id: 'DISCOM', name: 'Electricity DISCOM', focus: 'UTILITY', customMetrics: ['Grid Stability', 'Transformer Health'] },
  { id: 'JAL_NIGAM', name: 'Water (Jal Nigam)', focus: 'MUNICIPAL', customMetrics: ['Purity Index', 'Leakage %'] },
  { id: 'MUN_CORP', name: 'Municipal Corp', focus: 'MUNICIPAL', customMetrics: ['Waste Density', 'Street Light Uptime'] }
];

export const SUB_CATEGORIES = ['INSTALLATION', 'REPAIR', 'MAINTENANCE', 'REPLACEMENT'];

export const PROBLEM_TEMPLATES = [
  { title: "Device not working", severity: 7, tier: SLATier.SILVER, bom: ['Standard Tool Kit'] },
  { title: "Intermittent operation", severity: 4, tier: SLATier.BRONZE, bom: ['Diagnostic Kit'] },
  { title: "Installation required", severity: 3, tier: SLATier.BRONZE, bom: ['Drill', 'Mounts'] },
  { title: "Strange noise/smell", severity: 8, tier: SLATier.GOLD, bom: ['Gas Sensor', 'Multimeter'] },
  { title: "Performance issues", severity: 3, tier: SLATier.BRONZE, bom: ['Standard Kit'] },
  { title: "Power/Charging issue", severity: 6, tier: SLATier.SILVER, bom: ['Power Probe'] },
  { title: "Water leakage", severity: 9, tier: SLATier.GOLD, bom: ['Leak Sealant', 'Pipe Wrench'] },
  { title: "Physical damage", severity: 5, tier: SLATier.SILVER, bom: ['Replacement Housing'] },
  { title: "Routine servicing", severity: 2, tier: SLATier.BRONZE, bom: ['Cleaning Kit'] },
  { title: "Complete replacement", severity: 4, tier: SLATier.SILVER, bom: ['New Unit'] },
  { title: "Overheating problem", severity: 8, tier: SLATier.GOLD, bom: ['Thermal Paste', 'Fan'] },
  { title: "Connectivity issue", severity: 5, tier: SLATier.SILVER, bom: ['Network Tester'] },
  { title: "Unresponsive system", severity: 6, tier: SLATier.SILVER, bom: ['Reset Tool'] },
  { title: "Auto-shutdown", severity: 7, tier: SLATier.SILVER, bom: ['Volt Tester'] },
  { title: "Error indicators", severity: 5, tier: SLATier.SILVER, bom: ['Manual Override'] },
  { title: "Upgrade requested", severity: 2, tier: SLATier.BRONZE, bom: ['Modular Upgrade Parts'] },
  { title: "Safety concern", severity: 10, tier: SLATier.GOLD, bom: ['Hazmat Kit', 'First Aid'] },
  { title: "Improper fitting", severity: 5, tier: SLATier.SILVER, bom: ['Precision Level'] },
  { title: "Loose wiring/parts", severity: 8, tier: SLATier.GOLD, bom: ['Crimping Tool'] },
  { title: "Inspection only", severity: 1, tier: SLATier.BRONZE, bom: ['Inspection Camera'] }
];

export const generateProblems = (): Problem[] => {
  const problems: Problem[] = [];
  let idCounter = 1;

  CATEGORIES.forEach(cat => {
    SUB_CATEGORIES.forEach(sub => {
      PROBLEM_TEMPLATES.forEach((tpl, i) => {
        problems.push({
          id: `PROB_${idCounter.toString().padStart(4, '0')}`,
          ontologyId: `ONT_${cat.id.slice(0, 3)}_${sub.slice(0, 3)}_${idCounter.toString().padStart(3, '0')}`,
          category: cat.name,
          subCategory: sub,
          title: `${tpl.title} (${cat.name})`,
          basePrice: 150 + (i * 15),
          maxPrice: 600 + (i * 30),
          providerRole: cat.providerType,
          severity: tpl.severity,
          slaTier: tpl.tier,
          description: `Enterprise-grade ${sub.toLowerCase()} for ${cat.name.toLowerCase()} - ${tpl.title.toLowerCase()}. Optimized for ${tpl.tier} SLA compliance.`,
          addons: [
            { id: `add_${idCounter}_1`, name: 'Extended Warranty', price: 199 },
            { id: `add_${idCounter}_2`, name: 'Priority Visit', price: 99 }
          ],
          equipmentBOM: tpl.bom
        });
        idCounter++;
      });
    });
  });

  return problems;
};

export const PLATFORM_FEE = 10;
export const VISIT_CHARGE = 99;

export const EXECUTION_ROADMAP = {
  phases: [
    {
      id: "PHASE_1",
      title: "Foundation",
      timeline: "Month 0-6",
      goal: "One city, zero chaos",
      items: ["Tier-0 Priorities Fully Implemented", "1-2 Core Categories", "100-300 Providers", "COD Only"]
    },
    {
      id: "PHASE_2",
      title: "Market Fit",
      timeline: "Month 6-12",
      goal: "Prove repeatability",
      items: ["5-7 Service Categories", "Insurance Opt-in", "Rule-based AI Dispatch", "City Command Center"]
    },
    {
      id: "PHASE_3",
      title: "Scale",
      timeline: "Month 12-24",
      goal: "Default city OS",
      items: ["5-10 Cities", "Predictive Maintenance", "EMI Bundles", "PSU Paid Contracts"]
    },
    {
      id: "PHASE_4",
      title: "National",
      timeline: "Month 24-36",
      goal: "Infra-company status",
      items: ["National Command Center", "Multi-state Rules", "ML Models", "Smart City Integration"]
    }
  ],
  antiFeatures: [
    "In-app chat without moderation",
    "Free-text pricing by provider",
    "Too many categories too early",
    "Social feeds / comments",
    "Discounts wars",
    "Crypto / token nonsense"
  ],
  killStrategies: [
    {
      scenario: "Provider Collusion",
      risk: "Cash bypass, fake jobs",
      strategy: "Random audits, Wallet freeze, National blacklist"
    },
    {
      scenario: "SLA Collapse",
      risk: "Govt contract loss",
      strategy: "Auto-escalation, Backup provider pools, Penalty automation"
    }
  ]
};

export const ORG_CHART = [
  { role: 'CEO / Founder', level: 1, department: 'Leadership', status: 'FILLED' },
  { role: 'CTO', level: 1, department: 'Tech', status: 'FILLED' },
  { role: 'Head of Govt Programs', level: 2, department: 'Govt', status: 'OPEN' },
  { role: 'Data / AI Lead', level: 2, department: 'Intelligence', status: 'OPEN' },
  { role: 'City Manager (Noida)', level: 3, department: 'Operations', status: 'FILLED' },
  { role: 'Compliance Officer', level: 2, department: 'Legal', status: 'FILLED' }
];

export const theme = {
  colors: {
    primary: "#0A2540",
    accent: "#00D4FF",
    success: "#16A34A",
    danger: "#DC2626",
    background: "#F8FAFC"
  },
  radius: {
    card: "1.5rem",
    button: "1rem"
  }
};