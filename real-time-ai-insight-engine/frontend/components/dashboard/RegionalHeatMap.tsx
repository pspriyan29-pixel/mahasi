'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatNumber } from '@/lib/chartUtils';

interface RegionalData {
    region: string;
    count: number;
    percentage: number;
    anomaly?: boolean;
}

interface RegionalHeatMapProps {
    title: string;
    description?: string;
    data: RegionalData[];
    height?: number;
    loading?: boolean;
    onRegionClick?: (region: string) => void;
}

export function RegionalHeatMap({
    title,
    description,
    data,
    height = 350,
    loading = false,
    onRegionClick,
}: RegionalHeatMapProps) {
    // Sort data by count descending
    const sortedData = [...data].sort((a, b) => b.count - a.count);

    const getBarColor = (percentage: number, anomaly?: boolean) => {
        if (anomaly) return '#ef4444'; // red for anomalies
        if (percentage > 30) return '#10b981'; // green for high activity
        if (percentage > 15) return '#3b82f6'; // blue for medium activity
        if (percentage > 5) return '#f59e0b'; // amber for low activity
        return '#6b7280'; // gray for very low activity
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || payload.length === 0) return null;

        const data = payload[0].payload;

        return (
            <div className="rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
                <p className="mb-2 text-sm font-semibold text-foreground">{data.region}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Events:</span>
                        <span className="text-sm font-semibold text-foreground">
                            {formatNumber(data.count)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Share:</span>
                        <span className="text-sm font-semibold text-foreground">
                            {data.percentage.toFixed(1)}%
                        </span>
                    </div>
                    {data.anomaly && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-xs font-medium text-red-500">
                                Unusual Activity
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex h-[350px] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (sortedData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex h-[350px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">No regional data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={sortedData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            type="number"
                            className="text-xs text-muted-foreground"
                            stroke="currentColor"
                            tickFormatter={(value) => formatNumber(value)}
                        />
                        <YAxis
                            dataKey="region"
                            type="category"
                            className="text-xs text-muted-foreground"
                            stroke="currentColor"
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="count"
                            radius={[0, 4, 4, 0]}
                            onClick={(data) => onRegionClick?.(data.region)}
                            className="cursor-pointer"
                            animationDuration={500}
                        >
                            {sortedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry.percentage, entry.anomaly)}
                                    className="transition-opacity hover:opacity-80"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-[#10b981]" />
                        <span className="text-muted-foreground">&gt;30% High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-[#3b82f6]" />
                        <span className="text-muted-foreground">15-30% Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-[#f59e0b]" />
                        <span className="text-muted-foreground">5-15% Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-[#ef4444]" />
                        <span className="text-muted-foreground">Anomaly</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
