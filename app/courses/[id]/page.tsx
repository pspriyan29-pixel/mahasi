'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    Clock, Users, Star, Award, BookOpen, PlayCircle, FileText, CheckCircle,
    ChevronDown, ChevronUp, Calendar, Target, TrendingUp, Download, Share2
} from 'lucide-react';
import coursesData from '@/lib/data/coursesData';

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = parseInt(params.id as string);
    const course = coursesData.find(c => c.id === courseId);

    const [expandedModule, setExpandedModule] = useState<number | null>(1);
    const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'instructor' | 'reviews'>('overview');

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Course not found</h1>
                    <Link href="/courses" className="btn-primary">
                        Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    const totalLessons = course.syllabus.reduce((acc, module) => acc + module.lessons.length, 0);
    const totalVideos = course.syllabus.reduce((acc, module) =>
        acc + module.lessons.filter(l => l.type === 'video').length, 0
    );
    const totalAssignments = course.syllabus.reduce((acc, module) =>
        acc + module.lessons.filter(l => l.type === 'assignment').length, 0
    );

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 pb-12 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${course.thumbnailGradient} opacity-10`}></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Content */}
                        <div className="lg:col-span-2">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                <Link href="/" className="hover:text-white">Home</Link>
                                <span>/</span>
                                <Link href="/courses" className="hover:text-white">Courses</Link>
                                <span>/</span>
                                <span className="text-white">{course.title}</span>
                            </div>

                            {/* Title & Description */}
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
                            <p className="text-xl text-gray-300 mb-6">{course.description}</p>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-6 mb-6">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold">{course.rating}</span>
                                    <span className="text-gray-400">({course.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <span>{course.students.toLocaleString()} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-gray-400" />
                                    <span className="glass px-3 py-1 rounded-full text-sm">{course.level}</span>
                                </div>
                            </div>

                            {/* Instructor */}
                            <div className="flex items-center gap-4 glass-strong rounded-xl p-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                                    {course.instructor.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Instructor</p>
                                    <p className="font-bold text-lg">{course.instructor.name}</p>
                                    <p className="text-sm text-gray-400">{course.instructor.title} at {course.instructor.company}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Enrollment Card */}
                        <div className="lg:col-span-1">
                            <div className="glass-strong rounded-2xl p-6 sticky top-24">
                                {/* Thumbnail */}
                                <div className={`w-full h-48 rounded-xl bg-gradient-to-br ${course.thumbnailGradient} mb-6 flex items-center justify-center`}>
                                    <PlayCircle className="w-20 h-20 text-white/80" />
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="text-4xl font-bold gradient-text mb-2">GRATIS</div>
                                    {course.originalPrice > 0 && (
                                        <div className="text-gray-400 line-through">
                                            Rp {course.originalPrice.toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                {/* CTA Buttons */}
                                <div className="space-y-3 mb-6">
                                    <Link href={`/courses/${course.id}/learn`} className="btn-primary w-full text-center block">
                                        Mulai Belajar Sekarang
                                    </Link>
                                    <button className="btn-secondary w-full">
                                        <Share2 className="w-4 h-4 inline mr-2" />
                                        Share Course
                                    </button>
                                </div>

                                {/* What's Included */}
                                <div className="border-t border-gray-800 pt-6">
                                    <h3 className="font-bold mb-4">This course includes:</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <PlayCircle className="w-5 h-5 text-purple-400" />
                                            <span>{totalVideos} video lessons</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-cyan-400" />
                                            <span>{totalAssignments} assignments</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Download className="w-5 h-5 text-green-400" />
                                            <span>Downloadable resources</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Award className="w-5 h-5 text-yellow-400" />
                                            <span>Certificate of completion</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-pink-400" />
                                            <span>Lifetime access</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="pb-20">
                <div className="container-custom">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-4 mb-8 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'syllabus', label: 'Syllabus' },
                            { id: 'instructor', label: 'Instructor' },
                            { id: 'reviews', label: 'Reviews' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'glass text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-fade-in">
                                    {/* About Course */}
                                    <div className="glass-strong rounded-2xl p-8">
                                        <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                                        <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                                            {course.longDescription}
                                        </div>
                                    </div>

                                    {/* Learning Outcomes */}
                                    <div className="glass-strong rounded-2xl p-8">
                                        <h2 className="text-2xl font-bold mb-6">What You'll Learn</h2>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {course.learningOutcomes.map((outcome, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                                                    <span className="text-gray-300">{outcome}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Prerequisites */}
                                    <div className="glass-strong rounded-2xl p-8">
                                        <h2 className="text-2xl font-bold mb-6">Prerequisites</h2>
                                        <div className="space-y-3">
                                            {course.prerequisites.map((prereq, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2"></div>
                                                    <span className="text-gray-300">{prereq}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* FAQs */}
                                    {course.faqs && (
                                        <div className="glass-strong rounded-2xl p-8">
                                            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                                            <div className="space-y-4">
                                                {course.faqs.map((faq, index) => (
                                                    <div key={index} className="border-b border-gray-800 last:border-0 pb-4 last:pb-0">
                                                        <h3 className="font-bold mb-2">{faq.question}</h3>
                                                        <p className="text-gray-400">{faq.answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Syllabus Tab */}
                            {activeTab === 'syllabus' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="glass-strong rounded-2xl p-6 mb-6">
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-3xl font-bold gradient-text">{course.syllabus.length}</div>
                                                <div className="text-sm text-gray-400">Modules</div>
                                            </div>
                                            <div>
                                                <div className="text-3xl font-bold gradient-text">{totalLessons}</div>
                                                <div className="text-sm text-gray-400">Lessons</div>
                                            </div>
                                            <div>
                                                <div className="text-3xl font-bold gradient-text">{course.totalHours}h</div>
                                                <div className="text-sm text-gray-400">Total Duration</div>
                                            </div>
                                        </div>
                                    </div>

                                    {course.syllabus.map((module) => (
                                        <div key={module.moduleId} className="glass-strong rounded-2xl overflow-hidden">
                                            {/* Module Header */}
                                            <button
                                                onClick={() => setExpandedModule(expandedModule === module.moduleId ? null : module.moduleId)}
                                                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                                                        {module.moduleId}
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-bold text-lg">{module.title}</h3>
                                                        <p className="text-sm text-gray-400">
                                                            {module.lessons.length} lessons • {module.duration}
                                                        </p>
                                                    </div>
                                                </div>
                                                {expandedModule === module.moduleId ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </button>

                                            {/* Module Lessons */}
                                            {expandedModule === module.moduleId && (
                                                <div className="border-t border-gray-800">
                                                    {module.lessons.map((lesson) => (
                                                        <div
                                                            key={lesson.id}
                                                            className="p-4 border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {lesson.type === 'video' && <PlayCircle className="w-5 h-5 text-purple-400 mt-1" />}
                                                                {lesson.type === 'assignment' && <FileText className="w-5 h-5 text-cyan-400 mt-1" />}
                                                                {lesson.type === 'quiz' && <Target className="w-5 h-5 text-yellow-400 mt-1" />}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <h4 className="font-semibold">{lesson.title}</h4>
                                                                        <span className="text-sm text-gray-400">{lesson.duration}</span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-400">{lesson.description}</p>
                                                                    {lesson.type === 'assignment' && 'points' in lesson && lesson.points && (
                                                                        <div className="mt-2 flex items-center gap-2">
                                                                            <Award className="w-4 h-4 text-yellow-400" />
                                                                            <span className="text-sm text-yellow-400">{lesson.points} points</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Instructor Tab */}
                            {activeTab === 'instructor' && (
                                <div className="glass-strong rounded-2xl p-8 animate-fade-in">
                                    <div className="flex items-start gap-6 mb-6">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold flex-shrink-0">
                                            {course.instructor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">{course.instructor.name}</h2>
                                            <p className="text-lg text-gray-400 mb-4">{course.instructor.title}</p>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-yellow-400" />
                                                    <span>{course.instructor.rating} Instructor Rating</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span>{course.instructor.students.toLocaleString()} Students</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                                    <span>{course.instructor.courses} Courses</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{course.instructor.bio}</p>
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="glass-strong rounded-2xl p-8 animate-fade-in">
                                    <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                                    <div className="text-center py-12">
                                        <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">Reviews coming soon...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="glass-strong rounded-2xl p-6 sticky top-24">
                                <h3 className="font-bold mb-4">Course Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Enrolled</span>
                                        <span className="font-bold">{course.students.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-bold">{course.rating}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Duration</span>
                                        <span className="font-bold">{course.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Level</span>
                                        <span className="font-bold">{course.level}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-800">
                                    <h3 className="font-bold mb-4">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {course.tags.map((tag, index) => (
                                            <span key={index} className="glass px-3 py-1 rounded-full text-sm">
                                                {tag}
                                            </span>
                                        ))}
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
