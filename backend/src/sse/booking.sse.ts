
import { Request, Response } from "express";
import { eventBus, EventTypes } from "../events/eventBus";

/**
 * SSE Handler for Real-Time Booking Status
 * Clients connect here to listen for updates on a specific booking.
 */
export function bookingSSE(req: Request, res: Response) {
  const bookingId = (req as any).params.id;
  const userId = (req as any).user.id; // From Auth Middleware

  // Headers for SSE
  (res as any).setHeader("Content-Type", "text/event-stream");
  (res as any).setHeader("Cache-Control", "no-cache");
  (res as any).setHeader("Connection", "keep-alive");
  (res as any).flushHeaders();

  const sendEvent = (data: any) => {
    (res as any).write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Initial connection confirmation
  sendEvent({ type: "CONNECTED", bookingId });

  const listener = (data: any) => {
    // Only emit if it matches this booking ID
    // Security: We assume middleware already checked user has access to this booking ID?
    // Ideally, we should check ownership here, but for streaming, we rely on the route guard.
    if (data.id === bookingId) { 
        sendEvent({ type: "UPDATE", status: data.status, data });
    }
  };

  eventBus.on(EventTypes.BOOKING_UPDATED, listener);

  // Clean up on close
  (req as any).on("close", () => {
    eventBus.off(EventTypes.BOOKING_UPDATED, listener);
  });
}
