'use client';

import { ChevronDown, Sparkles, Trophy, Rocket, Award, Target, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Hero3D() {
    return (
        <section id="beranda" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Animated 3D-like Background with CSS */}
            <div className="absolute inset-0 z-0">
                {/* Gradient Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

                {/* Geometric Shapes */}
                <div className="absolute top-20 right-20 w-32 h-32 border-2 border-purple-500/30 rounded-lg rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-pink-500/30 rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg animate-bounce" style={{ animationDuration: '3s' }}></div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80 z-10"></div>

            {/* Content */}
            <div className="container-custom relative z-20 text-center">
                <div className="animate-fade-in">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6 animate-scale-in">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">Platform Lomba Mahasiswa Terpercaya</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Raih Prestasi Terbaik
                        <br />
                        <span className="gradient-text">Menangkan Kompetisi</span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Platform pendaftaran lomba mahasiswa POLITEKNIK KAMPAR.
                        Daftar kompetisi, raih prestasi, dan kembangkan potensimu bersama ribuan mahasiswa lainnya
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Link href="/competitions" className="btn-primary text-lg">
                            <Trophy className="w-5 h-5 inline mr-2" />
                            Lihat Lomba Aktif
                        </Link>
                        <Link href="/register" className="btn-secondary text-lg">
                            <Rocket className="w-5 h-5 inline mr-2" />
                            Daftar Sekarang
                        </Link>
                    </div>

                    {/* Competition Categories */}
                    <div className="mb-8">
                        <p className="text-sm text-gray-400 mb-4">Kategori Lomba:</p>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {['Coding', 'Design', 'Business', 'Innovation', 'Hackathon', 'Research'].map((category, index) => (
                                <div
                                    key={index}
                                    className="glass px-4 py-2 rounded-lg hover-lift animate-scale-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <span className="text-sm font-semibold">{category}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { number: '0', label: 'Peserta Aktif', icon: Users },
                            { number: '0', label: 'Lomba Tersedia', icon: Trophy },
                            { number: '100%', label: 'Kepuasan', icon: Award },
                            { number: '0', label: 'Pemenang', icon: TrendingUp },
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="glass-strong rounded-xl p-6 hover-lift animate-scale-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex justify-center mb-3">
                                    <stat.icon className="w-8 h-8 text-purple-400" />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                <ChevronDown className="w-8 h-8 text-gray-400" />
            </div>
        </section>
    );
}
