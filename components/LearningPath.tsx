'use client';

import { CheckCircle2, Circle } from 'lucide-react';

const learningPath = [
    {
        title: 'Fundamentals',
        description: 'HTML, CSS, JavaScript basics',
        modules: ['HTML5 & Semantic Markup', 'CSS3 & Flexbox/Grid', 'JavaScript ES6+', 'Git & GitHub'],
        completed: true,
    },
    {
        title: 'Frontend Development',
        description: 'Modern frontend frameworks',
        modules: ['React Fundamentals', 'State Management', 'React Router', 'API Integration'],
        completed: true,
    },
    {
        title: 'Backend Development',
        description: 'Server-side programming',
        modules: ['Node.js & Express', 'RESTful APIs', 'Database Design', 'Authentication'],
        completed: false,
    },
    {
        title: 'Full-Stack Projects',
        description: 'Build real-world applications',
        modules: ['E-commerce Platform', 'Social Media App', 'Task Management', 'Portfolio Website'],
        completed: false,
    },
    {
        title: 'Advanced Topics',
        description: 'Production-ready skills',
        modules: ['Testing & CI/CD', 'Performance Optimization', 'Security Best Practices', 'Cloud Deployment'],
        completed: false,
    },
];

export default function LearningPath() {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="container-custom relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Learning <span className="gradient-text">Path</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Jalur pembelajaran terstruktur dari pemula hingga profesional
                    </p>
                </div>

                {/* Learning Path Timeline */}
                <div className="max-w-4xl mx-auto">
                    {learningPath.map((stage, index) => (
                        <div
                            key={index}
                            className="relative pl-8 md:pl-12 pb-12 last:pb-0 animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Timeline Line */}
                            {index !== learningPath.length - 1 && (
                                <div className="absolute left-[15px] md:left-[23px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>
                            )}

                            {/* Timeline Dot */}
                            <div className="absolute left-0 md:left-2 top-0">
                                {stage.completed ? (
                                    <CheckCircle2 className="w-8 h-8 text-green-400 fill-green-400/20" />
                                ) : (
                                    <Circle className="w-8 h-8 text-gray-600" />
                                )}
                            </div>

                            {/* Content Card */}
                            <div className={`glass-strong rounded-2xl p-6 hover-lift ${stage.completed ? 'border-l-4 border-green-400' : ''}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2 gradient-text">
                                            {stage.title}
                                        </h3>
                                        <p className="text-gray-400">
                                            {stage.description}
                                        </p>
                                    </div>
                                    {stage.completed && (
                                        <span className="glass px-3 py-1 rounded-full text-xs font-semibold text-green-400">
                                            Completed
                                        </span>
                                    )}
                                </div>

                                {/* Modules Grid */}
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {stage.modules.map((module, i) => (
                                        <div
                                            key={i}
                                            className="glass rounded-lg p-3 flex items-center gap-2 hover:glass-strong transition-all"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${stage.completed ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                                            <span className="text-sm">{module}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <a href="/register" className="btn-primary inline-block">
                        Mulai Learning Path Kamu
                    </a>
                </div>
            </div>
        </section>
    );
}
