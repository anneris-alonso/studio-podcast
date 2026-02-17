import { NextResponse } from "next/server";
import { listActiveServices } from "@/server/data-access";

export async function GET() {
  try {
    const services = await listActiveServices();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
