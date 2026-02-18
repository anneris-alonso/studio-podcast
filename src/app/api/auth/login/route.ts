import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || "unknown";

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "missing_fields", requestId }, { status: 400 });
    }

    const result = await login(email, password);

    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.error || "login_failed", requestId }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: result.user.id, role: result.user.role },
      requestId 
    });
  } catch (error: any) {
    logger.error("Login failed", { requestId, error: error.message });
    return NextResponse.json({ error: "internal_error", requestId }, { status: 500 });
  }
}
