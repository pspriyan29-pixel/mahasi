'use client';

import Link from 'next/link';
import { Trophy, Award, Calendar, TrendingUp, Users, BookOpen, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface StudentDashboardProps {
    user: any;
    profile: any;
}

export default function StudentDashboard({ user, profile }: StudentDashboardProps) {
    // Mock data - akan diganti dengan data dari Supabase
    const stats = [
        { label: 'Kompetisi Diikuti', value: '5', icon: Trophy, color: 'from-purple-500 to-pink-500' },
        { label: 'Sertifikat', value: '3', icon: Award, color: 'from-yellow-500 to-orange-500' },
        { label: 'Peringkat', value: '#12', icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
        { label: 'Poin', value: '850', icon: Target, color: 'from-green-500 to-emerald-500' },
    ];

    const activeCompetitions = [
        {
            id: 1,
            title: 'Hackathon 2025',
            category: 'Coding',
            deadline: '2025-01-15',
            participants: 45,
            status: 'open',
            thumbnail: 'from-purple-500 to-pink-500',
        },
        {
            id: 2,
            title: 'UI/UX Design Challenge',
            category: 'Design',
            deadline: '2025-01-20',
            participants: 32,
            status: 'open',
            thumbnail: 'from-cyan-500 to-blue-500',
        },
        {
            id: 3,
            title: 'Business Plan Competition',
            category: 'Business',
            deadline: '2025-01-25',
            participants: 28,
            status: 'open',
            thumbnail: 'from-green-500 to-emerald-500',
        },
    ];

    const myRegistrations = [
        {
            id: 1,
            title: 'Web Development Contest',
            status: 'in_progress',
            progress: 65,
            deadline: '3 hari lagi',
            priority: 'high',
        },
        {
            id: 2,
            title: 'Mobile App Challenge',
            status: 'submitted',
            progress: 100,
            deadline: 'Submitted',
            priority: 'medium',
        },
    ];

    const certificates = [
        {
            id: 1,
            title: 'Juara 1 - Coding Competition 2024',
            date: '2024-12-01',
            issuer: 'MAHASI.TECH',
        },
        {
            id: 2,
            title: 'Juara 2 - Design Sprint 2024',
            date: '2024-11-15',
            issuer: 'MAHASI.TECH',
        },
        {
            id: 3,
            title: 'Best Innovation Award',
            date: '2024-10-20',
            issuer: 'MAHASI.TECH',
        },
    ];

    const recentActivity = [
        { type: 'registered', title: 'Mendaftar: Hackathon 2025', time: '2 jam lalu' },
        { type: 'submitted', title: 'Submit: Mobile App Challenge', time: '1 hari lalu' },
        { type: 'certificate', title: 'Menerima: Juara 1 Coding Competition', time: '3 hari lalu' },
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
                        {stats.map((stat, index) => {
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
                                    <h2 className="text-2xl font-bold">Kompetisi Aktif</h2>
                                    <Link href="/competitions" className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                                        Lihat Semua →
                                    </Link>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {activeCompetitions.map((comp, index) => (
                                        <div
                                            key={comp.id}
                                            className="premium-card animate-slide-up group cursor-pointer hover:scale-105 transition-transform"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className={`h-32 rounded-xl bg-gradient-to-br ${comp.thumbnail} mb-4 flex items-center justify-center`}>
                                                <Trophy className="w-12 h-12 text-white" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">{comp.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(comp.deadline).toLocaleDateString('id-ID')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {comp.participants}
                                                </span>
                                            </div>
                                            <Link href={`/competitions/${comp.id}`} className="btn-primary text-sm w-full text-center block">
                                                Daftar Sekarang
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* My Registrations */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Pendaftaran Saya</h2>
                                <div className="space-y-4">
                                    {myRegistrations.map((reg) => (
                                        <div key={reg.id} className="premium-card">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg mb-1">{reg.title}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${reg.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                                                reg.status === 'submitted' ? 'bg-green-500/20 text-green-400' :
                                                                    'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                            {reg.status === 'in_progress' ? 'Dalam Progress' :
                                                                reg.status === 'submitted' ? 'Submitted' : 'Pending'}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${reg.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                                reg.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-green-500/20 text-green-400'
                                                            }`}>
                                                            {reg.deadline}
                                                        </span>
                                                    </div>
                                                </div>
                                                {reg.status === 'in_progress' && (
                                                    <Link href={`/competitions/${reg.id}/submit`} className="btn-primary text-sm">
                                                        Lanjutkan
                                                    </Link>
                                                )}
                                            </div>
                                            {reg.status === 'in_progress' && (
                                                <div>
                                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                                        <span>Progress</span>
                                                        <span>{reg.progress}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                                            style={{ width: `${reg.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Certificates */}
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Sertifikat Saya</h2>
                                <div className="space-y-3">
                                    {certificates.map((cert) => (
                                        <div key={cert.id} className="glass-strong rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                                    <Award className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm mb-1 line-clamp-2">{cert.title}</h4>
                                                    <p className="text-xs text-gray-500">{cert.issuer}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(cert.date).toLocaleDateString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/dashboard/certificates" className="btn-secondary w-full text-center block text-sm mt-4">
                                    Lihat Semua Sertifikat
                                </Link>
                            </div>

                            {/* Recent Activity */}
                            <div className="glass-strong rounded-2xl p-6">
                                <h3 className="font-bold mb-4">Aktivitas Terbaru</h3>
                                <div className="space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3 pb-4 last:pb-0 border-b border-gray-800 last:border-0">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'registered' ? 'bg-blue-400' :
                                                    activity.type === 'submitted' ? 'bg-green-400' :
                                                        'bg-yellow-400'
                                                }`}></div>
                                            <div className="flex-1">
                                                <p className="text-sm">{activity.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
