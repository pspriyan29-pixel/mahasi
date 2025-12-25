-- COMPREHENSIVE FIX FOR COMPETITION CREATION
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active competitions" ON competitions;
DROP POLICY IF EXISTS "Anyone can view published competitions" ON competitions;
DROP POLICY IF EXISTS "Instructors can view all competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can view all competitions" ON competitions;
DROP POLICY IF EXISTS "Instructors can create competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can create competitions" ON competitions;
DROP POLICY IF EXISTS "Instructors can update competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can update competitions" ON competitions;
DROP POLICY IF EXISTS "Instructors can delete competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can delete competitions" ON competitions;
DROP POLICY IF EXISTS "Instructors and admins can create competitions" ON competitions;
DROP POLICY IF EXISTS "Instructors and admins can update competitions" ON competitions;
DROP POLICY IF EXISTS "Instructors and admins can delete competitions" ON competitions;

-- ============================================
-- STEP 2: ADD MISSING COLUMNS
-- ============================================
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS prizes TEXT;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES competition_categories(id);
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS long_description TEXT;

-- Make slug nullable if it's NOT NULL
ALTER TABLE competitions ALTER COLUMN slug DROP NOT NULL;

-- ============================================
-- STEP 3: CREATE NEW RLS POLICIES
-- ============================================

-- Public can view active/published competitions
CREATE POLICY "Public can view active competitions"
    ON competitions FOR SELECT
    TO public
    USING (status IN ('active', 'open', 'ongoing', 'closed', 'finished'));

-- Instructors and admins can view all competitions
CREATE POLICY "Instructors and admins can view all competitions"
    ON competitions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('instructor', 'admin')
        )
    );

-- Instructors and admins can create competitions
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

-- Instructors and admins can update competitions
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

-- Instructors and admins can delete competitions
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

-- ============================================
-- STEP 4: UPDATE USER ROLE
-- ============================================
UPDATE profiles 
SET role = 'instructor' 
WHERE email = 'perdhanariyan@gmail.com';

-- ============================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================

-- Check user role
SELECT 
    id,
    email,
    role,
    full_name
FROM profiles
WHERE email = 'perdhanariyan@gmail.com';

-- Check active policies
SELECT 
    policyname,
    cmd as command,
    roles
FROM pg_policies
WHERE tablename = 'competitions'
ORDER BY cmd, policyname;

-- Test permission
SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('instructor', 'admin')
) as has_permission;

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'competitions' 
AND column_name IN ('category_id', 'prizes', 'category')
ORDER BY column_name;
