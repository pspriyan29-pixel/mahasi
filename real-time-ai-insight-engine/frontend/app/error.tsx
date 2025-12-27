'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to Sentry
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">
                    Something went wrong!
                </h1>

                <p className="text-gray-400 mb-8">
                    We&apos;ve been notified and are working on a fix. Please try again.
                </p>

                {error.message && (
                    <div className="mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-300 font-mono break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={reset}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>

                    <Button
                        variant="outline"
                        asChild
                        className="border-gray-700 text-white hover:bg-gray-800"
                    >
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
