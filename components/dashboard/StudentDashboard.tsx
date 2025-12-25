'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Award, Calendar, TrendingUp, Users, BookOpen, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';

interface StudentDashboardProps {
    user: any;
    profile: any;
}

export default function StudentDashboard({ user, profile }: StudentDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        competitions: 0,
        certificates: 0,
        rank: '-',
        points: 0
    });
    const [activeCompetitions, setActiveCompetitions] = useState<any[]>([]);
    const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const supabase = createClient();

            // 1. Fetch Stats & Registrations
            const { data: regs, error: regError } = await supabase
                .from('competition_registrations')
                .select('*, competitions(*)')
                .eq('email', user.email)
                .order('registered_at', { ascending: false });

            if (regError) throw regError;

            // 2. Fetch Active Competitions
            const { data: active, error: activeError } = await supabase
                .from('competitions')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(4);

            if (activeError) throw activeError;

            // 3. Fetch Certificates (Mocking competition certs for now or real course certs)
            const { data: certs, error: certError } = await supabase
                .from('certificates')
                .select('*, courses(title)')
                .eq('student_id', user.id);

            // Update States
            setStats({
                competitions: regs?.length || 0,
                certificates: certs?.length || 0,
                rank: '#-', // Placeholder
                points: (regs?.length || 0) * 10 // Mock points logic
            });

            setMyRegistrations(regs || []);
            setActiveCompetitions(active || []);
            setCertificates(certs || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const dashboardStats = [
        { label: 'Kompetisi Diikuti', value: stats.competitions.toString(), icon: Trophy, color: 'from-purple-500 to-pink-500' },
        { label: 'Sertifikat', value: stats.certificates.toString(), icon: Award, color: 'from-yellow-500 to-orange-500' },
        { label: 'Peringkat', value: stats.rank, icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
        { label: 'Poin', value: stats.points.toString(), icon: Target, color: 'from-green-500 to-emerald-500' },
    ];

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="pt-24 pb-20">
                <div className="container-custom">
                    {/* Welcome Section */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            Selamat datang, <span className="gradient-text">{profile?.full_name || 'Mahasiswa'}!</span>
                        </h1>
                        <p className="text-xl text-gray-400">Dashboard Mahasiswa - Raih prestasi terbaikmu</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                        {dashboardStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="premium-card animate-scale-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-400">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Active Competitions */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Kompetisi Terbaru</h2>
                                    <Link href="/competitions" className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                                        Lihat Semua →
                                    </Link>
                                </div>

                                {loading ? (
                                    <div className="text-center py-8 text-gray-400">Memuat kompetisi...</div>
                                ) : activeCompetitions.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {activeCompetitions.map((comp: any, index: number) => (
                                            <div
                                                key={comp.id}
                                                className="premium-card animate-slide-up group cursor-pointer hover:scale-105 transition-transform"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                <div className="h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4 flex items-center justify-center overflow-hidden relative">
                                                    {comp.banner_url ? (
                                                        <img src={comp.banner_url} alt={comp.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Trophy className="w-12 h-12 text-white/50" />
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-lg mb-2 line-clamp-1">{comp.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(comp.registration_deadline).toLocaleDateString('id-ID')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {comp.current_participants}
                                                    </span>
                                                </div>
                                                <Link href={`/competitions/${comp.id}`} className="btn-primary text-sm w-full text-center block">
                                                    Lihat Detail
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 glass rounded-xl text-gray-400">
                                        Belum ada kompetisi aktif.
                                    </div>
                                )}
                            </div>

                            {/* My Registrations */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Pendaftaran Saya</h2>
                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="text-center py-8 text-gray-400">Memuat data pendaftaran...</div>
                                    ) : myRegistrations.length > 0 ? (
                                        myRegistrations.map((reg: any) => (
                                            <div key={reg.id} className="premium-card">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-bold text-lg mb-1">{reg.competitions?.title || 'Unknown Competition'}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${reg.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                                    reg.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                                        'bg-yellow-500/20 text-yellow-400'
                                                                }`}>
                                                                {reg.status === 'approved' ? 'Diterima' :
                                                                    reg.status === 'rejected' ? 'Ditolak' : 'Menunggu Konfirmasi'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                Daftar: {new Date(reg.registered_at).toLocaleDateString('id-ID')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/competitions/${reg.competition_id}`} className="btn-secondary text-sm">
                                                        Detail
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 glass rounded-xl text-gray-400">
                                            Anda belum mendaftar lomba apapun.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Certificates */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Sertifikat Saya</h2>
                                <div className="space-y-3">
                                    {certificates.length > 0 ? (
                                        certificates.map((cert: any) => (
                                            <div key={cert.id} className="glass-strong rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                                        <Award className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm mb-1 line-clamp-2">{cert.courses?.title || 'Certificate'}</h4>
                                                        <p className="text-xs text-gray-500">MAHASI.TECH</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(cert.issued_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 glass rounded-xl text-gray-400 text-sm">
                                            Belum ada sertifikat.
                                        </div>
                                    )}
                                </div>
                                {certificates.length > 0 && (
                                    <Link href="/dashboard/certificates" className="btn-secondary w-full text-center block text-sm mt-4">
                                        Lihat Semua Sertifikat
                                    </Link>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="glass-strong rounded-2xl p-6">
                                <h3 className="font-bold mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <Link href="/competitions" className="btn-secondary w-full text-center block text-sm">
                                        <Trophy className="w-4 h-4 inline mr-2" />
                                        Cari Kompetisi
                                    </Link>
                                    <Link href="/dashboard/certificates" className="btn-secondary w-full text-center block text-sm">
                                        <Award className="w-4 h-4 inline mr-2" />
                                        Sertifikat Saya
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
