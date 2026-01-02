import { db } from './DatabaseService';
import { User, UserRole, UserStatus, VerificationStatus } from '../types';

class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
  private readonly DEFAULT_ADMIN_PASSWORD = 'admin123'; // Default password for admins

  // Admin login with email and password
  async adminLogin(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.role === UserRole.ADMIN);

    if (!user) return null;

    // Check default password
    if (password !== this.DEFAULT_ADMIN_PASSWORD) return null;

    return this.issueTokens(user);
  }

  // Customer signup
  async customerSignup(data: { name: string; email: string; phone: string; password: string }): Promise<{ success: boolean; message: string; user?: User }> {
    const users = db.getUsers();
    if (users.find(u => u.email === data.email || u.phone === data.phone)) {
      return { success: false, message: 'Email or phone already exists' };
    }

    const user: User = {
      id: `U_${Date.now()}`,
      phone: data.phone,
      email: data.email,
      password: data.password, // Plain text for demo
      name: data.name,
      role: UserRole.USER,
      status: UserStatus.PENDING,
      verificationStatus: VerificationStatus.REGISTERED,
      city: 'MUMBAI',
      walletBalance: 0,
      fraudScore: 0,
      abuseScore: 0,
      qualityScore: 0,
      isProbation: false,
      jobCount: 0,
      createdAt: new Date().toISOString(),
    };

    await db.upsertUser(user);
    return { success: true, message: 'Account created. Please verify your email and phone.', user };
  }

  // Customer verification
  async verifyCustomer(userId: string, emailOtp: string, phoneOtp: string): Promise<{ success: boolean; message: string }> {
    const users = db.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user || user.role !== UserRole.USER) return { success: false, message: 'User not found' };

    // For demo, static OTP
    if (emailOtp !== '1234' || phoneOtp !== '1234') return { success: false, message: 'Invalid OTP' };

    user.status = UserStatus.VERIFIED;
    user.verificationStatus = VerificationStatus.ACTIVE;
    await db.upsertUser(user);
    return { success: true, message: 'Verification successful' };
  }

  // Customer login
  async customerLogin(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.role === UserRole.USER);

    if (!user || !user.password) return null;

    if (user.password !== password) return null;

    if (user.status !== UserStatus.VERIFIED) return null;

    return this.issueTokens(user);
  }

  // Provider signup
  async providerSignup(data: { name: string; email: string; phone: string; password: string; businessName: string; address: string; category: string }): Promise<{ success: boolean; message: string; user?: User }> {
    const users = db.getUsers();
    if (users.find(u => u.email === data.email || u.phone === data.phone)) {
      return { success: false, message: 'Email or phone already exists' };
    }

    const user: User = {
      id: `P_${Date.now()}`,
      phone: data.phone,
      email: data.email,
      password: data.password, // Plain text for demo
      name: data.name,
      role: UserRole.PROVIDER,
      status: UserStatus.UNDER_REVIEW,
      verificationStatus: VerificationStatus.KYC_PENDING,
      city: 'MUMBAI',
      walletBalance: 0,
      fraudScore: 0,
      abuseScore: 0,
      qualityScore: 80,
      isProbation: true,
      jobCount: 0,
      createdAt: new Date().toISOString(),
      kycDetails: {
        documentsUploaded: false, // Will be updated after upload
      },
    };

    await db.upsertUser(user);
    return { success: true, message: 'Account created. Please upload documents for verification.', user };
  }

  // Provider document upload
  async uploadProviderDocuments(userId: string, documents: any): Promise<{ success: boolean; message: string }> {
    const users = db.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user || user.role !== UserRole.PROVIDER) return { success: false, message: 'User not found' };

    // Simulate document upload
    user.kycDetails!.documentsUploaded = true;
    user.verificationStatus = VerificationStatus.ADMIN_APPROVED; // For demo, auto-approve
    await db.upsertUser(user);
    return { success: true, message: 'Documents uploaded. Awaiting admin approval.' };
  }

  // Admin approve provider
  async approveProvider(userId: string): Promise<{ success: boolean; message: string }> {
    const users = db.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user || user.role !== UserRole.PROVIDER) return { success: false, message: 'User not found' };

    user.status = UserStatus.APPROVED;
    user.verificationStatus = VerificationStatus.ACTIVE;
    user.isProbation = false;
    await db.upsertUser(user);
    return { success: true, message: 'Provider approved' };
  }

  // Provider login
  async providerLogin(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.role === UserRole.PROVIDER);

    if (!user || !user.password) return null;

    if (user.password !== password) return null;

    if (user.status !== UserStatus.APPROVED) return null;

    return this.issueTokens(user);
  }

  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    // For demo purposes, log the OTP to console
    console.log(`[DEMO] OTP for ${phone}: 1234`);
    return { success: true, message: "OTP sent to your mobile number." };
  }

  async verifyOtp(phone: string, otp: string, role: UserRole): Promise<{ user: User; token: string } | null> {
    if (otp !== '1234') return null; // Static OTP for enterprise demo node
    
    const users = db.getUsers();
    let user = users.find(u => u.phone === phone && u.role === role);

    if (!user) {
      if (role === UserRole.ADMIN) return null; // Admin must be provisioned
      user = {
        id: `U_${Date.now()}`,
        phone,
        name: `${role === UserRole.PROVIDER ? 'Partner' : 'Client'}_${phone.slice(-4)}`,
        role,
        status: role === UserRole.PROVIDER ? UserStatus.PROBATION : UserStatus.ACTIVE,
        verificationStatus: role === UserRole.PROVIDER ? VerificationStatus.REGISTERED : VerificationStatus.ACTIVE,
        city: 'MUMBAI',
        walletBalance: 0,
        fraudScore: 0,
        abuseScore: 0,
        qualityScore: role === UserRole.PROVIDER ? 80 : 0,
        isProbation: role === UserRole.PROVIDER,
        jobCount: 0,
        createdAt: new Date().toISOString(),
      };
      await db.upsertUser(user);
    }

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const expiresAt = Date.now() + this.ACCESS_TOKEN_EXPIRY;
    const token = `JWT_${btoa(user.id + ':' + expiresAt)}`;
    
    user.lastLogin = new Date().toISOString();
    await db.upsertUser(user);
    
    localStorage.setItem('DP_TOKEN', token);
    localStorage.setItem('DP_USER', JSON.stringify(user));
    
    return { user, token };
  }

  getSession() {
    const userStr = localStorage.getItem('DP_USER');
    const token = localStorage.getItem('DP_TOKEN');
    if (userStr && token) {
      return { user: JSON.parse(userStr), token };
    }
    return null;
  }

  logout() {
    localStorage.clear();
  }
}

export const auth = new AuthService();