import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/competitions/[id] - Get competition details
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await context.params;

        const { data, error } = await supabase
            .from('competitions')
            .select(`
                *,
                registrations:competition_registrations(count)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
        }

        return NextResponse.json({ competition: data }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching competition:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch competition' },
            { status: 500 }
        );
    }
}

// PUT /api/competitions/[id] - Update competition (instructor only)
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
        const body = await request.json();

        const { data, error } = await supabase
            .from('competitions')
            // @ts-ignore - Supabase types will be regenerated after migration
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ competition: data }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating competition:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update competition' },
            { status: 500 }
        );
    }
}

// DELETE /api/competitions/[id] - Delete competition (instructor only)
export async function DELETE(
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

        const { error } = await supabase
            .from('competitions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Competition deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting competition:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete competition' },
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
