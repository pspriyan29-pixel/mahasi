import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Competition } from '@/lib/types/competition.types';

interface UseCompetitionsOptions {
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
}

interface UseCompetitionsReturn {
    competitions: Competition[];
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useCompetitions(options: UseCompetitionsOptions = {}): UseCompetitionsReturn {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCompetitions = async () => {
        try {
            setLoading(true);
            setError(null);

            const supabase = createClient();
            let query = supabase
                .from('competitions')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply filters
            if (options.status) {
                query = query.eq('status', options.status);
            }

            if (options.category) {
                query = query.eq('category', options.category);
            }

            if (options.search) {
                query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setCompetitions(data || []);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching competitions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetitions();
    }, [options.status, options.category, options.search, options.limit]);

    return {
        competitions,
        loading,
        error,
        refetch: fetchCompetitions,
    };
}
