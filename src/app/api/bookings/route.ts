import { NextRequest, NextResponse } from "next/server";
import { createBooking, validateAvailability } from "@/server/data-access";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      roomId, 
      packageId, 
      packageQuantity, 
      serviceQuantities, // Expect mapping of serviceId -> quantity
      startTime, 
      timeZone 
    } = body;

    // 1. Basic Validation
    if (!userId || !roomId || !packageId || !startTime) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // 2. Create Booking (Transactional)
    // Server-side will re-validate availability and compute endTime
    const booking = await createBooking({
      userId: String(userId),
      roomId: String(roomId),
      packageId: String(packageId),
      packageQuantity: packageQuantity || 1,
      serviceQuantities: serviceQuantities || {},
      startTime: start,
      timeZone: timeZone || "Asia/Dubai",
    });

    return NextResponse.json({
      message: "Booking created successfully",
      bookingId: booking.id,
      booking,
    });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create booking" 
    }, { status: 500 });
  }
}
