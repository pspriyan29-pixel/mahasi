import { Card, CardContent } from '@/components/ui/card';
import { Activity, Users, Zap, Database, Cloud, Shield } from 'lucide-react';

export default function AboutPage() {
    const technologies = [
        { name: 'Next.js 14', icon: Zap, description: 'React framework for production' },
        { name: 'Supabase', icon: Database, description: 'PostgreSQL with real-time subscriptions' },
        { name: 'Apache Kafka', icon: Activity, description: 'Distributed event streaming' },
        { name: 'Google Gemini', icon: Cloud, description: 'AI-powered insights' },
        { name: 'Socket.io', icon: Users, description: 'Real-time WebSocket communication' },
        { name: 'Sentry', icon: Shield, description: 'Error tracking & monitoring' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-white mb-6">
                        About <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI Insight Engine</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        A production-ready, enterprise-grade platform for real-time data analytics and AI-powered anomaly detection
                    </p>
                </div>

                {/* Mission */}
                <div className="mb-20">
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-8">
                            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                We&apos;re building the future of real-time analytics by combining cutting-edge AI technology
                                with enterprise-grade infrastructure. Our platform processes millions of events per second,
                                detects anomalies instantly, and provides actionable insights powered by Google&apos;s Gemini AI.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Technology Stack */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Technology Stack</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {technologies.map((tech) => (
                            <Card key={tech.name} className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                            <tech.icon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">{tech.name}</h3>
                                            <p className="text-sm text-gray-400">{tech.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-3">Real-Time Processing</h3>
                                <ul className="space-y-2 text-gray-300">
                                    <li>• Sub-100ms latency</li>
                                    <li>• Millions of events per second</li>
                                    <li>• WebSocket real-time updates</li>
                                    <li>• Kafka-based event streaming</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Insights</h3>
                                <ul className="space-y-2 text-gray-300">
                                    <li>• Automatic anomaly detection</li>
                                    <li>• Natural language explanations</li>
                                    <li>• Predictive analytics</li>
                                    <li>• Smart alerting system</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-3">Enterprise Security</h3>
                                <ul className="space-y-2 text-gray-300">
                                    <li>• Row-level security (RLS)</li>
                                    <li>• Multi-tenancy support</li>
                                    <li>• Encryption at rest</li>
                                    <li>• Complete audit logs</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-3">Developer Experience</h3>
                                <ul className="space-y-2 text-gray-300">
                                    <li>• RESTful API</li>
                                    <li>• Webhook integrations</li>
                                    <li>• Comprehensive documentation</li>
                                    <li>• Error tracking with Sentry</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                        <div className="text-gray-400">Uptime SLA</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">&lt;100ms</div>
                        <div className="text-gray-400">Avg Latency</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">1M+</div>
                        <div className="text-gray-400">Events/Day</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">24/7</div>
                        <div className="text-gray-400">Support</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
