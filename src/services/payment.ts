import { api } from "./api";

/**
 * ENFORCED PAYMENT SERVICE
 * Strictly communicates with backend for financial integrity.
 */

export async function initPayment(bookingId: string, amount: number) {
  const { data } = await api.post("/api/v1/payments/init", {
    bookingId,
    amount,
  });
  return data;
}

export async function verifyPayment(payload: {
    orderId: string;
    paymentId: string;
    signature: string;
}) {
  const { data } = await api.post("/api/v1/payments/verify", payload);
  return data;
}