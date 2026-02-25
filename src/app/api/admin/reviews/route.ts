import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all reviews (for admin)
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        studioRoom: { select: { name: true } },
      },
    });
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// PATCH to approve/reject a review
export async function PATCH(req: Request) {
  try {
    const { id, isApproved } = await req.json();
    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE a review
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
