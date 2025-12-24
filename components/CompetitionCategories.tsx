'use client';

import { Code, Palette, Lightbulb, Rocket, Users, Award } from 'lucide-react';
import Link from 'next/link';

const categories = [
    {
        icon: Code,
        title: 'Programming',
        description: 'Kompetisi coding, hackathon, dan pengembangan software',
        color: 'from-blue-500 to-cyan-500',
        competitions: 12,
    },
    {
        icon: Palette,
        title: 'Design',
        description: 'UI/UX Design, Graphic Design, dan Creative Design',
        color: 'from-pink-500 to-rose-500',
        competitions: 8,
    },
    {
        icon: Lightbulb,
        title: 'Innovation',
        description: 'Inovasi teknologi, startup pitch, dan business plan',
        color: 'from-purple-500 to-indigo-500',
        competitions: 10,
    },
    {
        icon: Rocket,
        title: 'Entrepreneurship',
        description: 'Kewirausahaan, business case, dan social impact',
        color: 'from-orange-500 to-red-500',
        competitions: 7,
    },
    {
        icon: Users,
        title: 'Team Challenge',
        description: 'Kompetisi tim, case study, dan problem solving',
        color: 'from-green-500 to-emerald-500',
        competitions: 9,
    },
    {
        icon: Award,
        title: 'Academic',
        description: 'Olimpiade, debat, dan kompetisi akademik',
        color: 'from-yellow-500 to-amber-500',
        competitions: 11,
    },
];

export default function CompetitionCategories() {
    return (
        <section id="kompetisi" className="section-padding relative">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16 animate-fade-in px-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                        Kategori <span className="gradient-text">Kompetisi</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                        Pilih kategori kompetisi yang sesuai dengan minat dan keahlian Anda
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {categories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                href={`/competitions?category=${category.title.toLowerCase()}`}
                                key={index}
                                className="premium-card group cursor-pointer animate-scale-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Icon with Gradient Background */}
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${category.color} p-3 sm:p-4 mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-full h-full text-white" />
                                </div>

                                {/* Title */}
                                <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:gradient-text transition-all">
                                    {category.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
                                    {category.description}
                                </p>

                                {/* Competition Count */}
                                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-700">
                                    <span className="text-xs sm:text-sm text-gray-500">
                                        {category.competitions} Kompetisi Aktif
                                    </span>
                                    <span className="text-purple-400 group-hover:translate-x-2 transition-transform">
                                        →
                                    </span>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity -z-10`}></div>
                            </Link>
                        );
                    })}
                </div>

                {/* View All Button */}
                <div className="text-center mt-8 sm:mt-12 px-4">
                    <Link href="/competitions" className="btn-primary w-full sm:w-auto inline-block">
                        Lihat Semua Kompetisi
                    </Link>
                </div>
            </div>
        </section>
    );
}
