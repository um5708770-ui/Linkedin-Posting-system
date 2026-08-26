import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If user tries to access /login, redirect directly to dashboard /
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow direct access to all pages and API routes without password/authentication
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
