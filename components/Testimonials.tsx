'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Ahmad Rizki',
        role: 'Mahasiswa Teknik Informatika',
        competition: 'Coding Competition 2024',
        rank: 1,
        avatar: '👨‍💻',
        rating: 5,
        text: 'Platform ini sangat membantu saya menemukan kompetisi yang sesuai dengan skill. Prosesnya mudah dan transparan. Alhamdulillah bisa juara 1!',
    },
    {
        name: 'Siti Nurhaliza',
        role: 'Mahasiswa Desain Grafis',
        competition: 'UI/UX Design Challenge',
        rank: 2,
        avatar: '👩‍🎨',
        rating: 5,
        text: 'Dashboard-nya user-friendly banget! Notifikasi real-time juga sangat membantu agar tidak ketinggalan deadline. Recommended!',
    },
    {
        name: 'Budi Santoso',
        role: 'Mahasiswa Manajemen',
        competition: 'Business Plan Competition',
        rank: 1,
        avatar: '👨‍💼',
        rating: 5,
        text: 'Kompetisi di platform ini berkualitas dan hadiahnya juga menarik. Sertifikat digitalnya bisa langsung dipakai untuk CV!',
    },
    {
        name: 'Dewi Lestari',
        role: 'Mahasiswa Sastra',
        competition: 'Essay Writing Contest',
        rank: 3,
        avatar: '👩‍🎓',
        rating: 5,
        text: 'Senang banget bisa ikut berbagai lomba essay di sini. Prosesnya cepat dan adminnya responsif. Terima kasih!',
    },
];

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const current = testimonials[currentIndex];

    return (
        <section className="py-20 relative">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Apa Kata <span className="gradient-text">Mereka?</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Testimoni dari mahasiswa yang telah meraih prestasi
                    </p>
                </div>

                {/* Testimonial Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="glass-strong rounded-3xl p-8 md:p-12 relative">
                        {/* Quote Icon */}
                        <Quote className="w-16 h-16 text-purple-500/20 absolute top-8 left-8" />

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Avatar & Info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                                    {current.avatar}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{current.name}</h3>
                                    <p className="text-gray-400">{current.role}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(current.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-lg text-gray-300 mb-6 leading-relaxed italic">
                                "{current.text}"
                            </p>

                            {/* Competition Badge */}
                            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full">
                                <span className="text-sm text-gray-400">Juara {current.rank} -</span>
                                <span className="text-sm font-semibold gradient-text">{current.competition}</span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8">
                            <button
                                onClick={prevTestimonial}
                                className="w-12 h-12 rounded-full glass hover:glass-strong transition-all flex items-center justify-center"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            {/* Dots */}
                            <div className="flex gap-2">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                                ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                                                : 'bg-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextTestimonial}
                                className="w-12 h-12 rounded-full glass hover:glass-strong transition-all flex items-center justify-center"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
