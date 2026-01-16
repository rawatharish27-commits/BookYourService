import { BookingDTO, CreateBookingPayload } from '../../types';

// ============================================
// BOOKING SERVICE (PHASE-3 - CLEAN EXPORT PATTERN)
// ============================================
// Purpose: Booking Operations (Create, Fetch, Update).
// Stack: Mock (Production: Supabase Client).
// Type: Production-Grade (Single Named Export).
// 
// IMPORTANT:
// 1. Replaced \`export async function\` (Individual) with \`export const bookingService = { ... }\`.
// 2. This fixes Vite/Rollup bundling errors.
// 3. Uses \`BookingDTO\`, \`CreateBookingPayload\` from Global Types.
// ============================================

export const bookingService = {
  // ============================================
  // 1. CREATE BOOKING
  // ============================================
  async createBooking(payload: CreateBookingPayload): Promise<ApiResponse<BookingDTO>> {
    try {
      const response = await fetch(`${API_BASE_URL}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[BookingService] Create Booking Failed:', error);
      return {
        success: false,
        message: 'Booking creation failed',
        error: {
          name: 'CreateBookingError',
          message: error instanceof Error ? error.message : 'Unknown error',
          statusCode: 500,
          isOperational: false,
        },
      };
    }
  },

  // ============================================
  // 2. GET CUSTOMER BOOKINGS
  // ============================================
  async getCustomerBookings(customerId: string): Promise<ApiResponse<BookingDTO[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/booking/customer/${customerId}`, {
        method: 'GET',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[BookingService] Get Customer Bookings Failed:', error);
      return {
        success: false,
        message: 'Failed to fetch bookings',
        error: {
          name: 'GetBookingsError',
          message: error instanceof Error ? error.message : 'Unknown error',
          statusCode: 500,
          isOperational: false,
        },
      };
    }
  },

  // ============================================
  // 3. GET PROVIDER BOOKINGS
  // ============================================
  async getProviderBookings(providerId: string): Promise<ApiResponse<BookingDTO[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/booking/provider/${providerId}`, {
        method: 'GET',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[BookingService] Get Provider Bookings Failed:', error);
      return {
        success: false,
        message: 'Failed to fetch bookings',
        error: {
          name: 'GetBookingsError',
          message: error instanceof Error ? error.message : 'Unknown error',
          statusCode: 500,
          isOperational: false,
        },
      };
    }
  },
};
