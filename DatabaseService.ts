
import { UserEntity, ServiceRequestEntity, AuditLogEntity, UserRole, BookingStatus, SLATier, InfraMetric, SystemAlert, RiskLevel, VerificationStatus, KYCData, FraudSignal, KycDocument, BankAccount, VerificationLog, VendorWebhook, WebhookStatus, TrustSafetyKPI, InfraCostBreakdown, RevenueForecast } from './types';
import { fraudEngine } from './FraudDetectionEngine';
import { ai } from './AIIntelligenceService';
import { generateProblems, REGIONS } from './constants';

class DatabaseService {
  private readonly STORAGE_KEY = 'DOORSTEP_PRO_V7_DB';

  private db: {
    users: UserEntity[];
    requests: ServiceRequestEntity[];
    auditLogs: AuditLogEntity[];
    systemAlerts: SystemAlert[];
    fraudSignals: FraudSignal[];
    kycDocuments: KycDocument[];
    bankAccounts: BankAccount[];
    verificationLogs: VerificationLog[];
    webhooks: VendorWebhook[];
    platform_wallet: number;
    provider_wallets: Record<string, number>;
  } = {
    users: [],
    requests: [],
    auditLogs: [],
    systemAlerts: [],
    fraudSignals: [],
    kycDocuments: [],
    bankAccounts: [],
    verificationLogs: [],
    webhooks: [],
    platform_wallet: 0,
    provider_wallets: {}
  };

  constructor() {
    this.load();
    this.seedAlerts();
  }

