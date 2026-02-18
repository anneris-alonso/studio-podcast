import { createHash, randomInt } from 'node:crypto';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/server/email/mailer';

const SESSION_COOKIE_NAME = 'studio_session';
const SESSION_EXPIRY_DAYS = 7;
const OTP_EXPIRY_MINUTES = 10;

/**
 * SHA-256 Hashing utility
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a 6-digit OTP, hashes it, and saves it to the DB.
 * Sends the plain code via email.
 */
export async function requestOtp(email: string) {
  const otp = randomInt(100000, 999999).toString();
  const hashedOtp = hashToken(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Clear any existing tokens for this identifier to prevent clutter
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedOtp,
      expiresAt,
    },
  });

  // Send via SMTP using the existing mailer
  await sendEmail({
    to: email,
    subject: "Your Studio Suite Login Code",
    text: `Your login code is: ${otp}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>Your login code is: <strong>${otp}</strong></p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
  });

  logger.info("OTP sent successfully", { email });
  return { success: true };
}

/**
 * Validates the OTP, deletes it, and creates a session.
 */
export async function verifyOtp(email: string, otp: string) {
  const hashedOtp = hashToken(otp);

  const vt = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token: hashedOtp,
      expiresAt: { gt: new Date() },
    },
  });

  if (!vt) {
    logger.warn("Invalid or expired OTP attempt", { email });
    return { success: false, error: "invalid_code" };
  }

  // Delete the token immediately after use
  await prisma.verificationToken.delete({
    where: { token: hashedOtp },
  });

  // Ensure user exists or create them (Minimal Onboarding)
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0], // Default name
        role: 'CLIENT',
      },
    });
  }

  // Create Session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  // Set Cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: session.expiresAt,
  });

  logger.info("User logged in successfully", { userId: user.id, email });
  return { success: true, user };
}

/**
 * Retrieves the current session and user.
 * Enforces expiration and auto-deletes expired sessions.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return null;

  // Check Expiration
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return session;
}

/**
 * Destroys the current session.
 */
export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  return { success: true };
}
