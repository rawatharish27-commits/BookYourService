/**
 * Admin Service - Provider Approval Operations
 * 
 * This service handles all admin operations related to:
 * - Fetching pending providers
 * - Approving/Rejecting providers
 * - Managing provider status
 */

import { supabase, isSupabaseConfigured, type Provider } from './supabase';

// Mock data for development (when Supabase is not configured)
const MOCK_PENDING_PROVIDERS: Provider[] = [
  {
    id: 'mock_provider_1',
    service_type: 'Electrician',
    experience: 5,
    status: 'pending',
    city: 'Mumbai',
    description: 'Experienced electrician specializing in residential wiring',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Rahul Sharma',
    phone: '+919876543210',
    email: 'rahul@example.com'
  },
  {
    id: 'mock_provider_2',
    service_type: 'Plumber',
    experience: 3,
    status: 'pending',
    city: 'Delhi',
    description: 'Professional plumber with expertise in pipe fitting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Amit Kumar',
    phone: '+919876543211',
    email: 'amit@example.com'
  },
  {
    id: 'mock_provider_3',
    service_type: 'AC Repair',
    experience: 7,
    status: 'pending',
    city: 'Bangalore',
    description: 'AC specialist with 7 years of experience',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Suresh Patel',
    phone: '+919876543212',
    email: 'suresh@example.com'
  }
];

/**
 * Fetch all pending providers awaiting admin approval
 */
export async function getPendingProviders(): Promise<Provider[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[AdminService] Using mock data - getPendingProviders');
    return MOCK_PENDING_PROVIDERS;
  }

  try {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        email:auth_users!inner(email),
        phone:auth_users!inner(raw_user_meta_data)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AdminService] Error fetching pending providers:', error);
      throw error;
    }

    // Transform the data to match Provider interface
    return (data || []).map((provider: any) => ({
      ...provider,
      email: provider.email?.email,
      phone: provider.phone?.raw_user_meta_data?.phone,
      name: provider.phone?.raw_user_meta_data?.name
    }));
  } catch (error) {
    console.error('[AdminService] Failed to fetch pending providers:', error);
    return [];
  }
}

/**
 * Fetch all providers (regardless of status)
 */
export async function getAllProviders(): Promise<Provider[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[AdminService] Using mock data - getAllProviders');
    return MOCK_PENDING_PROVIDERS;
  }

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[AdminService] Failed to fetch all providers:', error);
    return [];
  }
}

/**
 * Approve a provider - changes status from 'pending' to 'approved'
 */
export async function approveProvider(providerId: string): Promise<boolean> {
  console.log(`[AdminService] Approving provider: ${providerId}`);

  if (!isSupabaseConfigured || !supabase) {
    // Update mock data
    const provider = MOCK_PENDING_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      provider.status = 'approved';
      provider.updated_at = new Date().toISOString();
      console.log('[AdminService] Mock provider approved');
      return true;
    }
    return false;
  }

  try {
    const { error } = await (supabase
      .from('providers') as any)
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId);

    if (error) {
      console.error('[AdminService] Error approving provider:', error);
      throw error;
    }

    console.log(`[AdminService] Provider ${providerId} approved successfully`);
    return true;
  } catch (error) {
    console.error('[AdminService] Failed to approve provider:', error);
    return false;
  }
}

/**
 * Reject a provider - changes status from 'pending' to 'rejected'
 */
export async function rejectProvider(providerId: string): Promise<boolean> {
  console.log(`[AdminService] Rejecting provider: ${providerId}`);

  if (!isSupabaseConfigured || !supabase) {
    // Update mock data
    const provider = MOCK_PENDING_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      provider.status = 'rejected';
      provider.updated_at = new Date().toISOString();
      console.log('[AdminService] Mock provider rejected');
      return true;
    }
    return false;
  }

  try {
    const { error } = await (supabase
      .from('providers') as any)
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId);

    if (error) {
      console.error('[AdminService] Error rejecting provider:', error);
      throw error;
    }

    console.log(`[AdminService] Provider ${providerId} rejected`);
    return true;
  } catch (error) {
    console.error('[AdminService] Failed to reject provider:', error);
    return false;
  }
}

/**
 * Get provider statistics for admin dashboard
 */
export async function getProviderStats(): Promise<{
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}> {
  if (!isSupabaseConfigured || !supabase) {
    const pending = MOCK_PENDING_PROVIDERS.filter(p => p.status === 'pending').length;
    const approved = MOCK_PENDING_PROVIDERS.filter(p => p.status === 'approved').length;
    const rejected = MOCK_PENDING_PROVIDERS.filter(p => p.status === 'rejected').length;
    return {
      pending,
      approved,
      rejected,
      total: MOCK_PENDING_PROVIDERS.length
    };
  }

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('status');

    if (error) throw error;

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    (data || []).forEach((provider: any) => {
      stats.total++;
      if (provider.status === 'pending') stats.pending++;
      else if (provider.status === 'approved') stats.approved++;
      else if (provider.status === 'rejected') stats.rejected++;
    });

    return stats;
  } catch (error) {
    console.error('[AdminService] Failed to get provider stats:', error);
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }
}

/**
 * Search providers by service type or city
 */
export async function searchProviders(
  query: string,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<Provider[]> {
  if (!isSupabaseConfigured || !supabase) {
    let results = MOCK_PENDING_PROVIDERS;
    if (status) {
      results = results.filter(p => p.status === status);
    }
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(p => 
        p.service_type.toLowerCase().includes(lowerQuery) ||
        p.city.toLowerCase().includes(lowerQuery) ||
        p.name?.toLowerCase().includes(lowerQuery)
      );
    }
    return results;
  }

  try {
    let queryBuilder = supabase
      .from('providers')
      .select('*');

    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }

    if (query) {
      queryBuilder = queryBuilder.or(`service_type.ilike.%${query}%,city.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[AdminService] Failed to search providers:', error);
    return [];
  }
}

