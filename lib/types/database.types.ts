export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole = 'student' | 'instructor' | 'admin';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type SubmissionStatus = 'pending' | 'submitted' | 'graded';

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    role: UserRole
                    bio: string | null
                    github_url: string | null
                    linkedin_url: string | null
                    portfolio_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: UserRole
                    bio?: string | null
                    github_url?: string | null
                    linkedin_url?: string | null
                    portfolio_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: UserRole
                    bio?: string | null
                    github_url?: string | null
                    linkedin_url?: string | null
                    portfolio_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            courses: {
                Row: {
                    id: string
                    instructor_id: string
                    title: string
                    slug: string
                    description: string | null
                    thumbnail_url: string | null
                    level: CourseLevel
                    status: CourseStatus
                    category: string | null
                    tags: string[] | null
                    price: number
                    duration_hours: number | null
                    total_lessons: number
                    total_students: number
                    rating: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    instructor_id: string
                    title: string
                    slug: string
                    description?: string | null
                    thumbnail_url?: string | null
                    level?: CourseLevel
                    status?: CourseStatus
                    category?: string | null
                    tags?: string[] | null
                    price?: number
                    duration_hours?: number | null
                    total_lessons?: number
                    total_students?: number
                    rating?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    instructor_id?: string
                    title?: string
                    slug?: string
                    description?: string | null
                    thumbnail_url?: string | null
                    level?: CourseLevel
                    status?: CourseStatus
                    category?: string | null
                    tags?: string[] | null
                    price?: number
                    duration_hours?: number | null
                    total_lessons?: number
                    total_students?: number
                    rating?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            modules: {
                Row: {
                    id: string
                    course_id: string
                    title: string
                    description: string | null
                    order_index: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    course_id: string
                    title: string
                    description?: string | null
                    order_index: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    course_id?: string
                    title?: string
                    description?: string | null
                    order_index?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            lessons: {
                Row: {
                    id: string
                    module_id: string
                    title: string
                    content: string | null
                    video_url: string | null
                    duration_minutes: number | null
                    order_index: number
                    is_free: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    module_id: string
                    title: string
                    content?: string | null
                    video_url?: string | null
                    duration_minutes?: number | null
                    order_index: number
                    is_free?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    module_id?: string
                    title?: string
                    content?: string | null
                    video_url?: string | null
                    duration_minutes?: number | null
                    order_index?: number
                    is_free?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            assignments: {
                Row: {
                    id: string
                    lesson_id: string
                    title: string
                    description: string | null
                    instructions: string | null
                    starter_code: string | null
                    solution_code: string | null
                    test_cases: Json | null
                    max_score: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    lesson_id: string
                    title: string
                    description?: string | null
                    instructions?: string | null
                    starter_code?: string | null
                    solution_code?: string | null
                    test_cases?: Json | null
                    max_score?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    lesson_id?: string
                    title?: string
                    description?: string | null
                    instructions?: string | null
                    starter_code?: string | null
                    solution_code?: string | null
                    test_cases?: Json | null
                    max_score?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            enrollments: {
                Row: {
                    id: string
                    student_id: string
                    course_id: string
                    enrolled_at: string
                    completed_at: string | null
                    progress_percentage: number
                    last_accessed_at: string | null
                }
                Insert: {
                    id?: string
                    student_id: string
                    course_id: string
                    enrolled_at?: string
                    completed_at?: string | null
                    progress_percentage?: number
                    last_accessed_at?: string | null
                }
                Update: {
                    id?: string
                    student_id?: string
                    course_id?: string
                    enrolled_at?: string
                    completed_at?: string | null
                    progress_percentage?: number
                    last_accessed_at?: string | null
                }
            }
            submissions: {
                Row: {
                    id: string
                    student_id: string
                    assignment_id: string
                    code: string | null
                    status: SubmissionStatus
                    score: number | null
                    feedback: string | null
                    submitted_at: string
                    graded_at: string | null
                    graded_by: string | null
                }
                Insert: {
                    id?: string
                    student_id: string
                    assignment_id: string
                    code?: string | null
                    status?: SubmissionStatus
                    score?: number | null
                    feedback?: string | null
                    submitted_at?: string
                    graded_at?: string | null
                    graded_by?: string | null
                }
                Update: {
                    id?: string
                    student_id?: string
                    assignment_id?: string
                    code?: string | null
                    status?: SubmissionStatus
                    score?: number | null
                    feedback?: string | null
                    submitted_at?: string
                    graded_at?: string | null
                    graded_by?: string | null
                }
            }
            lesson_progress: {
                Row: {
                    id: string
                    student_id: string
                    lesson_id: string
                    completed: boolean
                    completed_at: string | null
                    time_spent_minutes: number
                }
                Insert: {
                    id?: string
                    student_id: string
                    lesson_id: string
                    completed?: boolean
                    completed_at?: string | null
                    time_spent_minutes?: number
                }
                Update: {
                    id?: string
                    student_id?: string
                    lesson_id?: string
                    completed?: boolean
                    completed_at?: string | null
                    time_spent_minutes?: number
                }
            }
            certificates: {
                Row: {
                    id: string
                    student_id: string
                    course_id: string
                    certificate_url: string | null
                    issued_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    course_id: string
                    certificate_url?: string | null
                    issued_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    course_id?: string
                    certificate_url?: string | null
                    issued_at?: string
                }
            }
            discussions: {
                Row: {
                    id: string
                    lesson_id: string
                    user_id: string
                    parent_id: string | null
                    content: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    lesson_id: string
                    user_id: string
                    parent_id?: string | null
                    content: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    lesson_id?: string
                    user_id?: string
                    parent_id?: string | null
                    content?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            code_snippets: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    code: string
                    language: string | null
                    is_public: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    code: string
                    language?: string | null
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    code?: string
                    language?: string | null
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    student_id: string
                    course_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    course_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    course_id?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            competitions: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    category: string | null
                    start_date: string | null
                    end_date: string | null
                    registration_deadline: string | null
                    max_participants: number | null
                    current_participants: number
                    status: string
                    requirements: string | null
                    prizes: string | null
                    banner_url: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    category?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    registration_deadline?: string | null
                    max_participants?: number | null
                    current_participants?: number
                    status?: string
                    requirements?: string | null
                    prizes?: string | null
                    banner_url?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    category?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    registration_deadline?: string | null
                    max_participants?: number | null
                    current_participants?: number
                    status?: string
                    requirements?: string | null
                    prizes?: string | null
                    banner_url?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            competition_registrations: {
                Row: {
                    id: string
                    competition_id: string | null
                    student_name: string
                    nim: string
                    email: string | null
                    phone: string | null
                    university: string | null
                    ktm_url: string | null
                    status: string
                    registered_at: string
                    approved_at: string | null
                    approved_by: string | null
                    rejection_reason: string | null
                }
                Insert: {
                    id?: string
                    competition_id?: string | null
                    student_name: string
                    nim: string
                    email?: string | null
                    phone?: string | null
                    university?: string | null
                    ktm_url?: string | null
                    status?: string
                    registered_at?: string
                    approved_at?: string | null
                    approved_by?: string | null
                    rejection_reason?: string | null
                }
                Update: {
                    id?: string
                    competition_id?: string | null
                    student_name?: string
                    nim?: string
                    email?: string | null
                    phone?: string | null
                    university?: string | null
                    ktm_url?: string | null
                    status?: string
                    registered_at?: string
                    approved_at?: string | null
                    approved_by?: string | null
                    rejection_reason?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: UserRole
            course_level: CourseLevel
            course_status: CourseStatus
            submission_status: SubmissionStatus
        }
    }
}
