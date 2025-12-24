'use client';

import { BookOpen, Clock, Users, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const courses = [
    {
        id: 1,
        title: 'Full-Stack Web Development',
        description: 'Belajar membangun aplikasi web modern dari frontend hingga backend',
        level: 'Beginner',
        duration: '12 minggu',
        students: 2500,
        rating: 4.8,
        thumbnail: '/api/placeholder/400/250',
        tags: ['JavaScript', 'React', 'Node.js'],
        price: 'Gratis',
    },
    {
        id: 2,
        title: 'Python for Data Science',
        description: 'Kuasai Python untuk analisis data dan machine learning',
        level: 'Intermediate',
        duration: '10 minggu',
        students: 1800,
        rating: 4.9,
        thumbnail: '/api/placeholder/400/250',
        tags: ['Python', 'Pandas', 'ML'],
        price: 'Gratis',
    },
    {
        id: 3,
        title: 'Mobile App Development',
        description: 'Bangun aplikasi mobile dengan React Native',
        level: 'Intermediate',
        duration: '8 minggu',
        students: 1200,
        rating: 4.7,
        thumbnail: '/api/placeholder/400/250',
        tags: ['React Native', 'Mobile'],
        price: 'Gratis',
    },
];

export default function CourseShowcase() {
    return (
        <section id="courses" className="py-20 relative">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Kursus <span className="gradient-text">Populer</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Pilih dari berbagai kursus berkualitas yang dirancang untuk membantumu mencapai tujuan karir
                    </p>
                </div>

                {/* Course Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {courses.map((course, index) => (
                        <div
                            key={course.id}
                            className="premium-card group animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Thumbnail */}
                            <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-4 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BookOpen className="w-16 h-16 text-purple-400 opacity-50" />
                                </div>
                                {/* Level Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="glass px-3 py-1 rounded-full text-xs font-semibold">
                                        {course.level}
                                    </span>
                                </div>
                                {/* Price Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full text-xs font-semibold text-green-400">
                                        {course.price}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold group-hover:gradient-text transition-all">
                                    {course.title}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {course.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="glass px-2 py-1 rounded text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{course.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{course.students.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{course.rating}</span>
                                    </div>
                                </div>

                                {/* CTA */}
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="btn-primary w-full text-center block"
                                >
                                    Mulai Belajar
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center">
                    <Link href="/courses" className="btn-secondary inline-flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Lihat Semua Kursus
                    </Link>
                </div>
            </div>
        </section>
    );
}
