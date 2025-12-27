'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, TrendingUp, Clock, Brain, Filter, Download } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';

interface AIInsight {
    id: string;
    status: 'NORMAL' | 'ANOMALY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
    possible_causes?: string[];
    recommended_action?: string;
    created_at: string;
    analyzed_period_start?: string;
    analyzed_period_end?: string;
    metrics?: any;
}

export default function InsightsPage() {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'anomaly' | 'normal'>('all');
    const [severityFilter, setSeverityFilter] = useState<'all' | 'LOW' | 'MEDIUM' | 'HIGH'>('all');

    useEffect(() => {
        const supabase = createClient();

        async function fetchInsights() {
            const { data, error: _error } = await supabase
                .from('ai_insights')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (data) {
                setInsights(data as AIInsight[]);
            }
            if (_error) {
                // Error handling can be added here if needed
            }
            setLoading(false);
        }

        fetchInsights();

        // Subscribe to new insights
        const channel = supabase
            .channel('insights-page')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ai_insights',
                },
                (payload) => {
                    setInsights((prev) => [payload.new as AIInsight, ...prev].slice(0, 100));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredInsights = useMemo(() => {
        return insights.filter((insight) => {
            if (filter === 'anomaly' && insight.status !== 'ANOMALY') return false;
            if (filter === 'normal' && insight.status !== 'NORMAL') return false;
            if (severityFilter !== 'all' && insight.severity !== severityFilter) return false;
            return true;
        });
    }, [insights, filter, severityFilter]);

    const getSeverityColor = (severity: string) => {
        const colors = {
            HIGH: 'destructive',
            MEDIUM: 'warning',
            LOW: 'default',
        };
        return colors[severity as keyof typeof colors] || 'default';
    };

    const getSeverityIcon = (status: string, severity: string) => {
        if (status === 'NORMAL') {
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
        if (severity === 'HIGH') {
            return <AlertTriangle className="w-5 h-5 text-red-500" />;
        }
        if (severity === 'MEDIUM') {
            return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        }
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
    };

    const stats = {
        total: insights.length,
        anomalies: insights.filter((i) => i.status === 'ANOMALY').length,
        normal: insights.filter((i) => i.status === 'NORMAL').length,
        high: insights.filter((i) => i.severity === 'HIGH').length,
    };

    // Generate timeline data
    const timelineData = useMemo(() => {
        interface TimelineItem {
            time: string;
            anomalies: number;
            normal: number;
        }

        const last24h: TimelineItem[] = insights
            .filter((i) => {
                const date = parseISO(i.created_at);
                const now = new Date();
                return now.getTime() - date.getTime() < 24 * 60 * 60 * 1000;
            })
            .map((i) => ({
                time: format(parseISO(i.created_at), 'HH:mm'),
                anomalies: i.status === 'ANOMALY' ? 1 : 0,
                normal: i.status === 'NORMAL' ? 1 : 0,
            }));

        // Group by hour
        const grouped: Record<string, TimelineItem> = last24h.reduce((acc: Record<string, TimelineItem>, item: TimelineItem) => {
            const hour = item.time.split(':')[0];
            if (!acc[hour]) {
                acc[hour] = { time: `${hour}:00`, anomalies: 0, normal: 0 };
            }
            acc[hour].anomalies += item.anomalies;
            acc[hour].normal += item.normal;
            return acc;
        }, {});

        return Object.values(grouped);
    }, [insights]);

    const InsightCard = ({ insight }: { insight: AIInsight }) => (
        <Card className={`glass-hover border-l-4 ${
            insight.status === 'ANOMALY' 
                ? insight.severity === 'HIGH' 
                    ? 'border-l-red-500' 
                    : insight.severity === 'MEDIUM'
                    ? 'border-l-orange-500'
                    : 'border-l-yellow-500'
                : 'border-l-green-500'
        }`}>
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                    {getSeverityIcon(insight.status, insight.severity)}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant={getSeverityColor(insight.severity) as any}>
                                {insight.severity}
                            </Badge>
                            <Badge variant={insight.status === 'ANOMALY' ? 'destructive' : 'default'}>
                                {insight.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground ml-auto">
                                {format(parseISO(insight.created_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-3">{insight.summary}</h3>
                        
                        {insight.analyzed_period_start && insight.analyzed_period_end && (
                            <div className="mb-3 text-xs text-muted-foreground">
                                Analyzed period: {format(parseISO(insight.analyzed_period_start), 'MMM dd HH:mm')} - {format(parseISO(insight.analyzed_period_end), 'MMM dd HH:mm')}
                            </div>
                        )}

                        {insight.possible_causes && insight.possible_causes.length > 0 && (
                            <div className="mb-3">
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                    Possible Causes:
                                </p>
                                <ul className="space-y-1">
                                    {insight.possible_causes.map((cause: string, idx: number) => (
                                        <li key={idx} className="text-sm flex items-start gap-2">
                                            <span className="text-muted-foreground mt-1">•</span>
                                            <span>{cause}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {insight.recommended_action && (
                            <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <p className="text-sm font-medium text-blue-400 mb-1">
                                    💡 Recommended Action:
                                </p>
                                <p className="text-sm text-blue-300">{insight.recommended_action}</p>
                            </div>
                        )}

                        {insight.metrics && (
                            <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-2">Metrics:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(insight.metrics).slice(0, 4).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-muted-foreground">{key}:</span>
                                            <span className="font-medium">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-2">
                        <Brain className="w-8 h-8" />
                        AI Insights
                    </h1>
                    <p className="text-muted-foreground">
                        AI-powered anomaly detection powered by Google Gemini
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">Total Insights</p>
                    </CardContent>
                </Card>
                <Card className="glass border-l-4 border-l-red-500">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-500">{stats.anomalies}</div>
                        <p className="text-sm text-muted-foreground">Anomalies Detected</p>
                    </CardContent>
                </Card>
                <Card className="glass border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-500">{stats.normal}</div>
                        <p className="text-sm text-muted-foreground">Normal Patterns</p>
                    </CardContent>
                </Card>
                <Card className="glass border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
                        <p className="text-sm text-muted-foreground">High Severity</p>
                    </CardContent>
                </Card>
            </div>

            {/* Timeline Chart */}
            {timelineData.length > 0 && (
                <Card className="glass">
                    <CardHeader>
                        <CardTitle>Anomaly Timeline (Last 24h)</CardTitle>
                        <CardDescription>Distribution of anomalies vs normal patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={timelineData}>
                                <defs>
                                    <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="time" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="anomalies"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorAnomalies)"
                                    name="Anomalies"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="normal"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorNormal)"
                                    name="Normal"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                    <TabsList>
                        <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                        <TabsTrigger value="anomaly">Anomalies ({stats.anomalies})</TabsTrigger>
                        <TabsTrigger value="normal">Normal ({stats.normal})</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Tabs value={severityFilter} onValueChange={(v) => setSeverityFilter(v as any)}>
                    <TabsList>
                        <TabsTrigger value="all">All Severities</TabsTrigger>
                        <TabsTrigger value="HIGH">High</TabsTrigger>
                        <TabsTrigger value="MEDIUM">Medium</TabsTrigger>
                        <TabsTrigger value="LOW">Low</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Insights List */}
            {loading ? (
                <Card className="glass">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Loading insights...
                    </CardContent>
                </Card>
            ) : filteredInsights.length === 0 ? (
                <Card className="glass">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No insights found</p>
                        <p className="text-sm mt-1">
                            {filter === 'anomaly' 
                                ? 'No anomalies detected. System is operating normally.'
                                : 'AI insights will appear here when data is analyzed'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredInsights.map((insight) => (
                        <InsightCard key={insight.id} insight={insight} />
                    ))}
                </div>
            )}
        </div>
    );
}
