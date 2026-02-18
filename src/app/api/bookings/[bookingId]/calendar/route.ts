import { NextRequest, NextResponse } from "next/server";
import { getBookingDetailForUser } from "@/server/data-access";
import { generateIcsString } from "@/server/calendar/ics";
import { getSession } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await getBookingDetailForUser(session.userId, params.bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ensure UID exists
  const eventUid = booking.calendarEventUid || `booking-${booking.id}-${uuidv4()}`;

  const icsContent = generateIcsString({
    uid: eventUid,
    start: booking.startTime,
    end: booking.endTime,
    summary: `Podcast Session — ${booking.room.name}`,
    description: `Booking ID: ${booking.id}\nManage at: ${process.env.APP_URL || 'http://localhost:3000'}/account/bookings/${booking.id}`,
    location: "Dubai Podcast Studio",
    url: `${process.env.APP_URL || 'http://localhost:3000'}/account/bookings/${booking.id}`
  });

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="studio_booking_${booking.id.slice(0, 8)}.ics"`,
    },
  });
}
