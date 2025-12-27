'use client';

import Link from 'next/link';
import { Activity, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white font-bold text-xl">AI Insight Engine</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-4">
                            Enterprise-grade real-time event processing and AI-powered anomaly detection platform.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/alerts" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Alerts
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/events" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/insights" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Insights
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    API Reference
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Guides
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <a
                                    href="mailto:infomahasi@gmail.com"
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    infomahasi@gmail.com
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <a
                                    href="tel:+6285378963269"
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    +62 853-7896-3269
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">
                                    Indonesia
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm text-center md:text-left">
                            &copy; {currentYear} AI Insight Engine. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                Security
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

