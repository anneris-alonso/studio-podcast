import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rateLimit';

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const startTime = Date.now();

  const { pathname } = request.nextUrl;

  // 1. Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(`https://${request.headers.get('host')}${pathname}`, 301);
  }

  // 2. Determine Client IP (TRUST_PROXY check)
  const trustProxy = process.env.TRUST_PROXY === 'true';
  let ip = '127.0.0.1';
  
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (trustProxy && forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  } else {
    // Fallback to headers or a default if request.ip is unavailable in this environment
    ip = forwardedFor?.split(',')[0].trim() || '127.0.0.1';
  }

  // 3. Selectively Apply Rate Limiting
  if (pathname === '/api/auth/otp' && request.method === 'POST') {
    const { limited, retryAfterMs } = await rateLimit(`otp-ip:${ip}`, 5, 60000);
    if (limited) {
      return NextResponse.json({ 
        error: 'rate_limited', 
        message: 'Too many OTP requests. Please wait.',
        retryAfterMs,
        requestId 
      }, { status: 429 });
    }
  }

  const isWebhook = pathname.startsWith('/api/stripe/webhook');
  if (isWebhook) {
    const { limited, retryAfterMs } = await rateLimit(`webhook:${ip}`, 1000, 60000);
    if (limited) {
      return NextResponse.json({ error: 'rate_limited', requestId }, { status: 429 });
    }
  }

  // 3. Auth Redirects (Pages Only)
  const isAdminPath = pathname.startsWith('/admin');
  const isAccountPath = pathname.startsWith('/account');
  const isLoginPage = pathname === '/login';
  const sessionCookie = request.cookies.get('studio_session');
  
  if (!sessionCookie) {
    if (isAdminPath || isAccountPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } else if (isLoginPage) {
    return NextResponse.redirect(new URL('/account/bookings', request.url));
  }

  // 4. Prepare Response
  const response = NextResponse.next();

  // 4. Propagate Request ID
  response.headers.set('x-request-id', requestId);

  // 5. Add Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Permissive CSP for development (allows framer-motion, Stripe, and fonts)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src https://js.stripe.com; " +
    "connect-src 'self' https://api.stripe.com blob:; " +
    "img-src 'self' data: https: blob:;"
  );

  return response;
}

// Match all paths except static assets and next internals
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
