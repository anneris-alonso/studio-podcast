import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rateLimit';

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const startTime = Date.now();

  // 1. Determine Client IP (TRUST_PROXY check)
  const trustProxy = process.env.TRUST_PROXY === 'true';
  let ip = '127.0.0.1';
  
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (trustProxy && forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  } else {
    // Fallback to headers or a default if request.ip is unavailable in this environment
    ip = forwardedFor?.split(',')[0].trim() || '127.0.0.1';
  }

  const { pathname } = request.nextUrl;

  // 2. Selectively Apply Rate Limiting
  // Sensitive endpoints require stricter limits.
  const sensitivePaths = [
    '/api/bookings',
    '/api/payments/checkout-session',
    '/api/subscriptions/checkout-session',
    '/api/subscriptions/customer-portal'
  ];

  const isSensitive = sensitivePaths.some(p => pathname.startsWith(p)) && request.method === 'POST';
  const isWebhook = pathname.startsWith('/api/stripe/webhook');

  if (isSensitive || isWebhook) {
    // Webhooks get a much higher limit to avoid blocking retries
    const limit = isWebhook ? 1000 : undefined; 
    const key = `${ip}:${pathname}`;
    
    const { limited, retryAfterMs } = await rateLimit(key, limit);

    if (limited) {
      return NextResponse.json(
        { 
          error: 'rate_limited', 
          message: 'Too many requests, please try again later.',
          retryAfterMs,
          requestId 
        },
        { status: 429 }
      );
    }
  }

  // 3. Prepare Response
  const response = NextResponse.next();

  // 4. Propagate Request ID
  response.headers.set('x-request-id', requestId);

  // 5. Add Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Conservative CSP (allows Stripe and self)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; frame-src https://js.stripe.com; connect-src 'self' https://api.stripe.com; img-src 'self' data: https:;"
  );

  return response;
}

// Ensure middleware doesn't run on static assets
export const config = {
  matcher: '/api/:path*',
};
