# Platform Flow & Relations Documentation

## ✅ All Errors Fixed
- **Build Status**: ✅ SUCCESS (Exit Code: 0)
- **TypeScript Errors**: All resolved
- **Component Relations**: Properly typed and connected

## 🔄 User Flow

### 1. **Landing Page** (`app/page.tsx`)
**Entry Point** → User arrives at homepage
- View hero section with coding camp introduction
- Browse featured courses in CourseShowcase
- See learning path visualization
- Try interactive code playground
- Read success stories from alumni

**Actions Available**:
- Click "Daftar Gratis" → Navigate to `/register`
- Click "Masuk" → Navigate to `/login`
- Click "Lihat Semua Kursus" → Navigate to `/courses`
- Click on a course card → Navigate to `/courses/[id]`

---

### 2. **Authentication Flow**

#### **Registration** (`app/register/page.tsx`)
- **Step 1**: Enter email, password, full name
- **Step 2**: Select role (Student/Instructor)
- **OAuth Options**: Google or GitHub signup
- **On Success**: 
  - Profile created in Supabase
  - Auto-redirect to `/dashboard`
  - AuthContext updated with user data

#### **Login** (`app/login/page.tsx`)
- Enter credentials or use OAuth
- **On Success**: 
  - Session established
  - Redirect to `/dashboard`
  - Profile loaded from Supabase

---

### 3. **Course Discovery** (`app/courses/page.tsx`)
**Browse & Filter**
- Search by keyword (title, description, tags)
- Filter by category (Web, Data, Mobile, AI, Design, Security)
- Filter by level (Beginner, Intermediate, Advanced)
- View course cards with:
  - Thumbnail with gradient
  - Title & description
  - Instructor name
  - Duration, students, rating
  - Tags

**Actions**:
- Click "Lihat Detail" → Navigate to `/courses/[id]`

---

### 4. **Course Detail** (`app/courses/[id]/page.tsx`)
**Comprehensive Course Information**

**Tabs**:
1. **Overview**:
   - Long description
   - Learning outcomes (what you'll learn)
   - Prerequisites
   - FAQs

2. **Syllabus**:
   - All modules with expandable lessons
   - Lesson types (video, assignment, quiz)
   - Duration and points for each lesson
   - Total stats (modules, lessons, hours)

3. **Instructor**:
   - Instructor profile
   - Bio and credentials
   - Rating and student count

4. **Reviews**:
   - Student reviews (coming soon)

**Sidebar**:
- Course thumbnail
- Price (FREE)
- "Mulai Belajar Sekarang" button → Navigate to `/courses/[id]/learn`
- Share button
- Course includes list
- Course stats

---

### 5. **Learning Interface** (`app/courses/[id]/learn/page.tsx`)
**Interactive Learning Experience**

**Layout**:
- **Left Sidebar** (toggleable):
  - Course title
  - Progress bar (% completed)
  - All modules and lessons
  - Visual indicators (completed, current, type)
  - Click lesson to navigate

- **Main Content Area**:
  - **Top Bar**: Module title, lesson title, lesson counter
  - **Content Section**:
    - Video player (for video lessons)
    - Lesson description
    - Assignment requirements (for assignments)
    - Quiz information (for quizzes)
    - Downloadable resources
  - **Bottom Navigation**: Previous/Next buttons
  - **Mark Complete Button**: Tracks progress

**User Actions**:
- Navigate between lessons
- Mark lessons as complete
- Download resources
- Track progress
- Return to course detail page

---

### 6. **Student Dashboard** (`app/dashboard/page.tsx`)
**Personalized Learning Hub**

**Sections**:
1. **Welcome Header**: Personalized greeting
2. **Statistics Grid**:
   - Active courses
   - Study hours
   - Certificates earned
   - Learning streak

3. **Enrolled Courses**:
   - Course cards with progress bars
   - Continue learning buttons

4. **Recent Activity Feed**:
   - Lesson completions
   - Assignment submissions
   - Certificate achievements

5. **Upcoming Deadlines**:
   - Assignment due dates
   - Priority indicators

6. **Weekly Learning Goals**:
   - Progress toward weekly targets

7. **Quick Actions**:
   - Browse courses
   - View certificates
   - Access community

**Actions**:
- Click course → Navigate to `/courses/[id]/learn`
- Browse courses → Navigate to `/courses`

---

## 🔗 Component Relations

### **Data Flow**

```
coursesData.ts (Source of Truth)
    ↓
├── CourseShowcase (Landing) → Display featured courses
├── CoursesPage → List all courses with filters
├── CourseDetailPage → Show full course info
└── LearnPage → Interactive learning interface
```

### **Authentication Flow**

```
AuthContext (Global State)
    ↓
├── Navbar → Display user status, profile
├── Login/Register → Update auth state
├── Dashboard → Access user profile
├── LearnPage → Protect routes, check enrollment
└── Middleware → Route protection
```

### **State Management**

1. **Global State** (AuthContext):
   - `user`: Current user object
   - `profile`: User profile from Supabase
   - `session`: Active session
   - `loading`: Auth loading state

2. **Local State** (Component-specific):
   - Course filters (category, level, search)
   - Expanded modules
   - Active tabs
   - Completed lessons
   - Sidebar visibility

### **Database Relations**

```
Supabase Database
    ↓
profiles (user data)
    ↓
├── enrollments → courses
├── lesson_progress → lessons
├── assignments → submissions
└── certificates → earned certificates
```

---

## 🎯 Key Features

### **1. Progressive Disclosure**
- Landing → Courses → Detail → Learn
- Each step reveals more information
- Clear CTAs guide user journey

### **2. Consistent Navigation**
- Navbar always accessible
- Breadcrumbs show current location
- Back buttons for easy navigation

### **3. Visual Feedback**
- Loading states during auth
- Progress bars show completion
- Icons indicate lesson types
- Badges show achievements

### **4. Responsive Design**
- Mobile-first approach
- Collapsible sidebars
- Adaptive layouts
- Touch-friendly interactions

### **5. Performance Optimization**
- Static generation for course pages
- Client-side filtering
- Lazy loading for heavy content
- Optimized images and gradients

---

## 🚀 Next Steps for Users

1. **First Time Users**:
   - Land on homepage
   - Browse courses
   - Register account
   - Enroll in course
   - Start learning

2. **Returning Users**:
   - Login
   - Go to dashboard
   - Continue where left off
   - Track progress
   - Complete courses

3. **Instructors** (Future):
   - Create courses
   - Manage content
   - View analytics
   - Interact with students

---

## 📊 Data Consistency

All course data flows from `coursesData.ts`:
- **Single source of truth**
- **Type-safe** with TypeScript
- **Comprehensive** lesson details
- **Flexible** structure for different lesson types
- **Scalable** for adding more courses

---

## ✨ Premium Features Implemented

1. **Glassmorphism UI** throughout
2. **Smooth animations** and transitions
3. **Interactive elements** with hover effects
4. **Progress tracking** with visual indicators
5. **Responsive design** for all devices
6. **Premium gradients** and color schemes
7. **Micro-interactions** for better UX
8. **Loading states** for better feedback
