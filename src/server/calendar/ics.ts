import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const DEFAULT_TZ = process.env.CALENDAR_DEFAULT_TZ || 'Asia/Dubai';
const PRODID = "-//Studio Suite//Podcast Booking//EN";

export interface IcsEventOptions {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
  url?: string;
}

/**
 * Generates an ICS string manually to avoid dependencies and ensure strict format.
 * All times are rendered in Asia/Dubai timezone as per requirements.
 */
export function generateIcsString(options: IcsEventOptions): string {
  const { uid, start, end, summary, description, location, url } = options;

  // Convert to Dubai time for the ICS string
  const startDubai = toZonedTime(start, DEFAULT_TZ);
  const endDubai = toZonedTime(end, DEFAULT_TZ);

  // Format: YYYYMMDDTHHMMSS
  const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART;TZID=${DEFAULT_TZ}:${fmt(startDubai)}`,
    `DTEND;TZID=${DEFAULT_TZ}:${fmt(endDubai)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location}`,
    url ? `URL:${url}` : "",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  return lines.filter(Boolean).join("\r\n");
}
