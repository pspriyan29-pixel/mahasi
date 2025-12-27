import { Router } from 'express';
import { startProducer, stopProducer } from '../kafka/producer';
import { logger } from '../utils/logger';
import { supabase, createEvent, getOrganizationStats } from '../utils/supabase';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'AI Insight Engine Backend'
    });
});

// Get system info
apiRouter.get('/info', (req, res) => {
    res.json({
        name: 'Real-Time AI Insight Engine',
        version: '1.0.0',
        description: 'AI-powered real-time anomaly detection using Confluent Kafka and Google Gemini',
        technologies: {
            streaming: 'Confluent Cloud (Apache Kafka)',
            ai: 'Google Gemini 1.5 Flash',
            backend: 'Node.js + Express + Socket.io',
            database: 'Supabase (PostgreSQL)',
            deployment: 'Google Cloud Run'
        }
    });
});

// Ingest event (alternative to Edge Function)
apiRouter.post('/events/ingest', async (req, res) => {
    try {
        const { organization_id, event_id, event_type, region, amount, user_id, device, metadata } = req.body;

        if (!organization_id || !event_id || !event_type) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: organization_id, event_id, event_type'
            });
        }

        const event = await createEvent({
            organization_id,
            event_id,
            event_type,
            region,
            amount,
            user_id,
            device,
            metadata
        });

        res.json({
            success: true,
            event
        });
    } catch (error: any) {
        logger.error('Event ingestion error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get organization statistics
apiRouter.get('/organizations/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await getOrganizationStats(id);

        res.json({
            success: true,
            stats
        });
    } catch (error: any) {
        logger.error('Stats fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get recent events
apiRouter.get('/events/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({
            success: true,
            events: data,
            count: data?.length || 0
        });
    } catch (error: any) {
        logger.error('Events fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get recent insights
apiRouter.get('/insights/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const { data, error } = await supabase
            .from('ai_insights')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({
            success: true,
            insights: data,
            count: data?.length || 0
        });
    } catch (error: any) {
        logger.error('Insights fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get active alerts
apiRouter.get('/alerts/active', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            alerts: data,
            count: data?.length || 0
        });
    } catch (error: any) {
        logger.error('Alerts fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start data producer (Kafka)
apiRouter.post('/producer/start', async (req, res) => {
    try {
        await startProducer();
        res.json({
            success: true,
            message: 'Producer started successfully'
        });
    } catch (error: any) {
        logger.error('Failed to start producer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start producer'
        });
    }
});

// Stop data producer (Kafka)
apiRouter.post('/producer/stop', async (req, res) => {
    try {
        await stopProducer();
        res.json({
            success: true,
            message: 'Producer stopped successfully'
        });
    } catch (error: any) {
        logger.error('Failed to stop producer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to stop producer'
        });
    }
});
