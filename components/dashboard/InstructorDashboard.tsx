'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Users, TrendingUp, Clock, Plus, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface InstructorDashboardProps {
    user: any;
    profile: any;
}

interface Stats {
    total_competitions: number;
    active_competitions: number;
    total_participants: number;
    pending_approvals: number;
}

interface Competition {
    id: string;
    title: string;
    category: string;
    status: string;
    current_participants: number;
    max_participants: number | null;
    created_at: string;
}

interface Registration {
    id: string;
    student_name: string;
    nim: string;
    competition_id: string;
    registered_at: string;
    competitions: {
        title: string;
    };
}

export default function InstructorDashboard({ user, profile }: InstructorDashboardProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [pendingRegistrations, setPendingRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const supabase = createClient();

            // Fetch competitions
            const { data: competitionsData } = await supabase
                .from('competitions')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false })
                .limit(5) as { data: Competition[] | null };

            // Fetch pending registrations
            const { data: registrationsData } = await supabase
                .from('competition_registrations')
                .select(`
                    *,
                    competitions!inner(title, created_by)
                `)
                .eq('status', 'pending')
                .eq('competitions.created_by', user.id)
                .order('registered_at', { ascending: false })
                .limit(5) as { data: Registration[] | null };

            // Calculate stats
            const totalCompetitions = competitionsData?.length || 0;
            const activeCompetitions = competitionsData?.filter(c => c.status === 'active').length || 0;
            const totalParticipants = competitionsData?.reduce((sum, c) => sum + (c.current_participants || 0), 0) || 0;
            const pendingApprovals = registrationsData?.length || 0;

            setStats({
                total_competitions: totalCompetitions,
                active_competitions: activeCompetitions,
                total_participants: totalParticipants,
                pending_approvals: pendingApprovals,
            });

            setCompetitions(competitionsData || []);
            setPendingRegistrations(registrationsData || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400';
            case 'draft': return 'bg-gray-500/20 text-gray-400';
            case 'closed': return 'bg-red-500/20 text-red-400';
            case 'completed': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="pt-24 pb-20">
                <div className="container-custom">
                    {/* Welcome Section */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            Selamat datang, <span className="gradient-text">{profile?.full_name || 'Instructor'}!</span>
                        </h1>
                        <p className="text-xl text-gray-400">Dashboard Instructor - Kelola lomba dan peserta</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                        {[
                            { label: 'Total Lomba', value: stats?.total_competitions || 0, icon: Trophy, color: 'from-purple-500 to-pink-500' },
                            { label: 'Lomba Aktif', value: stats?.active_competitions || 0, icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
                            { label: 'Total Peserta', value: stats?.total_participants || 0, icon: Users, color: 'from-green-500 to-emerald-500' },
                            { label: 'Pending Approval', value: stats?.pending_approvals || 0, icon: AlertCircle, color: 'from-yellow-500 to-orange-500' },
                        ].map((stat, index) => {
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
                            {/* My Competitions */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Lomba Saya</h2>
                                    <Link href="/instructor/competitions/create" className="btn-primary text-sm">
                                        <Plus className="w-4 h-4 inline mr-1" />
                                        Buat Lomba Baru
                                    </Link>
                                </div>

                                {competitions.length === 0 ? (
                                    <EmptyState
                                        icon={Trophy}
                                        title="Belum Ada Lomba"
                                        description="Mulai dengan membuat lomba pertama Anda untuk mahasiswa"
                                        action={{
                                            label: 'Buat Lomba Baru',
                                            onClick: () => window.location.href = '/instructor/competitions/create'
                                        }}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {competitions.map((competition, index) => (
                                            <div
                                                key={competition.id}
                                                className="premium-card animate-slide-up"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg mb-2">{competition.title}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(competition.status)}`}>
                                                                {competition.status}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-4 h-4" />
                                                                {competition.current_participants}
                                                                {competition.max_participants && `/${competition.max_participants}`} peserta
                                                            </span>
                                                            <span>{competition.category}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/instructor/competitions/${competition.id}`}
                                                        className="btn-primary text-sm"
                                                    >
                                                        <Eye className="w-4 h-4 inline mr-1" />
                                                        Kelola
                                                    </Link>
                                                    <Link
                                                        href={`/instructor/competitions`}
                                                        className="btn-secondary text-sm"
                                                    >
                                                        Lihat Semua
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pending Approvals */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Pending Approval</h2>
                                    <Link href="/instructor/competitions" className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                                        Lihat Semua →
                                    </Link>
                                </div>

                                {pendingRegistrations.length === 0 ? (
                                    <div className="glass-strong rounded-xl p-8 text-center">
                                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                        <p className="text-gray-400">Tidak ada pendaftaran yang menunggu approval</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingRegistrations.map((registration) => (
                                            <div key={registration.id} className="glass-strong rounded-xl p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold mb-1">{registration.student_name}</h4>
                                                        <p className="text-sm text-gray-400">NIM: {registration.nim}</p>
                                                        <p className="text-sm text-gray-500 mt-1">{registration.competitions.title}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(registration.registered_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                        <Link
                                                            href={`/instructor/competitions`}
                                                            className="btn-primary text-xs px-3 py-1"
                                                        >
                                                            Review
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="glass-strong rounded-2xl p-6">
                                <h3 className="font-bold mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <Link href="/instructor/competitions/create" className="btn-secondary w-full text-center block text-sm">
                                        <Plus className="w-4 h-4 inline mr-2" />
                                        Buat Lomba
                                    </Link>
                                    <Link href="/instructor/competitions" className="btn-secondary w-full text-center block text-sm">
                                        <Trophy className="w-4 h-4 inline mr-2" />
                                        Kelola Lomba
                                    </Link>
                                    <Link href="/instructor/competitions" className="btn-secondary w-full text-center block text-sm">
                                        <Users className="w-4 h-4 inline mr-2" />
                                        Lihat Peserta
                                    </Link>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="glass-strong rounded-2xl p-6">
                                <h3 className="font-bold mb-4">Informasi</h3>
                                <div className="space-y-3 text-sm text-gray-400">
                                    <p>• Lomba dengan status <span className="text-green-400">active</span> akan muncul di landing page</p>
                                    <p>• Review pendaftaran peserta secara berkala</p>
                                    <p>• Approve peserta yang memenuhi syarat</p>
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
