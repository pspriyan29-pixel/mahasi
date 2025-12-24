'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Code2, BookOpen, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import Logo from '@/components/Logo';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, profile, signOut } = useAuth();

    const navLinks = [
        { href: '/', label: 'Beranda' },
        { href: '/competitions', label: 'Lomba' },
        { href: '/about', label: 'Tentang' },
        { href: '/contact', label: 'Kontak' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-gray-800">
            <div className="container-custom">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Logo size="sm" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="btn-secondary flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                {profile?.role === 'instructor' && (
                                    <Link href="/instructor" className="text-gray-300 hover:text-white">
                                        Teach
                                    </Link>
                                )}
                                {profile?.role === 'admin' && (
                                    <Link href="/admin" className="text-gray-300 hover:text-white">
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="text-gray-300 hover:text-white"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn-secondary flex items-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    Masuk
                                </Link>
                                <Link href="/register" className="btn-primary">
                                    Daftar Gratis
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white p-2"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-gray-800">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-gray-300 hover:text-white transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-gray-800 space-y-3">
                                {user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="btn-secondary w-full text-center block"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                signOut();
                                                setIsOpen(false);
                                            }}
                                            className="btn-secondary w-full"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="btn-secondary w-full text-center block"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="btn-primary w-full text-center block"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Daftar Gratis
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
