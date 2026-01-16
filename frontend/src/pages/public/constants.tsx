import { Category, PitchSlide, Problem, SLATier, SOPItem } from './types';

export const PLATFORM_FEE: number = 10;
export const VISIT_CHARGE: number = 100;

export const CATEGORIES: Category[] = [
  { id: 'ELECTRICAL', name: 'Electrical', icon: '⚡', providerType: 'Electrician', isEnabled: true },
  { id: 'PLUMBING', name: 'Plumbing', icon: '🚰', providerType: 'Plumber', isEnabled: true },
  { id: 'AC', name: 'AC & Cooling', icon: '❄️', providerType: 'AC Technician', isEnabled: true },
  { id: 'APPLIANCE', name: 'Home Appliances', icon: '📺', providerType: 'Appliance Repair', isEnabled: true },
  { id: 'MOBILE', name: 'Mobile & Laptop', icon: '📱', providerType: 'Technician', isEnabled: true },
  { id: 'NETWORKING', name: 'Internet & Network', icon: '🌐', providerType: 'Network Engineer', isEnabled: true },
  { id: 'SECURITY', name: 'CCTV & Security', icon: '📹', providerType: 'Security Tech', isEnabled: true },
  { id: 'RO_WATER', name: 'RO & Water', icon: '💧', providerType: 'RO Technician', isEnabled: true },
  { id: 'CARPENTER', name: 'Carpenter', icon: '🪚', providerType: 'Carpenter', isEnabled: true },
  { id: 'PAINTING', name: 'Painting & Renovation', icon: '🎨', providerType: 'Painter', isEnabled: true },
  { id: 'CLEANING', name: 'Cleaning', icon: '🧹', providerType: 'House Cleaner', isEnabled: true },
  { id: 'PEST_CONTROL', name: 'Pest Control', icon: '🐜', providerType: 'Pest Expert', isEnabled: true },
  { id: 'MECHANIC', name: 'Vehicle Repair', icon: '🔧', providerType: 'Mechanic', isEnabled: true },
  { id: 'GAS_KITCHEN', name: 'Gas & Kitchen', icon: '🔥', providerType: 'Gas Technician', isEnabled: true },
  { id: 'PACKERS', name: 'Home Shifting', icon: '📦', providerType: 'Packers & Movers', isEnabled: true },
  { id: 'HANDYMAN', name: 'Interior Small Works', icon: '🛠️', providerType: 'Handyman', isEnabled: true },
  { id: 'IOT_SMART', name: 'Smart Devices', icon: '🤖', providerType: 'IoT Technician', isEnabled: true },
  { id: 'SOLAR', name: 'Solar & Power', icon: '☀️', providerType: 'Solar Tech', isEnabled: true },
  { id: 'FURNITURE', name: 'Furniture Assembly', icon: '🛋️', providerType: 'Assembler', isEnabled: true },
  { id: 'EVENTS', name: 'Event Support', icon: '🎉', providerType: 'Event Helper', isEnabled: true },
  { id: 'BEAUTY', name: 'Personal Care @Home', icon: '💅', providerType: 'Beautician', isEnabled: true },
  { id: 'HEALTH', name: 'Health @Home', icon: '🏥', providerType: 'Nurse', isEnabled: true },
  { id: 'DELIVERY', name: 'Delivery Support', icon: '🚲', providerType: 'Pickup Agent', isEnabled: true },
  { id: 'GOVT_FIELD', name: 'Government Form Help', icon: '📄', providerType: 'Field Agent', isEnabled: true },
  { id: 'EMERGENCY', name: 'Misc Emergency', icon: '🚨', providerType: 'Rapid Response', isEnabled: true },
];

const PROBLEM_TEMPLATES = [
  { sub: "Wiring", templates: ["Short Circuit in {sub}", "New Wiring Installation", "Faulty Connection Fix", "Load Balancing"] },
  { sub: "Switchboard", templates: ["Burned Switch replacement", "Socket malfunctioning", "Modular plate install", "Power socket check"] },
  { sub: "Lighting", templates: ["Chandelier hanging", "False ceiling light fix", "External floodlight install", "LED strip sensor setup"] },
  { sub: "MCB/DB", templates: ["Tripping issue", "Busbar sparking", "Main switch replacement", "RCBO installation"] },
  { sub: "Diagnostics", templates: ["Complete health check", "Voltage fluctuation audit", "Earthing measurement", "Commercial load test"] }
];

