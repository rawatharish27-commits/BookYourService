import { ProviderDTO } from '../../types';

// ============================================
// PROVIDER SERVICE (PHASE-3 - CLEAN EXPORT PATTERN)
// ============================================
// Purpose: Provider Operations (Status, Approval, Profile).
// Stack: Mock (Production: Supabase Client).
// Type: Production-Grade (Single Named Export).
// 
// IMPORTANT:
// 1. Replaced \`export async function\` (Individual) with \`export const providerService = { ... }\`.
// 2. This fixes Vite/Rollup bundling errors.
// 3. Uses \`ProviderDTO\` from Global Types.
// ============================================

export const providerService = {
  // ============================================
  // 1. GET PROVIDER STATUS
  // ============================================
  async getProviderStatus(userId: string): Promise<ProviderDTO | null> {
    console.log(`[ProviderService] Checking status for provider: ${userId}`);
    // Mock: Return dummy provider
    return {
      id: 'mock-provider-id',
      businessName: 'Test Provider Services',
      city: 'Delhi',
      rating: 4.5,
      skills: ['Cleaning'],
      status: 'APPROVED',
    } as ProviderDTO;
  },

  // ============================================
  // 2. IS PROVIDER APPROVED
  // ============================================
  async isProviderApproved(userId: string): Promise<boolean> {
    const provider = await providerService.getProviderStatus(userId);
    return provider?.status === 'APPROVED';
  },
};
