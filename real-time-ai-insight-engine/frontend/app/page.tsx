'use client';

import Link from 'next/link';
import { ArrowRight, Activity, Zap, Shield, TrendingUp, BarChart3, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                {/* Animated Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-fade-in">
                            <Activity className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-400 font-medium">Real-Time AI-Powered Analytics</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
                            Transform Data Into
                            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Actionable Insights
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 animate-fade-in-up delay-100">
                            Harness the power of AI and real-time analytics to detect anomalies,
                            predict trends, and make data-driven decisions instantly.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-200">
                            <Link href="/dashboard">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg group">
                                    Get Started
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/docs">
                                <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800 px-8 py-6 text-lg">
                                    View Documentation
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-in-up delay-300">
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                                <div className="text-sm text-gray-400">Uptime</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">&lt;100ms</div>
                                <div className="text-sm text-gray-400">Latency</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">1M+</div>
                                <div className="text-sm text-gray-400">Events/Day</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Powerful Features for Modern Teams
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Everything you need to monitor, analyze, and optimize your data streams
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                    <Zap className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Real-Time Processing</h3>
                                <p className="text-gray-400">
                                    Process millions of events per second with sub-100ms latency using Apache Kafka
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                                    <Activity className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Insights</h3>
                                <p className="text-gray-400">
                                    Leverage Google Gemini AI for intelligent anomaly detection and predictive analytics
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                                    <Shield className="w-6 h-6 text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
                                <p className="text-gray-400">
                                    Row-level security, encryption at rest, and SOC 2 compliance built-in
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 4 */}
                        <Card className="bg-gray-800/50 border-gray-700 hover:border-yellow-500/50 transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Predictive Analytics</h3>
                                <p className="text-gray-400">
                                    Forecast trends and identify patterns before they become critical issues
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 5 */}
                        <Card className="bg-gray-800/50 border-gray-700 hover:border-pink-500/50 transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                                    <BarChart3 className="w-6 h-6 text-pink-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Beautiful Dashboards</h3>
                                <p className="text-gray-400">
                                    Customizable, interactive dashboards with real-time updates and drill-down capabilities
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 6 */}
                        <Card className="bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                                    <Bell className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Smart Alerts</h3>
                                <p className="text-gray-400">
                                    Intelligent alerting system with customizable thresholds and multi-channel notifications
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-gray-400 mb-10">
                        Join thousands of teams already using our platform to make better decisions
                    </p>
                    <Link href="/dashboard">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg">
                            Start Free Trial
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
