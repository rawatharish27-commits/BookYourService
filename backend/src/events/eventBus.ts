
import { EventEmitter } from "events";
import { PoolClient } from "pg";
import { db } from "../config/db";
import { logger } from "../utils/logger";

export enum EventTypes {
    BOOKING_CREATED = "BOOKING_CREATED",
    BOOKING_UPDATED = "BOOKING_UPDATED",
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
    PROVIDER_WASHED_OUT = "PROVIDER_WASHED_OUT"
}

// Internal emitter for process-local real-time events
const internalEmitter = new EventEmitter();

/**
 * 🧱 PHASE 4: PERSISTENT EVENT BUS
 * Replaces In-Memory EventEmitter to ensure data durability.
 */
export const eventBus = {
    /**
     * Publishes an event to the outbox.
     * If a client is provided, it participates in an existing transaction.
     */
    async emit(type: EventTypes, payload: any, client?: PoolClient) {
        const executor = client || db;
        
        try {
            await executor.query(
                `INSERT INTO event_outbox (event_type, payload, next_run_at)
                 VALUES ($1, $2, NOW())`,
                [type, JSON.stringify(payload)]
            );
            logger.info(`Event Queued: ${type}`);
            
            // Broadcast locally for real-time features (WS, SSE)
            internalEmitter.emit(type, payload);
        } catch (e) {
            logger.error(`Critical: Failed to queue event ${type}`, e);
            // We throw here because if the event can't be logged, 
            // the calling transaction should likely roll back.
            throw e; 
        }
    },

    // Bridge for real-time listeners (WS server, SSE) to satisfy subscription requirements
    on(type: EventTypes, listener: (...args: any[]) => void) {
        internalEmitter.on(type, listener);
    },

    // Bridge for real-time listeners cleanup
    off(type: EventTypes, listener: (...args: any[]) => void) {
        internalEmitter.off(type, listener);
    }
};
