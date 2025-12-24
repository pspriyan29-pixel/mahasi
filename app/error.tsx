'use client';

import { useEffect, useState } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [errorDetails, setErrorDetails] = useState<string>('');

    useEffect(() => {
        // Log error to error tracking service (e.g., Sentry)
        console.error('Application error:', error);
        setErrorDetails(error.message);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-strong rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-10 h-10 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold mb-2">Oops! Terjadi Kesalahan</h2>
                <p className="text-gray-400 mb-6">
                    Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang memperbaikinya.
                </p>

                {process.env.NODE_ENV === 'development' && errorDetails && (
                    <div className="mb-6 p-4 bg-gray-900 rounded-lg text-left">
                        <p className="text-xs text-red-400 font-mono break-all">{errorDetails}</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={reset}
                        className="btn-primary flex-1"
                    >
                        Coba Lagi
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="btn-secondary flex-1"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        </div>
    );
}
