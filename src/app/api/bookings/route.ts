import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/server/data-access";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || "unknown";
  try {
    const body = await request.json();
    const { 
      userId, 
      roomId, 
      packageId, 
      packageQuantity, 
      serviceQuantities, 
      startTime, 
      timeZone 
    } = body;

    if (!userId || !roomId || !packageId || !startTime) {
      return NextResponse.json({ 
        error: "invalid_request", 
        message: "Missing required booking details",
        requestId 
      }, { status: 400 });
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return NextResponse.json({ 
        error: "invalid_date", 
        message: "Invalid date format",
        requestId 
      }, { status: 400 });
    }

    const booking = await createBooking({
      userId: String(userId),
      roomId: String(roomId),
      packageId: String(packageId),
      packageQuantity: packageQuantity || 1,
      serviceQuantities: serviceQuantities || {},
      startTime: start,
      timeZone: timeZone || "Asia/Dubai",
    });

    // Best-effort non-blocking audit log
    try {
      // Fetch some details for metadata if needed, or use what we have
      prisma.auditLog.create({
        data: {
          action: "BOOKING_CREATE",
          entity: "Booking",
          entityId: booking.id,
          actorUserId: userId,
          requestId,
          ip: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
          userAgent: request.headers.get('user-agent'),
          metadata: {
            packageId,
            packageQty: packageQuantity || 1,
            selectedServices: serviceQuantities || {},
            totalPriceMinorSnapshot: booking.totalPriceMinorSnapshot,
          }
        }
      }).catch(err => logger.error("Audit log failed for BOOKING_CREATE", { requestId, error: err.message }));
    } catch (e) {
      // Ignore audit failures as per best-effort requirement
    }

    return NextResponse.json({
      message: "Booking created successfully",
      bookingId: booking.id,
      requestId,
    });
  } catch (error: any) {
    logger.error("Booking creation error", { requestId, error: error.message });
    return NextResponse.json({ 
      error: "internal_error",
      message: error.message || "Failed to create booking",
      requestId 
    }, { status: 500 });
  }
}
