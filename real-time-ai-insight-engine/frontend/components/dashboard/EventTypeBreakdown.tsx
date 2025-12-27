'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatNumber, formatPercentage, generateColorPalette } from '@/lib/chartUtils';

interface EventTypeData {
    name: string;
    value: number;
    percentage: number;
}

interface EventTypeBreakdownProps {
    title: string;
    description?: string;
    data: EventTypeData[];
    height?: number;
    loading?: boolean;
    onSegmentClick?: (eventType: string) => void;
}

export function EventTypeBreakdown({
    title,
    description,
    data,
    height = 350,
    loading = false,
    onSegmentClick,
}: EventTypeBreakdownProps) {
    const colors = generateColorPalette(data.length);

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || payload.length === 0) return null;

        const data = payload[0].payload;

        return (
            <div className="rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
                <p className="mb-2 text-sm font-semibold text-foreground">{data.name}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Count:</span>
                        <span className="text-sm font-semibold text-foreground">
                            {formatNumber(data.value)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">Percentage:</span>
                        <span className="text-sm font-semibold text-foreground">
                            {formatPercentage(data.percentage)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCustomLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label for small segments

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-semibold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
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

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex h-[350px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">No data available</p>
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
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={120}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            animationDuration={500}
                            onClick={(entry) => onSegmentClick?.(entry.name)}
                            className="cursor-pointer"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                    className="transition-opacity hover:opacity-80"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => (
                                <span className="text-xs text-foreground">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
