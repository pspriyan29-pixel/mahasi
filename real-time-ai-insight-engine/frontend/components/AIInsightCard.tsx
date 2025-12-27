'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, TrendingUp, Brain } from 'lucide-react';
import { format, parseISO } from 'date-fns';

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
}

interface AIInsightCardProps {
    insight: AIInsight;
    compact?: boolean;
}

export function AIInsightCard({ insight, compact = false }: AIInsightCardProps) {
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

    const borderColor =
        insight.status === 'ANOMALY'
            ? insight.severity === 'HIGH'
                ? 'border-l-red-500'
                : insight.severity === 'MEDIUM'
                ? 'border-l-orange-500'
                : 'border-l-yellow-500'
            : 'border-l-green-500';

    return (
        <Card className={`glass-hover border-l-4 ${borderColor}`}>
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(insight.status, insight.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant={getSeverityColor(insight.severity) as any}>
                                {insight.severity}
                            </Badge>
                            <Badge variant={insight.status === 'ANOMALY' ? 'destructive' : 'default'}>
                                {insight.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground ml-auto">
                                {format(parseISO(insight.created_at), 'MMM dd, HH:mm')}
                            </span>
                        </div>

                        <div className="flex items-start gap-2 mb-2">
                            <Brain className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <h3 className="font-semibold text-base">{insight.summary}</h3>
                        </div>

                        {!compact && (
                            <>
                                {insight.analyzed_period_start && insight.analyzed_period_end && (
                                    <div className="mb-3 text-xs text-muted-foreground">
                                        Period: {format(parseISO(insight.analyzed_period_start), 'MMM dd HH:mm')} -{' '}
                                        {format(parseISO(insight.analyzed_period_end), 'MMM dd HH:mm')}
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
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

