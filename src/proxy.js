import { NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isOperatorRoute = pathname.startsWith('/operator');

  if (isAdminRoute || isOperatorRoute) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'unauthenticated');
      return NextResponse.redirect(loginUrl);
    }

    // Role verification
    if (session.role === 'citizen') {
      const dashboardUrl = new URL('/track', request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    if (isAdminRoute && session.role !== 'admin') {
      // Operator tried to access admin route: redirect to operator workbench
      return NextResponse.redirect(new URL('/operator', request.url));
    }

    if (isOperatorRoute && session.role !== 'operator' && session.role !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/operator/:path*'],
};

