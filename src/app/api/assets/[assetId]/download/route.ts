import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { localStorageProvider } from '@/server/storage/localStorage';
import { UserRole } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  const { assetId } = params;

  try {
    // 1. Auth check (Placeholder - assumes userId in headers)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // 2. Fetch Asset & Booking to verify permission
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        booking: {
          select: { userId: true }
        }
      }
    });

    if (!asset) {
      return new Response('Asset not found', { status: 404 });
    }

    // Check Authorization BEFORE streaming
    const isOwner = asset.booking.userId === userId;
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      return new Response('Forbidden', { status: 403 });
    }

    // 3. Stream File
    try {
      const stream = await localStorageProvider.getStream(asset.storageKey);
      
      // Sanitize filename for Content-Disposition
      const safeFilename = asset.filename.replace(/[^a-zA-Z0-9.-]/g, '_');

      // Create valid Response with stream
      // Node Readable to Web ReadableStream
      const webStream = (stream as any).toWeb ? (stream as any).toWeb() : stream;

      return new Response(webStream, {
        headers: {
          'Content-Type': asset.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'Cache-Control': 'private, no-store',
        }
      });

    } catch (storageError: any) {
      console.error('Storage stream error:', storageError);
      return new Response('Failed to stream file', { status: 500 });
    }

  } catch (error: any) {
    console.error('Download route error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
