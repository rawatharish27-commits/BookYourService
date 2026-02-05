
export type PaymentStatus = "CREATED" | "SUCCESS" | "FAILED" | "REFUNDED";
export type Gateway = "RAZORPAY" | "STRIPE";

export interface CreatePaymentDTO {
  bookingId: string;
  amount: number;
  userId: string;
}

export interface WebhookPayload {
  entityId: string;
  eventType: string;
  payload: any;
}
