
// Fixed: Using default import for db service
import db from './DatabaseService';

interface LaunchConfig {
  rolloutPercentage: number;
  betaTesters: string[]; // Device IDs
  featureFlags: Record<string, boolean>;
  isMaintenanceMode: boolean;
}

class ReleaseManagementService {
  private config: LaunchConfig = {
    rolloutPercentage: 10, // Default 10% rollout
    betaTesters: ['DEV_TEST_001', 'DEV_BETA_NODE'],
    featureFlags: {
      'AI_DIAGNOSTICS': true,
      'INSTANT_PAYOUT': false,
      'REGIONAL_CLUSTERING': true,
      'DARK_MODE_BETA': false
    },
    isMaintenanceMode: false
  };

  constructor() {
    this.load();
  }

  private load() {
    const saved = localStorage.getItem('DP_LAUNCH_CONFIG');
    if (saved) this.config = JSON.parse(saved);
  }

  private save() {
    localStorage.setItem('DP_LAUNCH_CONFIG', JSON.stringify(this.config));
    db.audit('ADMIN_ROOT', 'LAUNCH_CONFIG_UPDATED', 'ReleaseManager', this.config, 'INFO');
  }

  isFeatureEnabled(flag: string): boolean {
    return !!this.config.featureFlags[flag];
  }

  isUserAllowed(deviceId: string): boolean {
    if (this.config.isMaintenanceMode) return false;
    if (this.config.rolloutPercentage >= 100) return true;
    if (this.config.betaTesters.includes(deviceId)) return true;

    // Deterministic hash-based rollout
    const hash = Array.from(deviceId).reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const bucket = Math.abs(hash) % 100;
    return bucket < this.config.rolloutPercentage;
  }

  updateConfig(updates: Partial<LaunchConfig>) {
    this.config = { ...this.config, ...updates };
    this.save();
  }

  toggleFlag(flag: string) {
    this.config.featureFlags[flag] = !this.config.featureFlags[flag];
    this.save();
  }

  getConfig() {
    return this.config;
  }
}

export const releaseManager = new ReleaseManagementService();
