-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'graded');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'student',
    bio TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    level course_level DEFAULT 'beginner',
    status course_status DEFAULT 'draft',
    category TEXT,
    tags TEXT[],
    price DECIMAL(10,2) DEFAULT 0,
    duration_hours INTEGER,
    total_lessons INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table
CREATE TABLE public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    starter_code TEXT,
    solution_code TEXT,
    test_cases JSONB,
    max_score INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_percentage INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    UNIQUE(student_id, course_id)
);

-- Submissions table
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    code TEXT,
    status submission_status DEFAULT 'pending',
    score INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES public.profiles(id)
);

-- Progress tracking table
CREATE TABLE public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    time_spent_minutes INTEGER DEFAULT 0,
    UNIQUE(student_id, lesson_id)
);

-- Certificates table
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Discussions table
CREATE TABLE public.discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Code snippets table
CREATE TABLE public.code_snippets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_modules_course ON public.modules(course_id);
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
CREATE INDEX idx_assignments_lesson ON public.assignments(lesson_id);
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_progress_student ON public.lesson_progress(student_id);
CREATE INDEX idx_discussions_lesson ON public.discussions(lesson_id);
CREATE INDEX idx_reviews_course ON public.reviews(course_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Courses policies
CREATE POLICY "Published courses are viewable by everyone"
    ON public.courses FOR SELECT
    USING (status = 'published' OR instructor_id = auth.uid());

CREATE POLICY "Instructors can create courses"
    ON public.courses FOR INSERT
    WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own courses"
    ON public.courses FOR UPDATE
    USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete own courses"
    ON public.courses FOR DELETE
    USING (auth.uid() = instructor_id);

-- Modules policies
CREATE POLICY "Modules viewable if course is accessible"
    ON public.modules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = modules.course_id
            AND (courses.status = 'published' OR courses.instructor_id = auth.uid())
        )
    );

CREATE POLICY "Instructors can manage own course modules"
    ON public.modules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = modules.course_id
            AND courses.instructor_id = auth.uid()
        )
    );

-- Lessons policies
CREATE POLICY "Lessons viewable if enrolled or free"
    ON public.lessons FOR SELECT
    USING (
        is_free OR
        EXISTS (
            SELECT 1 FROM public.modules m
            JOIN public.courses c ON c.id = m.course_id
            WHERE m.id = lessons.module_id
            AND (
                c.instructor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.enrollments e
                    WHERE e.course_id = c.id AND e.student_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Instructors can manage own course lessons"
    ON public.lessons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.modules m
            JOIN public.courses c ON c.id = m.course_id
            WHERE m.id = lessons.module_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Enrollments policies
CREATE POLICY "Students can view own enrollments"
    ON public.enrollments FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can enroll in courses"
    ON public.enrollments FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- Submissions policies
CREATE POLICY "Students can view own submissions"
    ON public.submissions FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can create submissions"
    ON public.submissions FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can view course submissions"
    ON public.submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.lessons l ON l.id = a.lesson_id
            JOIN public.modules m ON m.id = l.module_id
            JOIN public.courses c ON c.id = m.course_id
            WHERE a.id = submissions.assignment_id
            AND c.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Instructors can grade submissions"
    ON public.submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.lessons l ON l.id = a.lesson_id
            JOIN public.modules m ON m.id = l.module_id
            JOIN public.courses c ON c.id = m.course_id
            WHERE a.id = submissions.assignment_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Progress policies
CREATE POLICY "Students can manage own progress"
    ON public.lesson_progress FOR ALL
    USING (student_id = auth.uid());

-- Certificates policies
CREATE POLICY "Certificates are viewable by owner"
    ON public.certificates FOR SELECT
    USING (student_id = auth.uid());

-- Discussions policies
CREATE POLICY "Discussions viewable by enrolled students"
    ON public.discussions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons l
            JOIN public.modules m ON m.id = l.module_id
            JOIN public.courses c ON c.id = m.course_id
            WHERE l.id = discussions.lesson_id
            AND (
                c.instructor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.enrollments e
                    WHERE e.course_id = c.id AND e.student_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Enrolled students can create discussions"
    ON public.discussions FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.lessons l
            JOIN public.modules m ON m.id = l.module_id
            JOIN public.courses c ON c.id = m.course_id
            WHERE l.id = discussions.lesson_id
            AND EXISTS (
                SELECT 1 FROM public.enrollments e
                WHERE e.course_id = c.id AND e.student_id = auth.uid()
            )
        )
    );

-- Code snippets policies
CREATE POLICY "Public snippets viewable by everyone"
    ON public.code_snippets FOR SELECT
    USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own snippets"
    ON public.code_snippets FOR ALL
    USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Reviews viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Enrolled students can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (
        student_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE enrollments.course_id = reviews.course_id
            AND enrollments.student_id = auth.uid()
        )
    );

CREATE POLICY "Students can update own reviews"
    ON public.reviews FOR UPDATE
    USING (student_id = auth.uid());

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON public.discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update course total_students count
CREATE OR REPLACE FUNCTION update_course_student_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.courses
    SET total_students = (
        SELECT COUNT(*) FROM public.enrollments
        WHERE course_id = NEW.course_id
    )
    WHERE id = NEW.course_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_count AFTER INSERT ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_student_count();

-- Function to update course rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.courses
    SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews
        WHERE course_id = NEW.course_id
    )
    WHERE id = NEW.course_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_course_rating();