export const generateProblems = (): Problem[] => {
  const problems: Problem[] = [];
  let globalIdCounter = 1;

  CATEGORIES.forEach(cat => {
    for (let i = 0; i < 80; i++) {
      const templateSet = PROBLEM_TEMPLATES[i % PROBLEM_TEMPLATES.length];
      const template = templateSet.templates[Math.floor(Math.random() * templateSet.templates.length)];
      const title = template.replace("{sub}", templateSet.sub);
      
      const basePrice = 199 + (Math.floor(Math.random() * 40) * 10);
      const maxPrice = basePrice + 1200;

      problems.push({
        id: `PROB_${globalIdCounter.toString().padStart(4, '0')}`,
        ontologyId: `${cat.id.slice(0, 3)}_${i.toString().padStart(3, '0')}`,
        category: cat.name,
        subCategory: templateSet.sub,
        title: `${title} (${i + 1})`,
        basePrice,
        maxPrice,
        addons: [
          { id: `add_${globalIdCounter}_1`, name: "Premium Spare Module", price: 450 },
          { id: `add_${globalIdCounter}_2`, name: "Standard Materials", price: 180 },
          { id: `add_${globalIdCounter}_3`, name: "Testing & Certification", price: 99 }
        ],
        description: `Standardized ${cat.name.toLowerCase()} support for ${templateSet.sub.toLowerCase()} problems. No bargaining - locked system price.`,
        providerRole: cat.providerType || 'Service Agent',
        severity: (i % 5) + 1,
        slaTier: i % 3 === 0 ? SLATier.GOLD : i % 3 === 1 ? SLATier.SILVER : SLATier.BRONZE,
        isEnabled: true
      });
      globalIdCounter++;
    }
  });

  return problems;
};

export const SOP_LIST: SOPItem[] = [
  {
    id: 'SOP_SAFETY',
    title: 'Site Safety Protocol',
    category: 'Safety',
    content: 'Standard safety steps before any physical work begins.',
    steps: [
      'Isolate main power/water supply.',
      'Wear platform-issued high-visibility vest.',
      'Check for gas leaks if working in kitchen nodes.',
      'Verify customer identity node.'
    ]
  },
  {
    id: 'SOP_BILLING',
    title: 'Add-on Lock Procedure',
    category: 'Billing',
    content: 'How to handle material billing on-site.',
    steps: [
      'Select required parts from the system ontology.',
      'Confirm the generated total is within the Max Cap.',
      'Show the digital bill to customer before finalizing.',
      'Ensure platform fee transparency.'
    ]
  }
];

export const PITCH_SLIDES: PitchSlide[] = [
  { id: 1, title: "The Problem", content: "The home service market is highly fragmented, plagued by non-standard pricing, unreliable service quality, and zero accountability nodes." },
  { id: 2, title: "The Solution", content: "BookYourService: A technology-first operational hub providing standardized, high-trust home service fulfillment through a unified system ontology." },
  { id: 3, title: "Service Ontology", content: "Our library of 2,000+ distinct problem nodes, each with system-locked pricing caps, eliminates bargaining and ensures financial transparency." },
  { id: 4, title: "Operational SOPs", content: "Every job is governed by strict safety and diagnostic SOPs, ensuring consistent delivery quality across all regional operational hubs." },
  { id: 5, title: "Partner Ecosystem", content: "Advanced partner verification nodes including identity audit and biometric-backed onboarding ensure a professional and safe supply layer." },
  { id: 6, title: "AI Intelligence", content: "Our proprietary AI engines handle real-time supply-demand matching, predictive demand forecasting, and multi-layered fraud risk analysis." },
  { id: 7, title: "Quality Governance", content: "Automated quality score calculation and mandatory retraining triggers maintain a high-performance supply network with 99%+ SLA compliance." },
  { id: 8, title: "Financial Infrastructure", content: "Instant UPI settlement nodes and automated platform fee reconciliation ensure healthy unit economics and partner retention." },
  { id: 9, title: "Regional Scalability", content: "Standardized city node configurations and local hub management protocols allow for rapid geographical expansion with zero quality dilution." },
  { id: 10, title: "System Integrity", content: "Immutable forensic audit logs and real-time operational monitoring provide complete visibility and governance for Super Admin controllers." },
  { id: 11, title: "Market Opportunity", content: "We are organizing the unorganized segment of a $200B+ market, focusing on high-frequency maintenance and repair tasks." },
  { id: 12, title: "Growth Vision", content: "Scaling from 3 to 50 operational nodes by EOY, integrating IoT for predictive maintenance and automated problem detection." }
];