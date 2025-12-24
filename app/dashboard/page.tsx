'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import InstructorDashboard from '@/components/dashboard/InstructorDashboard';

export default function DashboardPage() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();

    useEffect(() => {
        // Give auth state time to load before checking
        const timer = setTimeout(() => {
            if (!loading && !user) {
                router.push('/login');
            }
        }, 300);

        return () => clearTimeout(timer);
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

    if (!user) return null;

    // Role-based dashboard routing
    if (profile?.role === 'instructor' || profile?.role === 'admin') {
        return <InstructorDashboard user={user} profile={profile} />;
    }

    // Default to student dashboard
    return <StudentDashboard user={user} profile={profile} />;
}
