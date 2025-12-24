'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import Background3D from '@/components/Background3D';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn, signInWithGoogle, signInAndRedirect } = useAuth();
    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    // Handle OAuth errors from callback
    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            let errorMessage = 'Login gagal. Silakan coba lagi.';

            switch (error) {
                case 'auth_failed':
                    errorMessage = 'Autentikasi gagal. Silakan coba lagi.';
                    break;
                case 'no_code':
                    errorMessage = 'Kode autentikasi tidak ditemukan.';
                    break;
                case 'no_user':
                    errorMessage = 'Pengguna tidak ditemukan setelah autentikasi.';
                    break;
                case 'unexpected':
                    errorMessage = 'Terjadi kesalahan yang tidak terduga.';
                    break;
                default:
                    errorMessage = decodeURIComponent(error);
            }

            toast.error(errorMessage);
            // Clear error from URL
            router.replace('/login');
        }
    }, [searchParams, toast, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password) {
            toast.error('Email dan password harus diisi');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Format email tidak valid');
            return;
        }

        setLoading(true);

        try {
            const success = await signInAndRedirect(formData.email, formData.password);
            if (success) {
                toast.success('Login berhasil! Mengarahkan ke dashboard...');
                // Use replace to prevent back button issues
                router.replace('/dashboard');
            } else {
                toast.error('Login gagal. Sesi tidak dapat dibuat. Silakan coba lagi.');
            }
        } catch (err: any) {
            console.error('Login error:', err);

            // Better error messages
            let errorMessage = 'Login gagal. Silakan coba lagi.';
            if (err.message?.includes('Invalid login credentials')) {
                errorMessage = 'Email atau password salah';
            } else if (err.message?.includes('Email not confirmed')) {
                errorMessage = 'Email belum diverifikasi. Cek inbox Anda.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            // User will be redirected to Google OAuth page
            // After authorization, Google redirects to /auth/callback
            // Callback route will handle profile creation and redirect to dashboard
        } catch (err: any) {
            console.error('Google OAuth error:', err);
            toast.error(err.message || 'Gagal memulai login Google. Silakan coba lagi.');
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Loading Overlay */}
            {loading && <LoadingSpinner overlay />}

            {/* 3D Background */}
            <Background3D variant="purple" intensity="low" />

            {/* Login Card */}
            <div className="w-full max-w-md relative z-10">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Beranda
                </Link>

                <div className="glass-strong rounded-3xl p-8 animate-scale-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            Selamat <span className="gradient-text">Datang</span>
                        </h1>
                        <p className="text-gray-400">Masuk ke akun Anda untuk melanjutkan</p>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-3 px-4 glass hover:glass-strong rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Masuk dengan Google
                        </button>


                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 glass-strong text-gray-400">Atau masuk dengan email</span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    placeholder="nama@email.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-12 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                                    disabled={loading}
                                />
                                <span className="text-sm text-gray-400">Ingat saya</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                Lupa password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" color="white" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="text-center text-gray-400 mt-6">
                        Belum punya akun?{' '}
                        <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            Daftar Sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
