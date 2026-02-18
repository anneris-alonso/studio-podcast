import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationOtpOnly, login, hashToken } from "@/lib/auth"; // Accessing standard login logic
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || "unknown";

  try {
    const { email, otp, password, name } = await request.json();

    if (!email || !otp || !password || !name) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    // 1. Verify OTP
    const otpVerification = await verifyRegistrationOtpOnly(email, otp);
    if (!otpVerification.success) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create User
    // Double check user doesn't exist (race condition safety)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
       return NextResponse.json({ error: "user_exists" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "CLIENT",
      },
    });

    // 4. Delete OTP
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    // 5. Log them in automatically
    // reuse logic from login but manually to avoid re-fetching or just call login
    // calling login from auth.ts is cleaner but requires re-fetching user. 
    // Let's just create session directly since we have the user.
    const session = await prisma.session.create({
        data: {
          userId: newUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    
    const cookieStore = await cookies();
    cookieStore.set('studio_session', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: session.expiresAt,
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, role: newUser.role } });

  } catch (error: any) {
    logger.error("Registration Completion failed", { requestId, error: error.message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
