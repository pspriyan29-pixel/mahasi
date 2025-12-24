'use client';

import { Target, Trophy, Users, BarChart3, Bell, Award } from 'lucide-react';

const features = [
    {
        icon: Target,
        title: 'Kompetisi Beragam',
        description: 'Berbagai kategori lomba dari coding, design, business, hingga essay writing',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        icon: Trophy,
        title: 'Hadiah Menarik',
        description: 'Prize pool jutaan rupiah dan sertifikat digital untuk semua pemenang',
        gradient: 'from-yellow-500 to-orange-500',
    },
    {
        icon: Users,
        title: 'Komunitas Aktif',
        description: 'Bergabung dengan ribuan mahasiswa dari berbagai kampus di Indonesia',
        gradient: 'from-cyan-500 to-blue-500',
    },
    {
        icon: BarChart3,
        title: 'Dashboard Lengkap',
        description: 'Track progress kompetisi, achievements, dan riwayat partisipasi Anda',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        icon: Bell,
        title: 'Notifikasi Real-time',
        description: 'Dapatkan update lomba terbaru, deadline, dan pengumuman pemenang',
        gradient: 'from-pink-500 to-rose-500',
    },
    {
        icon: Award,
        title: 'Sertifikat Digital',
        description: 'Sertifikat resmi yang dapat digunakan untuk portofolio dan CV',
        gradient: 'from-indigo-500 to-purple-500',
    },
];

export default function Features() {
    return (
        <section className="py-12 sm:py-16 md:py-20 relative">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16 px-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                        Kenapa Pilih <span className="gradient-text">Platform Kami?</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                        Platform kompetisi mahasiswa terlengkap dengan fitur-fitur unggulan
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="glass-strong rounded-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-300 group animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Icon */}
                                <div
                                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}
                                >
                                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
