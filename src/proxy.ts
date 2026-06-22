import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-super-secret-key-at-least-32-chars-long'
);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get('session')?.value;

  let session = null;
  if (sessionToken) {
    try {
      const { payload } = await jose.jwtVerify(sessionToken, JWT_SECRET);
      session = payload;
    } catch {
      // Invalid token
    }
  }

  const isAppRoute = pathname.startsWith('/app');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  if (isAppRoute && !session) {
    // Redirect to login if trying to access app and not logged in
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && session) {
    // Redirect to app dashboard if already logged in
    const dashboardUrl = new URL('/app/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/app/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/app/:path*', '/login', '/register'],
};
