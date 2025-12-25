'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Users, Trophy, FileText, ArrowLeft, Clock, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CompetitionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, profile } = useAuth();
    const toast = useToast();
    const [competition, setCompetition] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ nim: '', phone: '' });

    // Handle params.id which can be string or string[]
    const competitionId = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        if (competitionId) {
            fetchCompetition(competitionId);
            if (user) {
                checkRegistrationStatus(competitionId);
            }
        }
    }, [competitionId, user]);

    const fetchCompetition = async (id: string) => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('competitions')
                .select('*, profiles(full_name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setCompetition(data);
        } catch (error) {
            console.error('Error fetching competition:', error);
            toast.error('Gagal memuat detail lomba');
        } finally {
            setLoading(false);
        }
    };

    const checkRegistrationStatus = async (id: string) => {
        try {
            if (!user?.email) return; // Guard clause to ensure email exists

            const supabase = createClient();
            const { data } = await supabase
                .from('competition_registrations')
                .select('*')
                .eq('competition_id', id)
                .eq('email', user.email) // Now TypeScript knows email is defined
                .single();

            if (data) setIsRegistered(true);
        } catch (error) {
            // No registration found
        }
    };

    const handleRegisterClick = () => {
        if (!user) {
            toast.error('Silakan login terlebih dahulu');
            router.push('/login');
            return;
        }

        if (profile?.role !== 'student') {
            toast.error('Hanya mahasiswa yang dapat mendaftar lomba');
            return;
        }

        setShowModal(true);
    };

    const handleConfirmRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nim) {
            toast.error('NIM wajib diisi');
            return;
        }

        setRegistering(true);
        try {
            const response = await fetch('/api/competitions/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    competition_id: competition.id,
                    nim: formData.nim,
                    phone: formData.phone
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Gagal mendaftar');

            toast.success('Berhasil mendaftar lomba!');
            setIsRegistered(true);
            setShowModal(false);
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Gagal mendaftar lomba');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    if (!competition) return <div className="min-h-screen flex items-center justify-center">Lomba tidak ditemukan</div>;

    const isRegistrationOpen = new Date(competition.registration_deadline) > new Date();

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            {/* Registration Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full animate-scale-in">
                        <h3 className="text-xl font-bold mb-4">Lengkapi Data Pendaftaran</h3>
                        <form onSubmit={handleConfirmRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">NIM <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    value={formData.nim}
                                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                                    placeholder="Contoh: 20241038"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Nomor WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                                    placeholder="Contoh: 081234567890"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={registering}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {registering ? 'Memproses...' : 'Daftar Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Banner Section */}
            <div className="relative h-[400px] w-full">
                {competition.banner_url ? (
                    <Image
                        src={competition.banner_url}
                        alt={competition.title}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900 opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 pb-12">
                    <div className="container-custom">
                        <Link href="/competitions" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Daftar Lomba
                        </Link>

                        <div className="flex flex-wrap items-end justify-between gap-6">
                            <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${competition.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                    {competition.category || 'Umum'}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">{competition.title}</h1>
                                <div className="flex flex-wrap gap-6 text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-purple-400" />
                                        <span>Deadline: {new Date(competition.registration_deadline).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-400" />
                                        <span>{competition.current_participants} Peserta</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                        <span>Total Hadiah: Lihat Detail</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="glass-strong rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-purple-400" />
                                Deskripsi Lomba
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                                    {competition.description}
                                </p>
                            </div>
                        </div>

                        {/* Prizes */}
                        <div className="glass-strong rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-400" />
                                Hadiah & Penghargaan
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-gray-300 bg-transparent p-0">
                                    {competition.prizes || 'Informasi hadiah belum tersedia.'}
                                </pre>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="glass-strong rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                                Persyaratan
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-gray-300 bg-transparent p-0">
                                    {competition.requirements || 'Tidak ada persyaratan khusus.'}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Registration Card */}
                        <div className="glass-strong rounded-2xl p-6 sticky top-24">
                            <h3 className="text-xl font-bold mb-4">Pendaftaran</h3>

                            {isRegistered ? (
                                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-4 text-center">
                                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                    <p className="font-semibold text-green-400">Anda sudah terdaftar</p>
                                    <p className="text-xs text-green-300 mt-1">Cek dashboard untuk update</p>
                                </div>
                            ) : !isRegistrationOpen ? (
                                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4 text-center">
                                    <Clock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                    <p className="font-semibold text-red-400">Pendaftaran Ditutup</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegisterClick}
                                    disabled={registering}
                                    className="w-full btn-primary py-4 text-lg font-bold mb-4 flex items-center justify-center gap-2"
                                >
                                    {registering ? 'Memproses...' : 'Daftar Sekarang'}
                                </button>
                            )}

                            <div className="space-y-4 text-sm text-gray-400">
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span>Biaya Pendaftaran</span>
                                    <span className="text-green-400 font-semibold">GRATIS</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span>Batas Pendaftaran</span>
                                    <span>{new Date(competition.registration_deadline).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span>Pengumuman</span>
                                    <span>{new Date(competition.end_date).toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Share */}
                        <div className="glass-strong rounded-2xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Bagikan
                            </h3>
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors text-sm font-semibold">
                                    WhatsApp
                                </button>
                                <button className="flex-1 py-2 rounded-lg bg-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/30 transition-colors text-sm font-semibold">
                                    Twitter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
