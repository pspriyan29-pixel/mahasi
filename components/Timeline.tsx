'use client';

import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

const timelineEvents = [
    {
        date: '1 Januari 2025',
        title: 'Pembukaan Pendaftaran',
        description: 'Pendaftaran dibuka untuk semua kategori kompetisi',
        icon: Calendar,
        status: 'completed',
    },
    {
        date: '15 Januari 2025',
        title: 'Batas Pendaftaran Gelombang 1',
        description: 'Dapatkan early bird discount untuk pendaftaran gelombang pertama',
        icon: Clock,
        status: 'completed',
    },
    {
        date: '1 Februari 2025',
        title: 'Seleksi Administrasi',
        description: 'Tim panitia akan melakukan verifikasi dokumen peserta',
        icon: CheckCircle,
        status: 'active',
    },
    {
        date: '15 Februari 2025',
        title: 'Pengumuman Peserta Lolos',
        description: 'Pengumuman peserta yang lolos seleksi administrasi',
        icon: MapPin,
        status: 'upcoming',
    },
    {
        date: '1 Maret 2025',
        title: 'Babak Penyisihan',
        description: 'Kompetisi babak penyisihan untuk semua kategori',
        icon: MapPin,
        status: 'upcoming',
    },
    {
        date: '15 Maret 2025',
        title: 'Grand Final',
        description: 'Babak final dan pengumuman pemenang',
        icon: MapPin,
        status: 'upcoming',
    },
];

export default function Timeline() {
    return (
        <section id="timeline" className="section-padding relative">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16 animate-fade-in px-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                        Timeline <span className="gradient-text">Kompetisi</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                        Ikuti jadwal penting kompetisi agar tidak ketinggalan informasi
                    </p>
                </div>

                {/* Timeline */}
                <div className="max-w-4xl mx-auto px-4">
                    {timelineEvents.map((event, index) => {
                        const Icon = event.icon;
                        return (
                            <div
                                key={index}
                                className="relative pl-6 sm:pl-8 md:pl-32 pb-8 sm:pb-12 last:pb-0 animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Vertical Line */}
                                {index !== timelineEvents.length - 1 && (
                                    <div className="absolute left-3 sm:left-4 md:left-16 top-8 sm:top-12 w-0.5 h-full bg-gradient-to-b from-purple-500 to-transparent"></div>
                                )}

                                {/* Timeline Dot */}
                                <div className={`absolute left-0 sm:left-0 md:left-12 top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${event.status === 'completed'
                                    ? 'bg-green-500 glow-green'
                                    : event.status === 'active'
                                        ? 'bg-purple-500 glow-purple animate-pulse'
                                        : 'bg-gray-600'
                                    }`}>
                                    {event.status === 'completed' && (
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    )}
                                </div>

                                {/* Content Card */}
                                <div className="premium-card">
                                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${event.status === 'completed'
                                            ? 'bg-green-500/20'
                                            : event.status === 'active'
                                                ? 'bg-purple-500/20'
                                                : 'bg-gray-600/20'
                                            }`}>
                                            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${event.status === 'completed'
                                                ? 'text-green-400'
                                                : event.status === 'active'
                                                    ? 'text-purple-400'
                                                    : 'text-gray-400'
                                                }`} />
                                        </div>

                                        {/* Text Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-xs sm:text-sm text-gray-400">{event.date}</span>
                                                {event.status === 'active' && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">
                                                        Sedang Berlangsung
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-bold mb-2">{event.title}</h3>
                                            <p className="text-sm sm:text-base text-gray-400">{event.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
