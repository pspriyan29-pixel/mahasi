'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Info,
    ChevronDown,
    ChevronUp,
    Sparkles,
    MapPin,
    Activity,
} from 'lucide-react';
import { formatDateForDisplay, getRelativeTime } from '@/lib/dateUtils';

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
    confidence?: number;
    detailed_insights?: string[];
    affected_regions?: string[];
    affected_event_types?: string[];
}

interface AIInsightsPanelProps {
    insights: AIInsight[];
    loading?: boolean;
}

export function AIInsightsPanel({ insights, loading = false }: AIInsightsPanelProps) {
    const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

    const toggleExpanded = (id: string) => {
        setExpandedInsights((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const getSeverityConfig = (severity: 'LOW' | 'MEDIUM' | 'HIGH') => {
        switch (severity) {
            case 'HIGH':
                return {
                    color: 'bg-red-500/20 text-red-400 border-red-500/50',
                    icon: AlertTriangle,
                    iconColor: 'text-red-500',
                };
            case 'MEDIUM':
                return {
                    color: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
                    icon: TrendingDown,
                    iconColor: 'text-orange-500',
                };
            case 'LOW':
                return {
                    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
                    icon: Info,
                    iconColor: 'text-yellow-500',
                };
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>AI-Powered Insights</CardTitle>
                    </div>
                    <CardDescription>Real-time anomaly detection and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[200px] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (insights.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>AI-Powered Insights</CardTitle>
                    </div>
                    <CardDescription>Real-time anomaly detection and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No insights available yet. AI is analyzing your data...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>AI-Powered Insights</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {insights.length} {insights.length === 1 ? 'Insight' : 'Insights'}
                    </Badge>
                </div>
                <CardDescription>Real-time anomaly detection and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {insights.map((insight, index) => {
                    const insightId = insight.id || `insight-${index}`;
                    const isExpanded = expandedInsights.has(insightId);
                    const severityConfig = getSeverityConfig(insight.severity);
                    const SeverityIcon = severityConfig.icon;

                    return (
                        <div
                            key={insightId}
                            className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 ${severityConfig.iconColor}`}>
                                        <SeverityIcon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Badge className={severityConfig.color}>
                                                {insight.severity}
                                            </Badge>
                                            <Badge
                                                variant={
                                                    insight.status === 'ANOMALY'
                                                        ? 'destructive'
                                                        : 'secondary'
                                                }
                                            >
                                                {insight.status}
                                            </Badge>
                                            {insight.confidence && (
                                                <span className="text-xs text-muted-foreground">
                                                    {(insight.confidence * 100).toFixed(0)}% confidence
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-foreground">
                                            {insight.summary}
                                        </p>
                                        {insight.created_at && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {getRelativeTime(insight.created_at)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpanded(insightId)}
                                    className="shrink-0"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="mt-4 space-y-4 border-t border-border pt-4">
                                    {/* Possible Causes */}
                                    {insight.possible_causes && insight.possible_causes.length > 0 && (
                                        <div>
                                            <h4 className="mb-2 text-xs font-semibold text-foreground">
                                                Possible Causes:
                                            </h4>
                                            <ul className="space-y-1">
                                                {insight.possible_causes.map((cause, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-start gap-2 text-xs text-muted-foreground"
                                                    >
                                                        <span className="mt-1 text-primary">•</span>
                                                        <span>{cause}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Recommended Action */}
                                    {insight.recommended_action && (
                                        <div className="rounded-md bg-primary/10 p-3">
                                            <h4 className="mb-1 text-xs font-semibold text-primary">
                                                Recommended Action:
                                            </h4>
                                            <p className="text-xs text-foreground">
                                                {insight.recommended_action}
                                            </p>
                                        </div>
                                    )}

                                    {/* Detailed Insights */}
                                    {insight.detailed_insights &&
                                        insight.detailed_insights.length > 0 && (
                                            <div>
                                                <h4 className="mb-2 text-xs font-semibold text-foreground">
                                                    Detailed Analysis:
                                                </h4>
                                                <ul className="space-y-1">
                                                    {insight.detailed_insights.map((detail, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="flex items-start gap-2 text-xs text-muted-foreground"
                                                        >
                                                            <span className="mt-1 text-primary">→</span>
                                                            <span>{detail}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                    {/* Affected Regions and Event Types */}
                                    <div className="flex flex-wrap gap-4">
                                        {insight.affected_regions &&
                                            insight.affected_regions.length > 0 && (
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        Affected Regions:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {insight.affected_regions.map((region, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {region}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        {insight.affected_event_types &&
                                            insight.affected_event_types.length > 0 && (
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-foreground">
                                                        <Activity className="h-3 w-3" />
                                                        Event Types:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {insight.affected_event_types.map((type, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {type}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                    </div>

                                    {/* Analysis Period */}
                                    {insight.analyzed_period_start && insight.analyzed_period_end && (
                                        <div className="text-xs text-muted-foreground">
                                            <span className="font-medium">Analysis Period: </span>
                                            {formatDateForDisplay(
                                                insight.analyzed_period_start,
                                                'PPp'
                                            )}{' '}
                                            -{' '}
                                            {formatDateForDisplay(insight.analyzed_period_end, 'PPp')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
