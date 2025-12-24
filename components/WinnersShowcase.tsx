'use client';

import { Trophy, Briefcase, Star, Quote } from 'lucide-react';

const successStories = [
    {
        name: 'Ahmad Rizki',
        role: 'Full-Stack Developer',
        company: 'Tokopedia',
        image: '/api/placeholder/100/100',
        story: 'Dari nol coding sampai diterima di Tokopedia dalam 6 bulan. CodeCamp mengubah hidup saya!',
        course: 'Full-Stack Web Development',
        rating: 5,
    },
    {
        name: 'Siti Nurhaliza',
        role: 'Frontend Engineer',
        company: 'Gojek',
        image: '/api/placeholder/100/100',
        story: 'Kurikulum yang terstruktur dan mentor yang supportive membuat belajar coding jadi mudah.',
        course: 'React & Modern Frontend',
        rating: 5,
    },
    {
        name: 'Budi Santoso',
        role: 'Data Scientist',
        company: 'Bukalapak',
        image: '/api/placeholder/100/100',
        story: 'Project-based learning di CodeCamp sangat membantu saya membangun portfolio yang kuat.',
        course: 'Python for Data Science',
        rating: 5,
    },
];

export default function WinnersShowcase() {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="container-custom relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">Success Stories</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Alumni <span className="gradient-text">Kami</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Bergabung dengan ribuan alumni yang sudah berkarir di perusahaan top
                    </p>
                </div>

                {/* Success Stories Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {successStories.map((story, index) => (
                        <div
                            key={index}
                            className="premium-card group animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-4 right-4 opacity-10">
                                <Quote className="w-16 h-16" />
                            </div>

                            {/* Profile */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                                    {story.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{story.name}</h3>
                                    <p className="text-purple-400 text-sm">{story.role}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-400 text-sm">{story.company}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Story */}
                            <p className="text-gray-300 mb-4 italic">
                                "{story.story}"
                            </p>

                            {/* Course Badge */}
                            <div className="glass px-3 py-1 rounded-full text-xs inline-block mb-4">
                                {story.course}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                {[...Array(story.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Company Logos */}
                <div className="text-center">
                    <p className="text-gray-400 mb-8">Alumni kami bekerja di:</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
                        {['Tokopedia', 'Gojek', 'Bukalapak', 'Traveloka', 'Shopee', 'Grab'].map((company, index) => (
                            <div
                                key={index}
                                className="glass px-6 py-3 rounded-lg font-bold text-lg"
                            >
                                {company}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <p className="text-xl mb-4">
                        Siap menjadi <span className="gradient-text font-bold">success story</span> berikutnya?
                    </p>
                    <a href="/register" className="btn-primary inline-block">
                        Mulai Perjalanan Kamu
                    </a>
                </div>
            </div>
        </section>
    );
}
