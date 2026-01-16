/**
 * Supabase Client Configuration (Production-Grade)
 * 
 * This file sets up Supabase client with full table definitions
 * matching the production SQL schema.
 * 
 * Make sure to set these environment variables in your .env file:
 * - VITE_SUPABASE_URL=your-project-url
 * - VITE_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// TYPE DEFINITIONS (MUST MATCH SQL SCHEMA)
// ============================================

// Database Tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'customer' | 'provider' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'customer' | 'provider' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'customer' | 'provider' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      providers: {
        Row: {
          id: string;
          status: 'pending' | 'approved' | 'rejected' | 'suspended';
          experience: number;
          hourly_rate: number | null;
          city: string;
          description: string | null;
          rating: number;
          total_jobs: number;
          is_online: boolean;
          created_at: string;
          updated_at: string;
          // Joined data
          email?: string;
          phone?: string;
          name?: string;
        };
        Insert: {
          id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          experience?: number;
          hourly_rate?: number | null;
          city: string;
          description?: string | null;
          rating?: number;
          total_jobs?: number;
          is_online?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          experience?: number;
          hourly_rate?: number | null;
          city?: string;
          description?: string | null;
          rating?: number;
          total_jobs?: number;
          is_online?: boolean;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          provider_id: string | null;
          category: string;
          title: string;
          description: string | null;
          price: number;
          duration: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          // Joined data
          provider_name?: string;
          provider_rating?: number;
        };
        Insert: {
          id?: string;
          provider_id: string;
          category: string;
          title: string;
          description?: string | null;
          price: number;
          duration?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider_id?: string;
          category?: string;
          title?: string;
          description?: string | null;
          price?: number;
          duration?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          provider_id: string | null;
          service_id: string | null;
          service_title: string;
          status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          booking_date: string;
          booking_time: string | null;
          notes: string | null;
          total_amount: number | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          // Joined data
          customer_name?: string;
          customer_email?: string;
          provider_name?: string;
          provider_phone?: string;
          provider_service_type?: string;
          provider_rating?: number;
          payment_status?: string;
          review_rating?: number;
        };
        Insert: {
          id?: string;
          customer_id: string;
          provider_id?: string | null;
          service_id?: string | null;
          service_title: string;
          status?: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          booking_date: string;
          booking_time?: string | null;
          notes?: string | null;
          total_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider_id?: string | null;
          service_id?: string | null;
          status?: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          booking_date?: string;
          booking_time?: string | null;
          notes?: string | null;
          total_amount?: number | null;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          order_id: string;
          amount: number;
          currency: string;
          gateway: 'razorpay' | 'stripe';
          status: 'pending' | 'paid' | 'failed' | 'refunded';
          gateway_status: string | null;
          gateway_response: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          order_id: string;
          amount: number;
          currency?: string;
          gateway: 'razorpay' | 'stripe';
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          gateway_status?: string | null;
          gateway_response?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          gateway_status?: string | null;
          gateway_response?: any;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          provider_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          provider_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          comment?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: any;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          metadata?: any;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      pending_providers: {
        Row: {
          id: string;
          status: string;
          experience: number;
          city: string;
          rating: number;
          created_at: string;
          email: string;
          phone: string;
          name: string;
          total_bookings: number;
        };
      };
      provider_earnings_summary: {
        Row: {
          id: string;
          status: string;
          rating: number;
          total_bookings: number;
          completed_bookings: number;
          total_earnings: number;
        };
      };
      customer_booking_history: {
        Row: {
          id: string;
          customer_id: string;
          status: string;
          booking_date: string;
          total_amount: number;
          created_at: string;
          service_title: string;
          service_price: number;
          provider_email: string;
          provider_name: string;
          provider_phone: string;
          provider_rating: number;
          booking_rating: number;
          payment_status: string;
        };
      };
    };
  };
};

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create typed Supabase client
let supabase: ReturnType<typeof createClient<Database>> | null = null;

if (isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ============================================
// EXPORTS
// ============================================

export { supabase, isSupabaseConfigured };
export type Database = Database;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check Supabase Connection
 * Verifies that the client is properly configured and can reach the database
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    return !error;
  } catch {
    return false;
  }
};

/**
 * Get Current User
 * Returns the currently authenticated user from Supabase
 */
export const getCurrentUser = async () => {
  if (!supabase) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
};

/**
 * Get User Profile with Role
 * Fetches the user's profile with role information
 */
export const getUserProfile = async (userId: string) => {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data;
};

// ============================================
// LOGGING
// ============================================

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Using mock data mode.');
  console.warn('To enable Supabase backend, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
} else {
  console.log('✅ Supabase client initialized with full type definitions');
}
