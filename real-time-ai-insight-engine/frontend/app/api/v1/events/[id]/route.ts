import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logAuditEvent } from '@/lib/middleware/auth';
import { moderateRateLimit } from '@/lib/middleware/rateLimiter';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return moderateRateLimit(request, async () => {
        return requireAuth(async (req, user) => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        return NextResponse.json(
                            { error: 'Not Found', message: 'Event not found' },
                            { status: 404 }
                        );
                    }
                    throw error;
                }

                await logAuditEvent(user.id, 'READ', 'events', { event_id: params.id });

                return NextResponse.json(data);
            } catch (error) {
                console.error('Error fetching event:', error);
                return NextResponse.json(
                    { error: 'Internal Server Error', message: 'Failed to fetch event' },
                    { status: 500 }
                );
            }
        })(req);
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return moderateRateLimit(request, async () => {
        return requireAuth(async (req, user) => {
            try {
                const supabase = createClient();
                const { error } = await supabase
                    .from('events')
                    .delete()
                    .eq('id', params.id);

                if (error) {
                    throw error;
                }

                await logAuditEvent(user.id, 'DELETE', 'events', { event_id: params.id });

                return NextResponse.json({ success: true });
            } catch (error) {
                console.error('Error deleting event:', error);
                return NextResponse.json(
                    { error: 'Internal Server Error', message: 'Failed to delete event' },
                    { status: 500 }
                );
            }
        })(req);
    });
}
