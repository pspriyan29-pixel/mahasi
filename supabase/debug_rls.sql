-- Debug script untuk cek RLS policies dan user role
-- Jalankan ini di Supabase SQL Editor untuk debugging

-- 1. Cek role user yang sedang login
SELECT 
    auth.uid() as user_id,
    p.email,
    p.role,
    p.full_name
FROM profiles p
WHERE p.id = auth.uid();

-- 2. Cek semua RLS policies untuk tabel competitions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'competitions'
ORDER BY policyname;

-- 3. Test apakah user bisa insert (dry run)
-- Ini akan show error jika ada masalah
EXPLAIN (VERBOSE, COSTS OFF)
SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('instructor', 'admin')
);
