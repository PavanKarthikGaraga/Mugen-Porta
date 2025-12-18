import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

export async function proxy(request) {
    const pathname = request.nextUrl.pathname;

    // Check if the request is for auth routes (login, register, etc.)
    if (pathname.startsWith('/auth/')) {
        const token = request.cookies.get('tck')?.value;

        // If user is logged in and trying to access auth pages, redirect to dashboard
        if (token) {
            try {
                const payload = await verifyToken(token);

                if (payload) {
                    // Redirect logged-in users to their respective dashboards
                    return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.url));
                }
            } catch (error) {
                // Token is invalid, continue to auth page
                console.log('Invalid token in auth route, allowing access');
            }
        }
    }

    // Check if the request is for dashboard routes
    if (pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('tck')?.value;

        if (!token) {
            // Redirect to login if no token
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        try {
            const payload = await verifyToken(token);
            
            // Check if token verification failed (expired or invalid)
            if (!payload) {
                return NextResponse.redirect(new URL('/auth/login', request.url));
            }
            
            // Check if accessing admin routes
            if (pathname.startsWith('/dashboard/admin')) {
                if (payload.role !== 'admin') {
                    // Redirect to regular dashboard if not admin
                    return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.url));
                }
            }

            if (pathname.startsWith('/dashboard/lead')) {
                if (payload.role !== 'lead') {
                    return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.url));
                }
            }

            if (pathname.startsWith('/dashboard/faculty')) {
                if (payload.role !== 'faculty') {
                    return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.url));
                }
            }

            if (pathname.startsWith('/dashboard/student')) {
                if (payload.role !== 'student') {
                    return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.url));
                }
            }

            // Allow access if token is valid
            return NextResponse.next();
        } catch (error) {
            console.error('Middleware token verification failed:', error);
            // Redirect to login if token is invalid
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*']
};
