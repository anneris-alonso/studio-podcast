import { logger } from "./logger";

type EventName = 
  | "BOOKING_STARTED" 
  | "BOOKING_COMPLETED" 
  | "SUBSCRIPTION_STARTED" 
  | "FILE_DOWNLOADED"
  | "PORTAL_VISIT"
  | "AUTH_SUCCESS";

export function trackEvent(eventName: EventName, metadata: Record<string, any> = {}) {
  // Local-first: Analytics go to system logs only
  logger.info(`Analytics Event: ${eventName}`, {
    eventName,
    ...metadata
  });
}
