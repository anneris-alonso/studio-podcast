import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await logout();
  // Redirect to login page after logout
  return NextResponse.redirect(new URL("/login", request.url));
}
