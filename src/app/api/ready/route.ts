import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const head = await headers();
  const requestId = head.get('x-request-id');

  try {
    // Lightweight check: find any user ID
    await prisma.user.findFirst({ select: { id: true } });

    return NextResponse.json({
      status: 'ready',
      database: 'connected',
      requestId
    });
  } catch (err: any) {
    // Log error securely (don't log the full error object if it might contain sensitive info)
    logger.error('Database readiness check failed', { 
      requestId, 
      error: err.message || 'Unknown database error' 
    });

    return NextResponse.json({
      error: 'service_unavailable',
      message: 'Database connection failed',
      requestId
    }, { status: 503 });
  }
}
