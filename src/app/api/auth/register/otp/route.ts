import { NextRequest, NextResponse } from "next/server";
import { requestRegistrationOtp } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || "unknown";

  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "invalid_email", requestId }, { status: 400 });
    }

    // Rate Limit
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const { limited, retryAfterMs } = await rateLimit(`reg-otp:${ip}`, 3, 60000); 
    if (limited) {
      return NextResponse.json({ error: "rate_limited", retryAfterMs }, { status: 429 });
    }

    const result = await requestRegistrationOtp(email);
    if (!result.success) {
      return NextResponse.json({ error: result.error, requestId }, { status: 400 });
    }

    return NextResponse.json({ success: true, requestId });
  } catch (error: any) {
    logger.error("Registration OTP Request failed", { requestId, error: error.message });
    return NextResponse.json({ error: "internal_error", requestId }, { status: 500 });
  }
}
