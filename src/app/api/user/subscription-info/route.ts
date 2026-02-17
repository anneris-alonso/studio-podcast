import { NextRequest, NextResponse } from "next/server";
import { getActiveSubscription, getCreditBalanceMinutes } from "@/server/data-access";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const subscription = await getActiveSubscription(userId);
    const balance = await getCreditBalanceMinutes(userId);

    return NextResponse.json({
      subscription,
      credits: {
        balance,
      },
    });
  } catch (error: any) {
    console.error("Error fetching subscription info:", error);
    return NextResponse.json({ error: "Failed to fetch subscription info" }, { status: 500 });
  }
}
