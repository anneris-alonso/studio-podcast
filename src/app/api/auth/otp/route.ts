import { NextRequest, NextResponse } from "next/server";
import { requestOtp } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || "unknown";
  
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "invalid_email", requestId }, { status: 400 });
    }

    // Rate Limiting (Per IP + Email)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const limitKey = `otp:${ip}:${email}`;
    const { limited, retryAfterMs } = await rateLimit(limitKey, 5, 60000); // 5 attempts per minute per email/ip

    if (limited) {
      return NextResponse.json({ 
        error: "rate_limited", 
        message: "Too many OTP requests. Please wait.",
        retryAfterMs,
        requestId 
      }, { status: 429 });
    }

    await requestOtp(email);

    return NextResponse.json({ success: true, requestId });
  } catch (error: any) {
    logger.error("OTP Request failed", { requestId, error: error.message });
    return NextResponse.json({ error: "internal_error", requestId }, { status: 500 });
  }
}
