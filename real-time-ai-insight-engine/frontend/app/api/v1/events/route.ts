import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logAuditEvent } from '@/lib/middleware/auth';
import { moderateRateLimit } from '@/lib/middleware/rateLimiter';
import { validateQuery, schemas } from '@/lib/middleware/validator';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Query schema for events endpoint
const eventsQuerySchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
    event_type: z.string().optional(),
    region: z.string().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    sort_by: z.enum(['timestamp', 'amount', 'event_type']).default('timestamp'),
    sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
    return moderateRateLimit(request, async () => {
        return requireAuth(async (req, user) => {
            // Validate query parameters
            const validation = validateQuery(req, eventsQuerySchema);
            if (!validation.success) {
                return validation.error;
            }

            const { page, limit, event_type, region, start_date, end_date, sort_by, sort_order } =
                validation.data;

            try {
                const supabase = createClient();

                // Build query
                let query = supabase
                    .from('events')
                    .select('*', { count: 'exact' });

                // Apply filters
                if (event_type) {
                    query = query.eq('event_type', event_type);
                }
                if (region) {
                    query = query.eq('region', region);
                }
                if (start_date) {
                    query = query.gte('timestamp', start_date);
                }
                if (end_date) {
                    query = query.lte('timestamp', end_date);
                }

                // Apply sorting
                query = query.order(sort_by, { ascending: sort_order === 'asc' });

                // Apply pagination
                const from = (page - 1) * limit;
                const to = from + limit - 1;
                query = query.range(from, to);

                const { data, error, count } = await query;

                if (error) {
                    throw error;
                }

                // Log audit event
                await logAuditEvent(user.id, 'READ', 'events', {
                    filters: { event_type, region, start_date, end_date },
                    page,
                    limit,
                });

                return NextResponse.json({
                    data,
                    pagination: {
                        page,
                        limit,
                        total: count || 0,
                        total_pages: Math.ceil((count || 0) / limit),
                    },
                });
            } catch (error) {
                console.error('Error fetching events:', error);
                return NextResponse.json(
                    { error: 'Internal Server Error', message: 'Failed to fetch events' },
                    { status: 500 }
                );
            }
        })(req);
    });
}

// Event creation schema
const createEventSchema = z.object({
    event_type: z.string().min(1),
    region: z.string().optional(),
    amount: z.number().positive().optional(),
    user_id: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
    return moderateRateLimit(request, async () => {
        return requireAuth(async (req, user) => {
            try {
                const body = await req.json();
                const validation = createEventSchema.safeParse(body);

                if (!validation.success) {
                    return NextResponse.json(
                        {
                            error: 'Validation Error',
                            details: validation.error.errors,
                        },
                        { status: 400 }
                    );
                }

                const supabase = createClient();
                const { data, error } = await supabase
                    .from('events')
                    .insert({
                        ...validation.data,
                        timestamp: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (error) {
                    throw error;
                }

                // Log audit event
                await logAuditEvent(user.id, 'CREATE', 'events', {
                    event_id: data.id,
                });

                return NextResponse.json(data, { status: 201 });
            } catch (error) {
                console.error('Error creating event:', error);
                return NextResponse.json(
                    { error: 'Internal Server Error', message: 'Failed to create event' },
                    { status: 500 }
                );
            }
        })(req);
    });
}
