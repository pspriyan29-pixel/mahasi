'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string, role: 'student' | 'instructor') => Promise<void>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInAndRedirect: (email: string, password: string) => Promise<boolean>;
    signUpAndRedirect: (email: string, password: string, fullName: string, role: 'student' | 'instructor') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
    };

    const signInAndRedirect = async (email: string, password: string): Promise<boolean> => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Poll for session with retry logic (max 5 seconds)
        for (let i = 0; i < 10; i++) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await loadProfile(session.user.id);
                // Extra wait to ensure state is updated in React
                await new Promise(resolve => setTimeout(resolve, 200));
                return true;
            }
            // Wait 500ms before retry
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.error('Session not established after login');
        return false;
    };

    const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'instructor') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        });

        if (error) throw error;

        // Create profile
        if (data.user) {
            const profileData = {
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: role,
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .insert(profileData as any);

            if (profileError) throw profileError;
        }

    };

    const signUpAndRedirect = async (email: string, password: string, fullName: string, role: 'student' | 'instructor'): Promise<boolean> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        });

        if (error) throw error;

        // Create profile and wait for completion
        if (data.user) {
            const profileData = {
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: role,
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .insert(profileData as any);

            if (profileError) {
                console.error('Profile creation error:', profileError);
                throw profileError;
            }

            // Poll for session with retry logic (max 5 seconds)
            for (let i = 0; i < 10; i++) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await loadProfile(session.user.id);
                    // Extra wait to ensure state is updated in React
                    await new Promise(resolve => setTimeout(resolve, 200));
                    return true;
                }
                // Wait 500ms before retry
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.error('Session not established after signup');
        }
        return false;
    };



    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        router.push('/');
    };

    const signInWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;

            // OAuth will redirect, so we don't need to do anything else here
            // The callback route will handle profile creation and redirect to dashboard
        } catch (error: any) {
            console.error('Google OAuth error:', error);
            throw new Error(error.message || 'Failed to initiate Google login');
        }
    };



    const value = {
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInAndRedirect,
        signUpAndRedirect,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
