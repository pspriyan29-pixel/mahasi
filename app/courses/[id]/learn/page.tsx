'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
    ChevronLeft, ChevronRight, CheckCircle, Circle, PlayCircle, FileText,
    Target, BookOpen, Download, Menu, X
} from 'lucide-react';
import coursesData from '@/lib/data/coursesData';
import { useAuth } from '@/contexts/AuthContext';

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const courseId = parseInt(params.id as string);
    const course = coursesData.find(c => c.id === courseId);

    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<number[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || !course) return null;

    // Flatten all lessons from all modules
    const allLessons = course.syllabus.flatMap(module =>
        module.lessons.map(lesson => ({
            ...lesson,
            moduleTitle: module.title,
            moduleId: module.moduleId
        }))
    );

    const currentLesson = allLessons[currentLessonIndex];
    const progress = ((completedLessons.length / allLessons.length) * 100).toFixed(0);

    const handleMarkComplete = () => {
        if (!completedLessons.includes(currentLesson.id)) {
            setCompletedLessons([...completedLessons, currentLesson.id]);
        }
        // Auto-advance to next lesson
        if (currentLessonIndex < allLessons.length - 1) {
            setCurrentLessonIndex(currentLessonIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentLessonIndex > 0) {
            setCurrentLessonIndex(currentLessonIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentLessonIndex < allLessons.length - 1) {
            setCurrentLessonIndex(currentLessonIndex + 1);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 flex pt-16">
                {/* Sidebar - Course Navigation */}
                <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 glass-strong border-r border-gray-800 overflow-hidden flex flex-col`}>
                    {/* Course Header */}
                    <div className="p-6 border-b border-gray-800">
                        <Link href={`/courses/${course.id}`} className="text-sm text-gray-400 hover:text-white mb-2 block">
                            ← Back to Course
                        </Link>
                        <h2 className="font-bold text-lg line-clamp-2 mb-4">{course.title}</h2>

                        {/* Progress */}
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-400">Progress</span>
                                <span className="font-bold gradient-text">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {completedLessons.length} of {allLessons.length} lessons completed
                            </p>
                        </div>
                    </div>

                    {/* Lessons List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {course.syllabus.map((module, moduleIndex) => (
                            <div key={module.moduleId} className="mb-6">
                                <h3 className="font-bold text-sm mb-3 text-gray-300">
                                    Module {module.moduleId}: {module.title}
                                </h3>
                                <div className="space-y-2">
                                    {module.lessons.map((lesson) => {
                                        const lessonIndex = allLessons.findIndex(l => l.id === lesson.id);
                                        const isActive = lessonIndex === currentLessonIndex;
                                        const isCompleted = completedLessons.includes(lesson.id);

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => setCurrentLessonIndex(lessonIndex)}
                                                className={`w-full text-left p-3 rounded-xl transition-all ${isActive
                                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                                                    : 'glass hover:glass-strong'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                    ) : lesson.type === 'video' ? (
                                                        <PlayCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                                    ) : lesson.type === 'assignment' ? (
                                                        <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                                    ) : (
                                                        <Target className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold line-clamp-2 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                                            {lesson.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <div className="glass-strong border-b border-gray-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 glass rounded-lg hover:glass-strong transition-all"
                            >
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            <div>
                                <p className="text-xs text-gray-400">{currentLesson.moduleTitle}</p>
                                <h1 className="font-bold">{currentLesson.title}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                                {currentLessonIndex + 1} / {allLessons.length}
                            </span>
                        </div>
                    </div>

                    {/* Lesson Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto">
                            {/* Video Player Placeholder */}
                            {currentLesson.type === 'video' && (
                                <div className="mb-8">
                                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center mb-4">
                                        <div className="text-center">
                                            <PlayCircle className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                                            <p className="text-gray-400">Video Player</p>
                                            {'videoUrl' in currentLesson && (
                                                <p className="text-sm text-gray-500">{currentLesson.videoUrl}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* Lesson Description */}
                            <div className="glass-strong rounded-2xl p-6 mb-6">
                                <h2 className="text-2xl font-bold mb-4">About This Lesson</h2>
                                <p className="text-gray-300 leading-relaxed">{currentLesson.description}</p>
                            </div>

                            {/* Assignment Details */}
                            {currentLesson.type === 'assignment' && 'requirements' in currentLesson && (
                                <div className="glass-strong rounded-2xl p-6 mb-6">
                                    <h2 className="text-2xl font-bold mb-4">Assignment Requirements</h2>
                                    <ul className="space-y-3">
                                        {currentLesson.requirements?.map((req, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-300">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {currentLesson.points && (
                                        <div className="mt-6 pt-6 border-t border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Points</span>
                                                <span className="text-2xl font-bold gradient-text">{currentLesson.points}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quiz Info */}
                            {currentLesson.type === 'quiz' && 'questions' in currentLesson && (
                                <div className="glass-strong rounded-2xl p-6 mb-6">
                                    <h2 className="text-2xl font-bold mb-4">Quiz Information</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-400 text-sm">Questions</p>
                                            <p className="text-2xl font-bold">{currentLesson.questions}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Passing Score</p>
                                            <p className="text-2xl font-bold">{currentLesson.passingScore}%</p>
                                        </div>
                                    </div>
                                    <button className="btn-primary w-full mt-6">
                                        Start Quiz
                                    </button>
                                </div>
                            )}

                            {/* Resources */}
                            {currentLesson.type === 'video' && 'resources' in currentLesson && currentLesson.resources && (
                                <div className="glass-strong rounded-2xl p-6 mb-6">
                                    <h2 className="text-2xl font-bold mb-4">Resources</h2>
                                    <div className="space-y-3">
                                        {currentLesson.resources.map((resource, index) => (
                                            <a
                                                key={index}
                                                href={resource.url}
                                                className="flex items-center justify-between p-4 glass rounded-xl hover:glass-strong transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Download className="w-5 h-5 text-purple-400" />
                                                    <span className="font-semibold group-hover:gradient-text transition-all">
                                                        {resource.name}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mark Complete Button */}
                            {!completedLessons.includes(currentLesson.id) && (
                                <button
                                    onClick={handleMarkComplete}
                                    className="btn-primary w-full mb-6"
                                >
                                    <CheckCircle className="w-5 h-5 inline mr-2" />
                                    Mark as Complete & Continue
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="glass-strong border-t border-gray-800 p-4">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <button
                                onClick={handlePrevious}
                                disabled={currentLessonIndex === 0}
                                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Previous
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentLessonIndex === allLessons.length - 1}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
