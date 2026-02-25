import { NextResponse } from "next/server";
import { getStudioReviews, createReview } from "@/server/data-access";
import { z } from "zod";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // We receive the studio slug, but reviews are indexed by studioRoomId.
    // First resolve the studio by slug to get its id.
    const { getStudioRoomBySlug } = await import("@/server/data-access");
    const studio = await getStudioRoomBySlug(params.slug);
    if (!studio) return NextResponse.json({ error: "Studio not found" }, { status: 404 });

    const data = await getStudioReviews(studio.id);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

const ReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(500),
  authorName: z.string().min(1).max(80),
  userId: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { getStudioRoomBySlug } = await import("@/server/data-access");
    const studio = await getStudioRoomBySlug(params.slug);
    if (!studio) return NextResponse.json({ error: "Studio not found" }, { status: 404 });

    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    await createReview({ studioRoomId: studio.id, ...parsed.data });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
