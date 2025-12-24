import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export async function middleware(request: NextRequest) {
    // Rate limiting for API and auth routes
    const shouldRateLimit =
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/register';

    if (shouldRateLimit) {
        const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anonymous';
        const now = Date.now();
        const limit = rateLimit.get(ip);

        if (limit && now < limit.resetTime) {
            if (limit.count >= 100) { // 100 requests per minute
                return new NextResponse('Too Many Requests', {
                    status: 429,
                    headers: { 'Retry-After': String(Math.ceil((limit.resetTime - now) / 1000)) }
                });
            }
            limit.count++;
        } else {
            rateLimit.set(ip, { count: 1, resetTime: now + 60000 });
        }
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Protected routes
    const protectedRoutes = ['/dashboard', '/instructor', '/admin'];
    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access control
    if (session) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, email')
            .eq('id', session.user.id)
            .single();

        // Admin routes
        if (request.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Instructor routes - ONLY for specific email
        const INSTRUCTOR_EMAIL = 'perdhanariyan@gmail.com';
        if (request.nextUrl.pathname.startsWith('/instructor')) {
            // Check if user email matches instructor email OR is admin
            if (session.user.email !== INSTRUCTOR_EMAIL && profile?.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
