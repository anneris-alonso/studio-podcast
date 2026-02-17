import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { 
  markBookingAsPaid, 
  createBookingInvoice, 
  isEventProcessed, 
  markEventAsProcessed,
  getBookingById,
  upsertSubscription,
  applyInvoicePaidGrant
} from "@/server/data-access";
import Stripe from "stripe";
import { BookingStatus, SubscriptionStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (await isEventProcessed(event.id)) {
    console.log(`Event ${event.id} already processed. Skipping.`);
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          await handlePaymentSuccess(session.metadata?.bookingId, session.payment_intent as string);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(pi.metadata?.bookingId, pi.id);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handleSubscriptionInvoicePaid(event.id, invoice);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handleSubscriptionInvoiceFailed(invoice);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    await markEventAsProcessed(event.id);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Error processing webhook ${event.id}:`, err);
    return NextResponse.json({ error: "Webhook process failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(bookingId: string | undefined, paymentIntentId: string | null) {
  if (!bookingId || !paymentIntentId) return;

  const booking = await getBookingById(bookingId);
  if (!booking) {
    console.error(`Booking ${bookingId} not found in webhook handler.`);
    return;
  }

  if (booking.status === BookingStatus.PAID) return;

  await markBookingAsPaid(bookingId, paymentIntentId);
  await createBookingInvoice(bookingId, paymentIntentId);
}

async function handleSubscriptionChange(stripeSub: Stripe.Subscription) {
  const userId = stripeSub.metadata.userId;
  const planId = stripeSub.metadata.planId;

  if (!userId || !planId) {
    console.error(`Missing metadata in subscription ${stripeSub.id}`);
    return;
  }

  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    unpaid: 'CANCELED',
    canceled: 'CANCELED',
    incomplete: 'PAST_DUE',
    incomplete_expired: 'CANCELED',
    trialing: 'ACTIVE',
    paused: 'PAST_DUE'
  };

  const status = statusMap[stripeSub.status] || SubscriptionStatus.CANCELED;

  await upsertSubscription({
    userId,
    planId,
    stripeCustomerId: stripeSub.customer as string,
    stripeSubscriptionId: stripeSub.id,
    status,
    currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    latestInvoiceId: stripeSub.latest_invoice as (string | undefined)
  });
}

async function handleSubscriptionInvoicePaid(eventId: string, invoice: Stripe.Invoice) {
  const stripeSubId = invoice.subscription as string;
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
  
  const userId = stripeSub.metadata.userId;
  const planId = stripeSub.metadata.planId;

  if (!userId || !planId) return;

  // Grant credits (idempotent via eventId)
  await applyInvoicePaidGrant(eventId, userId, planId);
}

async function handleSubscriptionInvoiceFailed(invoice: Stripe.Invoice) {
  const stripeSubId = invoice.subscription as string;
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
  
  const userId = stripeSub.metadata.userId;
  const planId = stripeSub.metadata.planId;

  if (!userId || !planId) return;

  await upsertSubscription({
    userId,
    planId,
    stripeCustomerId: stripeSub.customer as string,
    stripeSubscriptionId: stripeSub.id,
    status: 'PAST_DUE',
    currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    latestInvoiceId: invoice.id
  });
}
