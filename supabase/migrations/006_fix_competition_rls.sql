-- Fix RLS policies to allow instructors to create competitions
-- Migration 004 only allowed admins, but we need instructors too

-- Drop the restrictive admin-only policies
DROP POLICY IF EXISTS "Admins can create competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can update competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can delete competitions" ON competitions;

-- Create new policies that allow both instructors and admins
CREATE POLICY "Instructors and admins can create competitions"
    ON competitions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('instructor', 'admin')
        )
    );

CREATE POLICY "Instructors and admins can update competitions"
    ON competitions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('instructor', 'admin')
        )
    );

CREATE POLICY "Instructors and admins can delete competitions"
    ON competitions FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('instructor', 'admin')
        )
    );
