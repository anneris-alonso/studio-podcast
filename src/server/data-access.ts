import prisma from "@/lib/db";
import { BookingStatus, Prisma, SubscriptionStatus, TransactionType, PackageUnit, ServiceUnit } from "@prisma/client";
import { computePackagePrice, computeServicePrice, computeEndTime } from "./pricing/pricingEngine";

/**
 * listStudioRooms()
 */
export async function listStudioRooms() {
  return prisma.studioRoom.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * getStudioRoomBySlug(slug)
 */
export async function getStudioRoomBySlug(slug: string) {
  return prisma.studioRoom.findUnique({
    where: { slug },
  });
}

/**
 * listPackages(studioRoomId)
 */
export async function listPackages(studioRoomId?: string) {
  return prisma.package.findMany({
    where: {
      active: true,
      OR: [
        { studioRoomId: null },
        ...(studioRoomId ? [{ studioRoomId }] : []),
      ],
    },
    orderBy: { price: "asc" },
  });
}

/**
 * listActiveServices()
 */
export async function listActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

/**
 * getUserByEmail(email)
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * validateAvailability(roomId, start, end)
 */
export async function validateAvailability(roomId: string, start: Date, end: Date) {
  const overlap = await prisma.booking.findFirst({
    where: {
      roomId,
      status: { not: BookingStatus.CANCELLED },
      AND: [
        { startTime: { lt: end } },
        { endTime: { gt: start } },
      ],
    },
  });
  return !overlap;
}

/**
 * createBooking()
 * Core transactional booking engine - Step 5.5 Refined
 */
export async function createBooking(data: {
  userId: string;
  roomId: string; // Ensure this is included
  packageId: string;
  packageQuantity?: number;
  serviceQuantities?: Record<string, number>; // Map of serviceId -> quantity
  startTime: Date;
  timeZone: string;
}) {
  const pkgQty = data.packageQuantity || 1;
  const svcQtys = data.serviceQuantities || {};

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Fetch Package dependencies early to compute endTime
    const pkg = await tx.package.findUniqueOrThrow({ where: { id: data.packageId } });
    
    // 2. Compute endTime server-side
    const endTime = computeEndTime(data.startTime, pkg.unit, pkgQty, pkg.durationMinutes);

    // 3. Re-validate availability
    const overlap = await tx.booking.findFirst({
      where: {
        roomId: data.roomId,
        status: { not: BookingStatus.CANCELLED },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: data.startTime } },
        ],
      },
    });

    if (overlap) {
      throw new Error("Availability conflict detected.");
    }

    const services = await tx.service.findMany({
      where: { id: { in: Object.keys(svcQtys).length > 0 ? Object.keys(svcQtys) : [] } },
    });

    // 4. Calculate pricing using Pricing Engine (Minor Units)
    const pkgPricing = computePackagePrice(pkg, pkgQty);
    
    const lineItemsData = services.map(svc => {
      const qty = svcQtys[svc.id] || 1;
      const svcPricing = computeServicePrice(svc, qty, {
        unit: pkg.unit,
        quantity: pkgQty,
        durationMinutes: pkg.durationMinutes
      });
      return {
        serviceId: svc.id,
        nameSnapshot: svc.name,
        unitPriceMinorSnapshot: svcPricing.unitPriceMinor,
        totalPriceMinorSnapshot: svcPricing.totalPriceMinor,
        quantity: qty,
        priceAtBooking: new Prisma.Decimal(svc.price.toString()),
        unitPriceAedSnapshot: new Prisma.Decimal((svcPricing.unitPriceMinor / 100).toString()),
        totalPriceAedSnapshot: new Prisma.Decimal((svcPricing.totalPriceMinor / 100).toString()),
      };
    });

    // Handle Subscription Credits
    let usedCreditMinutes = 0;
    const activeSubscription = await tx.subscription.findFirst({
      where: { userId: data.userId, status: 'ACTIVE' },
      include: { plan: true },
    });

    if (activeSubscription) {
      const requiredMinutes = pkg.unit === PackageUnit.FIXED_MINUTES ? pkg.durationMinutes : (pkg.unit === PackageUnit.HOUR ? pkgQty * 60 : pkgQty * 24 * 60);
      
      const ledgerSum = await (tx.creditLedger as any).aggregate({
        where: { userId: data.userId },
        _sum: { amount: true },
      });
      const balance = ledgerSum._sum.amount || 0;

      if (balance >= requiredMinutes) {
        usedCreditMinutes = requiredMinutes;
      } else {
        throw new Error(`Not enough credits. Required: ${requiredMinutes}, Available: ${balance}`);
      }
    }

    // Final Total (Minor Units)
    const packageTotalMinor = usedCreditMinutes > 0 ? 0 : pkgPricing.totalPriceMinor;
    const servicesTotalMinor = lineItemsData.reduce((acc, item) => acc + item.totalPriceMinorSnapshot, 0);
    const bookingTotalMinor = packageTotalMinor + servicesTotalMinor;

    // 5. Create Booking
    const booking = await tx.booking.create({
      data: {
        userId: data.userId,
        roomId: data.roomId,
        startTime: data.startTime,
        endTime: endTime,
        status: BookingStatus.CONFIRMED,
        totalPrice: new Prisma.Decimal((bookingTotalMinor / 100).toString()),
        totalPriceAedSnapshot: new Prisma.Decimal((bookingTotalMinor / 100).toString()),
        totalPriceMinorSnapshot: bookingTotalMinor,
        timeZone: data.timeZone,
        usedCreditMinutes,
      },
      include: { lineItems: true }
    });

    // 6. Create Package Line Item
    await tx.bookingLineItem.create({
      data: {
        bookingId: booking.id,
        nameSnapshot: pkg.name,
        unitPriceMinorSnapshot: pkgPricing.unitPriceMinor,
        totalPriceMinorSnapshot: pkgPricing.totalPriceMinor,
        quantity: pkgQty,
        priceAtBooking: pkg.price,
        unitPriceAedSnapshot: pkg.price,
        totalPriceAedSnapshot: new Prisma.Decimal((pkgPricing.totalPriceMinor / 100).toString()),
      },
    });

    // 7. Create Service Line Items
    if (lineItemsData.length > 0) {
      await tx.bookingLineItem.createMany({
        data: lineItemsData.map(li => ({
          ...li,
          bookingId: booking.id,
        })),
      });
    }

    // 8. Record consumption in ledger if used
    if (usedCreditMinutes > 0) {
      await (tx.creditLedger as any).create({
        data: {
          userId: data.userId,
          bookingId: booking.id,
          amount: -usedCreditMinutes,
          transactionType: TransactionType.BOOKING,
          description: `Booking #${booking.id} usage from Subscription`,
        },
      });
    }

    return booking;
  });
}

