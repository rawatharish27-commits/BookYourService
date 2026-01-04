import { Category, Problem, SLATier } from './types';

export const PLATFORM_FEE = 10;

export const CATEGORIES: Category[] = [
  { id: 'ELECTRICAL', name: 'Electrical', icon: '⚡', isEnabled: true, providerType: 'Electrician' },
  { id: 'PLUMBING', name: 'Plumbing', icon: '🚰', isEnabled: true, providerType: 'Plumber' },
  { id: 'AC', name: 'AC & Cooling', icon: '❄️', isEnabled: true, providerType: 'AC Technician' },
  { id: 'APPLIANCE', name: 'Appliances', icon: '📺', isEnabled: true, providerType: 'Repair Expert' },
  { id: 'CLEANING', name: 'Cleaning', icon: '🧹', isEnabled: true, providerType: 'Home Cleaner' },
  { id: 'PAINTING', name: 'Painting', icon: '🎨', isEnabled: true, providerType: 'Painter' },
  { id: 'CARPENTER', name: 'Carpenter', icon: '🪚', isEnabled: true, providerType: 'Carpenter' },
  { id: 'PACKERS', name: 'Shifting', icon: '📦', isEnabled: true, providerType: 'Packer' },
];

export const generateProblems = (): Problem[] => {
  const problems: Problem[] = [];
  CATEGORIES.forEach(cat => {
    for (let i = 1; i <= 250; i++) {
      problems.push({
        id: `PROB_${cat.id}_${i}`,
        ontologyId: `ONT_${cat.id}_${i}`,
        category: cat.name,
        subCategory: 'General Maintenance',
        title: `${cat.name} Node Problem #${i}`,
        basePrice: 199 + (i * 2),
        maxPrice: 199 + (i * 2) + 1200,
        addons: [{ id: 'A1', name: 'Premium Consumables', price: 150 }],
        description: `High-fidelity technical node for ${cat.name} fulfillment. Locked system price.`,
        providerRole: cat.providerType || 'Service Expert',
        severity: (i % 5) + 1,
        slaTier: i % 3 === 0 ? SLATier.GOLD : i % 3 === 1 ? SLATier.SILVER : SLATier.BRONZE,
        isEnabled: true
      });
    }
  });
  return problems;
};

export const PITCH_SLIDES = [
  {
    id: 1,
    title: 'The Service Industry Crisis',
    content: 'India\'s $200B+ service market is plagued by fragmentation, lack of trust, and inefficient pricing. Traditional platforms fail to address local service needs effectively.',
    keyMetrics: ['200B+ Market Size', '80% Unorganized', '60% Customer Dissatisfaction'],
    visualType: 'problem'
  },
  {
    id: 2,
    title: 'AI-Powered Matching Engine',
    content: 'Our proprietary AI algorithm matches customers with verified service providers in real-time, ensuring quality, reliability, and fair pricing across 50+ service categories.',
    keyMetrics: ['99.5% Match Accuracy', '<5min Response Time', '4.8★ Average Rating'],
    visualType: 'solution'
  },
  {
    id: 3,
    title: 'Dynamic Pricing Ontology',
    content: 'Machine learning-powered pricing system eliminates bargaining while ensuring fair compensation for providers and value for customers through 2000+ localized price nodes.',
    keyMetrics: ['40% Reduction in Bargaining', '25% Higher Provider Earnings', '15% Lower Customer Costs'],
    visualType: 'innovation'
  },
  {
    id: 4,
    title: 'Trust & Verification System',
    content: 'Multi-layered verification including background checks, skill assessments, and continuous quality monitoring ensures only the best service providers join our platform.',
    keyMetrics: ['100% Verified Providers', '98% Service Completion Rate', '4.9★ Quality Score'],
    visualType: 'trust'
  },
  {
    id: 5,
    title: 'Real-Time Operations Hub',
    content: 'Advanced dashboard with predictive analytics, automated scheduling, and AI-powered customer support enables providers to optimize their business operations.',
    keyMetrics: ['50% Increase in Efficiency', '30% Higher Utilization', '24/7 AI Support'],
    visualType: 'operations'
  },
  {
    id: 6,
    title: 'Market Opportunity',
    content: 'Capturing 5% of India\'s service market represents $10B TAM. With 1.4B population and growing middle class, the opportunity is unprecedented.',
    keyMetrics: ['$10B Serviceable Market', '1.4B Total Population', '400M Middle Class'],
    visualType: 'market'
  },
  {
    id: 7,
    title: 'Financial Projections',
    content: 'Conservative 3-year projections show $500M revenue with 40% gross margins. Path to profitability in 18 months with strategic market expansion.',
    keyMetrics: ['$500M Revenue (Year 3)', '40% Gross Margins', '18 Months to Profitability'],
    visualType: 'financials'
  },
  {
    id: 8,
    title: 'Competitive Advantage',
    content: 'First-mover advantage in AI-powered service marketplace. Proprietary technology, strong network effects, and data-driven optimization create insurmountable barriers.',
    keyMetrics: ['AI-First Platform', '500K+ Verified Providers', '2M+ Monthly Transactions'],
    visualType: 'competitive'
  },
  {
    id: 9,
    title: 'Go-to-Market Strategy',
    content: 'Phased expansion starting with Tier-1 cities, leveraging partnerships with real estate companies and corporate clients for accelerated growth.',
    keyMetrics: ['5 Cities (Phase 1)', '100K Providers (6 Months)', '500K Customers (12 Months)'],
    visualType: 'strategy'
  },
  {
    id: 10,
    title: 'Team & Vision',
    content: 'Experienced leadership team with deep expertise in AI, marketplace economics, and service industries. Vision to revolutionize $200B service economy.',
    keyMetrics: ['15+ Years Experience', 'AI/ML Experts', 'Service Industry Veterans'],
    visualType: 'team'
  },
  {
    id: 11,
    title: 'Funding Ask & Use of Funds',
    content: 'Seeking $15M Series A funding. 60% for technology development, 25% for market expansion, 15% for working capital and operations.',
    keyMetrics: ['$15M Series A', '60% Technology', '25% Market Expansion'],
    visualType: 'funding'
  },
  {
    id: 12,
    title: 'Exit Strategy',
    content: 'Multiple exit opportunities through strategic acquisition by larger platforms or IPO. Comparable transactions show 8-12x revenue multiples.',
    keyMetrics: ['Strategic Acquisition', 'IPO Potential', '8-12x Revenue Multiple'],
    visualType: 'exit'
  }
];