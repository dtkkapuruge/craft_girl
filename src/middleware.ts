import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. /admin පේජ් එකට යන්න හදනවා නම් සහ /admin/login නෙවෙයි නම්
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminSession = request.cookies.get('admin_session');

    // 2. සෙෂන් එක නැත්නම් /admin/login වෙත යවන්න
    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};