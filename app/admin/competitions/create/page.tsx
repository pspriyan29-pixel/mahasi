'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';

export default function CreateCompetitionPage() {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        requirements: [''],
        deadline: '',
        registrationFee: '',
        prize1: '',
        prize2: '',
        prize3: '',
        maxParticipants: '',
    });

    const addRequirement = () => {
        setFormData({
            ...formData,
            requirements: [...formData.requirements, ''],
        });
    };

    const removeRequirement = (index: number) => {
        const newRequirements = formData.requirements.filter((_, i) => i !== index);
        setFormData({ ...formData, requirements: newRequirements });
    };

    const updateRequirement = (index: number, value: string) => {
        const newRequirements = [...formData.requirements];
        newRequirements[index] = value;
        setFormData({ ...formData, requirements: newRequirements });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual competition creation
        alert('Kompetisi berhasil dibuat!');
    };

    return (
        <div className="min-h-screen animated-bg p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">
                        Buat <span className="gradient-text">Kompetisi Baru</span>
                    </h1>
                    <p className="text-gray-400">Isi formulir di bawah untuk membuat kompetisi baru</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="glass-strong rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Informasi Dasar</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nama Kompetisi</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-premium"
                                    placeholder="Hackathon 2025"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Kategori</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-premium"
                                    required
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    <option value="programming">Programming</option>
                                    <option value="design">Design</option>
                                    <option value="innovation">Innovation</option>
                                    <option value="entrepreneurship">Entrepreneurship</option>
                                    <option value="team">Team Challenge</option>
                                    <option value="academic">Academic</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-premium min-h-32"
                                    placeholder="Deskripsi kompetisi..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="glass-strong rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Persyaratan</h2>
                            <button
                                type="button"
                                onClick={addRequirement}
                                className="btn-secondary text-sm"
                            >
                                <Plus className="w-4 h-4 inline mr-1" />
                                Tambah
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.requirements.map((req, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={req}
                                        onChange={(e) => updateRequirement(index, e.target.value)}
                                        className="input-premium flex-1"
                                        placeholder={`Persyaratan ${index + 1}`}
                                        required
                                    />
                                    {formData.requirements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRequirement(index)}
                                            className="glass p-3 rounded-lg hover:glass-strong text-red-400"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="glass-strong rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Detail Kompetisi</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Batas Pendaftaran</label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="input-premium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Biaya Pendaftaran (Rp)</label>
                                <input
                                    type="number"
                                    value={formData.registrationFee}
                                    onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
                                    className="input-premium"
                                    placeholder="0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Maksimal Peserta</label>
                                <input
                                    type="number"
                                    value={formData.maxParticipants}
                                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                    className="input-premium"
                                    placeholder="100"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Prizes */}
                    <div className="glass-strong rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Hadiah</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Juara 1 (Rp)</label>
                                <input
                                    type="number"
                                    value={formData.prize1}
                                    onChange={(e) => setFormData({ ...formData, prize1: e.target.value })}
                                    className="input-premium"
                                    placeholder="10000000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Juara 2 (Rp)</label>
                                <input
                                    type="number"
                                    value={formData.prize2}
                                    onChange={(e) => setFormData({ ...formData, prize2: e.target.value })}
                                    className="input-premium"
                                    placeholder="7500000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Juara 3 (Rp)</label>
                                <input
                                    type="number"
                                    value={formData.prize3}
                                    onChange={(e) => setFormData({ ...formData, prize3: e.target.value })}
                                    className="input-premium"
                                    placeholder="5000000"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link href="/admin" className="btn-secondary">
                            Batal
                        </Link>
                        <button type="submit" className="btn-primary">
                            <Save className="w-5 h-5 inline mr-2" />
                            Buat Kompetisi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
