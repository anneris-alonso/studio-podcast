import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { localStorageProvider } from '@/server/storage/localStorage';
import { UserRole } from '@prisma/client';

import { requireAssetOwnerOrAdmin } from '@/lib/auth-guards';

export async function GET(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  const { assetId } = await params;

  try {
    try {
      await requireAssetOwnerOrAdmin(assetId);
    } catch (e: any) {
      if (e.message === "unauthorized") return new Response('Unauthorized', { status: 401 });
      if (e.message === "forbidden") return new Response('Forbidden', { status: 403 });
      throw e;
    }

    // 2. Fetch Asset to get storage key
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      return new Response('Asset not found', { status: 404 });
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
