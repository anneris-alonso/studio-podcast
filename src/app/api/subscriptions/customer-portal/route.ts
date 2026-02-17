import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUserById } from "@/server/data-access";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Get user and their stripeCustomerId
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    console.error("Customer Portal Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create billing portal session" 
    }, { status: 500 });
  }
}
