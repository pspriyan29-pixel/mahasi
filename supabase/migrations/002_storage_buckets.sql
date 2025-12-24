-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
    ('course-thumbnails', 'course-thumbnails', true),
    ('lesson-videos', 'lesson-videos', false),
    ('assignment-files', 'assignment-files', false),
    ('submission-files', 'submission-files', false),
    ('avatars', 'avatars', true),
    ('certificates', 'certificates', false);

-- Storage policies for course-thumbnails
CREATE POLICY "Course thumbnails are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Instructors can upload course thumbnails"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'course-thumbnails' AND
        auth.role() = 'authenticated'
    );

-- Storage policies for avatars
CREATE POLICY "Avatars are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for lesson-videos
CREATE POLICY "Enrolled students can view lesson videos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'lesson-videos' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Instructors can upload lesson videos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'lesson-videos' AND
        auth.role() = 'authenticated'
    );

-- Storage policies for submission-files
CREATE POLICY "Students can view own submissions"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'submission-files' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Students can upload submissions"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'submission-files' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for certificates
CREATE POLICY "Users can view own certificates"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'certificates' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
