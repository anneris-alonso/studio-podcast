import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

/**
 * Formats minor units (e.g., fils/cents) to AED string.
 * @param minorUnits The amount in minor units.
 */
export function formatAED(minorUnits: number): string {
  return (minorUnits / 100).toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  });
}

/**
 * Formats a date to Dubai timezone string.
 * @param date The date to format.
 * @param formatStr Optional format string (default: "PPpp").
 */
export function formatDubaiDate(date: Date, formatStr: string = "PPP p"): string {
  const zonedDate = toZonedTime(date, "Asia/Dubai");
  return format(zonedDate, formatStr);
}

/**
 * Formats duration in minutes to a readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}
