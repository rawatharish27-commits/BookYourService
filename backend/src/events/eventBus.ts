
import { EventEmitter } from "events";

export const eventBus = new EventEmitter();

export enum EventTypes {
    BOOKING_CREATED = "BOOKING_CREATED",
    BOOKING_UPDATED = "BOOKING_UPDATED",
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS"
}
