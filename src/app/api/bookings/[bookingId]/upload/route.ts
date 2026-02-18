import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { localStorageProvider } from '@/server/storage/localStorage';
import { AssetKind, UserRole } from '@prisma/client';
import { crypto } from 'crypto';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const { bookingId } = params;

  try {
    // 1. Authentication & Authorization (Placeholder - assumes userId in headers for now)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const kind = formData.get('kind') as AssetKind;

    if (!file || !kind) {
      return NextResponse.json({ error: 'Missing file or asset kind' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds limit (50MB)' }, { status: 400 });
    }

    if (!Object.values(AssetKind).includes(kind)) {
      return NextResponse.json({ error: 'Invalid asset kind' }, { status: 400 });
    }

    // 3. Validate Booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 4. Generate storageKey and Save File
    const fileUuid = crypto.randomUUID();
    const storageKey = `booking/${bookingId}/${fileUuid}`;
    
    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let assetCreated = false;
    try {
      // Save to local storage
      await localStorageProvider.save(buffer, storageKey);
      
      // 5. Create Asset in DB
      const asset = await prisma.asset.create({
        data: {
          bookingId,
          kind,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          storageKey,
        }
      });
      assetCreated = true;

      return NextResponse.json({
        message: 'File uploaded successfully',
        asset: {
          id: asset.id,
          filename: asset.filename,
          kind: asset.kind,
          createdAt: asset.createdAt
        }
      });

    } catch (saveError: any) {
      console.error('File save or DB error:', saveError);
      
      // Idempotency / Cleanup: If we saved the file but DB failed, delete the file
      if (!assetCreated) {
        try {
          await localStorageProvider.delete(storageKey);
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
        }
      }
      
      return NextResponse.json({ error: 'Failed to save asset' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
