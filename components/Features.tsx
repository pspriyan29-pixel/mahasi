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
        <section className="py-20 relative">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Kenapa Pilih <span className="gradient-text">Platform Kami?</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Platform kompetisi mahasiswa terlengkap dengan fitur-fitur unggulan
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-300 group animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Icon */}
                                <div
                                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                                >
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
