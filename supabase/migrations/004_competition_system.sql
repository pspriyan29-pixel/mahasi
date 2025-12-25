-- Competition Management System
-- Migration: 004_competition_system.sql

-- ============================================
-- TABLES
-- ============================================

-- Competition Categories
CREATE TABLE IF NOT EXISTS competition_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#667eea',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Competitions
CREATE TABLE IF NOT EXISTS competitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    category_id UUID REFERENCES competition_categories(id) ON DELETE SET NULL,
    
    -- Dates
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Participants
    max_participants INTEGER NOT NULL DEFAULT 100,
    current_participants INTEGER DEFAULT 0,
    is_team_competition BOOLEAN DEFAULT false,
    max_team_members INTEGER DEFAULT 1,
    
    -- Prize & Requirements
    prize_pool TEXT,
    first_prize TEXT,
    second_prize TEXT,
    third_prize TEXT,
    prizes TEXT, -- Backward compatibility with existing frontend
    requirements TEXT,
    
    -- Media
    banner_url TEXT,
    thumbnail_url TEXT,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'ongoing', 'closed', 'finished')),
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Competition Registrations
CREATE TABLE IF NOT EXISTS competition_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Team Info (if team competition)
    team_name TEXT,
    team_members JSONB, -- Array of {name, email, phone, role}
    
    -- Registration Details
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Submission
    submission_url TEXT,
    submission_date TIMESTAMP WITH TIME ZONE,
    
    -- Admin Notes
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Constraint: One registration per user per competition
    UNIQUE(competition_id, user_id)
);

-- Competition Winners
CREATE TABLE IF NOT EXISTS competition_winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES competition_registrations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Winner Details
    rank INTEGER NOT NULL CHECK (rank > 0),
    prize_amount TEXT,
    
    -- Certificate
    certificate_url TEXT,
    certificate_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Announcement
    announcement_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_published BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Constraint: One rank per competition
    UNIQUE(competition_id, rank)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_category ON competitions(category_id);
CREATE INDEX IF NOT EXISTS idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_competitions_created_by ON competitions(created_by);

CREATE INDEX IF NOT EXISTS idx_registrations_competition ON competition_registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON competition_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON competition_registrations(status);

CREATE INDEX IF NOT EXISTS idx_winners_competition ON competition_winners(competition_id);
CREATE INDEX IF NOT EXISTS idx_winners_user ON competition_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_published ON competition_winners(is_published);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE competition_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_winners ENABLE ROW LEVEL SECURITY;

-- Categories: Public read, admin write
CREATE POLICY "Anyone can view categories"
    ON competition_categories FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Admins can manage categories"
    ON competition_categories FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Competitions: Public read for published, admin full access
CREATE POLICY "Anyone can view published competitions"
    ON competitions FOR SELECT
    TO public
    USING (status IN ('open', 'ongoing', 'closed', 'finished'));

CREATE POLICY "Admins can view all competitions"
    ON competitions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can create competitions"
    ON competitions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update competitions"
    ON competitions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete competitions"
    ON competitions FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Registrations: Users can view their own, admins can view all
CREATE POLICY "Users can view their own registrations"
    ON competition_registrations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all registrations"
    ON competition_registrations FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can register"
    ON competition_registrations FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own registrations"
    ON competition_registrations FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can update all registrations"
    ON competition_registrations FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Winners: Public read if published, admin full access
CREATE POLICY "Anyone can view published winners"
    ON competition_winners FOR SELECT
    TO public
    USING (is_published = true);

CREATE POLICY "Admins can manage winners"
    ON competition_winners FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_competition_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update participant count
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE competitions
        SET current_participants = current_participants + 1
        WHERE id = NEW.competition_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            UPDATE competitions
            SET current_participants = current_participants + 1
            WHERE id = NEW.competition_id;
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            UPDATE competitions
            SET current_participants = current_participants - 1
            WHERE id = NEW.competition_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE competitions
        SET current_participants = current_participants - 1
        WHERE id = OLD.competition_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE TRIGGER update_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW
    EXECUTE FUNCTION update_competition_updated_at();

CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON competition_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_competition_updated_at();

-- Update participant count
CREATE TRIGGER update_competition_participant_count
    AFTER INSERT OR UPDATE OR DELETE ON competition_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_participant_count();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO competition_categories (name, slug, description, icon, color) VALUES
('Coding', 'coding', 'Kompetisi pemrograman dan pengembangan software', '💻', '#667eea'),
('Design', 'design', 'Kompetisi desain grafis, UI/UX, dan kreativitas visual', '🎨', '#f093fb'),
('Business', 'business', 'Kompetisi ide bisnis dan kewirausahaan', '💼', '#4facfe'),
('Essay', 'essay', 'Kompetisi penulisan esai dan karya tulis', '📝', '#43e97b'),
('Video', 'video', 'Kompetisi pembuatan video dan konten multimedia', '🎬', '#fa709a'),
('Innovation', 'innovation', 'Kompetisi inovasi dan teknologi', '💡', '#feca57')
ON CONFLICT (slug) DO NOTHING;
