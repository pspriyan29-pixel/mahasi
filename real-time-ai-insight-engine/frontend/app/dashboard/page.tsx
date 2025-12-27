'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Activity, 
    TrendingUp, 
    AlertTriangle, 
    Users, 
    Zap, 
    Globe,
    Clock,
    BarChart3,
    Brain,
    Radio,
    Server,
    Database,
    MessageSquare
} from 'lucide-react';
import { useRealtime } from '@/lib/hooks/useRealtime';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    ComposedChart,
} from 'recharts';
import { format, subMinutes, parseISO } from 'date-fns';

interface AIInsight {
    id?: string;
    status: 'NORMAL' | 'ANOMALY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
    possible_causes?: string[];
    recommended_action?: string;
    created_at?: string;
    analyzed_period_start?: string;
    analyzed_period_end?: string;
}

interface Event {
    id: string;
    event_id: string;
    event_type: string;
    region?: string;
    amount?: number;
    timestamp: string;
    user_id?: string;
}

interface Metrics {
    total_events: number;
    events_per_second: number;
    avg_transaction_amount: number;
    active_regions: number;
}

const COLORS = {
    NORMAL: '#10b981',
    ANOMALY_LOW: '#f59e0b',
    ANOMALY_MEDIUM: '#f97316',
    ANOMALY_HIGH: '#ef4444',
};

