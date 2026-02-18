import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getBookingById, updateBookingStripeSession } from "@/server/data-access";
import { BookingStatus } from "@prisma/client";

import { requireBookingOwnerOrAdmin } from "@/lib/auth-guards";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || "unknown";
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required", requestId }, { status: 400 });
    }

    // 1. Fetch booking and validate ownership
    await requireBookingOwnerOrAdmin(bookingId);
    const booking = await getBookingById(bookingId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === BookingStatus.PAID) {
      return NextResponse.json({ error: "Booking is already paid" }, { status: 400 });
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      return NextResponse.json({ error: "Booking must be in CONFIRMED status to pay" }, { status: 400 });
    }

    // 2. Idempotency Check: Reuse existing session if it exists
    if (booking.stripeCheckoutSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(booking.stripeCheckoutSessionId);
        if (existingSession.status === "open") {
          return NextResponse.json({ url: existingSession.url });
        }
      } catch (e) {
        // If session expired or invalid, we'll create a new one
        console.warn("Existing Stripe session invalid or expired:", e);
      }
    }

    // 3. Create Stripe Checkout Session
    // We use the totalPriceAedSnapshot EXACTLY as requested
    const amountInCents = Math.round(Number(booking.totalPriceAedSnapshot) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aed",
            product_data: {
              name: "Studio Booking",
              description: `Booking #${booking.id} - ${(booking as any).lineItems.map((li: any) => li.nameSnapshot).join(", ")}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
      },
      success_url: `${process.env.APP_URL}/book/success?bookingId=${booking.id}`,
      cancel_url: `${process.env.APP_URL}/book/cancel?bookingId=${booking.id}`,
    });

    // 4. Save session ID to booking
    await updateBookingStripeSession(String(booking.id), session.id);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    if (error.message === "unauthorized") return NextResponse.json({ error: "unauthorized", requestId }, { status: 401 });
    if (error.message === "forbidden") return NextResponse.json({ error: "forbidden", requestId }, { status: 403 });
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session", requestId }, { status: 500 });
  }
}
