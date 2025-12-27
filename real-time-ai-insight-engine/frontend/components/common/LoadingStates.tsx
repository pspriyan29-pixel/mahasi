import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Skeleton for dashboard cards
export function DashboardCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
            </CardContent>
        </Card>
    );
}

// Skeleton for charts
export function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="w-full" style={{ height: `${height}px` }} />
            </CardContent>
        </Card>
    );
}

// Skeleton for table rows
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <div className="flex gap-4 py-3 border-b">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
    );
}

// Skeleton for list items
export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

// Full page loading spinner
export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}

// Inline spinner
export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{text}</span>
        </div>
    );
}

// Button loading state
export function ButtonLoader() {
    return <Loader2 className="h-4 w-4 animate-spin" />;
}

// Shimmer effect for images
export function ImageSkeleton({ aspectRatio = '16/9' }: { aspectRatio?: string }) {
    return (
        <div
            className="relative overflow-hidden rounded-lg bg-muted"
            style={{ aspectRatio }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
    );
}
