// Extend database types with competitions tables
import { Database } from './database.types';

export type CompetitionStatus = 'draft' | 'active' | 'closed' | 'completed';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface CompetitionsTable {
    Row: {
        id: string;
        title: string;
        description: string | null;
        category: string | null;
        start_date: string | null;
        end_date: string | null;
        registration_deadline: string | null;
        max_participants: number | null;
        current_participants: number;
        status: CompetitionStatus;
        requirements: string | null;
        prizes: string | null;
        banner_url: string | null;
        created_by: string | null;
        created_at: string;
        updated_at: string;
    };
    Insert: {
        id?: string;
        title: string;
        description?: string | null;
        category?: string | null;
        start_date?: string | null;
        end_date?: string | null;
        registration_deadline?: string | null;
        max_participants?: number | null;
        current_participants?: number;
        status?: CompetitionStatus;
        requirements?: string | null;
        prizes?: string | null;
        banner_url?: string | null;
        created_by?: string | null;
        created_at?: string;
        updated_at?: string;
    };
    Update: {
        id?: string;
        title?: string;
        description?: string | null;
        category?: string | null;
        start_date?: string | null;
        end_date?: string | null;
        registration_deadline?: string | null;
        max_participants?: number | null;
        current_participants?: number;
        status?: CompetitionStatus;
        requirements?: string | null;
        prizes?: string | null;
        banner_url?: string | null;
        created_by?: string | null;
        created_at?: string;
        updated_at?: string;
    };
}

export interface CompetitionRegistrationsTable {
    Row: {
        id: string;
        competition_id: string;
        student_name: string;
        nim: string;
        email: string | null;
        phone: string | null;
        university: string;
        ktm_url: string | null;
        status: RegistrationStatus;
        registered_at: string;
        approved_at: string | null;
        approved_by: string | null;
        rejection_reason: string | null;
    };
    Insert: {
        id?: string;
        competition_id: string;
        student_name: string;
        nim: string;
        email?: string | null;
        phone?: string | null;
        university?: string;
        ktm_url?: string | null;
        status?: RegistrationStatus;
        registered_at?: string;
        approved_at?: string | null;
        approved_by?: string | null;
        rejection_reason?: string | null;
    };
    Update: {
        id?: string;
        competition_id?: string;
        student_name?: string;
        nim?: string;
        email?: string | null;
        phone?: string | null;
        university?: string;
        ktm_url?: string | null;
        status?: RegistrationStatus;
        registered_at?: string;
        approved_at?: string | null;
        approved_by?: string | null;
        rejection_reason?: string | null;
    };
}

// Extend Database interface
export interface ExtendedDatabase extends Database {
    public: Database['public'] & {
        Tables: Database['public']['Tables'] & {
            competitions: CompetitionsTable;
            competition_registrations: CompetitionRegistrationsTable;
        };
    };
}