/**
 * getBookingById(id)
 */
export async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      lineItems: true,
      user: true,
    },
  });
}

/**
 * updateBookingStripeSession(bookingId, sessionId)
 */
export async function updateBookingStripeSession(bookingId: string, sessionId: string) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      stripeCheckoutSessionId: sessionId,
    },
  });
}

/**
 * markBookingAsPaid(bookingId, paymentIntentId)
 * Transitions booking to PAID and records payment info.
 */
export async function markBookingAsPaid(bookingId: string, paymentIntentId: string) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.PAID,
      stripePaymentIntentId: paymentIntentId,
      paidAt: new Date(),
    },
  });
}

/**
 * createBookingInvoice(bookingId, paymentIntentId)
 * Generates an invoice for a paid booking.
 */
export async function createBookingInvoice(bookingId: string, paymentIntentId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
  });

  const year = new Date().getFullYear();
  const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const invoiceNumber = `INV-${year}-${shortId}`;

  return prisma.invoice.upsert({
    where: { bookingId: bookingId },
    update: {
      stripePaymentIntentId: paymentIntentId,
      status: "PAID",
    },
    create: {
      userId: booking.userId,
      bookingId: booking.id,
      amount: booking.totalPriceAedSnapshot,
      status: "PAID",
      stripePaymentIntentId: paymentIntentId,
    },
  });
}

/**
 * isEventProcessed(eventId)
 */
export async function isEventProcessed(eventId: string) {
  const processed = await prisma.stripeEventProcessed.findUnique({
    where: { id: eventId },
  });
  return !!processed;
}

/**
 * markEventAsProcessed(eventId)
 */
export async function markEventAsProcessed(eventId: string) {
  return prisma.stripeEventProcessed.create({
    data: { id: eventId },
  });
}

/**
 * getActiveSubscription(userId)
 * Returns the user's active subscription with plan details
 */
export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      plan: true,
    },
  });
}

