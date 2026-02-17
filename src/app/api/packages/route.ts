import { NextRequest, NextResponse } from "next/server";
import { listPackages } from "@/server/data-access";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomIdStr = searchParams.get("studioRoomId");
  const roomId = roomIdStr ? parseInt(roomIdStr, 10) : undefined;

  try {
    const packages = await listPackages(roomId);
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}
