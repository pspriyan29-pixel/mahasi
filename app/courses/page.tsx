'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, Filter, Clock, Users, Star, TrendingUp, Code, Database, Smartphone, Brain, Palette, Shield } from 'lucide-react';
import coursesData from '@/lib/data/coursesData';

const categories = [
    { id: 'all', name: 'Semua', icon: TrendingUp },
    { id: 'web', name: 'Web Development', icon: Code },
    { id: 'mobile', name: 'Mobile', icon: Smartphone },
    { id: 'data', name: 'Data Science', icon: Database },
    { id: 'ai', name: 'AI & ML', icon: Brain },
    { id: 'design', name: 'UI/UX Design', icon: Palette },
    { id: 'security', name: 'Cybersecurity', icon: Shield },
];

const levels = ['Semua Level', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('Semua Level');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = coursesData.filter(course => {
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
        const matchesLevel = selectedLevel === 'Semua Level' || course.level === selectedLevel;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesLevel && matchesSearch;
    });

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            Katalog <span className="gradient-text">Kursus</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Pilih dari {coursesData.length}+ kursus berkualitas untuk memulai perjalanan coding kamu
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari kursus, teknologi, atau topik..."
                                className="w-full pl-12 pr-4 py-4 glass-strong rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${selectedCategory === category.id
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                            : 'glass text-gray-400 hover:text-white hover:glass-strong'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Level Filter */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                        <Filter className="w-5 h-5 text-gray-400" />
                        {levels.map((level) => (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(level)}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${selectedLevel === level
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'glass text-gray-400 hover:text-white hover:glass-strong'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    {/* Results Count */}
                    <div className="text-center text-gray-400 mb-8">
                        Menampilkan {filteredCourses.length} kursus
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="pb-20">
                <div className="container-custom">
                    {filteredCourses.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCourses.map((course, index) => (
                                <div
                                    key={course.id}
                                    className="premium-card group animate-slide-up hover:scale-105 transition-transform duration-300"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {/* Thumbnail */}
                                    <div className={`relative h-40 bg-gradient-to-br ${course.thumbnailGradient} rounded-xl mb-4 overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                        {/* Level Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className="glass px-3 py-1 rounded-full text-xs font-semibold">
                                                {course.level}
                                            </span>
                                        </div>
                                        {/* Price Badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full text-xs font-semibold text-green-400">
                                                GRATIS
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold group-hover:gradient-text transition-all line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-2">
                                            {course.description}
                                        </p>

                                        {/* Instructor */}
                                        <p className="text-xs text-gray-500">
                                            Oleh {course.instructor.name}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {course.tags.slice(0, 3).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="glass px-2 py-1 rounded text-xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-800">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{course.duration}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    <span>{course.students.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">{course.rating}</span>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <Link
                                            href={`/courses/${course.id}`}
                                            className="btn-primary w-full text-center block text-sm"
                                        >
                                            Lihat Detail
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="glass-strong rounded-3xl p-12 max-w-md mx-auto">
                                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Tidak ada kursus ditemukan</h3>
                                <p className="text-gray-400 mb-6">
                                    Coba ubah filter atau kata kunci pencarian
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setSelectedLevel('Semua Level');
                                        setSearchQuery('');
                                    }}
                                    className="btn-primary"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
