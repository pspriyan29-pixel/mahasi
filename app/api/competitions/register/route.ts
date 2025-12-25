import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { competition_id, nim, phone } = body;

        if (!competition_id || !nim) {
            return NextResponse.json({ error: 'Competition ID and NIM are required' }, { status: 400 });
        }

        // Check if already registered
        const { data: existingRegistration } = await supabase
            .from('competition_registrations')
            .select('id')
            .eq('competition_id', competition_id)
            .eq('email', session.user.email) // Check by email as unique identifier for user
            .single();

        if (existingRegistration) {
            return NextResponse.json({ error: 'You are already registered for this competition' }, { status: 409 });
        }

        // Get user profile for name
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

        const student_name = profile?.full_name || session.user.user_metadata?.full_name || 'Mahasiswa';

        // Insert registration
        const { data, error } = await supabase
            .from('competition_registrations')
            .insert({
                competition_id,
                student_name,
                nim,
                email: session.user.email,
                phone: phone || null,
                status: 'pending',
                university: 'POLITEKNIK KAMPAR' // Default for now
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase registration error:', error);
            throw new Error(error.message);
        }

        return NextResponse.json({ registration: data }, { status: 201 });

    } catch (error: any) {
        console.error('Registration API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