const SEVERITY_COLORS = {
    LOW: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    MEDIUM: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeAlerts: 0,
        eventsPerSecond: 0,
        activeUsers: 0,
        kafkaLag: 0,
        apiLatency: 0,
    });
    
    const [loading, setLoading] = useState(true);
    const [recentInsights, setRecentInsights] = useState<AIInsight[]>([]);
    const [recentEvents, setRecentEvents] = useState<Event[]>([]);
    const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
    const [regionalData, setRegionalData] = useState<any[]>([]);
    const [currentMetrics, setCurrentMetrics] = useState<Metrics | null>(null);
    const [systemHealth, setSystemHealth] = useState({
        kafka: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        api: 'healthy',
    });

    const supabase = createClient();

    // Real-time WebSocket connection
    const { isConnected } = useRealtime({
        new_event: (event: Event) => {
            setRecentEvents((prev) => [event, ...prev].slice(0, 50));
            setStats((prev) => ({
                ...prev,
                totalEvents: prev.totalEvents + 1,
            }));
        },
        new_alert: (alert: any) => {
            setStats((prev) => ({
                ...prev,
                activeAlerts: prev.activeAlerts + 1,
            }));
            toast.warning('New Alert', {
                description: alert.title || 'An alert has been triggered',
            });
        },
        ai_insight: (insight: AIInsight) => {
            setRecentInsights((prev) => [insight, ...prev].slice(0, 10));
            
            if (insight.status === 'ANOMALY') {
                toast.error('AI Detected Anomaly', {
                    description: insight.summary,
                    duration: 5000,
                });
            }
        },
        metrics_update: (metrics: Metrics) => {
            setCurrentMetrics(metrics);
            setStats((prev) => ({
                ...prev,
                eventsPerSecond: metrics.events_per_second || prev.eventsPerSecond,
            }));
        },
        connected: () => {
            toast.success('Real-time connection established');
        }
    });

    useEffect(() => {
        async function fetchInitialData() {
            try {
                // Fetch total events
                const { count: eventsCount } = await supabase
                    .from('events')
                    .select('*', { count: 'exact', head: true });

                // Fetch active alerts
                const { count: alertsCount } = await supabase
                    .from('alerts')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'open');

                // Fetch recent insights
                const { data: insights } = await supabase
                    .from('ai_insights')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);

                // Fetch recent events
                const { data: events } = await supabase
                    .from('events')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(50);

                setStats({
                    totalEvents: eventsCount || 0,
                    activeAlerts: alertsCount || 0,
                    eventsPerSecond: 0,
                    activeUsers: 0,
                    kafkaLag: 0.5,
                    apiLatency: 45,
                });

                if (insights) {
                    setRecentInsights(insights as AIInsight[]);
                }

                if (events) {
                    setRecentEvents(events as Event[]);
                }

                // Generate time series data
                generateTimeSeriesData();
                generateRegionalData();

                setLoading(false);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                setLoading(false);
            }
        }

        fetchInitialData();

        // Subscribe to real-time updates
        const eventsChannel = supabase
            .channel('dashboard-events')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'events',
                },
                (payload) => {
                    setRecentEvents((prev) => [payload.new as Event, ...prev].slice(0, 50));
                    setStats((prev) => ({
                        ...prev,
                        totalEvents: prev.totalEvents + 1,
                    }));
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ai_insights',
                },
                (payload) => {
                    setRecentInsights((prev) => [payload.new as AIInsight, ...prev].slice(0, 10));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
        };
    }, [supabase]);

    function generateTimeSeriesData() {
        const now = new Date();
        const data = Array.from({ length: 30 }, (_, i) => {
            const time = subMinutes(now, 29 - i);
            return {
                time: format(time, 'HH:mm'),
                events: Math.floor(Math.random() * 200) + 100,
                anomalies: Math.floor(Math.random() * 5),
                avgAmount: Math.floor(Math.random() * 500) + 50,
            };
        });
        setTimeSeriesData(data);
    }

    function generateRegionalData() {
        const regions = ['US-WEST', 'US-EAST', 'EU-CENTRAL', 'AP-SOUTHEAST', 'ID-JB'];
        const data = regions.map((region) => ({
            name: region,
            value: Math.floor(Math.random() * 1000) + 100,
            events: Math.floor(Math.random() * 500) + 50,
        }));
        setRegionalData(data);
    }

    const metrics = [
        {
            title: 'Total Events',
            value: stats.totalEvents.toLocaleString(),
            icon: Activity,
            trend: '+12.5%',
            trendUp: true,
            color: 'text-blue-500',
            description: 'All time events processed',
        },
        {
            title: 'Events/Second',
            value: stats.eventsPerSecond.toFixed(2),
            icon: Zap,
            trend: '+8.1%',
            trendUp: true,
            color: 'text-green-500',
            description: 'Current processing rate',
        },
        {
            title: 'Active Alerts',
            value: stats.activeAlerts.toString(),
            icon: AlertTriangle,
            trend: '-5.2%',
            trendUp: false,
            color: 'text-red-500',
            description: 'Open alerts requiring attention',
        },
        {
            title: 'Kafka Lag',
            value: `${stats.kafkaLag}s`,
            icon: Radio,
            trend: '-2.1%',
            trendUp: false,
            color: stats.kafkaLag < 1 ? 'text-green-500' : 'text-yellow-500',
            description: 'Message processing delay',
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        Real-Time AI Insight Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Live monitoring of streaming events with AI-powered anomaly detection
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm text-muted-foreground">
                            {isConnected ? 'Live' : 'Disconnected'}
                        </span>
                    </div>
                    <Badge variant="outline" className="gap-2">
                        <Brain className="w-3 h-3" />
                        AI Active
                    </Badge>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <Card
                        key={metric.title}
                        className="glass-hover animate-fade-in border-l-4"
                        style={{ 
                            animationDelay: `${index * 100}ms`,
                            borderLeftColor: metric.color.replace('text-', '').replace('-500', '')
                        } as React.CSSProperties}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {metric.title}
                            </CardTitle>
                            <metric.icon className={`w-5 h-5 ${metric.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-1">{metric.value}</div>
                            <p className="text-xs text-muted-foreground mb-1">{metric.description}</p>
                            <p
                                className={`text-xs flex items-center gap-1 ${metric.trendUp ? 'text-green-500' : 'text-red-500'
                                    }`}
                            >
                                <TrendingUp
                                    className={`w-3 h-3 ${!metric.trendUp && 'rotate-180'}`}
                                />
                                {metric.trend} from last hour
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* AI Insights Section */}
            {recentInsights.length > 0 && (
                <Card className="glass border-l-4 border-l-purple-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-400" />
                                    Latest AI Insights
                                </CardTitle>
                                <CardDescription>
                                    Real-time anomaly detection powered by Google Gemini AI
                                </CardDescription>
                            </div>
                            <Badge variant={recentInsights[0]?.status === 'ANOMALY' ? 'destructive' : 'default'}>
                                {recentInsights[0]?.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentInsights.slice(0, 3).map((insight, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border ${SEVERITY_COLORS[insight.severity] || 'bg-gray-800/50 border-gray-700'}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                variant={insight.status === 'ANOMALY' ? 'destructive' : 'default'}
                                                className="text-xs"
                                            >
                                                {insight.severity}
                                            </Badge>
                                            {insight.created_at && (
                                                <span className="text-xs text-muted-foreground">
                                                    {format(parseISO(insight.created_at), 'MMM dd, HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium mb-2">{insight.summary}</p>
                                    {insight.possible_causes && insight.possible_causes.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-xs text-muted-foreground mb-1">Possible causes:</p>
                                            <ul className="text-xs space-y-1">
                                                {insight.possible_causes.map((cause, i) => (
                                                    <li key={i} className="flex items-start gap-1">
                                                        <span className="text-muted-foreground">•</span>
                                                        <span>{cause}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {insight.recommended_action && (
                                        <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                            <p className="text-xs font-medium text-blue-400 mb-1">Recommended Action:</p>
                                            <p className="text-xs text-blue-300">{insight.recommended_action}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event Volume Chart */}
                <Card className="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Event Volume (Last 30 Minutes)
                        </CardTitle>
                        <CardDescription>Real-time event processing rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={timeSeriesData}>
                                <defs>
                                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="#888"
                                    tick={{ fill: '#888', fontSize: 12 }}
                                />
                                <YAxis 
                                    stroke="#888"
                                    tick={{ fill: '#888', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="events"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorEvents)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="anomalies"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={{ fill: '#ef4444', r: 4 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Regional Distribution */}
                <Card className="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Regional Distribution
                        </CardTitle>
                        <CardDescription>Events by geographic region</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={regionalData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {regionalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* System Health & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <Card className="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5" />
                            System Health
                        </CardTitle>
                        <CardDescription>Infrastructure monitoring</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'Kafka Consumer', status: systemHealth.kafka, latency: `${stats.kafkaLag}s` },
                                { name: 'Database', status: systemHealth.database, latency: '12ms' },
                                { name: 'AI Service', status: systemHealth.ai, latency: '250ms' },
                                { name: 'API Gateway', status: systemHealth.api, latency: `${stats.apiLatency}ms` },
                            ].map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${item.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div>
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Latency: {item.latency}</p>
                                        </div>
                                    </div>
                                    <Badge variant={item.status === 'healthy' ? 'default' : 'destructive'}>
                                        {item.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Events Stream */}
                <Card className="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Recent Events Stream
                        </CardTitle>
                        <CardDescription>Live event feed from Kafka</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {recentEvents.slice(0, 10).map((event, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                                >
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 animate-pulse" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium">{event.event_type}</span>
                                            {event.region && (
                                                <Badge variant="outline" className="text-xs">
                                                    {event.region}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>ID: {event.event_id.slice(0, 8)}...</span>
                                            {event.amount && (
                                                <span>${event.amount.toFixed(2)}</span>
                                            )}
                                            <span>{format(parseISO(event.timestamp), 'HH:mm:ss')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentEvents.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Waiting for events...</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
