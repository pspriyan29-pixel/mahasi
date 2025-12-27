'use client';

import { TransactionEvent } from '@/types';
import { useEffect, useRef } from 'react';

interface EventStreamProps {
    events: TransactionEvent[];
}

export default function EventStream({ events }: EventStreamProps) {
    const streamRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.scrollTop = 0;
        }
    }, [events]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'purchase':
                return 'text-success';
            case 'refund':
                return 'text-warning';
            case 'transfer':
                return 'text-primary-400';
            default:
                return 'text-gray-400';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'purchase':
                return '🛒';
            case 'refund':
                return '↩️';
            case 'transfer':
                return '💸';
            default:
                return '📝';
        }
    };

    return (
        <div className="glass rounded-xl p-6 h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📡</span>
                Live Event Stream
            </h2>

            <div
                ref={streamRef}
                className="flex-1 overflow-y-auto space-y-2 pr-2"
            >
                {events.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Waiting for events...</p>
                    </div>
                ) : (
                    events.slice(0, 50).map((event) => (
                        <div
                            key={event.id}
                            className="glass p-4 rounded-lg hover:bg-white/10 transition-all duration-200 animate-fade-in"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{getTypeIcon(event.type)}</span>
                                    <span className={`font-medium ${getTypeColor(event.type)}`}>
                                        {event.type.toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-gray-400 text-xs">
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-400">Amount:</span>
                                    <span className="text-white font-medium ml-2">
                                        ${event.amount.toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Region:</span>
                                    <span className="text-white font-medium ml-2">
                                        {event.region}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Device:</span>
                                    <span className="text-white font-medium ml-2">
                                        {event.metadata.device}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">User:</span>
                                    <span className="text-white font-medium ml-2">
                                        {event.user_id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
