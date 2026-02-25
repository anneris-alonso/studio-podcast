"use server";

import { getStudioReviews, createReview } from "@/server/data-access";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ReviewSchema = z.object({
  studioRoomId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(500),
  authorName: z.string().min(1, "Name is required").max(80),
  userId: z.string().optional(),
});

export async function submitReview(formData: {
  studioRoomId: string;
  rating: number;
  comment: string;
  authorName: string;
  userId?: string;
}) {
  const parsed = ReviewSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  await createReview(parsed.data);

  revalidatePath(`/studios/${formData.studioRoomId}`);

  return { success: true };
}

export { getStudioReviews };
