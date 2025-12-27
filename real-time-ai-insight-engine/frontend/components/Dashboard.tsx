'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { TransactionEvent, AIInsight, MetricsSummary } from '@/types';
import MetricsCard from './MetricsCard';
import AlertPanel from './AlertPanel';
import EventStream from './EventStream';
import TransactionChart from './TransactionChart';
import { Activity, Wifi, WifiOff } from 'lucide-react';

export default function Dashboard() {
    const [isConnected, setIsConnected] = useState(false);
    const [events, setEvents] = useState<TransactionEvent[]>([]);
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [metrics, setMetrics] = useState<MetricsSummary>({
        total_events: 0,
        events_per_second: 0,
        avg_transaction_amount: 0,
        active_regions: 0,
    });

    useEffect(() => {
        const socket = getSocket();

        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('new_event', (event: TransactionEvent) => {
            setEvents((prev) => [event, ...prev].slice(0, 100));
        });

        socket.on('ai_insight', (insight: AIInsight) => {
            setInsights((prev) => [insight, ...prev].slice(0, 10));
        });

        socket.on('metrics_update', (newMetrics: MetricsSummary) => {
            setMetrics(newMetrics);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('new_event');
            socket.off('ai_insight');
            socket.off('metrics_update');
        };
    }, []);

    const startProducer = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/producer/start`, {
                method: 'POST',
            });
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Failed to start producer:', error);
        }
    };

    const stopProducer = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/producer/stop`, {
                method: 'POST',
            });
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Failed to stop producer:', error);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-8 h-8 text-primary-400" />
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                                Real-Time AI Insight Engine
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm md:text-base">
                            Powered by Confluent Kafka × Google Gemini
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Connection Status */}
                        <div className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
                            {isConnected ? (
                                <>
                                    <Wifi className="w-5 h-5 text-success pulse-glow" />
                                    <span className="text-success font-medium">Live</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-500 font-medium">Offline</span>
                                </>
                            )}
                        </div>

                        {/* Producer Controls */}
                        <div className="flex gap-2">
                            <button
                                onClick={startProducer}
                                className="px-4 py-2 bg-success hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Start
                            </button>
                            <button
                                onClick={stopProducer}
                                className="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Stop
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricsCard
                    title="Total Events"
                    value={metrics.total_events.toLocaleString()}
                    icon="📊"
                />
                <MetricsCard
                    title="Events/Second"
                    value={metrics.events_per_second.toFixed(2)}
                    icon="⚡"
                />
                <MetricsCard
                    title="Avg Amount"
                    value={`$${metrics.avg_transaction_amount.toFixed(2)}`}
                    icon="💰"
                />
                <MetricsCard
                    title="Active Regions"
                    value={metrics.active_regions.toString()}
                    icon="🌍"
                />
            </div>

            {/* AI Insights */}
            <div className="mb-8">
                <AlertPanel insights={insights} />
            </div>

            {/* Charts and Event Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TransactionChart events={events} />
                <EventStream events={events} />
            </div>
        </div>
    );
}
