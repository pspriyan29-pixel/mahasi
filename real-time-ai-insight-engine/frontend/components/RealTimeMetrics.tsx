'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, AlertTriangle, Radio, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRealtime } from '@/lib/hooks/useRealtime';

interface Metrics {
    total_events: number;
    events_per_second: number;
    avg_transaction_amount: number;
    active_regions: number;
}

export function RealTimeMetrics() {
    const [metrics, setMetrics] = useState<Metrics>({
        total_events: 0,
        events_per_second: 0,
        avg_transaction_amount: 0,
        active_regions: 0,
    });

    const { isConnected } = useRealtime({
        metrics_update: (data: Metrics) => {
            setMetrics(data);
        },
    });

    const metricsList = [
        {
            title: 'Total Events',
            value: metrics.total_events.toLocaleString(),
            icon: Activity,
            color: 'text-blue-500',
            trend: '+12.5%',
            trendUp: true,
        },
        {
            title: 'Events/Second',
            value: metrics.events_per_second.toFixed(2),
            icon: Zap,
            color: 'text-green-500',
            trend: '+8.1%',
            trendUp: true,
        },
        {
            title: 'Avg Amount',
            value: `$${metrics.avg_transaction_amount.toFixed(2)}`,
            icon: TrendingUp,
            color: 'text-purple-500',
            trend: '+3.2%',
            trendUp: true,
        },
        {
            title: 'Active Regions',
            value: metrics.active_regions.toString(),
            icon: Radio,
            color: 'text-yellow-500',
            trend: '+1',
            trendUp: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricsList.map((metric, index) => (
                <Card
                    key={metric.title}
                    className="glass-hover animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {metric.title}
                        </CardTitle>
                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">{metric.value}</div>
                        <p
                            className={`text-xs flex items-center gap-1 ${
                                metric.trendUp ? 'text-green-500' : 'text-red-500'
                            }`}
                        >
                            {metric.trendUp ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            {metric.trend}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

