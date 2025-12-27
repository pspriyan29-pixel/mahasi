'use client';

import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDateForAxis } from '@/lib/dateUtils';
import { formatTooltipValue, generateColorPalette } from '@/lib/chartUtils';

interface DataPoint {
    timestamp: string;
    [key: string]: string | number;
}

interface DataSeries {
    key: string;
    name: string;
    color?: string;
    type?: 'number' | 'currency' | 'percentage';
}

interface AdvancedLineChartProps {
    title: string;
    description?: string;
    data: DataPoint[];
    series: DataSeries[];
    height?: number;
    showBrush?: boolean;
    showLegend?: boolean;
    rangeInHours?: number;
    loading?: boolean;
}

export function AdvancedLineChart({
    title,
    description,
    data,
    series,
    height = 400,
    showBrush = false,
    showLegend = true,
    rangeInHours = 1,
    loading = false,
}: AdvancedLineChartProps) {
    const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

    // Generate colors for series
    const colors = generateColorPalette(series.length);
    const seriesWithColors = series.map((s, idx) => ({
        ...s,
        color: s.color || colors[idx],
    }));

    const handleLegendClick = (dataKey: string) => {
        setHiddenSeries((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(dataKey)) {
                newSet.delete(dataKey);
            } else {
                newSet.add(dataKey);
            }
            return newSet;
        });
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0) return null;

        return (
            <div className="rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
                <p className="mb-2 text-sm font-medium text-foreground">
                    {formatDateForAxis(label, rangeInHours)}
                </p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => {
                        const seriesInfo = series.find((s) => s.key === entry.dataKey);
                        return (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {entry.name}:
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-foreground">
                                    {formatTooltipValue(
                                        entry.value,
                                        seriesInfo?.type || 'number'
                                    )}
                                </span>
                            </div>
                        );
                    })}
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
                    <div className="flex h-[400px] items-center justify-center">
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
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && (
                            <Legend
                                onClick={(e) => handleLegendClick(e.dataKey as string)}
                                wrapperStyle={{ cursor: 'pointer' }}
                                formatter={(value, entry: any) => (
                                    <span
                                        className={
                                            hiddenSeries.has(entry.dataKey)
                                                ? 'text-muted-foreground line-through'
                                                : 'text-foreground'
                                        }
                                    >
                                        {value}
                                    </span>
                                )}
                            />
                        )}
                        {seriesWithColors.map((s) => (
                            <Line
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.name}
                                stroke={s.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                                hide={hiddenSeries.has(s.key)}
                                animationDuration={500}
                            />
                        ))}
                        {showBrush && (
                            <Brush
                                dataKey="timestamp"
                                height={30}
                                stroke="hsl(var(--primary))"
                                tickFormatter={(value) => formatDateForAxis(value, rangeInHours)}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
