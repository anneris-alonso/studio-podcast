import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUserById } from "@/server/data-access";

import { requireUser } from "@/lib/auth-guards";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || "unknown";
  try {
    const user = await requireUser();

    // 1. User is already validated by requireUser()
    if (!user) {
      return NextResponse.json({ error: "User not found", requestId }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json({ 
        error: "User has no active billing record. Please subscribe to a plan first." 
      }, { status: 400 });
    }

    // 2. Create Stripe Billing Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.APP_URL}/account/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    if (error.message === "unauthorized") return NextResponse.json({ error: "unauthorized", requestId }, { status: 401 });
    if (error.message === "forbidden") return NextResponse.json({ error: "forbidden", requestId }, { status: 403 });
    console.error("Customer Portal Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create billing portal session",
      requestId 
    }, { status: 500 });
  }
}
