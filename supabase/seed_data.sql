-- ============================================
-- SEED DATA FOR TESTING
-- ============================================
-- Sample data to test instructor dashboard
-- Run this AFTER creating instructor account

-- ============================================
-- SAMPLE COMPETITIONS
-- ============================================

-- Get instructor ID (replace with actual ID after creating instructor)
DO $$
DECLARE
    instructor_uuid UUID;
BEGIN
    -- Get instructor ID
    SELECT id INTO instructor_uuid 
    FROM auth.users 
    WHERE email = 'perdhanariyan@gmail.com' 
    LIMIT 1;

    -- Insert sample competitions
    INSERT INTO competitions (id, title, description, category, start_date, end_date, registration_deadline, max_participants, status, requirements, prizes, created_by)
    VALUES 
    (
        gen_random_uuid(),
        'Lomba Web Development 2024',
        'Kompetisi pengembangan website modern menggunakan teknologi terkini. Peserta akan membuat website responsif dengan fitur lengkap.',
        'Coding',
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '30 days',
        NOW() + INTERVAL '5 days',
        50,
        'active',
        '- Mahasiswa aktif\n- Upload KTM\n- Memiliki laptop',
        'Juara 1: Rp 5.000.000\nJuara 2: Rp 3.000.000\nJuara 3: Rp 2.000.000',
        instructor_uuid
    ),
    (
        gen_random_uuid(),
        'Lomba UI/UX Design Competition',
        'Kompetisi desain antarmuka pengguna untuk aplikasi mobile. Fokus pada user experience dan visual design.',
        'Design',
        NOW() + INTERVAL '10 days',
        NOW() + INTERVAL '25 days',
        NOW() + INTERVAL '7 days',
        30,
        'active',
        '- Mahasiswa aktif\n- Upload KTM\n- Portfolio design',
        'Juara 1: Rp 4.000.000\nJuara 2: Rp 2.500.000\nJuara 3: Rp 1.500.000',
        instructor_uuid
    ),
    (
        gen_random_uuid(),
        'Business Plan Competition 2024',
        'Kompetisi rencana bisnis untuk startup teknologi. Peserta akan mempresentasikan ide bisnis inovatif.',
        'Business',
        NOW() + INTERVAL '14 days',
        NOW() + INTERVAL '35 days',
        NOW() + INTERVAL '10 days',
        20,
        'active',
        '- Mahasiswa aktif\n- Upload KTM\n- Tim 3-5 orang',
        'Juara 1: Rp 10.000.000\nJuara 2: Rp 6.000.000\nJuara 3: Rp 4.000.000',
        instructor_uuid
    ),
    (
        gen_random_uuid(),
        'Hackathon 48 Hours Challenge',
        'Kompetisi coding marathon selama 48 jam. Buat aplikasi inovatif untuk menyelesaikan masalah nyata.',
        'Coding',
        NOW() + INTERVAL '20 days',
        NOW() + INTERVAL '22 days',
        NOW() + INTERVAL '15 days',
        100,
        'draft',
        '- Mahasiswa aktif\n- Upload KTM\n- Tim 2-4 orang\n- Laptop dan charger',
        'Juara 1: Rp 15.000.000\nJuara 2: Rp 10.000.000\nJuara 3: Rp 7.000.000',
        instructor_uuid
    ),
    (
        gen_random_uuid(),
        'Data Science Competition',
        'Kompetisi analisis data dan machine learning. Gunakan dataset yang disediakan untuk membuat model prediksi.',
        'Data Science',
        NOW() - INTERVAL '5 days',
        NOW() + INTERVAL '15 days',
        NOW() - INTERVAL '7 days',
        40,
        'closed',
        '- Mahasiswa aktif\n- Upload KTM\n- Pengalaman Python/R',
        'Juara 1: Rp 8.000.000\nJuara 2: Rp 5.000.000\nJuara 3: Rp 3.000.000',
        instructor_uuid
    );

END $$;

-- ============================================
-- SAMPLE REGISTRATIONS
-- ============================================

-- Insert sample registrations for active competitions
DO $$
DECLARE
    comp_id UUID;
    i INTEGER;
BEGIN
    -- Get first active competition
    SELECT id INTO comp_id 
    FROM competitions 
    WHERE status = 'active' 
    LIMIT 1;

    -- Insert 15 sample registrations with various statuses
    FOR i IN 1..15 LOOP
        INSERT INTO competition_registrations (
            competition_id,
            student_name,
            nim,
            email,
            phone,
            university,
            status
        ) VALUES (
            comp_id,
            'Mahasiswa ' || i,
            '2024' || LPAD(i::TEXT, 4, '0'),
            'mahasiswa' || i || '@example.com',
            '08' || LPAD((1000000000 + i)::TEXT, 10, '0'),
            'POLITEKNIK KAMPUR',
            CASE 
                WHEN i <= 5 THEN 'pending'
                WHEN i <= 10 THEN 'approved'
                ELSE 'rejected'
            END
        );
    END LOOP;

END $$;

-- ============================================
-- VERIFY SEED DATA
-- ============================================

-- Check competitions
SELECT 
    id,
    title,
    category,
    status,
    current_participants,
    max_participants
FROM competitions
ORDER BY created_at DESC;

-- Check registrations
SELECT 
    cr.student_name,
    cr.nim,
    cr.status,
    c.title as competition_title
FROM competition_registrations cr
JOIN competitions c ON c.id = cr.competition_id
ORDER BY cr.registered_at DESC;

-- Check statistics
SELECT * FROM competition_statistics;
