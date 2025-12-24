-- ============================================
-- DATABASE ENHANCEMENTS
-- ============================================
-- Adds performance indexes, new fields, and helper functions

-- Add banner_url to competitions
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add notes to registrations
ALTER TABLE competition_registrations 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Competitions indexes
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_category ON competitions(category);
CREATE INDEX IF NOT EXISTS idx_competitions_created_by ON competitions(created_by);
CREATE INDEX IF NOT EXISTS idx_competitions_created_at ON competitions(created_at DESC);

-- Registrations indexes
CREATE INDEX IF NOT EXISTS idx_registrations_competition_id ON competition_registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON competition_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_nim ON competition_registrations(nim);
CREATE INDEX IF NOT EXISTS idx_registrations_registered_at ON competition_registrations(registered_at DESC);

-- ============================================
-- STATISTICS VIEW
-- ============================================

CREATE OR REPLACE VIEW competition_statistics AS
SELECT 
    c.id,
    c.title,
    c.status,
    c.category,
    COUNT(cr.id) as total_registrations,
    COUNT(CASE WHEN cr.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN cr.status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN cr.status = 'rejected' THEN 1 END) as rejected_count,
    c.max_participants,
    c.current_participants,
    c.created_at,
    c.registration_deadline
FROM competitions c
LEFT JOIN competition_registrations cr ON c.id = cr.competition_id
GROUP BY c.id;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get instructor statistics
CREATE OR REPLACE FUNCTION get_instructor_stats(instructor_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_competitions', COUNT(DISTINCT c.id),
        'active_competitions', COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END),
        'total_participants', COALESCE(SUM(c.current_participants), 0),
        'pending_approvals', COUNT(CASE WHEN cr.status = 'pending' THEN 1 END),
        'total_approved', COUNT(CASE WHEN cr.status = 'approved' THEN 1 END)
    ) INTO result
    FROM competitions c
    LEFT JOIN competition_registrations cr ON c.id = cr.competition_id
    WHERE c.created_by = instructor_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant access to view
GRANT SELECT ON competition_statistics TO authenticated;

-- Grant execute on function
GRANT EXECUTE ON FUNCTION get_instructor_stats(UUID) TO authenticated;
