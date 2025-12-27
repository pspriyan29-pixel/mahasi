import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

        socket = io(wsUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
        });

        socket.on('connect', () => {
            // WebSocket connected
        });

        socket.on('disconnect', () => {
            // WebSocket disconnected
        });

        socket.on('connect_error', (error) => {
            // WebSocket connection error - handled by useRealtime hook
        });
    }

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
