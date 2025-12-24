import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CompetitionRegistration } from '@/lib/types/competition.types';

interface UseRegistrationsOptions {
    competitionId?: string;
    status?: string;
}

interface UseRegistrationsReturn {
    registrations: CompetitionRegistration[];
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useRegistrations(options: UseRegistrationsOptions = {}): UseRegistrationsReturn {
    const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            setError(null);

            const supabase = createClient();
            let query = supabase
                .from('competition_registrations')
                .select('*')
                .order('registered_at', { ascending: false });

            // Apply filters
            if (options.competitionId) {
                query = query.eq('competition_id', options.competitionId);
            }

            if (options.status) {
                query = query.eq('status', options.status);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setRegistrations(data || []);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching registrations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [options.competitionId, options.status]);

    return {
        registrations,
        loading,
        error,
        refetch: fetchRegistrations,
    };
}
