import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('brainstormer_session')?.value;
  const { pathname } = request.nextUrl;

  // Paths that don't need authentication
  const isAuthRoute = pathname.startsWith('/api/auth') || pathname.startsWith('/auth');
  const isPublicRoute = pathname === '/' || pathname.startsWith('/_next') || pathname.includes('.');

  if (isAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  // Protect internal routes
  const isProtectedRoute = pathname.startsWith('/project') || pathname.startsWith('/api');

  if (isProtectedRoute) {
    if (!sessionId) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Validate session
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        console.error('DATABASE_URL is not set');
        return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
      }
      const sql = neon(dbUrl);
      
      const rows = await sql`
        SELECT "userId" 
        FROM neon_auth.session 
        WHERE id = ${sessionId} AND "expiresAt" > NOW()
        LIMIT 1
      `;

      if (rows.length === 0) {
        if (pathname.startsWith('/api')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('brainstormer_session');
        return response;
      }

      // Session is valid.
      // We can't directly modify request headers for the destination route in standard Next.js middleware
      // but we can set it for the response or rewrite.
      // Actually, Next.js allows adding headers to the request using the `request.headers` clone.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', rows[0].userId as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Middleware session validation error:', error);
      // If DB is down, we might want to allow the request but without a user, 
      // or block it. For internal routes, blocking is safer.
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/project/:path*',
  ],
};
