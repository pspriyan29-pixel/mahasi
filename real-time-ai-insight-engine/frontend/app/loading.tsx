import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-20">
            <div className="max-w-7xl mx-auto">
                {/* Hero Skeleton */}
                <div className="text-center mb-20">
                    <Skeleton className="h-12 w-64 mx-auto mb-6 bg-gray-800" />
                    <Skeleton className="h-20 w-full max-w-3xl mx-auto mb-6 bg-gray-800" />
                    <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-10 bg-gray-800" />
                    <div className="flex gap-4 justify-center">
                        <Skeleton className="h-14 w-40 bg-gray-800" />
                        <Skeleton className="h-14 w-40 bg-gray-800" />
                    </div>
                </div>

                {/* Features Skeleton */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-6 rounded-lg bg-gray-800/50">
                            <Skeleton className="h-12 w-12 mb-4 bg-gray-700" />
                            <Skeleton className="h-6 w-3/4 mb-2 bg-gray-700" />
                            <Skeleton className="h-4 w-full bg-gray-700" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
