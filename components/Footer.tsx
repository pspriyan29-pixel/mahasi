'use client';

import { useState } from 'react';
import { Github, Linkedin, Twitter, Mail, MapPin, Phone, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';
import { createClient } from '@/lib/supabase/client';

import Logo from '@/components/Logo';

export default function Footer() {
    const toast = useToast();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const currentYear = new Date().getFullYear();

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
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
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert({ email } as any);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast.warning('Email sudah terdaftar di newsletter');
                } else {
                    throw error;
                }
            } else {
                toast.success('Berhasil subscribe newsletter! 🎉');
                setEmail('');
            }
        } catch (err: any) {
            console.error('Newsletter error:', err);
            toast.error('Gagal subscribe newsletter');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="glass-strong mt-20 border-t border-gray-800">
            <div className="container-custom py-12">
                {/* Logo Section - Large and Prominent */}
                <div className="flex justify-center mb-12">
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <Logo size="xl" showTagline={true} />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold gradient-text mb-3">
                            Platform Lomba Mahasiswa
                        </h3>
                        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                            Platform pendaftaran dan manajemen lomba mahasiswa POLITEKNIK KAMPAR.
                            Daftar lomba, raih prestasi, dan kembangkan potensimu.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link href="/competitions" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Lomba
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Tentang
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Kontak
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Lomba */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Lomba</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/competitions" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Semua Lomba
                                </Link>
                            </li>
                            <li>
                                <Link href="/competitions?status=open" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Lomba Aktif
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Daftar
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    Bantuan
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Ikuti Kami</h4>
                        <p className="text-gray-400 text-sm mb-4">
                            Tetap terhubung untuk update lomba terbaru
                        </p>
                        <div className="flex space-x-3">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:glass-strong transition-all hover:scale-110 hover:bg-purple-500/20"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:glass-strong transition-all hover:scale-110 hover:bg-purple-500/20"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:glass-strong transition-all hover:scale-110 hover:bg-purple-500/20"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Newsletter</h4>
                        <p className="text-gray-400 text-sm mb-4">
                            Dapatkan update lomba terbaru dan informasi penting langsung ke email Anda
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Anda"
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-2 glass-strong rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                {loading ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-3 gap-4 mb-8 pb-8 border-b border-gray-800">
                    <div className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                        <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="font-semibold text-white text-sm mb-1">Alamat</p>
                            <p className="text-sm">POLITEKNIK KAMPAR, Riau, Indonesia</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                        <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="font-semibold text-white text-sm mb-1">Email</p>
                            <a href="mailto:infomahasi@gmail.com" className="text-sm hover:text-purple-400 transition-colors">
                                infomahasi@gmail.com
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                        <Phone className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="font-semibold text-white text-sm mb-1">Telepon</p>
                            <a href="tel:+6285378963269" className="text-sm hover:text-purple-400 transition-colors">
                                +62 853-7896-3269
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
                    <p className="text-center md:text-left">
                        © {currentYear} Platform Lomba Mahasiswa. By <span className="text-purple-400 font-semibold">Riyan Perdhana Putra</span> | POLITEKNIK KAMPAR
                    </p>
                    <div className="flex gap-6">
                        <Link href="/contact" className="hover:text-white transition-colors hover:text-purple-400">
                            Privacy Policy
                        </Link>
                        <Link href="/contact" className="hover:text-white transition-colors hover:text-purple-400">
                            Terms of Service
                        </Link>
                        <Link href="/contact" className="hover:text-white transition-colors hover:text-purple-400">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
