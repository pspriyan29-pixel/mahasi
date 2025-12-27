'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSocket, disconnectSocket } from '../socket';
import type { Socket } from 'socket.io-client';
import * as Sentry from '@sentry/nextjs';

interface UseRealtimeOptions {
    autoConnect?: boolean;
}

interface RealtimeEvent {
    new_event?: (data: any) => void;
    ai_insight?: (data: any) => void;
    new_alert?: (data: any) => void;
    alert_updated?: (data: any) => void;
    metrics_update?: (data: any) => void;
    connected?: (data: any) => void;
}

export function useRealtime(events?: RealtimeEvent, options: UseRealtimeOptions = {}) {
    const { autoConnect = true } = options;
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const connect = useCallback(() => {
        try {
            const socketInstance = getSocket();
            setSocket(socketInstance);

            socketInstance.on('connect', () => {
                setIsConnected(true);
                setError(null);

                const { logger } = Sentry;
                logger.info('WebSocket connected successfully');
            });

            socketInstance.on('disconnect', () => {
                setIsConnected(false);

                const { logger } = Sentry;
                logger.warn('WebSocket disconnected');
            });

            socketInstance.on('connect_error', (err) => {
                setError(err as Error);
                setIsConnected(false);

                // Capture error in Sentry
                Sentry.captureException(err, {
                    tags: {
                        component: 'websocket',
                        action: 'connect'
                    },
                    contexts: {
                        websocket: {
                            url: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'
                        }
                    }
                });
            });

            // Register event listeners
            if (events) {
                if (events.new_event) {
                    socketInstance.on('new_event', events.new_event);
                }
                if (events.ai_insight) {
                    socketInstance.on('ai_insight', events.ai_insight);
                }
                if (events.new_alert) {
                    socketInstance.on('new_alert', events.new_alert);
                }
                if (events.alert_updated) {
                    socketInstance.on('alert_updated', events.alert_updated);
                }
                if (events.metrics_update) {
                    socketInstance.on('metrics_update', events.metrics_update);
                }
                if (events.connected) {
                    socketInstance.on('connected', events.connected);
                }
            }
        } catch (err) {
            console.error('Error connecting to WebSocket:', err);
            setError(err as Error);
        }
    }, [events]);

    const disconnect = useCallback(() => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
    }, []);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            // Cleanup event listeners on unmount
            if (socket && events) {
                if (events.new_event) socket.off('new_event', events.new_event);
                if (events.ai_insight) socket.off('ai_insight', events.ai_insight);
                if (events.new_alert) socket.off('new_alert', events.new_alert);
                if (events.alert_updated) socket.off('alert_updated', events.alert_updated);
                if (events.metrics_update) socket.off('metrics_update', events.metrics_update);
                if (events.connected) socket.off('connected', events.connected);
            }
        };
    }, [autoConnect, connect, socket, events]);

    return {
        socket,
        isConnected,
        error,
        connect,
        disconnect
    };
}
