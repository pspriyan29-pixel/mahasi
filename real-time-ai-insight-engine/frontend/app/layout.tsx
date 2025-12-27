import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'AI Insight Engine - Real-Time Event Analytics',
    description: 'Enterprise-grade real-time event processing and AI-powered anomaly detection platform',
    keywords: ['AI', 'Analytics', 'Real-time', 'Event Processing', 'Anomaly Detection'],
    authors: [{ name: 'AI Insight Engine Team' }],
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
    },
    openGraph: {
        title: 'AI Insight Engine',
        description: 'Real-Time Event Analytics with AI-Powered Insights',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ErrorBoundary>
                    <Providers>
                        {children}
                        <Toaster position="top-right" richColors closeButton />
                    </Providers>
                </ErrorBoundary>
            </body>
        </html>
    )
}
