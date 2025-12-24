'use client';

import { useState } from 'react';
import { X, Mail, Phone, User, Hash, Building2 } from 'lucide-react';
import KTMUpload from './KTMUpload';
import { useToast } from '@/contexts/ToastContext';
import type { Competition } from '@/lib/types/competition.types';

interface CompetitionRegistrationModalProps {
    competition: Competition;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CompetitionRegistrationModal({
    competition,
    isOpen,
    onClose,
    onSuccess
}: CompetitionRegistrationModalProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        student_name: '',
        nim: '',
        email: '',
        phone: '',
        university: 'POLITEKNIK KAMPAR',
        ktm_url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.student_name || !formData.nim || !formData.ktm_url) {
            toast.error('Nama, NIM, dan KTM harus diisi');
            return;
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Format email tidak valid');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    competition_id: competition.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mendaftar');
            }

            toast.success('Pendaftaran berhasil! Menunggu persetujuan.');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Gagal mendaftar lomba');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-2xl glass-strong rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold gradient-text mb-1">Daftar Lomba</h2>
                        <p className="text-gray-400 text-sm">{competition.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nama Lengkap */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Nama Lengkap <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.student_name}
                                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                                placeholder="Masukkan nama lengkap"
                                className="w-full pl-11 pr-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                    </div>

                    {/* NIM */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            NIM <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.nim}
                                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                                placeholder="Masukkan NIM"
                                className="w-full pl-11 pr-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                                className="w-full pl-11 pr-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            No. Telepon
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="08xx xxxx xxxx"
                                className="w-full pl-11 pr-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* University */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Universitas
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.university}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                placeholder="Nama universitas"
                                className="w-full pl-11 pr-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* KTM Upload */}
                    <KTMUpload
                        onUploadComplete={(url) => setFormData({ ...formData, ktm_url: url })}
                        currentUrl={formData.ktm_url}
                    />

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 glass hover:glass-strong rounded-xl font-semibold transition-all"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary py-3 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
