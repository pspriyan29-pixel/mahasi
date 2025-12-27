import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logAuditEvent } from '@/lib/middleware/auth';
import { moderateRateLimit } from '@/lib/middleware/rateLimiter';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const analyzeSchema = z.object({
    period_minutes: z.number().int().positive().max(1440).default(60),
    sensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
});

export async function POST(request: NextRequest) {
    return moderateRateLimit(request, async () => {
        return requireAuth(async (req, user) => {
            try {
                const body = await req.json();
                const validation = analyzeSchema.safeParse(body);

                if (!validation.success) {
                    return NextResponse.json(
                        { error: 'Validation Error', details: validation.error.errors },
                        { status: 400 }
                    );
                }

                const { period_minutes, sensitivity } = validation.data;

                // Call Supabase Edge Function for analysis
                const supabase = createClient();
                const { data, error } = await supabase.functions.invoke('analyze-events', {
                    body: {
                        period_minutes,
                        sensitivity,
                    },
                });

                if (error) {
                    throw error;
                }

                await logAuditEvent(user.id, 'ANALYZE', 'events', {
                    period_minutes,
                    sensitivity,
                });

                return NextResponse.json(data);
            } catch (error) {
                console.error('Error triggering analysis:', error);
                return NextResponse.json(
                    { error: 'Internal Server Error', message: 'Failed to trigger analysis' },
                    { status: 500 }
                );
            }
        })(req);
    });
}
