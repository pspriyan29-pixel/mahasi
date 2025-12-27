'use client';

import { TransactionEvent } from '@/types';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TransactionChartProps {
    events: TransactionEvent[];
}

export default function TransactionChart({ events }: TransactionChartProps) {
    const chartData = useMemo(() => {
        // Group events by minute
        const grouped = events.reduce((acc, event) => {
            const minute = new Date(event.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });

            if (!acc[minute]) {
                acc[minute] = { time: minute, count: 0, total: 0 };
            }

            acc[minute].count += 1;
            acc[minute].total += event.amount;

            return acc;
        }, {} as Record<string, { time: string; count: number; total: number }>);

        return Object.values(grouped)
            .sort((a, b) => a.time.localeCompare(b.time))
            .slice(-10); // Last 10 minutes
    }, [events]);

    return (
        <div className="glass rounded-xl p-6 h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Transaction Volume
            </h2>

            <div className="flex-1">
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Waiting for data...</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="time"
                                stroke="#888"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#888"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                dot={{ fill: '#0ea5e9', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
