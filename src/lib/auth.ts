import prisma from '@/lib/db';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import { createHash, randomInt } from 'node:crypto';
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
 * Generates an OTP for REGISTRATION.
 */
export async function requestRegistrationOtp(email: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: "user_exists" };
  }

  const otp = randomInt(100000, 999999).toString();
  const hashedOtp = hashToken(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Clear existing tokens
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

  // Log OTP (ALWAYS VISIBLE FOR DEBUGGING)
  console.log("\n\n========================================================");
  console.log(`🔑 REGISTRATION OTP FOR ${email}: ${otp}`);
  console.log("========================================================\n\n");
  logger.info("Generated Use Registration OTP", { email, code: otp });

  // Send Email
  if (process.env.SMTP_HOST) {
    try {
      await sendEmail({
        to: email,
        subject: "Your Studio Suite Registration Code",
        text: `Your registration code is: ${otp}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        html: `<p>Your registration code is: <strong>${otp}</strong></p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
      });
    } catch (err: any) {
      logger.error("Failed to send Registration OTP", { email, error: err.message });
       if (process.env.NODE_ENV === 'production') throw err;
    }
  }

  return { success: true };
}

/**
 * Verifies the OTP and creates the user (without password initially, or we handle password setting in a separate step).
 * For simplicity in this flow: Verify OTP -> User enters Password -> Create User.
 * So this function just verifies validity.
 */
export async function verifyRegistrationOtpOnly(email: string, otp: string) {
  const hashedOtp = hashToken(otp);
  const vt = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token: hashedOtp,
      expiresAt: { gt: new Date() },
    },
  });

  if (!vt) return { success: false, error: "invalid_code" };

  // Valid. Code is good. We don't delete it yet, we delete it when they actually create the account with password.
  // Or better: Delete it and return a "registration_token" (signed) that allows /api/auth/complete-registration to work.
  // For simplicity: We will accept the OTP + Password in one "Finalize Registration" call, 
  // OR we keep it simple: Client sends Email + OTP + Name + Password to /api/auth/register-complete.
  
  return { success: true };
}

/**
 * Validates the credentials and creates a session.
 */
export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ 
    where: { email } 
  });

  if (!user || !user.passwordHash) {
    logger.warn("Login attempt failed: User not found or no password set", { email });
    return { success: false, error: "invalid_credentials" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    logger.warn("Login attempt failed: Invalid password", { email });
    return { success: false, error: "invalid_credentials" };
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
