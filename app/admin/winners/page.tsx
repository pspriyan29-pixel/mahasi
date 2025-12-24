'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Calendar, Users, Award, Save } from 'lucide-react';

export default function AdminWinnersPage() {
    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [winners, setWinners] = useState({
        first: '',
        second: '',
        third: '',
    });

    const competitions = [
        { id: '1', title: 'Hackathon 2025', participants: 45 },
        { id: '2', title: 'UI/UX Design Challenge', participants: 32 },
        { id: '3', title: 'Business Plan Competition', participants: 28 },
    ];

    const participants = [
        { id: '1', name: 'Ahmad Rizki', university: 'Universitas Indonesia' },
        { id: '2', name: 'Siti Nurhaliza', university: 'Institut Teknologi Bandung' },
        { id: '3', name: 'Budi Santoso', university: 'Universitas Gadjah Mada' },
        { id: '4', name: 'Dewi Lestari', university: 'Universitas Brawijaya' },
        { id: '5', name: 'Eko Prasetyo', university: 'Institut Teknologi Sepuluh Nopember' },
    ];

    const handlePublish = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual winner announcement
        alert('Pemenang berhasil diumumkan!');
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
                        Umumkan <span className="gradient-text">Pemenang</span>
                    </h1>
                    <p className="text-gray-400">Pilih kompetisi dan tentukan pemenangnya</p>
                </div>

                <form onSubmit={handlePublish} className="space-y-6">
                    {/* Select Competition */}
                    <div className="glass-strong rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-purple-400" />
                            Pilih Kompetisi
                        </h2>
                        <select
                            value={selectedCompetition}
                            onChange={(e) => setSelectedCompetition(e.target.value)}
                            className="input-premium"
                            required
                        >
                            <option value="">-- Pilih Kompetisi --</option>
                            {competitions.map((comp) => (
                                <option key={comp.id} value={comp.id}>
                                    {comp.title} ({comp.participants} peserta)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Winner Selection */}
                    {selectedCompetition && (
                        <div className="glass-strong rounded-2xl p-6 animate-fade-in">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Award className="w-6 h-6 text-yellow-400" />
                                Pilih Pemenang
                            </h2>

                            <div className="space-y-6">
                                {/* 1st Place */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-sm font-bold">
                                            1
                                        </div>
                                        Juara 1
                                    </label>
                                    <select
                                        value={winners.first}
                                        onChange={(e) => setWinners({ ...winners, first: e.target.value })}
                                        className="input-premium"
                                        required
                                    >
                                        <option value="">-- Pilih Pemenang --</option>
                                        {participants.map((participant) => (
                                            <option key={participant.id} value={participant.id}>
                                                {participant.name} - {participant.university}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 2nd Place */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-sm font-bold">
                                            2
                                        </div>
                                        Juara 2
                                    </label>
                                    <select
                                        value={winners.second}
                                        onChange={(e) => setWinners({ ...winners, second: e.target.value })}
                                        className="input-premium"
                                        required
                                    >
                                        <option value="">-- Pilih Pemenang --</option>
                                        {participants.map((participant) => (
                                            <option key={participant.id} value={participant.id}>
                                                {participant.name} - {participant.university}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 3rd Place */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-bold">
                                            3
                                        </div>
                                        Juara 3
                                    </label>
                                    <select
                                        value={winners.third}
                                        onChange={(e) => setWinners({ ...winners, third: e.target.value })}
                                        className="input-premium"
                                        required
                                    >
                                        <option value="">-- Pilih Pemenang --</option>
                                        {participants.map((participant) => (
                                            <option key={participant.id} value={participant.id}>
                                                {participant.name} - {participant.university}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Publish Button */}
                    {selectedCompetition && (
                        <div className="flex justify-end gap-4">
                            <Link href="/admin" className="btn-secondary">
                                Batal
                            </Link>
                            <button type="submit" className="btn-primary">
                                <Save className="w-5 h-5 inline mr-2" />
                                Publikasikan Pemenang
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
