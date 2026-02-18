import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { UserRole } from '@prisma/client';
import { getSession } from './auth';

/**
 * Returns the current session user or null.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Enforces that a user is authenticated.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("unauthorized");
  }
  return user;
}

/**
 * Enforces that the current user is an Admin or Super Admin.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    throw new Error("forbidden");
  }

  return user;
}

/**
 * Enforces that the current user is a Super Admin.
 */
export async function requireSuperAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error("forbidden");
  }

  return user;
}

/**
 * Enforces that the user owns the booking or is an admin.
 */
export async function requireBookingOwnerOrAdmin(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");

  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    return user;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { userId: true }
  });

  if (!booking || booking.userId !== user.id) {
    throw new Error("forbidden");
  }

  return user;
}

/**
 * Enforces that the user owns the asset (via booking) or is an admin.
 */
export async function requireAssetOwnerOrAdmin(assetId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");

  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    return user;
  }

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { booking: true }
  });

  if (!asset || asset.booking.userId !== user.id) {
    throw new Error("forbidden");
  }

  return user;
}
