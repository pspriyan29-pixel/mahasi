'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface CompetitionCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string;
    created_at: string;
}

export function useCategories() {
    const [categories, setCategories] = useState<CompetitionCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const supabase = createClient();
            const { data, error: fetchError } = await supabase
                .from('competition_categories')
                .select('*')
                .order('name', { ascending: true });

            if (fetchError) throw fetchError;

            setCategories(data || []);
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            setError(err.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    return { categories, loading, error, refetch: fetchCategories };
}
