'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, ArrowLeft, ArrowRight, UserCircle, GraduationCap } from 'lucide-react';
import Background3D from '@/components/Background3D';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const { signUp, signInWithGoogle, signUpAndRedirect } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' as const, // Always student, instructor access restricted
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter');
            setLoading(false);
            return;
        }

        try {
            const success = await signUpAndRedirect(formData.email, formData.password, formData.fullName, formData.role);
            if (success) {
                setError('Registrasi berhasil! Mengarahkan ke dashboard... 🎉');
                // Use replace to prevent back button issues
                router.replace('/dashboard');
            } else {
                setError('Registrasi gagal. Sesi tidak dapat dibuat. Silakan coba lagi.');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            // User will be redirected to Google OAuth page
            // After authorization, Google redirects to /auth/callback
            // Callback route will handle profile creation and redirect to dashboard
        } catch (err: any) {
            console.error('Google OAuth error:', err);
            setError(err.message || 'Gagal memulai pendaftaran Google. Silakan coba lagi.');
            setLoading(false);
        }
    };



    const nextStep = () => {
        if (step < 2) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* 3D Background */}
            <Background3D variant="pink" intensity="low" />

            {/* Register Card */}
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
                            Daftar <span className="gradient-text">Akun Baru</span>
                        </h1>
                        <p className="text-gray-400">Mulai perjalanan coding kamu sekarang!</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step >= 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'glass'
                                }`}>
                                1
                            </div>
                            <div className={`w-16 h-1 transition-all ${step >= 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-700'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step >= 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'glass'
                                }`}>
                                2
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Basic Info & Role */}
                        {step === 1 && (
                            <div className="space-y-4 animate-fade-in">
                                {/* OAuth Buttons */}
                                <div className="space-y-3 mb-6">
                                    <button
                                        type="button"
                                        onClick={handleGoogleSignup}
                                        disabled={loading}
                                        className="w-full py-3 px-4 glass hover:glass-strong rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Daftar dengan Google
                                    </button>

                                </div>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-700"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-gray-900/50 text-gray-400">Atau dengan email</span>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="input-premium pl-12"
                                            placeholder="John Doe"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input-premium pl-12"
                                            placeholder="nama@email.com"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Info: Registering as Student */}
                                <div className="p-4 glass rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="w-6 h-6 text-purple-400" />
                                        <div>
                                            <p className="font-semibold">Daftar sebagai Mahasiswa</p>
                                            <p className="text-sm text-gray-400">Akses lomba dan kompetisi mahasiswa</p>
                                        </div>
                                    </div>
                                </div>

                                <button type="button" onClick={nextStep} className="btn-primary w-full" disabled={loading}>
                                    Lanjut
                                    <ArrowRight className="w-5 h-5 inline ml-2" />
                                </button>
                            </div>
                        )}

                        {/* Step 2: Password */}
                        {step === 2 && (
                            <div className="space-y-4 animate-fade-in">
                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="input-premium pl-12"
                                            placeholder="••••••••"
                                            required
                                            disabled={loading}
                                            minLength={6}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Konfirmasi Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="input-premium pl-12"
                                            placeholder="••••••••"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-2">
                                    <input type="checkbox" id="terms" className="mt-1" required disabled={loading} />
                                    <label htmlFor="terms" className="text-sm text-gray-400">
                                        Saya setuju dengan{' '}
                                        <a
                                            href="https://www.termsfeed.com/live/21a0f743-cadf-4f6d-9555-c558d95b0094"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            Syarat & Ketentuan
                                        </a>{' '}
                                        dan{' '}
                                        <a
                                            href="https://www.termsfeed.com/live/11dc13ee-e613-46f4-8fa5-178da379baf9"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            Kebijakan Privasi
                                        </a>{' '}
                                        yang berlaku
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={prevStep} className="btn-secondary" disabled={loading}>
                                        <ArrowLeft className="w-5 h-5 inline mr-2" />
                                        Kembali
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Memproses...' : 'Daftar'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400">Sudah punya akun? </span>
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                            Masuk
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
