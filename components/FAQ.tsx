'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: 'Apakah platform ini gratis?',
        answer: 'Ya, platform ini sepenuhnya gratis untuk semua mahasiswa. Anda dapat mendaftar, browse kompetisi, dan mengikuti lomba tanpa biaya apapun.',
    },
    {
        question: 'Siapa saja yang bisa ikut kompetisi?',
        answer: 'Semua mahasiswa aktif dari berbagai kampus di Indonesia dapat mengikuti kompetisi di platform kami. Beberapa kompetisi mungkin memiliki persyaratan khusus yang akan disebutkan di deskripsi lomba.',
    },
    {
        question: 'Bagaimana cara mendaftar kompetisi?',
        answer: 'Setelah membuat akun, Anda dapat browse kompetisi yang tersedia, klik "Daftar Sekarang" pada lomba yang diminati, isi form pendaftaran, dan submit karya Anda sesuai deadline.',
    },
    {
        question: 'Apakah saya akan mendapat sertifikat?',
        answer: 'Ya! Semua pemenang akan mendapatkan sertifikat digital yang dapat digunakan untuk portofolio dan CV. Sertifikat akan dikirim via email setelah pengumuman resmi.',
    },
    {
        question: 'Bagaimana sistem penilaian kompetisi?',
        answer: 'Setiap kompetisi memiliki kriteria penilaian yang berbeda dan akan dijelaskan di halaman detail lomba. Penilaian dilakukan oleh juri yang berkompeten di bidangnya.',
    },
    {
        question: 'Kapan pengumuman pemenang?',
        answer: 'Tanggal pengumuman pemenang akan disebutkan di halaman detail kompetisi. Anda juga akan mendapat notifikasi email jika terpilih sebagai pemenang.',
    },
    {
        question: 'Apakah bisa ikut lebih dari satu kompetisi?',
        answer: 'Tentu saja! Anda dapat mengikuti sebanyak mungkin kompetisi yang Anda minati, selama memenuhi persyaratan dan dapat mengelola waktu dengan baik.',
    },
    {
        question: 'Bagaimana cara mengklaim hadiah?',
        answer: 'Pemenang akan dihubungi oleh tim kami melalui email untuk proses klaim hadiah. Pastikan data kontak Anda selalu update dan cek email secara berkala.',
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 relative">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Pertanyaan <span className="gradient-text">Umum</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Temukan jawaban untuk pertanyaan yang sering diajukan
                    </p>
                </div>

                {/* FAQ List */}
                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="glass-strong rounded-2xl overflow-hidden animate-slide-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {/* Question */}
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="text-lg font-semibold pr-4">{faq.question}</span>
                                <ChevronDown
                                    className={`w-6 h-6 text-purple-400 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            {/* Answer */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <div className="px-6 pb-6 text-gray-400 leading-relaxed">{faq.answer}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="text-center mt-12">
                    <p className="text-gray-400 mb-4">Masih ada pertanyaan?</p>
                    <a href="/contact" className="btn-secondary inline-block">
                        Hubungi Kami
                    </a>
                </div>
            </div>
        </section>
    );
}
