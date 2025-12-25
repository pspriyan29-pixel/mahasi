'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trophy, Users, Calendar, CheckCircle, XCircle, Clock, Eye, Download, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Competition, CompetitionRegistration } from '@/lib/types/competition.types';

export default function CompetitionDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { user, profile } = useAuth();
    const toast = useToast();
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        if (user && profile && params?.id) {
            fetchData();
        }
    }, [user, profile, params?.id]);

    const fetchData = async () => {
        if (!params?.id) return;
        try {
            // Fetch competition
            const compRes = await fetch(`/api/competitions/${params.id}`);
            const compData = await compRes.json();
            if (compRes.ok) {
                setCompetition(compData.competition);
            }

            // Fetch registrations
            const regRes = await fetch(`/api/registrations?competition_id=${params.id}`);
            const regData = await regRes.json();
            if (regRes.ok) {
                setRegistrations(regData.registrations || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`/api/registrations/${id}/approve`, {
                method: 'PUT'
            });

            if (response.ok) {
                toast.success('Pendaftaran disetujui');
                fetchData();
            } else {
                const data = await response.json();
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyetujui pendaftaran');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Alasan penolakan (opsional):');

        try {
            const response = await fetch(`/api/registrations/${id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rejection_reason: reason })
            });

            if (response.ok) {
                toast.success('Pendaftaran ditolak');
                fetchData();
            } else {
                const data = await response.json();
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal menolak pendaftaran');
        }
    };

    const filteredRegistrations = registrations.filter(reg =>
        filter === 'all' || reg.status === filter
    );

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
            approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Disetujui' },
            rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Ditolak' }
        };
        const badge = badges[status as keyof typeof badges] || badges.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return <LoadingSpinner overlay />;
    }

    if (!competition) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-400">Lomba tidak ditemukan</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-custom">
                {/* Header */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </button>

                {/* Competition Info */}
                <div className="glass-strong rounded-xl p-8 mb-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{competition.title}</h1>
                            <p className="text-gray-400">{competition.description}</p>
                            <button
                                onClick={() => router.push(`/instructor/competitions/${competition.id}/edit`)}
                                className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all font-semibold text-sm flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Edit Lomba
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                <p className="text-sm text-gray-400">Peserta</p>
                            </div>
                            <p className="text-2xl font-bold">
                                {competition.current_participants} / {competition.max_participants || '∞'}
                            </p>
                        </div>

                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <p className="text-sm text-gray-400">Disetujui</p>
                            </div>
                            <p className="text-2xl font-bold">
                                {registrations.filter(r => r.status === 'approved').length}
                            </p>
                        </div>

                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-yellow-400" />
                                <p className="text-sm text-gray-400">Pending</p>
                            </div>
                            <p className="text-2xl font-bold">
                                {registrations.filter(r => r.status === 'pending').length}
                            </p>
                        </div>

                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <XCircle className="w-5 h-5 text-red-400" />
                                <p className="text-sm text-gray-400">Ditolak</p>
                            </div>
                            <p className="text-2xl font-bold">
                                {registrations.filter(r => r.status === 'rejected').length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Registrations */}
                <div className="glass-strong rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Pendaftaran Peserta</h2>
                        <div className="flex gap-3">
                            {['all', 'pending', 'approved', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === status
                                        ? 'bg-purple-500 text-white'
                                        : 'glass hover:glass-strong'
                                        }`}
                                >
                                    {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredRegistrations.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">Belum ada pendaftaran</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRegistrations.map((registration) => (
                                <div key={registration.id} className="glass rounded-xl p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold">{registration.student_name}</h3>
                                                {getStatusBadge(registration.status)}
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-400">
                                                <p>NIM: {registration.nim}</p>
                                                <p>Email: {registration.email || '-'}</p>
                                                <p>Phone: {registration.phone || '-'}</p>
                                                <p>Universitas: {registration.university}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Daftar: {new Date(registration.registered_at).toLocaleString('id-ID')}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {registration.ktm_url && (
                                                <a
                                                    href={registration.ktm_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-secondary flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Lihat KTM
                                                </a>
                                            )}

                                            {registration.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(registration.id)}
                                                        className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Setujui
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(registration.id)}
                                                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Tolak
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
