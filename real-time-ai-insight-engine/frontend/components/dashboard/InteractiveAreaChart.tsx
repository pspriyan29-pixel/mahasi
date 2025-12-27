'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Brush,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDateForAxis } from '@/lib/dateUtils';
import { formatNumber } from '@/lib/chartUtils';

interface DataPoint {
    timestamp: string;
    value: number;
    anomaly?: boolean;
}

interface InteractiveAreaChartProps {
    title: string;
    description?: string;
    data: DataPoint[];
    height?: number;
    showBrush?: boolean;
    rangeInHours?: number;
    color?: string;
    loading?: boolean;
}

export function InteractiveAreaChart({
    title,
    description,
    data,
    height = 350,
    showBrush = true,
    rangeInHours = 1,
    color = '#3b82f6',
    loading = false,
}: InteractiveAreaChartProps) {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0) return null;

        const isAnomaly = payload[0]?.payload?.anomaly;

        return (
            <div className="rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
                <p className="mb-2 text-sm font-medium text-foreground">
                    {formatDateForAxis(label, rangeInHours)}
                </p>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground">Events:</span>
                    <span className="text-sm font-semibold text-foreground">
                        {formatNumber(payload[0].value)}
                    </span>
                </div>
                {isAnomaly && (
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-xs font-medium text-red-500">Anomaly Detected</span>
                    </div>
                )}
            </div>
        );
    };

    const CustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        if (payload.anomaly) {
            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#ef4444"
                    stroke="#fff"
                    strokeWidth={2}
                    className="animate-pulse"
                />
            );
        }
        return null;
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(value) => formatDateForAxis(value, rangeInHours)}
                            className="text-xs text-muted-foreground"
                            stroke="currentColor"
                        />
                        <YAxis
                            className="text-xs text-muted-foreground"
                            stroke="currentColor"
                            tickFormatter={(value) => formatNumber(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            dot={<CustomDot />}
                            animationDuration={500}
                        />
                        {showBrush && (
                            <Brush
                                dataKey="timestamp"
                                height={30}
                                stroke={color}
                                tickFormatter={(value) => formatDateForAxis(value, rangeInHours)}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
