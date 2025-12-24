// Competition Types
export interface Competition {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    start_date: string | null;
    end_date: string | null;
    registration_deadline: string | null;
    max_participants: number | null;
    current_participants: number;
    status: 'draft' | 'active' | 'closed' | 'completed';
    requirements: string | null;
    prizes: string | null;
    banner_url: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface CompetitionRegistration {
    id: string;
    competition_id: string;
    student_name: string;
    nim: string;
    email: string | null;
    phone: string | null;
    university: string;
    ktm_url: string | null;
    status: 'pending' | 'approved' | 'rejected';
    registered_at: string;
    approved_at: string | null;
    approved_by: string | null;
    rejection_reason: string | null;
}

export interface CompetitionWithRegistrations extends Competition {
    registrations?: CompetitionRegistration[];
    registration_count?: number;
}

export interface CreateCompetitionData {
    title: string;
    description?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    registration_deadline?: string;
    max_participants?: number;
    requirements?: string;
    prizes?: string;
    banner_url?: string;
    status?: 'draft' | 'active';
}

export interface UpdateCompetitionData extends Partial<CreateCompetitionData> {
    id: string;
}

export interface CreateRegistrationData {
    competition_id: string;
    student_name: string;
    nim: string;
    email?: string;
    phone?: string;
    university?: string;
    ktm_url?: string;
}

export interface UpdateRegistrationData {
    id: string;
    status?: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
}
