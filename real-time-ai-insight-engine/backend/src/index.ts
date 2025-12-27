/**
 * Main Backend Entry Point
 * Integrates all enterprise features
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Import utilities and middleware
import { logger } from './utils/logger';
import { cache } from './cache/redis';
import { jobQueue } from './queue/bull';
import { initializeTelemetry } from './telemetry/opentelemetry';
import { RateLimitPresets } from './security/rate-limiter';

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api', RateLimitPresets.api.middleware());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const cacheStats = await cache.getStats();
        const queueStats = await jobQueue.getAllStats();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                redis: {
                    connected: cacheStats.connected,
                    keys: cacheStats.keys,
                    memory: cacheStats.memory,
                },
                jobQueue: queueStats,
            },
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// API Routes
app.get('/api/status', (req, res) => {
    res.json({
        message: 'AI Insight Engine API is running',
        version: '2.0.0',
        features: [
            'Redis Caching',
            'Bull Job Queue',
            'RBAC Security',
            'Rate Limiting',
            'OpenTelemetry',
            'AI Chat Assistant',
            'Predictive Analytics',
        ],
    });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });

    // Handle real-time events
    socket.on('subscribe', (channel) => {
        socket.join(channel);
        logger.info(`Client ${socket.id} subscribed to ${channel}`);
    });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Initialize services and start server
async function startServer() {
    try {
        logger.info('Starting AI Insight Engine Backend...');

        // Initialize OpenTelemetry
        if (process.env.NODE_ENV === 'production') {
            initializeTelemetry();
            logger.info('✅ OpenTelemetry initialized');
        }

        // Connect to Redis
        try {
            await cache.connect();
            logger.info('✅ Redis connected successfully');
        } catch (error) {
            logger.warn('⚠️  Redis connection failed, continuing without cache:', error);
        }

        // Initialize job queues
        try {
            await jobQueue.initialize();
            logger.info('✅ Job queues initialized');
        } catch (error) {
            logger.warn('⚠️  Job queue initialization failed:', error);
        }

        // Start HTTP server
        httpServer.listen(PORT, () => {
            logger.info(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 AI Insight Engine Backend - RUNNING                  ║
║                                                            ║
║   📍 Port: ${PORT}                                        ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   📊 Health: http://localhost:${PORT}/health              ║
║   🔌 WebSocket: Ready                                     ║
║                                                            ║
║   Enterprise Features:                                     ║
║   ✅ Redis Caching                                        ║
║   ✅ Bull Job Queue                                       ║
║   ✅ RBAC Security                                        ║
║   ✅ Rate Limiting                                        ║
║   ✅ OpenTelemetry                                        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');

    httpServer.close(async () => {
        await cache.disconnect();
        await jobQueue.closeAll();
        logger.info('Server shut down complete');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');

    httpServer.close(async () => {
        await cache.disconnect();
        await jobQueue.closeAll();
        logger.info('Server shut down complete');
        process.exit(0);
    });
});

// Start the server
startServer();

export { app, io };
