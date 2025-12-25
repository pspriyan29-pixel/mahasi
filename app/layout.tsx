import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ToastContainer from '@/components/ui/ToastContainer';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
    metadataBase: new URL('https://mahasi.tech'),
    title: {
        default: 'MAHASI.TECH - Platform Lomba Mahasiswa Indonesia',
        template: '%s | MAHASI.TECH'
    },
    description: 'Platform kompetisi digital untuk mahasiswa Indonesia. Ikuti lomba coding, desain, dan inovasi teknologi. Mahasiswa Berprestasi, Teknologi Terdepan.',
    keywords: ['lomba mahasiswa', 'kompetisi coding', 'hackathon', 'teknologi', 'mahasiswa indonesia', 'politeknik kampar', 'mahasi.tech', 'prestasi mahasiswa', 'sertifikat digital', 'kompetisi desain'],
    authors: [{ name: 'MAHASI.TECH Team' }, { name: 'POLITEKNIK KAMPAR' }],
    creator: 'MAHASI.TECH',
    publisher: 'MAHASI.TECH',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: 'https://mahasi.tech',
        title: 'MAHASI.TECH - Platform Lomba Mahasiswa Indonesia',
        description: 'Platform kompetisi digital untuk mahasiswa Indonesia. Mahasiswa Berprestasi, Teknologi Terdepan.',
        siteName: 'MAHASI.TECH',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'MAHASI.TECH - Platform Lomba Mahasiswa Indonesia',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'MAHASI.TECH - Platform Lomba Mahasiswa Indonesia',
        description: 'Platform kompetisi digital untuk mahasiswa Indonesia',
        images: ['/og-image.png'],
        creator: '@mahasi_tech',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code-here',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <head>
                <meta name="google-adsense-account" content="ca-pub-6133261181364771" />
                <StructuredData />
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6133261181364771"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
            </head>
            <body className="antialiased">
                <AuthProvider>
                    <ToastProvider>
                        {children}
                        <ToastContainer />
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
