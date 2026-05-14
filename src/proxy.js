import { NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/checkout', '/payment', '/orders'];
// Routes only accessible by admins
const ADMIN_ROUTES = ['/admin'];

export function proxy(request) {
    const { pathname } = request.nextUrl;

    const sessionCookie = request.cookies.get('__session')?.value;
    const isAuthed = !!sessionCookie;

    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        if (!isAuthed) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
        if (!isAuthed) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/checkout/:path*',
        '/payment/:path*',
        '/orders/:path*',
        '/admin/:path*',
    ],
};
