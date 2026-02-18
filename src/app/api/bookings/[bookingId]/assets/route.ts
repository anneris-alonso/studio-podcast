import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { UserRole } from '@prisma/client';

import { requireBookingOwnerOrAdmin } from '@/lib/auth-guards';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const { bookingId } = await params;
  const requestId = request.headers.get("x-request-id") || "unknown";

  try {
    await requireBookingOwnerOrAdmin(bookingId);

    // 3. Fetch Assets
    const assets = await prisma.asset.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(assets);

  } catch (error: any) {
    if (error.message === "unauthorized") return NextResponse.json({ error: "unauthorized", requestId }, { status: 401 });
    if (error.message === "forbidden") return NextResponse.json({ error: "forbidden", requestId }, { status: 403 });
    console.error('Assets list error:', error);
    return NextResponse.json({ error: 'Internal server error', requestId }, { status: 500 });
  }
}
