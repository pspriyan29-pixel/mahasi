import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/competitions - List all competitions (filtered by status for public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        // Check if user is authenticated and is instructor
        const { data: { session } } = await supabase.auth.getSession();
        const isInstructor = session?.user ? await checkInstructorRole(supabase, session.user.id) : false;

        let query = supabase
            .from('competitions')
            .select(`
                *,
                category:competition_categories(id, name, slug, icon, color)
            `)
            .order('created_at', { ascending: false });

        // If not instructor, only show active competitions
        if (!isInstructor) {
            query = query.eq('status', 'active');
        } else if (status) {
            query = query.eq('status', status);
        }

        if (category) {
            query = query.eq('competition_categories.slug', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ competitions: data }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching competitions:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch competitions' },
            { status: 500 }
        );
    }
}

// POST /api/competitions - Create new competition (instructor only)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is instructor
        const isInstructor = await checkInstructorRole(supabase, session.user.id);
        if (!isInstructor) {
            return NextResponse.json({ error: 'Forbidden - Instructor access required' }, { status: 403 });
        }

        const body = await request.json();
        const {
            title,
            description,
            category_id,
            start_date,
            end_date,
            registration_deadline,
            max_participants,
            requirements,
            prizes,
            banner_url,
            status = 'draft'
        } = body;

        // Validation
        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('competitions')
            // @ts-ignore - Supabase types will be regenerated after migration
            .insert({
                title,
                description,
                category_id,
                start_date,
                end_date,
                registration_deadline,
                max_participants,
                requirements,
                prizes,
                banner_url,
                status,
                created_by: session.user.id
            })
            .select(`
                *,
                category:competition_categories(id, name, slug, icon, color)
            `)
            .single();

        if (error) throw error;

        return NextResponse.json({ competition: data }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating competition:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create competition' },
            { status: 500 }
        );
    }
}

// Helper function to check if user is instructor
async function checkInstructorRole(supabase: any, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    return data?.role === 'instructor' || data?.role === 'admin';
}
