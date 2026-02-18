import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { 
  markBookingAsPaid, 
  createBookingInvoice, 
  isEventProcessed, 
  markEventAsProcessed,
  getBookingById,
  upsertSubscription,
  applyInvoicePaidGrant,
  markBookingPaidEmailSent,
  markSubscriptionActiveEmailSent,
  getActiveSubscription
} from "@/server/data-access";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import Stripe from "stripe";
import { BookingStatus, SubscriptionStatus } from "@prisma/client";
import { sendEmail } from "@/server/email/mailer";
import { getBookingPaidEmail, getSubscriptionActivatedEmail } from "@/server/email/templates";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || "unknown";
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ 
      error: "bad_request", 
      message: "Missing signature or webhook secret", 
      requestId 
    }, { status: 400 });
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
    logger.warn(`Webhook signature verification failed`, { requestId, error: err.message });
    return NextResponse.json({ 
      error: "webhook_verification_failed", 
      message: err.message, 
      requestId 
    }, { status: 400 });
  }

  if (await isEventProcessed(event.id)) {
    return NextResponse.json({ received: true, requestId, processed: true });
  }

  try {
    let auditAction = `STRIPE_${event.type.toUpperCase().replace(/\./g, '_')}`;
    let entity = "StripeEvent";
    let entityId = event.id;
    let metadata: any = { type: event.type };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        metadata.sessionId = session.id;
        metadata.mode = session.mode;
        if (session.mode === "payment") {
          await handlePaymentSuccess(session.metadata?.bookingId, session.payment_intent as string);
          entity = "Booking";
          entityId = session.metadata?.bookingId || event.id;
        }
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(pi.metadata?.bookingId, pi.id);
        entity = "Booking";
        entityId = pi.metadata?.bookingId || event.id;
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        entity = "Subscription";
        entityId = subscription.id;
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await handleSubscriptionInvoicePaid(event.id, invoice);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await handleSubscriptionInvoiceFailed(invoice);
        }
        break;
      }
    }

    // Best-effort non-blocking audit log
    prisma.auditLog.create({
      data: {
        action: auditAction,
        entity,
        entityId,
        requestId,
        metadata,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
        userAgent: request.headers.get('user-agent'),
      }
    }).catch(e => logger.error("Webhook audit failed", { requestId, error: e.message }));

    await markEventAsProcessed(event.id);
    return NextResponse.json({ received: true, requestId });
  } catch (err: any) {
    logger.error(`Webhook processing error`, { requestId, eventId: event.id, error: err.message });
    return NextResponse.json({ 
      error: "webhook_process_failed", 
      message: "Internal server error during webhook processing", 
      requestId 
    }, { status: 500 });
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

  // Email Notification with idempotency
  if (!booking.bookingPaidEmailSentAt) {
    try {
      const email = getBookingPaidEmail({
        userName: booking.user.name,
        roomName: booking.room.name,
        startTime: booking.startTime,
        totalAmountMinor: booking.totalPriceMinorSnapshot,
        bookingId: booking.id
      });
      await sendEmail({
        to: booking.user.email,
        subject: email.subject,
        html: email.html,
        text: email.text
      });
      await markBookingPaidEmailSent(bookingId);
    } catch (err: any) {
      logger.error("Failed to send booking paid email", { bookingId, error: err.message });
    }
  }

  // Step 9: Non-blocking calendar invitation
  const { sendBookingCalendarInvite } = await import("@/server/calendar/actions");
  void sendBookingCalendarInvite(bookingId, false).catch(err => {
    console.error("Non-blocking calendar invite failed", { bookingId, error: err.message });
  });
}

async function handleSubscriptionChange(stripeSub: any) {
  const userId = stripeSub.metadata?.userId;
  const planId = stripeSub.metadata?.planId;

  if (!userId || !planId) {
    console.error(`Missing metadata in subscription ${stripeSub.id}`);
    return;
  }

  const statusMap: Record<string, SubscriptionStatus> = {
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

async function handleSubscriptionInvoicePaid(eventId: string, invoice: any) {
  const stripeSubId = invoice.subscription as string;
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId) as any;
  
  const userId = stripeSub.metadata?.userId;
  const planId = stripeSub.metadata?.planId;

  if (!userId || !planId) return;

  // Grant credits (idempotent via eventId)
  await applyInvoicePaidGrant(eventId, userId, planId);

  // Subscription Activated Email with idempotency
  const sub = await getActiveSubscription(userId);
  if (sub && !sub.subscriptionActiveEmailSentAt) {
    try {
      const email = getSubscriptionActivatedEmail({
        userName: sub.user.name,
        planName: sub.plan.name,
        includedHours: sub.plan.includedCredits
      });
      await sendEmail({
        to: sub.user.email,
        subject: email.subject,
        html: email.html,
        text: email.text
      });
      await markSubscriptionActiveEmailSent(sub.id);
    } catch (err: any) {
      logger.error("Failed to send subscription active email", { subId: sub.id, error: err.message });
    }
  }
}

async function handleSubscriptionInvoiceFailed(invoice: any) {
  const stripeSubId = invoice.subscription as string;
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId) as any;
  
  const userId = stripeSub.metadata?.userId;
  const planId = stripeSub.metadata?.planId;

  if (!userId || !planId) return;

  await upsertSubscription({
    userId,
    planId,
    stripeCustomerId: stripeSub.customer as string,
    stripeSubscriptionId: stripeSub.id,
    status: 'PAST_DUE',
    currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    latestInvoiceId: invoice.id as string
  });
}
