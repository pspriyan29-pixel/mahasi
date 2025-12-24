'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trophy, Users, Clock, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Competition } from '@/lib/types/competition.types';

export default function InstructorCompetitionsPage() {
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const toast = useToast();
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
                return;
            }
            if (profile?.role !== 'instructor' && profile?.role !== 'admin') {
                router.push('/dashboard');
                return;
            }
            fetchCompetitions();
        }
    }, [user, profile, authLoading, router]);

    const fetchCompetitions = async () => {
        try {
            const url = filter === 'all'
                ? '/api/competitions'
                : `/api/competitions?status=${filter}`;

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setCompetitions(data.competitions || []);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            console.error('Error fetching competitions:', error);
            toast.error('Gagal memuat data lomba');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus lomba ini?')) return;

        try {
            const response = await fetch(`/api/competitions/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Lomba berhasil dihapus');
                fetchCompetitions();
            } else {
                const data = await response.json();
                throw new Error(data.error);
            }
        } catch (error: any) {
            console.error('Error deleting competition:', error);
            toast.error(error.message || 'Gagal menghapus lomba');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Draft' },
            active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Aktif' },
            closed: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Ditutup' },
            completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Selesai' }
        };
        const badge = badges[status as keyof typeof badges] || badges.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    if (authLoading || loading) {
        return <LoadingSpinner overlay />;
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-custom">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold gradient-text mb-2">Kelola Lomba</h1>
                        <p className="text-gray-400">Buat dan kelola lomba mahasiswa</p>
                    </div>
                    <button
                        onClick={() => router.push('/instructor/competitions/create')}
                        className="btn-primary flex items-center gap-2 mt-4 md:mt-0"
                    >
                        <Plus className="w-5 h-5" />
                        Buat Lomba Baru
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass-strong rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-8 h-8 text-purple-400" />
                            <div>
                                <p className="text-2xl font-bold">{competitions.length}</p>
                                <p className="text-sm text-gray-400">Total Lomba</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-strong rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {competitions.filter(c => c.status === 'active').length}
                                </p>
                                <p className="text-sm text-gray-400">Lomba Aktif</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-strong rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-8 h-8 text-blue-400" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {competitions.reduce((sum, c) => sum + c.current_participants, 0)}
                                </p>
                                <p className="text-sm text-gray-400">Total Peserta</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-strong rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-8 h-8 text-orange-400" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {competitions.filter(c => c.status === 'draft').length}
                                </p>
                                <p className="text-sm text-gray-400">Draft</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {['all', 'active', 'draft', 'closed', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setFilter(status);
                                setLoading(true);
                                fetchCompetitions();
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === status
                                    ? 'bg-purple-500 text-white'
                                    : 'glass hover:glass-strong'
                                }`}
                        >
                            {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Competitions List */}
                {competitions.length === 0 ? (
                    <div className="glass-strong rounded-xl p-12 text-center">
                        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">Belum ada lomba</h3>
                        <p className="text-gray-500 mb-6">Mulai buat lomba pertama Anda</p>
                        <button
                            onClick={() => router.push('/instructor/competitions/create')}
                            className="btn-primary"
                        >
                            Buat Lomba Baru
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {competitions.map((competition) => (
                            <div key={competition.id} className="glass-strong rounded-xl p-6 hover-lift">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Trophy className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold mb-1">{competition.title}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-2">
                                                    {competition.description || 'Tidak ada deskripsi'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    {competition.current_participants} / {competition.max_participants || '∞'} peserta
                                                </span>
                                            </div>
                                            {competition.registration_deadline && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        Deadline: {new Date(competition.registration_deadline).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                            )}
                                            {getStatusBadge(competition.status)}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/instructor/competitions/${competition.id}`)}
                                            className="p-2 glass hover:glass-strong rounded-lg transition-all"
                                            title="Lihat Detail"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => router.push(`/instructor/competitions/${competition.id}/edit`)}
                                            className="p-2 glass hover:glass-strong rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(competition.id)}
                                            className="p-2 glass hover:bg-red-500/20 rounded-lg transition-all"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
