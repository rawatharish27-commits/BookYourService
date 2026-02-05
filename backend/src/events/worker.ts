import { db } from "../config/db";
import { logger } from "../utils/logger";
import { EventTypes } from "./eventBus";

/**
 * ⚙️ PHASE 4 WORKER ENGINE
 * Processes the event_outbox. Designed for horizontal scaling.
 */
export class EventWorker {
    private isRunning = false;
    private pollInterval = 5000; // 5 seconds

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.info("🚀 Event Worker Started");
        this.poll();
    }

    private async poll() {
        while (this.isRunning) {
            try {
                await this.processNextBatch();
            } catch (e) {
                logger.error("Worker Loop Error", e);
            }
            await new Promise(r => setTimeout(r, this.pollInterval));
        }
    }

    private async processNextBatch() {
        // Atomic "Pick and Lock" for distributed safety
        const batch = await db.query(
            `UPDATE event_outbox 
             SET status = 'PROCESSING'
             WHERE id IN (
                 SELECT id FROM event_outbox
                 WHERE status IN ('PENDING', 'FAILED') 
                 AND next_run_at <= NOW()
                 AND attempts < max_attempts
                 ORDER BY created_at ASC
                 LIMIT 10
                 FOR UPDATE SKIP LOCKED
             )
             RETURNING *`
        );

        for (const job of batch.rows) {
            try {
                await this.handleEvent(job.event_type, job.payload);
                
                await db.query(
                    `UPDATE event_outbox SET status = 'COMPLETED', processed_at = NOW() WHERE id = $1`,
                    [job.id]
                );
            } catch (err: any) {
                const isFinal = job.attempts + 1 >= job.max_attempts;
                const backoffMinutes = Math.pow(2, job.attempts); // Exponential backoff
                
                await db.query(
                    `UPDATE event_outbox 
                     SET status = $1, 
                         attempts = attempts + 1,
                         last_error = $2,
                         next_run_at = NOW() + ($3 || ' minutes')::interval
                     WHERE id = $4`,
                    [
                        isFinal ? 'PERMANENT_FAILURE' : 'FAILED',
                        err.message,
                        backoffMinutes,
                        job.id
                    ]
                );
                logger.warn(`Job ${job.id} failed. Attempt ${job.attempts + 1}.`);
            }
        }
    }

    private async handleEvent(type: string, payload: any) {
        // ROUTING LOGIC: Where the actual work happens
        switch (type) {
            case EventTypes.BOOKING_UPDATED:
                // Handle logic like sending push notifications, SMS, or clearing cache
                logger.info(`[Worker] Processing update for booking ${payload.id}`);
                break;
                
            case EventTypes.PAYMENT_SUCCESS:
                // Handle heavy downstream logic like generating PDF invoices
                logger.info(`[Worker] Generating invoice for booking ${payload.booking_id}`);
                break;

            default:
                logger.info(`[Worker] No handler for ${type}. Skipping.`);
        }
    }

    stop() {
        this.isRunning = false;
    }
}

export const eventWorker = new EventWorker();