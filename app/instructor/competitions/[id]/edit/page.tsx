'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trophy, Calendar, Users, FileText, Award, Save, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BannerUpload from '@/components/BannerUpload';
import { useAuth } from '@/contexts/AuthContext';

export default function EditCompetitionPage() {
    const router = useRouter();
    const params = useParams();
    const toast = useToast();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        max_participants: '',
        requirements: '',
        prizes: '',
        banner_url: '',
        status: 'draft'
    });

    const competitionId = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        if (competitionId && user) {
            fetchCompetition(competitionId);
        }
    }, [competitionId, user]);

    const fetchCompetition = async (id: string) => {
        try {
            const response = await fetch(`/api/competitions/${id}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Gagal memuat data lomba');

            const comp = data.competition;

            // Format dates for input fields (YYYY-MM-DDThh:mm)
            const formatDate = (dateString: string | null) => {
                if (!dateString) return '';
                return new Date(dateString).toISOString().slice(0, 16);
            };

            setFormData({
                title: comp.title,
                description: comp.description || '',
                category: comp.category || '',
                start_date: formatDate(comp.start_date),
                end_date: formatDate(comp.end_date),
                registration_deadline: formatDate(comp.registration_deadline),
                max_participants: comp.max_participants ? comp.max_participants.toString() : '',
                requirements: comp.requirements || '',
                prizes: comp.prizes || '',
                banner_url: comp.banner_url || '',
                status: comp.status
            });

        } catch (error: any) {
            console.error('Error fetching competition:', error);
            toast.error('Gagal memuat data lomba');
            router.push('/instructor/competitions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title) {
            toast.error('Judul lomba harus diisi');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`/api/competitions/${competitionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal memperbarui lomba');
            }

            toast.success('Lomba berhasil diperbarui!');
            router.push(`/instructor/competitions/${competitionId}`);
        } catch (error: any) {
            console.error('Error updating competition:', error);
            toast.error(error.message || 'Gagal memperbarui lomba');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner overlay />;

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Batal Edit
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold gradient-text mb-2">Edit Lomba</h1>
                    <p className="text-gray-400">Perbarui informasi lomba</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="glass-strong rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-purple-400" />
                            Informasi Dasar
                        </h2>

                        <div className="space-y-4">
                            {/* Banner Upload */}
                            <BannerUpload
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, banner_url: url }))}
                                currentUrl={formData.banner_url}
                            />

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Judul Lomba <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Contoh: Lomba Pembuatan Website 2024"
                                    className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Kategori
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option value="Coding">Coding</option>
                                    <option value="Design">Design</option>
                                    <option value="Business">Business</option>
                                    <option value="Innovation">Innovation</option>
                                    <option value="Hackathon">Hackathon</option>
                                    <option value="Research">Research</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Jelaskan detail lomba..."
                                    rows={5}
                                    className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="glass-strong rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            Jadwal
                        </h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Tanggal Selesai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Deadline Pendaftaran
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.registration_deadline}
                                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                                    className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="glass-strong rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-400" />
                            Peserta
                        </h2>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Maksimal Peserta
                            </label>
                            <input
                                type="number"
                                value={formData.max_participants}
                                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                placeholder="Kosongkan untuk unlimited"
                                min="1"
                                className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-sm text-gray-500 mt-2">Kosongkan jika tidak ada batasan peserta</p>
                        </div>
                    </div>

                    {/* Requirements & Prizes */}
                    <div className="glass-strong rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" />
                            Detail Tambahan
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Persyaratan
                                </label>
                                <textarea
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    placeholder="Contoh: Mahasiswa aktif, Upload KTM, dll"
                                    rows={4}
                                    className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Detail Hadiah
                                </label>
                                <textarea
                                    value={formData.prizes}
                                    onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                                    placeholder="Baris pertama akan menjadi Highlight Hadiah Utama.&#10;Contoh:&#10;Total Hadiah Rp 10.000.000&#10;Juara 1: Rp 5.000.000&#10;Juara 2: Rp 3.000.000"
                                    rows={4}
                                    className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-xs text-gray-400 mt-2">* Baris pertama akan ditampilkan pada kartu lomba sebagai Highlight Hadiah</p>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="glass-strong rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Status Publikasi</h2>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-4 glass hover:glass-strong rounded-xl cursor-pointer transition-all">
                                <input
                                    type="radio"
                                    name="status"
                                    value="draft"
                                    checked={formData.status === 'draft'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <div>
                                    <p className="font-semibold">Draft</p>
                                    <p className="text-sm text-gray-400">Simpan sebagai draft, tidak tampil di public</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 glass hover:glass-strong rounded-xl cursor-pointer transition-all">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={formData.status === 'active'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <div>
                                    <p className="font-semibold">Aktif</p>
                                    <p className="text-sm text-gray-400">Publikasikan dan tampilkan di landing page</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 glass hover:glass-strong rounded-xl cursor-pointer transition-all">
                                <input
                                    type="radio"
                                    name="status"
                                    value="closed"
                                    checked={formData.status === 'closed'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <div>
                                    <p className="font-semibold">Ditutup</p>
                                    <p className="text-sm text-gray-400">Tutup pendaftaran, tidak menerima peserta baru</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 glass hover:glass-strong rounded-xl cursor-pointer transition-all">
                                <input
                                    type="radio"
                                    name="status"
                                    value="completed"
                                    checked={formData.status === 'completed'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-4 h-4"
                                />
                                <div>
                                    <p className="font-semibold">Selesai</p>
                                    <p className="text-sm text-gray-400">Lomba telah berakhir</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 px-4 glass hover:glass-strong rounded-xl font-semibold transition-all"
                            disabled={saving}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                            disabled={saving}
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
