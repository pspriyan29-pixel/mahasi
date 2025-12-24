'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Github, Linkedin, Twitter } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { createClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ContactPage() {
    const toast = useToast();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Semua field harus diisi');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Format email tidak valid');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('contact_submissions')
                .insert({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                } as any);

            if (error) throw error;

            toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            });
        } catch (err: any) {
            console.error('Contact form error:', err);
            toast.error(err.message || 'Gagal mengirim pesan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            Hubungi <span className="gradient-text">Kami</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Punya pertanyaan? Kami siap membantu Anda. Kirim pesan dan kami akan merespons secepat mungkin.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="pb-20">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Contact Cards */}
                            <div className="glass-strong rounded-2xl p-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Email</h3>
                                <p className="text-gray-400 text-sm mb-3">Kirim email kapan saja</p>
                                <a href="mailto:infomahasi@gmail.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                                    infomahasi@gmail.com
                                </a>
                            </div>

                            <div className="glass-strong rounded-2xl p-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Telepon</h3>
                                <p className="text-gray-400 text-sm mb-3">Sen - Jum, 9:00 - 17:00</p>
                                <a href="tel:+6285378963269" className="text-purple-400 hover:text-purple-300 transition-colors">
                                    +62 853-7896-3269
                                </a>
                            </div>

                            <div className="glass-strong rounded-2xl p-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Alamat</h3>
                                <p className="text-gray-400 text-sm mb-3">Kunjungi kantor kami</p>
                                <p className="text-white">
                                    POLITEKNIK KAMPAR<br />
                                    Riau, Indonesia
                                </p>
                            </div>

                            {/* Social Media */}
                            <div className="glass-strong rounded-2xl p-6">
                                <h3 className="font-bold text-lg mb-4">Ikuti Kami</h3>
                                <div className="flex gap-3">
                                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:glass-strong transition-all">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:glass-strong transition-all">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:glass-strong transition-all">
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            {/* Office Hours */}
                            <div className="glass-strong rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-bold text-lg">Jam Operasional</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Senin - Jumat</span>
                                        <span className="text-white">09:00 - 17:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Sabtu</span>
                                        <span className="text-white">10:00 - 14:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Minggu</span>
                                        <span className="text-white">Tutup</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="glass-strong rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <MessageSquare className="w-6 h-6 text-purple-400" />
                                    <h2 className="text-2xl font-bold">Kirim Pesan</h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                                placeholder="John Doe"
                                                disabled={loading}
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email *</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                                placeholder="john@example.com"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Subjek *</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            placeholder="Pertanyaan tentang kursus"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Pesan *</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={6}
                                            className="w-full px-4 py-3 glass-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                                            placeholder="Tulis pesan Anda di sini..."
                                            disabled={loading}
                                        ></textarea>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <LoadingSpinner size="sm" color="white" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Kirim Pesan
                                            </>
                                        )}
                                    </button>

                                    <p className="text-sm text-gray-400 text-center">
                                        * Field wajib diisi. Kami akan merespons dalam 1-2 hari kerja.
                                    </p>
                                </form>
                            </div>

                            {/* FAQ Section */}
                            <div className="glass-strong rounded-2xl p-8 mt-8">
                                <h3 className="text-2xl font-bold mb-6">Pertanyaan Umum</h3>
                                <div className="space-y-4">
                                    <div className="border-b border-gray-800 pb-4">
                                        <h4 className="font-bold mb-2">Berapa lama waktu respons?</h4>
                                        <p className="text-gray-400 text-sm">Kami berusaha merespons semua pesan dalam 1-2 hari kerja.</p>
                                    </div>
                                    <div className="border-b border-gray-800 pb-4">
                                        <h4 className="font-bold mb-2">Apakah ada biaya konsultasi?</h4>
                                        <p className="text-gray-400 text-sm">Konsultasi awal gratis! Kami akan membantu Anda memilih kursus yang tepat.</p>
                                    </div>
                                    <div className="border-b border-gray-800 pb-4">
                                        <h4 className="font-bold mb-2">Bagaimana cara mendaftar kursus?</h4>
                                        <p className="text-gray-400 text-sm">Daftar akun gratis, pilih kursus, dan langsung mulai belajar!</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">Apakah ada sertifikat?</h4>
                                        <p className="text-gray-400 text-sm">Ya! Setiap kursus yang diselesaikan akan mendapat sertifikat digital.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
