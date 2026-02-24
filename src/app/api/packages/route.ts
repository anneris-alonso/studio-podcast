import { NextRequest, NextResponse } from "next/server";
import { listPackages } from "@/server/data-access";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("studioRoomId") || undefined;

  try {
    const packages = await listPackages(roomId);
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}
