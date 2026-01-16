import { UserDTO, BookingDTO } from '../../types';

// ============================================
// DATABASE SERVICE (PHASE-2 - NAMED EXPORT FIX)
// ============================================
// Purpose: Mock Database Service (Supabase Client).
// Stack: Mock (Production: Supabase Client).
// Type: Production-Grade (Standard Service Pattern - Named Export).
// 
// IMPORTANT:
// 1. Exports \`DatabaseService\` (PascalCase) to match \`import { DatabaseService }\` in \`App.tsx\`.
// 2. Removes \`export default\` to avoid ambiguity.
// 3. Uses \`UserDTO\`, \`BookingDTO\` from Global Types.
// 4. Fixes \`import { DatabaseService }\` error in \`main.tsx\`.
// ============================================

export const DatabaseService = {
  // ============================================
  // 1. GET USERS (MOCK)
  // ============================================
  async getUsers(): Promise<UserDTO[]> {
    // Mock: Return empty array or mock users
    return [];
  },

  // ============================================
  // 2. GET BOOKINGS (MOCK)
  // ============================================
  async getBookings(): Promise<BookingDTO[]> {
    // Mock: Return empty array or mock bookings
    return [];
  },

  // ============================================
  // 3. GET STATS (MOCK)
  // ============================================
  async getStats(): Promise<{
    totalUsers: number;
    totalBookings: number;
    revenue: number;
  }> {
    // Mock: Return dummy stats
    return {
      totalUsers: 0,
      totalBookings: 0,
      revenue: 0,
    };
  },
};
