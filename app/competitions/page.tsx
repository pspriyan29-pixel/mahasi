'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CompetitionCard from '@/components/CompetitionCard';
import { Search, Filter, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Background3D from '@/components/Background3D';

export default function CompetitionsPage() {
    const supabase = createClient();
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        fetchCategories();
        fetchCompetitions();
    }, [selectedCategory, selectedStatus]);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('competition_categories')
            .select('*')
            .order('name');

        if (data) setCategories(data);
    };

    const fetchCompetitions = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('competitions')
                .select('*, competition_categories(name)')
                .in('status', ['open', 'ongoing', 'closed', 'finished'])
                .order('created_at', { ascending: false });

            if (selectedCategory !== 'all') {
                query = query.eq('category_id', selectedCategory);
            }

            if (selectedStatus !== 'all') {
                query = query.eq('status', selectedStatus);
            }

            const { data } = await query;

            if (data) {
                setCompetitions(data.map((comp: any) => ({
                    ...comp,
                    category: comp.competition_categories?.name || 'Umum'
                })));
            }
        } catch (error) {
            console.error('Error fetching competitions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompetitions = competitions.filter(comp =>
        comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero */}
            <section className="pt-32 pb-16 relative overflow-hidden">
                {/* 3D Background */}
                <Background3D variant="blue" intensity="medium" />

                <div className="container-custom relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            Semua <span className="gradient-text">Lomba</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Temukan lomba yang sesuai dengan minat dan keahlian Anda
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="max-w-4xl mx-auto">
                        <div className="glass-strong rounded-2xl p-6">
                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari lomba..."
                                    className="w-full pl-12 pr-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Filters */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Kategori</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">Semua Kategori</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="open">Terbuka</option>
                                        <option value="ongoing">Berlangsung</option>
                                        <option value="closed">Ditutup</option>
                                        <option value="finished">Selesai</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Competitions Grid */}
            <section className="pb-20">
                <div className="container-custom">
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-gray-400">
                            Menampilkan {filteredCompetitions.length} lomba
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredCompetitions.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCompetitions.map((competition) => (
                                <CompetitionCard key={competition.id} competition={competition} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 glass-strong rounded-2xl">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl"></div>
                                <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                                    <Trophy className="w-16 h-16 text-purple-400" />
                                </div>
                            </div>
                            <p className="text-gray-400 text-lg font-semibold mb-2">Tidak ada lomba ditemukan</p>
                            <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
