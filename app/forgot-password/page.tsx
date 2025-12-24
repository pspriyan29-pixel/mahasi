'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { createClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ForgotPasswordPage() {
    const toast = useToast();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Email harus diisi');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error('Format email tidak valid');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });

            if (error) throw error;

            setSent(true);
            toast.success('Email reset password telah dikirim! Cek inbox Anda.');
        } catch (err: any) {
            console.error('Reset password error:', err);
            toast.error(err.message || 'Gagal mengirim email reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animated-bg relative overflow-hidden">
            {/* Loading Overlay */}
            {loading && <LoadingSpinner overlay />}

            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Card */}
            <div className="w-full max-w-md relative z-10">
                {/* Back Button */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Login
                </Link>

                <div className="glass-strong rounded-3xl p-8 animate-scale-in">
                    {!sent ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2">
                                    Lupa <span className="gradient-text">Password</span>?
                                </h1>
                                <p className="text-gray-400">
                                    Masukkan email Anda dan kami akan mengirimkan link untuk reset password
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            placeholder="nama@email.com"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <LoadingSpinner size="sm" color="white" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Kirim Link Reset
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-8 h-8 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-4">Email Terkirim!</h2>
                                <p className="text-gray-400 mb-6">
                                    Kami telah mengirimkan link reset password ke <span className="text-white font-semibold">{email}</span>
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    Cek inbox Anda dan klik link yang dikirimkan untuk reset password. Link akan kadaluarsa dalam 1 jam.
                                </p>
                                <Link href="/login" className="btn-secondary inline-block">
                                    Kembali ke Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
