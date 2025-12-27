'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface User {
    id: string;
    email: string;
    user_metadata: {
        full_name?: string;
        avatar_url?: string;
    };
}

export function useAuth() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Sign in with Google OAuth
     */
    const signInWithGoogle = async () => {
        setLoading(true);
        setError(null);

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
            return { data, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
            setError(message);
            return { data: null, error: message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Sign in with email and password
     */
    const signInWithEmail = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push('/dashboard');
            return { data, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign in';
            setError(message);
            return { data: null, error: message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Sign up with email and password
     */
    const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            return { data, error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign up';
            setError(message);
            return { data: null, error: message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Sign out
     */
    const signOut = async () => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            router.push('/login');
            return { error: null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign out';
            setError(message);
            return { error: message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get current user
     */
    const getUser = async (): Promise<User | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            return user as User | null;
        } catch {
            return null;
        }
    };

    /**
     * Get current session
     */
    const getSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session;
        } catch {
            return null;
        }
    };

    return {
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        getUser,
        getSession,
        loading,
        error,
    };
}
