'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Calendar, Users, FileText, Award, Save } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CreateCompetitionPage() {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
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
        status: 'draft'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title) {
            toast.error('Judul lomba harus diisi');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/competitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal membuat lomba');
            }

            toast.success('Lomba berhasil dibuat!');
            router.push('/instructor/competitions');
        } catch (error: any) {
            console.error('Error creating competition:', error);
            toast.error(error.message || 'Gagal membuat lomba');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12">
            {loading && <LoadingSpinner overlay />}

            <div className="container-custom max-w-4xl">
                {/* Header */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold gradient-text mb-2">Buat Lomba Baru</h1>
                    <p className="text-gray-400">Isi informasi lomba yang akan dibuat</p>
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
                                    Hadiah
                                </label>
                                <textarea
                                    value={formData.prizes}
                                    onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                                    placeholder="Contoh: Juara 1: Rp 5.000.000, Juara 2: Rp 3.000.000"
                                    rows={4}
                                    className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
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
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 px-4 glass hover:glass-strong rounded-xl font-semibold transition-all"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Menyimpan...' : 'Simpan Lomba'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
