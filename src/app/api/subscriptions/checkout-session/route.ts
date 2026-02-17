import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPlanBySlug, getUserById, updateUserStripeCustomerId } from "@/server/data-access";

export async function POST(request: NextRequest) {
  try {
    const { planSlug, userId } = await request.json();

    if (!planSlug || !userId) {
      return NextResponse.json({ error: "Missing required details" }, { status: 400 });
    }

    // 1. Validate plan exists
    const plan = await getPlanBySlug(planSlug);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Invalid or inactive plan" }, { status: 404 });
    }

    // 2. Validate user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Create or reuse Stripe Customer
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
      await updateUserStripeCustomerId(user.id, stripeCustomerId);
    }

    // 4. Find Stripe Price ID for the plan
    // We expect the price to have the planSlug in metadata
    const prices = await stripe.prices.list({
      lookup_keys: [`plan_${planSlug}`],
      expand: ["data.product"],
    });

    let priceId: string;

    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
    } else {
      // Fallback: search by metadata if lookup_key is not used
      const searchedPrices = await stripe.prices.search({
        query: `active:'true' AND metadata['planSlug']:'${planSlug}'`,
      });
      
      if (searchedPrices.data.length > 0) {
        priceId = searchedPrices.data[0].id;
      } else {
        return NextResponse.json({ 
          error: `No Stripe Price found for plan ${planSlug}. Please ensure Stripe Price has metadata { "planSlug": "${planSlug}" } or lookup_key "plan_${planSlug}"`
        }, { status: 500 });
      }
    }

    // 5. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId: plan.id,
        planSlug: plan.slug,
      },
      success_url: `${process.env.APP_URL}/account/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/pricing?status=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Subscription Checkout Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create checkout session" 
    }, { status: 500 });
  }
}
