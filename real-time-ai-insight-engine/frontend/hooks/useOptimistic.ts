'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseOptimisticOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
}

/**
 * Hook for optimistic UI updates
 * Provides instant feedback by updating UI before API call completes
 */
export function useOptimistic<T, TArgs extends any[]>(
    mutationFn: (...args: TArgs) => Promise<T>,
    options: UseOptimisticOptions<T> = {}
) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const mutate = useCallback(
        async (...args: TArgs): Promise<T | null> => {
            setIsLoading(true);
            setError(null);

            try {
                // Call the mutation function
                const result = await mutationFn(...args);

                // Show success message
                if (options.successMessage) {
                    toast.success(options.successMessage);
                }

                // Call success callback
                options.onSuccess?.(result);

                return result;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('An error occurred');
                setError(error);

                // Show error message
                const errorMsg = options.errorMessage || error.message;
                toast.error(errorMsg);

                // Call error callback
                options.onError?.(error);

                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [mutationFn, options]
    );

    return {
        mutate,
        isLoading,
        error,
    };
}

/**
 * Hook for optimistic list updates (create, update, delete)
 */
export function useOptimisticList<T extends { id: string }>(
    initialData: T[] = []
) {
    const [data, setData] = useState<T[]>(initialData);
    const [optimisticData, setOptimisticData] = useState<T[]>(initialData);

    /**
     * Optimistically add item to list
     */
    const optimisticAdd = useCallback(
        async (
            tempItem: T,
            createFn: () => Promise<T>
        ): Promise<T | null> => {
            // 1. Immediately add to UI
            setOptimisticData(prev => [tempItem, ...prev]);

            try {
                // 2. Call API
                const result = await createFn();

                // 3. Replace temp item with real data
                setData(prev => [result, ...prev.filter(item => item.id !== tempItem.id)]);
                setOptimisticData(prev => [result, ...prev.filter(item => item.id !== tempItem.id)]);

                return result;
            } catch (error) {
                // 4. Rollback on error
                setOptimisticData(prev => prev.filter(item => item.id !== tempItem.id));
                throw error;
            }
        },
        []
    );

    /**
     * Optimistically update item in list
     */
    const optimisticUpdate = useCallback(
        async (
            id: string,
            updates: Partial<T>,
            updateFn: () => Promise<T>
        ): Promise<T | null> => {
            // Store original for rollback
            const original = optimisticData.find(item => item.id === id);
            if (!original) return null;

            // 1. Immediately update UI
            setOptimisticData(prev =>
                prev.map(item => (item.id === id ? { ...item, ...updates } : item))
            );

            try {
                // 2. Call API
                const result = await updateFn();

                // 3. Update with real data
                setData(prev => prev.map(item => (item.id === id ? result : item)));
                setOptimisticData(prev => prev.map(item => (item.id === id ? result : item)));

                return result;
            } catch (error) {
                // 4. Rollback on error
                setOptimisticData(prev =>
                    prev.map(item => (item.id === id ? original : item))
                );
                throw error;
            }
        },
        [optimisticData]
    );

    /**
     * Optimistically delete item from list
     */
    const optimisticDelete = useCallback(
        async (
            id: string,
            deleteFn: () => Promise<void>
        ): Promise<boolean> => {
            // Store original for rollback
            const original = optimisticData.find(item => item.id === id);
            if (!original) return false;

            // 1. Immediately remove from UI
            setOptimisticData(prev => prev.filter(item => item.id !== id));

            try {
                // 2. Call API
                await deleteFn();

                // 3. Remove from real data
                setData(prev => prev.filter(item => item.id !== id));

                return true;
            } catch (error) {
                // 4. Rollback on error
                setOptimisticData(prev => [...prev, original]);
                throw error;
            }
        },
        [optimisticData]
    );

    /**
     * Reset to server data
     */
    const reset = useCallback((serverData: T[]) => {
        setData(serverData);
        setOptimisticData(serverData);
    }, []);

    return {
        data: optimisticData,
        optimisticAdd,
        optimisticUpdate,
        optimisticDelete,
        reset,
    };
}
