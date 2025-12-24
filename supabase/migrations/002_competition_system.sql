-- Competition Management System Migration
-- This migration adds tables for competition management and student registrations

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- COMPETITIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'completed')),
    requirements TEXT,
    prizes TEXT,
    banner_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMPETITION REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS competition_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    nim VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    university VARCHAR(255) DEFAULT 'POLITEKNIK KAMPAR',
    ktm_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES profiles(id),
    rejection_reason TEXT,
    UNIQUE(competition_id, nim)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_created_by ON competitions(created_by);
CREATE INDEX IF NOT EXISTS idx_competitions_deadline ON competitions(registration_deadline);
CREATE INDEX IF NOT EXISTS idx_registrations_competition ON competition_registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON competition_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_nim ON competition_registrations(nim);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;

-- Competitions Policies
-- Anyone can view active competitions
CREATE POLICY "Anyone can view active competitions"
ON competitions FOR SELECT
USING (status = 'active');

-- Instructors and admins can view all competitions
CREATE POLICY "Instructors can view all competitions"
ON competitions FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('instructor', 'admin')
    )
);

-- Only instructors and admins can insert competitions
CREATE POLICY "Instructors can create competitions"
ON competitions FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('instructor', 'admin')
    )
);

-- Only instructors and admins can update competitions
CREATE POLICY "Instructors can update competitions"
ON competitions FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('instructor', 'admin')
    )
);

-- Only instructors and admins can delete competitions
CREATE POLICY "Instructors can delete competitions"
ON competitions FOR DELETE
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('instructor', 'admin')
    )
);

-- Registrations Policies
-- Anyone can insert registrations (for public registration)
CREATE POLICY "Anyone can register for competitions"
ON competition_registrations FOR INSERT
WITH CHECK (true);

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
ON competition_registrations FOR SELECT
USING (nim = current_setting('app.current_nim', true));

-- Instructors can view all registrations
CREATE POLICY "Instructors can view all registrations"
ON competition_registrations FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('instructor', 'admin')
    )
);

-- Only instructors can update registrations (approve/reject)
CREATE POLICY "Instructors can update registrations"
ON competition_registrations FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('instructor', 'admin')
    )
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update current_participants count
CREATE OR REPLACE FUNCTION update_competition_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE competitions
        SET current_participants = current_participants + 1
        WHERE id = NEW.competition_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
        UPDATE competitions
        SET current_participants = current_participants + 1
        WHERE id = NEW.competition_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
        UPDATE competitions
        SET current_participants = current_participants - 1
        WHERE id = NEW.competition_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE competitions
        SET current_participants = current_participants - 1
        WHERE id = OLD.competition_id;
    END IF
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update participant count
DROP TRIGGER IF EXISTS trigger_update_participants ON competition_registrations;
CREATE TRIGGER trigger_update_participants
AFTER INSERT OR UPDATE OR DELETE ON competition_registrations
FOR EACH ROW
EXECUTE FUNCTION update_competition_participants();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update competitions updated_at
DROP TRIGGER IF EXISTS trigger_competitions_updated_at ON competitions;
CREATE TRIGGER trigger_competitions_updated_at
BEFORE UPDATE ON competitions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET FOR KTM UPLOADS
-- =====================================================

-- Create storage bucket for KTM uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('ktm-uploads', 'ktm-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload KTM"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ktm-uploads');

CREATE POLICY "Instructors can view all KTM"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'ktm-uploads' AND
    auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('instructor', 'admin')
    )
);

CREATE POLICY "Users can view own KTM"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'ktm-uploads' AND
    auth.uid() = owner
);
