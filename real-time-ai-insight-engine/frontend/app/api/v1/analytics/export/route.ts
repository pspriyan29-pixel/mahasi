import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, logAuditEvent } from '@/lib/middleware/auth';
import { moderateRateLimit } from '@/lib/middleware/rateLimiter';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const exportSchema = z.object({
    format: z.enum(['csv', 'json', 'excel']),
    event_type: z.string().optional(),
    region: z.string().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
    return moderateRateLimit(request, async () => {
        return requireAuth(async (req, user) => {
            try {
                const body = await req.json();
                const validation = exportSchema.safeParse(body);

                if (!validation.success) {
                    return NextResponse.json(
                        { error: 'Validation Error', details: validation.error.errors },
                        { status: 400 }
                    );
                }

                const { format, event_type, region, start_date, end_date } = validation.data;

                const supabase = createClient();
                let query = supabase.from('events').select('*');

                if (event_type) query = query.eq('event_type', event_type);
                if (region) query = query.eq('region', region);
                if (start_date) query = query.gte('timestamp', start_date);
                if (end_date) query = query.lte('timestamp', end_date);

                const { data, error } = await query;

                if (error) throw error;

                await logAuditEvent(user.id, 'EXPORT', 'events', {
                    format,
                    count: data?.length || 0,
                });

                // Generate export based on format
                if (format === 'csv') {
                    const csv = convertToCSV(data || []);
                    return new NextResponse(csv, {
                        headers: {
                            'Content-Type': 'text/csv',
                            'Content-Disposition': `attachment; filename="events_export_${Date.now()}.csv"`,
                        },
                    });
                } else if (format === 'json') {
                    return new NextResponse(JSON.stringify(data, null, 2), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Disposition': `attachment; filename="events_export_${Date.now()}.json"`,
                        },
                    });
                }

                return NextResponse.json({ error: 'Format not supported yet' }, { status: 400 });
            } catch (error) {
                console.error('Error exporting data:', error);
                return NextResponse.json(
                    { error: 'Internal Server Error', message: 'Failed to export data' },
                    { status: 500 }
                );
            }
        })(req);
    });
}

function convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map((header) => {
            const value = row[header];
            const escaped = ('' + value).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}
