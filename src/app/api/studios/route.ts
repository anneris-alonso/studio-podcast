import { NextResponse } from "next/server";
import { listStudioRooms } from "@/server/data-access";

export async function GET() {
  try {
    const studios = await listStudioRooms();
    return NextResponse.json(studios);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch studios" }, { status: 500 });
  }
}
