'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useRealtimeSubscription(table: string, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*') {
    const [isConnected, setIsConnected] = useState(false)
    const queryClient = useQueryClient()
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel(`realtime-${table}`)
            .on(
                'postgres_changes' as any,
                {
                    event,
                    schema: 'public',
                    table,
                },
                (payload: any) => {
                    console.log(`Realtime ${event} on ${table}:`, payload)

                    // Invalidate relevant queries
                    queryClient.invalidateQueries({ queryKey: [table] })

                    // Show toast notification
                    if (event === 'INSERT' || event === '*') {
                        toast.success(`New ${table.slice(0, -1)} received`, {
                            description: 'Data updated in real-time',
                        })
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true)
                    console.log(`✅ Subscribed to ${table}`)
                } else if (status === 'CLOSED') {
                    setIsConnected(false)
                    console.log(`❌ Unsubscribed from ${table}`)
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [table, event, queryClient, supabase])

    return { isConnected }
}

export function useOptimisticUpdate<T>(queryKey: string[]) {
    const queryClient = useQueryClient()

    const optimisticUpdate = async (
        updateFn: () => Promise<T>,
        optimisticData: (oldData: T | undefined) => T
    ) => {
        // Snapshot the previous value
        const previousData = queryClient.getQueryData<T>(queryKey)

        // Optimistically update to the new value
        queryClient.setQueryData(queryKey, optimisticData)

        try {
            // Perform the actual update
            const result = await updateFn()

            // Update with real data
            queryClient.setQueryData(queryKey, result)

            return result
        } catch (error) {
            // Rollback on error
            queryClient.setQueryData(queryKey, previousData)
            throw error
        }
    }

    return { optimisticUpdate }
}

export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue
        }
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(error)
            return initialValue
        }
    })

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            }
        } catch (error) {
            console.error(error)
        }
    }

    return [storedValue, setValue] as const
}
