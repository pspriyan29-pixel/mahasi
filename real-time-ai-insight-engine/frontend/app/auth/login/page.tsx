'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        // Check if user is already logged in
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.push('/dashboard');
            }
        });
    }, [router, supabase.auth]);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                toast.error('Error signing in with Google: ' + error.message);
                setLoading(false);
            }
            // If successful, user will be redirected to OAuth provider
        } catch (error: any) {
            toast.error('An error occurred: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

            <Card className="w-full max-w-md glass border-gray-700 relative z-10">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-white">Welcome Back</CardTitle>
                        <CardDescription className="text-gray-400 mt-2 text-sm sm:text-base">
                            Sign in to access your AI Insight Engine dashboard
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                    <Button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-6 sm:py-7 text-sm sm:text-base touch-manipulation"
                        size="lg"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-800 px-2 text-gray-400">Quick Access</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-3">
                            Don't have an account?{' '}
                            <a
                                href="/register"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Sign up
                            </a>
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-700" />
                        </div>
                    </div>

                    <div className="text-center text-xs sm:text-sm text-gray-400">
                        <p className="mb-2">Need help? Contact us:</p>
                        <div className="space-y-1">
                            <a
                                href="mailto:infomahasi@gmail.com"
                                className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors touch-manipulation py-2"
                            >
                                <Mail className="w-4 h-4" />
                                <span className="break-all">infomahasi@gmail.com</span>
                            </a>
                            <p className="text-gray-500">+62 853-7896-3269</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

