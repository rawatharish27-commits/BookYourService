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
  { id: 1, title: 'Fragmented Market', content: 'Standardizing the unorganized home service market through technology.' },
  { id: 2, title: 'AI Matching', content: 'Real-time supply-demand stabilization engine.' },
  { id: 3, title: 'Price Ontology', content: '2,000+ system-locked pricing nodes to eliminate bargaining.' }
];