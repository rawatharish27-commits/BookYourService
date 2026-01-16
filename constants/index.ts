
import { Category, Problem, SLATier } from '../types';

export const PLATFORM_FEE = 10;

export const CATEGORIES: Category[] = [
  { id: 'ELECTRICAL', name: 'Electrical', icon: '⚡', isEnabled: true, providerType: 'Electrician' },
  { id: 'PLUMBING', name: 'Plumbing', icon: '🚰', isEnabled: true, providerType: 'Plumber' },
  { id: 'AC', name: 'AC & Cooling', icon: '❄️', isEnabled: true, providerType: 'AC Tech' },
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
      // Updated problem object to include subCategory, providerRole, and severity to match updated Problem interface
      problems.push({
        id: `PROB_${cat.id}_${i}`,
        ontologyId: `ONT_${cat.id}_${i}`,
        category: cat.name,
        subCategory: 'General',
        title: `${cat.name} Problem #${i}`,
        basePrice: 199 + (i * 2),
        maxPrice: 199 + (i * 2) + 500,
        addons: [{ id: 'A1', name: 'Spare Parts', price: 150 }],
        description: `Deep technical node for ${cat.name} fulfillment.`,
        providerRole: cat.providerType || 'Service Expert',
        severity: (i % 5) + 1,
        slaTier: i % 3 === 0 ? SLATier.GOLD : SLATier.SILVER,
        isEnabled: true
      });
    }
  });
  return problems;
};

export const PITCH_SLIDES = [
  { id: 1, title: 'Operational Excellence', content: 'Standardizing the unorganized home service market.' },
  { id: 2, title: 'AI Matching', content: 'Real-time supply-demand stabilization.' },
  { id: 3, title: 'Price Lock', content: 'Immutable system-locked pricing ontology.' }
];
