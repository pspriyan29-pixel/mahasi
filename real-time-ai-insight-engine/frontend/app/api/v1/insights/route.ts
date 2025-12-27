import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logAuditEvent } from '@/lib/middleware/auth';
import { moderateRateLimit } from '@/lib/middleware/rateLimiter';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    return moderateRateLimit(request, async () => {
        return requireAuth(async (req, user) => {
            try {
                const supabase = createClient();

                // Get AI insights with pagination
                const { searchParams } = new URL(req.url);
                const page = parseInt(searchParams.get('page') || '1');
                const limit = parseInt(searchParams.get('limit') || '20');
                const severity = searchParams.get('severity');

                let query = supabase
                    .from('ai_insights')
                    .select('*', { count: 'exact' })
                    .order('created_at', { ascending: false });

                if (severity) {
                    query = query.eq('severity', severity);
                }

                const from = (page - 1) * limit;
                const to = from + limit - 1;
                query = query.range(from, to);

                const { data, error, count } = await query;

                if (error) {
                    throw error;
                }

                await logAuditEvent(user.id, 'READ', 'ai_insights', { page, limit });

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
                console.error('Error fetching insights:', error);
                return NextResponse.json(
                    { error: 'Internal Server Error', message: 'Failed to fetch insights' },
                    { status: 500 }
                );
            }
        })(req);
    });
}
