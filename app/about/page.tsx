import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Target, Users, Trophy, Zap, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
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
                            Tentang <span className="gradient-text">Kami</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Platform terpercaya untuk pendaftaran dan manajemen lomba mahasiswa
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="pb-20">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-8 mb-20">
                        <div className="glass-strong rounded-2xl p-8">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Misi Kami</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Menyediakan platform yang mudah, transparan, dan efisien untuk mahasiswa dalam mengikuti berbagai kompetisi.
                                Kami berkomitmen untuk memfasilitasi pengembangan potensi mahasiswa melalui kompetisi yang berkualitas.
                            </p>
                        </div>

                        <div className="glass-strong rounded-2xl p-8">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Visi Kami</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Menjadi platform lomba mahasiswa terdepan di Indonesia yang menghubungkan talenta muda dengan berbagai
                                kesempatan untuk berkompetisi, belajar, dan berkembang.
                            </p>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">Cara Kerja Platform</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Proses yang mudah dan transparan dari pendaftaran hingga pengumuman pemenang
                            </p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                    1
                                </div>
                                <h3 className="font-bold text-lg mb-2">Daftar Akun</h3>
                                <p className="text-gray-400 text-sm">Buat akun gratis dengan email Anda</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                    2
                                </div>
                                <h3 className="font-bold text-lg mb-2">Pilih Lomba</h3>
                                <p className="text-gray-400 text-sm">Browse dan pilih lomba yang sesuai minat</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                    3
                                </div>
                                <h3 className="font-bold text-lg mb-2">Daftar & Ikuti</h3>
                                <p className="text-gray-400 text-sm">Lengkapi form pendaftaran dan ikuti lomba</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                    4
                                </div>
                                <h3 className="font-bold text-lg mb-2">Raih Prestasi</h3>
                                <p className="text-gray-400 text-sm">Kompetisi dan raih sertifikat/hadiah</p>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">Keuntungan Platform</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Berbagai benefit yang Anda dapatkan dengan menggunakan platform kami
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="glass-strong rounded-2xl p-6">
                                <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                                <h3 className="font-bold text-xl mb-3">Pendaftaran Mudah</h3>
                                <p className="text-gray-400">
                                    Proses pendaftaran yang simple dan cepat, hanya butuh beberapa menit
                                </p>
                            </div>

                            <div className="glass-strong rounded-2xl p-6">
                                <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                                <h3 className="font-bold text-xl mb-3">Transparan</h3>
                                <p className="text-gray-400">
                                    Semua informasi lomba jelas dan transparan, dari syarat hingga hadiah
                                </p>
                            </div>

                            <div className="glass-strong rounded-2xl p-6">
                                <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                                <h3 className="font-bold text-xl mb-3">Sertifikat Digital</h3>
                                <p className="text-gray-400">
                                    Dapatkan sertifikat digital untuk setiap lomba yang Anda ikuti
                                </p>
                            </div>

                            <div className="glass-strong rounded-2xl p-6">
                                <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                                <h3 className="font-bold text-xl mb-3">Beragam Kategori</h3>
                                <p className="text-gray-400">
                                    Coding, Design, Business, Essay, Video, dan banyak kategori lainnya
                                </p>
                            </div>

                            <div className="glass-strong rounded-2xl p-6">
                                <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                                <h3 className="font-bold text-xl mb-3">Update Real-time</h3>
                                <p className="text-gray-400">
                                    Notifikasi dan update status pendaftaran secara real-time
                                </p>
                            </div>

                            <div className="glass-strong rounded-2xl p-6">
                                <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                                <h3 className="font-bold text-xl mb-3">Gratis</h3>
                                <p className="text-gray-400">
                                    Platform 100% gratis untuk semua mahasiswa Indonesia
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Creator Info */}
                    <div className="mb-20">
                        <div className="glass-strong rounded-2xl p-8 max-w-3xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-4xl font-bold">
                                    RP
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Riyan Perdhana Putra</h2>
                                <p className="text-xl text-gray-400 mb-4">Creator & Developer</p>
                                <p className="text-lg gradient-text font-semibold">POLITEKNIK KAMPAR</p>
                            </div>

                            <div className="border-t border-gray-800 pt-6">
                                <p className="text-gray-300 text-center leading-relaxed mb-6">
                                    Platform ini dikembangkan untuk memudahkan mahasiswa dalam mengikuti berbagai kompetisi
                                    dan membantu penyelenggara dalam mengelola lomba dengan lebih efisien.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <a href="mailto:infomahasi@gmail.com" className="btn-secondary text-sm">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Hubungi Kami
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact CTA */}
                    <div className="glass-strong rounded-2xl p-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">Punya Pertanyaan?</h2>
                        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                            Tim kami siap membantu Anda. Jangan ragu untuk menghubungi kami jika ada pertanyaan
                            tentang platform atau lomba yang tersedia.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <div className="flex items-center gap-2 text-gray-300">
                                <Mail className="w-5 h-5 text-purple-400" />
                                <a href="mailto:infomahasi@gmail.com" className="hover:text-white transition-colors">
                                    infomahasi@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Phone className="w-5 h-5 text-purple-400" />
                                <a href="tel:+6285378963269" className="hover:text-white transition-colors">
                                    +62 853-7896-3269
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <MapPin className="w-5 h-5 text-purple-400" />
                                <span>POLITEKNIK KAMPAR, Riau</span>
                            </div>
                        </div>
                        <Link href="/contact" className="btn-primary inline-block">
                            Hubungi Kami
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
