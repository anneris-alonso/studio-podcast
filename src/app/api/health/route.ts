import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const head = await headers();
  const requestId = head.get('x-request-id');

  return NextResponse.json({
    status: 'ok',
    env: process.env.APP_ENV || 'development',
    timestamp: new Date().toISOString(),
    requestId
  });
}
