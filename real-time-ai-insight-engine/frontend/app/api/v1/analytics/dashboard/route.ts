import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logAuditEvent } from '@/lib/middleware/auth';
import { lenientRateLimit } from '@/lib/middleware/rateLimiter';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const dashboardQuerySchema = z.object({
    period: z.enum(['15m', '1h', '6h', '24h', '7d', '30d']).default('24h'),
});

export async function GET(request: NextRequest) {
    return lenientRateLimit(request, async () => {
        return requireAuth(async (req, user) => {
            try {
                const { searchParams } = new URL(req.url);
                const period = searchParams.get('period') || '24h';

                const supabase = createClient();

                // Calculate time range
                const now = new Date();
                const periodMap: Record<string, number> = {
                    '15m': 15 * 60 * 1000,
                    '1h': 60 * 60 * 1000,
                    '6h': 6 * 60 * 60 * 1000,
                    '24h': 24 * 60 * 60 * 1000,
                    '7d': 7 * 24 * 60 * 60 * 1000,
                    '30d': 30 * 24 * 60 * 60 * 1000,
                };

                const startTime = new Date(now.getTime() - periodMap[period]);

                // Fetch metrics in parallel
                const [eventsResult, insightsResult, alertsResult] = await Promise.all([
                    supabase
                        .from('events')
                        .select('*', { count: 'exact', head: false })
                        .gte('timestamp', startTime.toISOString()),
                    supabase
                        .from('ai_insights')
                        .select('*', { count: 'exact', head: false })
                        .gte('created_at', startTime.toISOString()),
                    supabase
                        .from('alerts')
                        .select('*', { count: 'exact', head: false })
                        .gte('created_at', startTime.toISOString()),
                ]);

                if (eventsResult.error) throw eventsResult.error;
                if (insightsResult.error) throw insightsResult.error;
                if (alertsResult.error) throw alertsResult.error;

                const events = eventsResult.data || [];
                const insights = insightsResult.data || [];
                const alerts = alertsResult.data || [];

                // Calculate metrics
                const totalEvents = events.length;
                const avgAmount =
                    events.reduce((sum, e) => sum + (e.amount || 0), 0) / (totalEvents || 1);
                const uniqueRegions = new Set(events.map((e) => e.region).filter(Boolean)).size;
                const eventTypes = events.reduce((acc, e) => {
                    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                // Events per second
                const durationSeconds = (now.getTime() - startTime.getTime()) / 1000;
                const eventsPerSecond = totalEvents / durationSeconds;

                // Regional distribution
                const regionalData = events.reduce((acc, e) => {
                    if (e.region) {
                        acc[e.region] = (acc[e.region] || 0) + 1;
                    }
                    return acc;
                }, {} as Record<string, number>);

                // Time series data (hourly buckets)
                const timeSeries = events.reduce((acc, e) => {
                    const hour = new Date(e.timestamp).toISOString().slice(0, 13);
                    if (!acc[hour]) {
                        acc[hour] = { timestamp: hour, count: 0, total_amount: 0 };
                    }
                    acc[hour].count++;
                    acc[hour].total_amount += e.amount || 0;
                    return acc;
                }, {} as Record<string, any>);

                await logAuditEvent(user.id, 'READ', 'analytics/dashboard', { period });

                return NextResponse.json({
                    metrics: {
                        total_events: totalEvents,
                        events_per_second: parseFloat(eventsPerSecond.toFixed(2)),
                        avg_transaction_amount: parseFloat(avgAmount.toFixed(2)),
                        active_regions: uniqueRegions,
                        total_insights: insights.length,
                        total_alerts: alerts.length,
                        anomaly_count: insights.filter((i) => i.status === 'ANOMALY').length,
                    },
                    event_types: Object.entries(eventTypes).map(([type, count]) => ({
                        type,
                        count,
                    })),
                    regional_distribution: Object.entries(regionalData).map(([region, count]) => ({
                        region,
                        count,
                    })),
                    time_series: Object.values(timeSeries).sort((a, b) =>
                        a.timestamp.localeCompare(b.timestamp)
                    ),
                    recent_insights: insights.slice(0, 5),
                    recent_alerts: alerts.slice(0, 5),
                });
            } catch (error) {
                console.error('Error fetching dashboard analytics:', error);
                return NextResponse.json(
                    {
                        error: 'Internal Server Error',
                        message: 'Failed to fetch dashboard analytics',
                    },
                    { status: 500 }
                );
            }
        })(req);
    });
}
