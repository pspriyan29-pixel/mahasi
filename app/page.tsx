'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CompetitionCard from '@/components/CompetitionCard';
import WinnerCard from '@/components/WinnerCard';
import Background3D from '@/components/Background3D';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import CircularGallery from '@/components/CircularGallery';
import AdInFeed from '@/components/AdInFeed';
import AdUnit from '@/components/AdUnit';
import { Trophy, Users, Award, TrendingUp, ArrowRight, Sparkles, Zap, Shield, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

export default function HomePage() {
    const supabase = createClient();
    const [activeCompetitions, setActiveCompetitions] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalCompetitions: 0,
        totalParticipants: 0,
        totalWinners: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch active competitions from new table
            const { data: competitions } = await supabase
                .from('competitions')
                .select('*')
                .eq('status', 'active')
                .order('registration_deadline', { ascending: true })
                .limit(6);

            if (competitions) {
                setActiveCompetitions(competitions);
            }

            // Fetch stats
            const { count: compCount } = await supabase
                .from('competitions')
                .select('*', { count: 'exact', head: true });

            const { data: participantData } = await supabase
                .from('competitions')
                .select('current_participants');

            const totalParticipants = participantData?.reduce((sum: number, comp: any) => sum + (comp.current_participants || 0), 0) || 0;

            // Count approved registrations as winners
            const { count: winnerCount } = await supabase
                .from('competition_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved');

            setStats({
                totalCompetitions: compCount || 0,
                totalParticipants,
                totalWinners: winnerCount || 0,
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative">
            {/* Global 3D Background */}
            <Background3D variant="purple" intensity="medium" />

            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="container-custom relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Logo Display */}
                        <div className="mb-8 animate-slide-up flex justify-center">
                            <Logo size="xl" showTagline={true} />
                        </div>

                        {/* Slogan */}
                        <div className="mb-6 animate-slide-up">
                            <p className="text-2xl md:text-3xl font-bold gradient-text">
                                Mahasiswa Berprestasi, Teknologi Terdepan
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 glass-strong px-4 py-2 rounded-full mb-6 animate-slide-up">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm">Platform Lomba Mahasiswa Terpercaya</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
                            Raih Prestasi Melalui{' '}
                            <span className="gradient-text">Kompetisi</span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto animate-slide-up">
                            Platform pendaftaran lomba mahasiswa POLITEKNIK KAMPAR. Daftar lomba, kompetisi, dan raih prestasi bersama ribuan mahasiswa lainnya.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center animate-slide-up">
                            <Link href="/competitions" className="btn-primary flex items-center gap-2">
                                Lihat Semua Lomba
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/about" className="btn-secondary">
                                Tentang Platform
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="pb-20 relative">
                <div className="container-custom">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="glass-strong rounded-2xl p-8 text-center hover:scale-105 transition-all">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-4xl font-bold gradient-text mb-2">{stats.totalCompetitions}+</h3>
                            <p className="text-gray-400">Total Lomba</p>
                        </div>

                        <div className="glass-strong rounded-2xl p-8 text-center hover:scale-105 transition-all">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-4xl font-bold gradient-text mb-2">{stats.totalParticipants}+</h3>
                            <p className="text-gray-400">Peserta Aktif</p>
                        </div>

                        <div className="glass-strong rounded-2xl p-8 text-center hover:scale-105 transition-all">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-4xl font-bold gradient-text mb-2">{stats.totalWinners}+</h3>
                            <p className="text-gray-400">Pemenang</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <Features />

            {/* Active Competitions */}
            <section className="pb-20 relative">
                <div className="container-custom">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-4xl font-bold mb-2">
                                Lomba <span className="gradient-text">Aktif</span>
                            </h2>
                            <p className="text-gray-400">Daftar sekarang sebelum kuota penuh!</p>
                        </div>
                        <Link href="/competitions" className="btn-secondary flex items-center gap-2">
                            Lihat Semua
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : activeCompetitions.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeCompetitions.map((competition, index) => (
                                <div key={competition.id} className="contents">
                                    <CompetitionCard competition={competition} />
                                    {/* Insert Ad after the 3rd item (index 2) */}
                                    {index === 2 && (
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <AdInFeed />
                                        </div>
                                    )}
                                </div>
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
                            <p className="text-gray-400 text-lg font-semibold mb-2">Belum ada lomba aktif saat ini</p>
                            <p className="text-gray-500 text-sm">Cek kembali nanti untuk lomba terbaru!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works */}
            <HowItWorks />

            {/* Testimonials */}
            <Testimonials />

            {/* Campus Gallery */}
            <section className="pb-20 relative">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Fasilitas <span className="gradient-text">Politeknik Kampar</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Kampus modern dengan fasilitas lengkap untuk mendukung prestasi mahasiswa
                        </p>
                    </div>

                    <CircularGallery
                        items={[
                            { image: '/polkam-gedung-1.png', text: 'Gedung Utama Polkam' },
                            { image: '/polkam-gedung-2.jpg', text: 'Gedung Direktorat' },
                            { image: '/polkam-aerial.png', text: 'Kampus dari Udara' },
                            { image: '/polkam-workshop-1.png', text: 'Workshop Teknik' },
                            { image: '/polkam-workshop-2.jpg', text: 'Laboratorium Industri' },
                        ]}
                        bend={3}
                        textColor="#ffffff"
                        borderRadius={0.05}
                        font="bold 24px Inter, sans-serif"
                        scrollSpeed={2}
                        scrollEase={0.05}
                    />
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="pb-20 relative">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Mengapa <span className="gradient-text">Kami Berbeda?</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Platform kompetisi dengan standar terbaik
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="glass-strong rounded-2xl p-8 text-center hover:scale-105 transition-all">
                            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-3">Proses Cepat</h3>
                            <p className="text-gray-400">Pendaftaran dan verifikasi dilakukan dengan cepat dan efisien</p>
                        </div>

                        <div className="glass-strong rounded-2xl p-8 text-center hover:scale-105 transition-all">
                            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-3">Terpercaya</h3>
                            <p className="text-gray-400">Platform resmi dengan sistem keamanan data yang terjamin</p>
                        </div>

                        <div className="glass-strong rounded-2xl p-8 text-center hover:scale-105 transition-all">
                            <Clock className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-3">Support 24/7</h3>
                            <p className="text-gray-400">Tim support siap membantu Anda kapan saja</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <FAQ />

            {/* CTA Section */}
            <section className="pb-20 relative">
                <div className="container-custom">
                    <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
                        <div className="relative z-10">
                            <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                            <h2 className="text-4xl font-bold mb-4">
                                Siap Berkompetisi?
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                                Bergabunglah dengan ribuan mahasiswa lainnya dan raih prestasi melalui berbagai kompetisi menarik.
                                Daftar sekarang dan mulai perjalanan Anda!
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link href="/register" className="btn-primary">
                                    Daftar Sekarang
                                </Link>
                                <Link href="/competitions" className="btn-secondary">
                                    Browse Lomba
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AdSense Unit */}
            <AdUnit />

            <Footer />
        </div>
    );
}
