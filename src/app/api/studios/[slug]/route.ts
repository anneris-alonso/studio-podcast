import { NextResponse } from "next/server";
import { getStudioRoomBySlug } from "@/server/data-access";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const studio = await getStudioRoomBySlug(slug);
    
    if (!studio) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 });
    }
    
    return NextResponse.json(studio);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch studio" }, { status: 500 });
  }
}