  private load() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) { this.db = JSON.parse(data); }
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.db));
  }

  private seedAlerts() {
    if (this.db.systemAlerts.length === 0) {
      this.createAlert('SLA_BREACH', 'Job #REQ_992 exceeds Gold SLA.', RiskLevel.CRITICAL);
    }
  }

  async processWebhook(vendor: VendorWebhook['vendor'], payload: any) {
    const externalRefId = payload.reference_id || `REF_${Date.now()}`;
    if (this.db.webhooks.find(w => w.externalRefId === externalRefId && w.status === WebhookStatus.SUCCESS)) { return { status: 'ALREADY_PROCESSED' }; }
    const webhook: VendorWebhook = { id: `WH_${Date.now()}`, vendor, eventType: payload.event || 'GENERIC_CALLBACK', externalRefId, payload, status: WebhookStatus.RECEIVED, retryCount: 0, createdAt: new Date().toISOString() };
    this.db.webhooks.unshift(webhook);
    try {
      webhook.status = WebhookStatus.PROCESSING;
      if (vendor === 'IDFY' && payload.result === 'SUCCESS') await this.verifyProvider(payload.provider_id, VerificationStatus.ID_VERIFIED, "OCR Confirmed");
      webhook.status = WebhookStatus.SUCCESS;
      webhook.processedAt = new Date().toISOString();
    } catch (e) { webhook.status = WebhookStatus.FAILED; webhook.retryCount++; }
    this.save();
    return { status: webhook.status };
  }

  async runIntelligenceSync(providerId: string) {
    const provider = this.db.users.find(u => u.id === providerId);
    if (!provider) return;

    const problems = generateProblems();
    const enrichedBookings = this.db.requests.map(r => {
      const p = problems.find(prob => prob.id === r.service_id) || problems[0];
      return { ...r, ontologyId: p.ontologyId } as any;
    });

    const newSignals = fraudEngine.analyze(provider, this.db.users, enrichedBookings, problems);
    const mlFraudScore = fraudEngine.calculateMLFraudScore(providerId, this.db.users, enrichedBookings);
    newSignals.forEach(sig => {
      if (!this.db.fraudSignals.find(s => s.providerId === sig.providerId && s.type === sig.type)) {
        sig.mlScore = mlFraudScore.score;
        this.db.fraudSignals.unshift(sig);
      }
    });

    provider.rank = ai.calculateProviderRank(providerId, enrichedBookings, mlFraudScore.score);
    const action = fraudEngine.getAutomatedAction(this.db.fraudSignals.filter(s => s.providerId === providerId));
    if (action === 'BAN' || action === 'SUSPEND') provider.status = action === 'BAN' ? 'BANNED' : 'SUSPENDED';
    
    this.save();
  }

  async createAlert(type: SystemAlert['type'], message: string, severity: RiskLevel) {
    const alert: SystemAlert = { id: `ALT_${Date.now()}`, timestamp: new Date().toISOString(), type, message, severity, resolved: false };
    this.db.systemAlerts.unshift(alert);
    this.save();
    return alert;
  }

  async resolveAlert(id: string) {
    const idx = this.db.systemAlerts.findIndex(a => a.id === id);
    if (idx !== -1) { this.db.systemAlerts[idx].resolved = true; this.save(); }
  }

  async audit(user_id: string, action: string, entity: string, metadata: any = {}, severity: AuditLogEntity['severity'] = 'INFO') {
    const log: AuditLogEntity = { id: `LOG_${Date.now()}`, user_id, action, entity, timestamp: new Date().toISOString(), ip_address: '127.0.0.1', metadata: JSON.stringify(metadata), severity };
    this.db.auditLogs.unshift(log);
    this.save();
  }

  async createUser(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser: UserEntity = { id: `U_${Date.now()}`, name: user.name || 'Anonymous', email: user.email || '', phone: user.phone || '', role_id: user.role_id || UserRole.USER, state_code: user.state_code || 'UP', is_active: true, wallet_balance: 0, trust_score: 100, created_at: new Date().toISOString(), status: 'ACTIVE', verification_status: user.verification_status || VerificationStatus.UNVERIFIED, kyc_data: user.kyc_data || {}, deviceId: `DEV_${Math.random().toString(36).substr(2, 9)}`, region_id: 'IN' };
    this.db.users.push(newUser);
    if (newUser.role_id === UserRole.PROVIDER) this.db.provider_wallets[newUser.id] = 0;
    this.save();
    return newUser;
  }

  async verifyOTP(userId: string): Promise<void> {
    const index = this.db.users.findIndex(u => u.id === userId);
    if (index !== -1) { this.db.users[index].verification_status = VerificationStatus.OTP_VERIFIED; this.save(); }
  }

  async updateUser(id: string, updates: Partial<UserEntity>): Promise<void> {
    const index = this.db.users.findIndex(u => u.id === id);
    if (index !== -1) { this.db.users[index] = { ...this.db.users[index], ...updates }; this.save(); }
  }

  async submitKYC(userId: string, data: KYCData): Promise<void> {
    const index = this.db.users.findIndex(u => u.id === userId);
    if (index !== -1) { this.db.users[index].kyc_data = { ...this.db.users[index].kyc_data, ...data, submittedAt: new Date().toISOString() }; this.db.users[index].verification_status = VerificationStatus.PENDING_ID; this.save(); }
  }

  async verifyBankUPI(userId: string, data: { bankAccount?: string, upiId?: string }): Promise<void> {
    const index = this.db.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const user = this.db.users[index];
      if (user.kyc_data) { user.kyc_data.bankAccount = data.bankAccount; user.kyc_data.upiId = data.upiId; }
      user.verification_status = VerificationStatus.BANK_VERIFIED;
      this.save();
      await this.runIntelligenceSync(userId);
    }
  }

  async verifyProvider(userId: string, status: VerificationStatus, notes: string): Promise<void> {
    const index = this.db.users.findIndex(u => u.id === userId);
    if (index !== -1) { this.db.users[index].verification_status = status; this.save(); }
  }

  async createRequest(req: Partial<ServiceRequestEntity>): Promise<ServiceRequestEntity> {
    const newReq: ServiceRequestEntity = { id: `REQ_${Date.now()}`, user_id: req.user_id || 'SYSTEM', service_id: req.service_id || 'UNK', status: BookingStatus.CREATED, priority: req.priority || 'MEDIUM', state_code: req.state_code || 'UP', ward_id: req.ward_id || 'WARD_01', created_at: new Date().toISOString(), total_amount: req.total_amount || 0, escalation_level: 0, payment_method: req.payment_method, payment_status: req.payment_status, region_id: 'IN' };
    this.db.requests.unshift(newReq);
    this.save();
    return newReq;
  }

  async updateRequest(id: string, updates: Partial<ServiceRequestEntity>): Promise<void> {
    const index = this.db.requests.findIndex(r => r.id === id);
    if (index !== -1) {
      const oldStatus = this.db.requests[index].status;
      this.db.requests[index] = { ...this.db.requests[index], ...updates };
      if (updates.status === BookingStatus.COMPLETED && oldStatus !== BookingStatus.COMPLETED) {
        const req = this.db.requests[index];
        if (req.provider_id) {
          this.db.platform_wallet += 10;
          this.db.provider_wallets[req.provider_id] = (this.db.provider_wallets[req.provider_id] || 0) + ((req.total_amount || 0) - 10);
          await this.runIntelligenceSync(req.provider_id);
        }
      }
      this.save();
    }
  }

  async getLogs() { return this.db.auditLogs.slice(0, 100); }
  async getAlerts() { return this.db.systemAlerts; }
  async getFraudSignals() { return this.db.fraudSignals; }
  async getUsers() { return this.db.users; }
  async getWebhooks() { return this.db.webhooks; }

  getTrustSafetyKPIs(): TrustSafetyKPI {
    const highRiskCount = this.db.fraudSignals.filter(s => s.severity >= 4).length;
    return { activeRiskProviders: highRiskCount, suspendedToday: this.db.users.filter(u => u.status === 'SUSPENDED').length, fraudSignalsDay: this.db.fraudSignals.length, kycSuccessRate: 94, avgVerificationTime: "12m", vendorFailureRate: 2.1, systemTrustScore: 96, complaintsPer100: 0.8 };
  }

  getInfraCosts(): InfraCostBreakdown {
    const bookingCount = Math.max(1, this.db.requests.length);
    const compute = 1200 + (bookingCount * 0.8);
    const db = 800 + (bookingCount * 0.6);
    const otp = bookingCount * 0.4;
    const maps = bookingCount * 0.5;
    const logging = 300 + (bookingCount * 0.2);
    const total = compute + db + otp + maps + logging;
    return { compute, database: db, otp, maps, logging, total, perBooking: parseFloat((total / bookingCount).toFixed(2)) };
  }

  getRevenueForecast(): RevenueForecast[] {
    const months = ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09'];
    let baselineBookings = this.db.requests.length || 150;
    return months.map((m, i) => {
      const predictedBookings = Math.round(baselineBookings * Math.pow(1.2, i + 1));
      const predictedRevenue = predictedBookings * 10;
      return { month: m, predictedBookings, predictedRevenue, confidence: 94 - (i * 2), growthRate: 20 };
    });
  }

  getInfraMetrics(): InfraMetric[] {
    const costs = this.getInfraCosts();
    return [
      { label: 'Infra Cost/Booking', value: costs.perBooking, unit: '₹', trend: 'down', status: costs.perBooking < 4 ? 'HEALTHY' : 'WARNING' },
      { label: 'Forecasted MRR', value: this.getRevenueForecast()[0].predictedRevenue, unit: '₹', trend: 'up', status: 'HEALTHY' },
      { label: 'Active Regions', value: REGIONS.filter(r => r.status === 'ACTIVE').length, unit: '', trend: 'stable', status: 'HEALTHY' },
      { label: 'Safety Index', value: 96, unit: '', trend: 'up', status: 'HEALTHY' },
    ];
  }
}

export const db = new DatabaseService();
