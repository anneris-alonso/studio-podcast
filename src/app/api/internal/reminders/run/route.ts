import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import prisma from "@/lib/db";
import { sendEmail } from "@/server/email/mailer";
import { formatDubaiDate } from "@/lib/format";
import { BookingStatus } from "@prisma/client";
import { logger } from "@/lib/logger";
import { generateIcsString } from "@/server/calendar/ics";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    await requireAdmin();

    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 2. Find eligible bookings
    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PAID,
        startTime: {
          gt: now,
          lt: twentyFourHoursFromNow,
        },
        reminderSentAt: null,
      },
      include: {
        user: true,
        room: true,
      }
    });

    logger.info(`Running reminder job: Found ${pendingBookings.length} bookings.`);

    const results = {
      total: pendingBookings.length,
      sent: 0,
      failed: 0,
    };

    // 3. Process reminders
    for (const booking of pendingBookings) {
      try {
        const dateStr = formatDubaiDate(booking.startTime, "PPPP");
        const timeStr = formatDubaiDate(booking.startTime, "p");

        // Use stable UID or generate one
        const eventUid = booking.calendarEventUid || `booking-${booking.id}-${uuidv4()}`;
        if (!booking.calendarEventUid) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { calendarEventUid: eventUid }
          });
        }

        const icsContent = generateIcsString({
          uid: eventUid,
          start: booking.startTime,
          end: booking.endTime,
          summary: `REMINDER: Podcast Session — ${booking.room.name}`,
          description: `Reminder for your booking at Studio Suite.\nBooking ID: ${booking.id}`,
          location: "Dubai Podcast Studio",
        });

        await sendEmail({
          to: booking.user.email,
          subject: `Reminder: Your studio session is tomorrow! — ${booking.room.name}`,
          text: `Hi ${booking.user.name},\n\nThis is a reminder for your podcast session tomorrow, ${dateStr} at ${timeStr}.\n\nLocation: Dubai Podcast Studio\n\nSee you there!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Tomorrow: Your Studio Session</h2>
              <p>Hi ${booking.user.name.split(' ')[0]},</p>
              <p>This is a reminder that you have a session booked at <strong>${booking.room.name}</strong>.</p>
              <p><strong>When:</strong> ${dateStr} at ${timeStr}</p>
              <p>See you at the studio!</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #666;">Dubai Podcast Studio</p>
            </div>
          `,
          attachments: [{
            filename: 'invite.ics',
            content: icsContent,
            contentType: 'text/calendar'
          }]
        });

        // 4. Mark as sent
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSentAt: new Date() }
        });

        results.sent++;
      } catch (err: any) {
        logger.error(`Failed to send reminder for booking ${booking.id}`, { error: err.message });
        results.failed++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${results.total} reminders. Sent: ${results.sent}, Failed: ${results.failed}`,
      results 
    });

  } catch (error: any) {
    logger.error("Reminder job runtime error", { error: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
