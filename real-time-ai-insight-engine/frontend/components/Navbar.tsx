'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, X, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/UserProfile';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'About', href: '/about' },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname?.startsWith(href);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-white font-bold text-base sm:text-lg hidden sm:block">
                            AI Insight Engine
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA & Contact */}
                    <div className="hidden md:flex items-center gap-3 lg:gap-4">
                        <div className="hidden lg:flex items-center gap-3 text-sm">
                            <a
                                href="mailto:infomahasi@gmail.com"
                                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                                title="Email: infomahasi@gmail.com"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                            <a
                                href="tel:+6285378963269"
                                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                                title="Phone: +62 853-7896-3269"
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                        </div>

                        {isAuthenticated ? (
                            <UserProfile />
                        ) : (
                            <Link href="/auth/login">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                                    Get Started
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button & User Profile */}
                    <div className="flex md:hidden items-center gap-3">
                        {isAuthenticated && <UserProfile />}
                        <button
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 touch-manipulation"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-gray-900 border-t border-gray-800">
                    <div className="px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors touch-manipulation ${isActive(item.href)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {!isAuthenticated && (
                            <>
                                <div className="pt-2 pb-2">
                                    <div className="border-t border-gray-800" />
                                </div>
                                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white touch-manipulation">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}

                        <div className="pt-4">
                            <div className="flex flex-col gap-2 text-sm text-gray-400">
                                <a
                                    href="mailto:infomahasi@gmail.com"
                                    className="flex items-center gap-2 hover:text-white transition-colors touch-manipulation py-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span className="break-all">infomahasi@gmail.com</span>
                                </a>
                                <a
                                    href="tel:+6285378963269"
                                    className="flex items-center gap-2 hover:text-white transition-colors touch-manipulation py-2"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>+62 853-7896-3269</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
