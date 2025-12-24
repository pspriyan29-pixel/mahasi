import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const error_description = requestUrl.searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
        console.error('OAuth error:', error, error_description);
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error_description || error)}`, request.url)
        );
    }

    if (!code) {
        console.error('No code provided in OAuth callback');
        return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    try {
        const cookieStore = await cookies();

        // Create regular client for auth
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        // Exchange code for session
        const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
            console.error('Session exchange error:', sessionError);
            return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
        }

        if (!session?.user) {
            console.error('No user in session after exchange');
            return NextResponse.redirect(new URL('/login?error=no_user', request.url));
        }

        console.log('OAuth successful for user:', session.user.id);

        // Check if user has a profile
        const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            // PGRST116 is "not found" which is expected for new users
            console.error('Profile check error:', profileCheckError);
        }

        // Create profile if it doesn't exist (for OAuth users)
        if (!existingProfile) {
            console.log('Creating profile for new OAuth user:', session.user.id);

            // Use service role client to bypass RLS
            const supabaseAdmin = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    cookies: {
                        get(name: string) {
                            return cookieStore.get(name)?.value;
                        },
                        set(name: string, value: string, options: CookieOptions) {
                            cookieStore.set({ name, value, ...options });
                        },
                        remove(name: string, options: CookieOptions) {
                            cookieStore.set({ name, value: '', ...options });
                        },
                    },
                }
            );

            // Extract name from metadata with multiple fallbacks
            const fullName =
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.user_metadata?.display_name ||
                session.user.email?.split('@')[0] ||
                'User';

            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: fullName,
                    role: 'student', // Default role for OAuth users
                    avatar_url: session.user.user_metadata?.avatar_url ||
                        session.user.user_metadata?.picture ||
                        null,
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Don't fail the login, user can update profile later
                // But log it for debugging
            } else {
                console.log('Profile created successfully for user:', session.user.id);
            }
        } else {
            console.log('Existing profile found for user:', session.user.id);
        }

        // Successful authentication - redirect to dashboard
        console.log('Redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));

    } catch (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(
            new URL('/login?error=unexpected', request.url)
        );
    }
}
