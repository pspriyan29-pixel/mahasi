import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/registrations/[id]/approve - Approve registration (instructor only)
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isInstructor = await checkInstructorRole(supabase, session.user.id);
        if (!isInstructor) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;

        // @ts-ignore - Supabase types will be regenerated after migration
        const { data, error } = await supabase
            .from('competition_registrations')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: session.user.id
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(
            { registration: data, message: 'Registration approved successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error approving registration:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to approve registration' },
            { status: 500 }
        );
    }
}

async function checkInstructorRole(supabase: any, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    return data?.role === 'instructor' || data?.role === 'admin';
}
