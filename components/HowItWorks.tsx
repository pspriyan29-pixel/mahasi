'use client';

import { UserPlus, Search, FileEdit, Trophy } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: UserPlus,
        title: 'Daftar Akun',
        description: 'Buat akun gratis dengan email atau Google. Proses cepat dan mudah!',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        number: '02',
        icon: Search,
        title: 'Pilih Lomba',
        description: 'Browse kompetisi yang sesuai dengan minat dan keahlian Anda',
        gradient: 'from-cyan-500 to-blue-500',
    },
    {
        number: '03',
        icon: FileEdit,
        title: 'Daftar & Ikuti',
        description: 'Daftar kompetisi dan submit karya Anda sebelum deadline',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        number: '04',
        icon: Trophy,
        title: 'Raih Prestasi',
        description: 'Menangkan hadiah menarik dan dapatkan sertifikat digital',
        gradient: 'from-yellow-500 to-orange-500',
    },
];

export default function HowItWorks() {
    return (
        <section className="py-20 relative">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Cara <span className="gradient-text">Kerjanya</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Ikuti 4 langkah mudah untuk mulai berkompetisi
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {/* Connection Lines (Desktop) */}
                    <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-cyan-500 via-green-500 to-yellow-500 opacity-20" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={index}
                                className="relative animate-slide-up"
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                {/* Step Card */}
                                <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300 group relative z-10">
                                    {/* Number Badge */}
                                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-lg shadow-lg">
                                        {step.number}
                                    </div>

                                    {/* Icon */}
                                    <div
                                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                                </div>

                                {/* Arrow (Mobile) */}
                                {index < steps.length - 1 && (
                                    <div className="lg:hidden flex justify-center my-4">
                                        <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 opacity-30" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
