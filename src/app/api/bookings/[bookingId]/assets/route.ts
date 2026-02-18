import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const { bookingId } = params;

  try {
    // 1. Auth check (Placeholder - assumes userId in headers)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Fetch Booking and Check Permissions
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only Owner or Admin can see assets
    const isOwner = booking.userId === userId;
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Fetch Assets
    const assets = await prisma.asset.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(assets);

  } catch (error: any) {
    console.error('Assets list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
