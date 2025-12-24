'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Trophy, Plus, Users, Award, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminCompetitionsPage() {
    const router = useRouter();
    const { user, profile } = useAuth();
    const toast = useToast();
    const supabase = createClient();

    const [competitions, setCompetitions] = useState<any[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        totalParticipants: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (profile?.role !== 'admin') {
            toast.error('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
            router.push('/dashboard');
            return;
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, profile]);

    const fetchData = async () => {
        try {
            // Fetch all competitions
            const { data: comps } = await supabase
                .from('competitions')
                .select('*, competition_categories(name)')
                .order('created_at', { ascending: false });

            if (comps) {
                setCompetitions(comps);

                const total = comps.length;
                const active = comps.filter((c: any) => c.status === 'open' || c.status === 'ongoing').length;
                const totalParticipants = comps.reduce((sum: number, c: any) => sum + (c.current_participants || 0), 0);

                setStats({ total, active, totalParticipants });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Yakin ingin menghapus lomba "${title}"?`)) return;

        try {
            const { error } = await supabase
                .from('competitions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Lomba berhasil dihapus');
            fetchData();
        } catch (error: any) {
            console.error('Error deleting competition:', error);
            toast.error(error.message || 'Gagal menghapus lomba');
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            draft: 'bg-gray-500/20 text-gray-400',
            open: 'bg-green-500/20 text-green-400',
            ongoing: 'bg-blue-500/20 text-blue-400',
            closed: 'bg-red-500/20 text-red-400',
            finished: 'bg-purple-500/20 text-purple-400',
        };
        return colors[status as keyof typeof colors] || colors.draft;
    };

    if (loading) {
        return <LoadingSpinner overlay />;
    }

    return (
        <div className="min-h-screen p-8 animated-bg">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                Kelola <span className="gradient-text">Lomba</span>
                            </h1>
                            <p className="text-gray-400">Manage semua lomba dari satu tempat</p>
                        </div>
                        <Link href="/admin/competitions/create" className="btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Buat Lomba Baru
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="glass-strong rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Total Lomba</p>
                                    <p className="text-3xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-strong rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Lomba Aktif</p>
                                    <p className="text-3xl font-bold">{stats.active}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-strong rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Total Peserta</p>
                                    <p className="text-3xl font-bold">{stats.totalParticipants}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Competitions Table */}
                <div className="glass-strong rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Lomba</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Kategori</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Peserta</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Deadline</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {competitions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>Belum ada lomba. Buat lomba pertama Anda!</p>
                                        </td>
                                    </tr>
                                ) : (
                                    competitions.map((comp) => (
                                        <tr key={comp.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold">{comp.title}</p>
                                                    <p className="text-sm text-gray-400 line-clamp-1">{comp.description}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-300">
                                                    {comp.competition_categories?.name || 'Umum'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(comp.status)}`}>
                                                    {comp.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm">
                                                    {comp.current_participants || 0}/{comp.max_participants}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-400">
                                                    {new Date(comp.registration_deadline).toLocaleDateString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/competitions/${comp.id}`}
                                                        className="p-2 glass rounded-lg hover:glass-strong transition-all"
                                                        title="Lihat"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/competitions/${comp.id}/edit`}
                                                        className="p-2 glass rounded-lg hover:glass-strong transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(comp.id, comp.title)}
                                                        className="p-2 glass rounded-lg hover:bg-red-500/20 transition-all"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="mt-8">
                    <Link href="/admin" className="btn-secondary inline-block">
                        Kembali ke Dashboard Admin
                    </Link>
                </div>
            </div>
        </div>
    );
}
