import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/registrations - List registrations (instructor only or filtered by competition)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const competitionId = searchParams.get('competition_id');
        const status = searchParams.get('status');

        const { data: { session } } = await supabase.auth.getSession();

        // Check if user is instructor
        const isInstructor = session?.user ? await checkInstructorRole(supabase, session.user.id) : false;

        if (!isInstructor && !competitionId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let query = supabase
            .from('competition_registrations')
            .select(`
                *,
                competition:competitions(title, category)
            `)
            .order('registered_at', { ascending: false });

        if (competitionId) {
            query = query.eq('competition_id', competitionId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ registrations: data }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch registrations' },
            { status: 500 }
        );
    }
}

// POST /api/registrations - Create new registration (public)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const {
            competition_id,
            student_name,
            nim,
            email,
            phone,
            university = 'POLITEKNIK KAMPAR',
            ktm_url
        } = body;

        // Validation
        if (!competition_id || !student_name || !nim) {
            return NextResponse.json(
                { error: 'Competition ID, student name, and NIM are required' },
                { status: 400 }
            );
        }

        // Check if competition exists and is active
        const { data: competition, error: compError } = await supabase
            .from('competitions')
            .select('id, status, max_participants, current_participants, registration_deadline')
            .eq('id', competition_id)
            .single();

        if (compError || !competition) {
            return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
        }

        if (competition.status !== 'active') {
            return NextResponse.json({ error: 'Competition is not active' }, { status: 400 });
        }

        // Check registration deadline
        if (competition.registration_deadline) {
            const deadline = new Date(competition.registration_deadline);
            if (new Date() > deadline) {
                return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 });
            }
        }

        // Check participant limit
        if (competition.max_participants && competition.current_participants >= competition.max_participants) {
            return NextResponse.json({ error: 'Competition is full' }, { status: 400 });
        }

        // Check for duplicate registration
        const { data: existing } = await supabase
            .from('competition_registrations')
            .select('id')
            .eq('competition_id', competition_id)
            .eq('nim', nim)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'You have already registered for this competition' },
                { status: 400 }
            );
        }

        // Create registration
        const { data, error } = await supabase
            .from('competition_registrations')
            .insert({
                competition_id,
                student_name,
                nim,
                email,
                phone,
                university,
                ktm_url,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(
            { registration: data, message: 'Registration submitted successfully' },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating registration:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create registration' },
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
