/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for frontend operations.
 * Make sure to set these environment variables in your .env file:
 * - VITE_SUPABASE_URL=your-project-url
 * - VITE_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from '@supabase/supabase-js';

// Extend ImportMetaEnv to include Supabase environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Types for our database tables
export interface Provider {
  id: string;
  service_type: string;
  experience: number;
  status: 'pending' | 'approved' | 'rejected';
  hourly_rate?: number;
  city: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Joined user data
  email?: string;
  phone?: string;
  name?: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_id?: string;
  service: string;
  booking_date: string;
  status: 'requested' | 'accepted' | 'completed' | 'cancelled';
  notes?: string;
  total_amount?: number;
  created_at: string;
  updated_at: string;
  // Joined data
  customer_name?: string;
  provider_name?: string;
  provider_service_type?: string;
}

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client only if configured
// Supabase client type with table definitions
type SupabaseClient = ReturnType<typeof createClient> & {
  from(table: 'providers' | 'bookings'): any;
};

// Create typed client
let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey) as SupabaseClient;
}

// Export for use in other services
export { supabase, isSupabaseConfigured };

// Helper function to check if Supabase is available
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase.from('providers').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Log configuration status
if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Using mock data mode.');
  console.warn('To enable Supabase backend, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
} else {
  console.log('✅ Supabase client initialized');
}