/**
 * getCreditBalanceMinutes(userId)
 * Calculates total credit balance in minutes from ledger
 */
export async function getCreditBalanceMinutes(userId: string): Promise<number> {
  const result = await prisma.creditLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount || 0;
}

/**
 * applyInvoicePaidGrant(eventId, userId, planId)
 * Grants monthly credits when subscription invoice is paid (idempotent)
 */
export async function applyInvoicePaidGrant(
  eventId: string,
  userId: string,
  planId: string
) {
  return prisma.$transaction(async (tx) => {
    // Check idempotency
    const processed = await tx.stripeEventProcessed.findUnique({
      where: { id: eventId },
    });
    if (processed) {
      console.log(`Event ${eventId} already processed, skipping credit grant`);
      return null;
    }

    // Get plan details
    const plan = await tx.plan.findUniqueOrThrow({ where: { id: planId } });
    const grantMinutes = plan.includedCredits * 60;

    // Create ledger entry
    await tx.creditLedger.create({
      data: {
        userId,
        amount: grantMinutes,
        transactionType: TransactionType.GRANT,
        description: `Monthly credit grant for ${plan.name}`,
      },
    });

    // Mark event as processed
    await tx.stripeEventProcessed.create({
      data: { id: eventId },
    });

    console.log(`Granted ${grantMinutes} minutes to user ${userId} for plan ${plan.name}`);
    return grantMinutes;
  });
}

/**
 * upsertSubscription(data)
 * Creates or updates a subscription from Stripe webhook data
 */
export async function upsertSubscription(data: {
  userId: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  latestInvoiceId?: string;
}) {
  return prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: data.stripeSubscriptionId,
    },
    update: {
      status: data.status,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      latestInvoiceId: data.latestInvoiceId,
    },
    create: {
      userId: data.userId,
      planId: data.planId,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      status: data.status,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      latestInvoiceId: data.latestInvoiceId,
    },
  });
}

/**
 * getPlanBySlug(slug)
 * Retrieves a plan by its slug
 */
export async function getPlanBySlug(slug: string) {
  return prisma.plan.findUnique({
    where: { slug },
  });
}

/**
 * listActivePlans()
 * Returns all active subscription plans
 */
export async function listActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: 'asc' },
  });
}

/**
 * updateUserStripeCustomerId(userId, stripeCustomerId)
 * Updates the user's Stripe customer ID
 */
export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId },
  });
}

/**
 * getUserById(userId)
 * Retrieves a user by ID
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

/**
 * listUserBookings(userId, filter)
 * Server-side filtering for portal views.
 */
export async function listUserBookings(
  userId: string, 
  filter: 'UPCOMING' | 'PAST' | 'CANCELED' = 'UPCOMING'
) {
  const now = new Date();
  let where: Prisma.BookingWhereInput = { userId };

  if (filter === 'UPCOMING') {
    where = {
      ...where,
      startTime: { gt: now },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PAID] },
    };
  } else if (filter === 'PAST') {
    where = {
      ...where,
      startTime: { lt: now },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PAID] },
    };
  } else if (filter === 'CANCELED') {
    where = {
      ...where,
      status: BookingStatus.CANCELLED,
    };
  }

  return prisma.booking.findMany({
    where,
    include: {
      room: true,
      lineItems: {
        where: { serviceId: null } // Only get the package line item for the list view
      }
    },
    orderBy: { startTime: filter === 'UPCOMING' ? 'asc' : 'desc' },
  });
}

/**
 * getBookingDetailForUser(userId, bookingId)
 * Strict relational ownership check.
 */
export async function getBookingDetailForUser(userId: string, bookingId: string) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: userId,
    },
    include: {
      room: true,
      lineItems: true,
      assets: true,
      invoice: true,
    },
  });
}

/**
 * listUserInvoices(userId)
 */
export async function listUserInvoices(userId: string) {
  return prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      booking: true,
    }
  });
}

/**
 * markBookingPaidEmailSent(bookingId)
 */
export async function markBookingPaidEmailSent(bookingId: string) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { bookingPaidEmailSentAt: new Date() },
  });
}

/**
 * markSubscriptionActiveEmailSent(subscriptionId)
 */
export async function markSubscriptionActiveEmailSent(subscriptionId: string) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { subscriptionActiveEmailSentAt: new Date() },
  });
}
