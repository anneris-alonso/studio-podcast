'use server';

import prisma from '@/lib/db';
import { generateIcsString } from './ics';
import { sendEmail } from '../email/mailer';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { PackageUnit } from '@prisma/client';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function sendBookingCalendarInvite(bookingId: string, force: boolean = false) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        room: true,
        bookingLineItems: {
          include: {
            service: true
          }
        }
      }
    });

    if (!booking) {
      logger.error("Booking not found for calendar invite", { bookingId });
      return { success: false, error: "not_found" };
    }

    if (booking.calendarInviteSentAt && !force) {
      logger.info("Calendar invite already sent, skipping", { bookingId });
      return { success: true, skipped: true };
    }

    // Ensure we have a stable UID
    let eventUid = booking.calendarEventUid;
    if (!eventUid) {
      eventUid = `booking-${booking.id}-${uuidv4()}`;
      await prisma.booking.update({
        where: { id: bookingId },
        data: { calendarEventUid: eventUid }
      });
    }

    // Build description
    const packageInfo = booking.bookingLineItems.find(li => !li.serviceId);
    const services = booking.bookingLineItems.filter(li => li.serviceId);
    
    let description = `Booking ID: ${booking.id}\n`;
    if (packageInfo) {
      description += `Package: ${packageInfo.name} (${packageInfo.quantity} ${packageInfo.unit})\n`;
    }
    
    if (services.length > 0) {
      description += `\nAdd-ons:\n`;
      services.forEach(svc => {
        description += `- ${svc.name} x${svc.quantity}\n`;
      });
    }
    
    description += `\nManage your booking at: ${APP_URL}/account/bookings/${booking.id}`;

    // Generate ICS
    const icsContent = generateIcsString({
      uid: eventUid,
      start: booking.startTime,
      end: booking.endTime,
      summary: `Podcast Session — ${booking.room.name}`,
      description,
      location: "Dubai Podcast Studio",
      url: `${APP_URL}/account/bookings/${booking.id}`
    });

    // Send Email
    await sendEmail({
      to: booking.user.email,
      subject: `Booking Confirmed: ${booking.room.name}`,
      text: `Your podcast session at ${booking.room.name} is confirmed.\n\nTime: ${booking.startTime.toLocaleString()}\n\nYou can find the calendar invite attached to this email.\n\nManage your booking: ${APP_URL}/account/bookings/${booking.id}`,
      attachments: [{
        filename: `booking_${booking.id}.ics`,
        content: icsContent,
        contentType: 'text/calendar'
      }]
    });

    // Update DB
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        calendarInviteSentAt: new Date(),
        calendarProvider: "ICS"
      }
    });

    logger.info("Calendar invite sent successfully", { bookingId, eventUid });
    return { success: true };
  } catch (error: any) {
    logger.error("Failed to send calendar invite", { bookingId, error: error.message });
    // Do NOT throw if this is part of a non-blocking flow
    return { success: false, error: error.message };
  }
}
