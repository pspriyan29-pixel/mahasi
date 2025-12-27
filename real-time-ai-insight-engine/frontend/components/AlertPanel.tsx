'use client';

import { AIInsight } from '@/types';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface AlertPanelProps {
    insights: AIInsight[];
}

export default function AlertPanel({ insights }: AlertPanelProps) {
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    const visibleInsights = insights.filter(
        (insight) => !dismissedIds.has(insight.timestamp)
    );

    const latestInsight = visibleInsights[0];

    if (!latestInsight) {
        return (
            <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 text-gray-400">
                    <Info className="w-5 h-5" />
                    <p>Waiting for AI analysis...</p>
                </div>
            </div>
        );
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'HIGH':
                return 'border-danger bg-red-500/10';
            case 'MEDIUM':
                return 'border-warning bg-yellow-500/10';
            case 'LOW':
                return 'border-blue-500 bg-blue-500/10';
            default:
                return 'border-success bg-green-500/10';
        }
    };

    const getSeverityIcon = (status: string, severity: string) => {
        if (status === 'NORMAL') {
            return <CheckCircle className="w-6 h-6 text-success" />;
        }
        return <AlertTriangle className={`w-6 h-6 ${severity === 'HIGH' ? 'text-danger' : severity === 'MEDIUM' ? 'text-warning' : 'text-blue-400'}`} />;
    };

    const dismissInsight = (timestamp: string) => {
        setDismissedIds((prev) => new Set(prev).add(timestamp));
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                AI Insights
            </h2>

            {visibleInsights.map((insight) => (
                <div
                    key={insight.timestamp}
                    className={`glass rounded-xl p-6 border-2 ${getSeverityColor(insight.severity)} animate-fade-in relative`}
                >
                    <button
                        onClick={() => dismissInsight(insight.timestamp)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-4">
                        {getSeverityIcon(insight.status, insight.severity)}

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${insight.status === 'ANOMALY' ? 'bg-danger text-white' : 'bg-success text-white'
                                    }`}>
                                    {insight.status}
                                </span>
                                <span className="text-gray-400 text-sm">
                                    {new Date(insight.timestamp).toLocaleTimeString()}
                                </span>
                            </div>

                            <p className="text-white text-lg font-medium mb-3">
                                {insight.summary}
                            </p>

                            {insight.possible_causes.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-gray-400 text-sm mb-1">Possible Causes:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {insight.possible_causes.map((cause, idx) => (
                                            <li key={idx} className="text-gray-300 text-sm">
                                                {cause}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="glass px-4 py-2 rounded-lg">
                                <p className="text-primary-400 text-sm font-medium">
                                    💡 {insight.recommended_action}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
