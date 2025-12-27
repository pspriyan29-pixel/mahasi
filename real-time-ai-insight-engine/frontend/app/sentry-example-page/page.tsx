'use client';

import Link from 'next/link';
import * as Sentry from "@sentry/nextjs";
import { useEffect } from 'react';

export default function SentryTestPage() {
    useEffect(() => {
        // Log page view
        const { logger } = Sentry;
        logger.info('Sentry test page loaded');
    }, []);

    const handleTestError = () => {
        try {
            // Intentionally trigger an error
            throw new Error('This is a test error from Sentry test page');
        } catch (error) {
            Sentry.captureException(error, {
                tags: {
                    page: 'sentry-test',
                    action: 'button-click'
                }
            });
            alert('Test error sent to Sentry! Check your Sentry dashboard.');
        }
    };

    const handleTestSpan = () => {
        Sentry.startSpan(
            {
                op: "ui.click",
                name: "Test Span Button Click",
            },
            (span) => {
                span.setAttribute("test_attribute", "test_value");
                span.setAttribute("timestamp", new Date().toISOString());

                const { logger } = Sentry;
                logger.info('Test span created', {
                    spanId: span.spanContext().spanId,
                    traceId: span.spanContext().traceId
                });

                alert('Test span created! Check your Sentry performance monitoring.');
            },
        );
    };

    const handleUnhandledError = () => {
        // This will cause an undefined function error
        // @ts-expect-error - Intentionally calling undefined function for testing
        myUndefinedFunction();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="max-w-2xl w-full p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
                <h1 className="text-4xl font-bold text-white mb-4">
                    Sentry Integration Test
                </h1>
                <p className="text-gray-300 mb-8">
                    Click the buttons below to test Sentry error tracking and performance monitoring.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleTestError}
                        className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
                    >
                        🔴 Test Error Tracking
                    </button>

                    <button
                        onClick={handleTestSpan}
                        className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
                    >
                        📊 Test Performance Span
                    </button>

                    <button
                        onClick={handleUnhandledError}
                        className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
                    >
                        ⚠️ Test Unhandled Error
                    </button>
                </div>

                <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
                    <h2 className="text-lg font-semibold text-white mb-2">
                        Expected Results:
                    </h2>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                        <li>Errors should appear in your Sentry Issues dashboard</li>
                        <li>Performance spans should appear in Performance monitoring</li>
                        <li>Logs should be captured in Sentry</li>
                    </ul>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
