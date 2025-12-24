# CodeCamp - Platform Belajar Coding 🚀

Platform belajar coding full-stack dengan Supabase backend, dirancang untuk membantu mahasiswa Indonesia menguasai skill programming dari nol hingga mahir.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)

## ✨ Fitur Utama

### 🎓 Untuk Students
- **Course Catalog**: Browse dan enroll ke berbagai kursus coding
- **Interactive Learning**: Belajar dengan code playground langsung di browser
- **Progress Tracking**: Track kemajuan belajar secara real-time
- **Assignment Submission**: Submit dan dapatkan feedback untuk assignments
- **Certificates**: Dapatkan sertifikat setelah menyelesaikan course
- **Discussion Forum**: Diskusi dengan sesama students dan instructors

### 👨‍🏫 Untuk Instructors
- **Course Management**: Create dan manage courses dengan mudah
- **Content Creation**: Upload video, materi, dan assignments
- **Student Monitoring**: Track progress students
- **Grading System**: Review dan grade student submissions
- **Analytics Dashboard**: Lihat engagement dan performance metrics

### 👨‍💼 Untuk Admins
- **Platform Management**: Kelola users, courses, dan content
- **Analytics & Reporting**: Comprehensive platform statistics
- **User Management**: Manage roles dan permissions
- **Content Moderation**: Approve dan moderate courses

### 🎨 Design Premium
- **Glassmorphism**: Modern glass-morphic UI design
- **Gradient Animations**: Smooth animated gradients
- **Dark Theme**: Premium dark theme dengan neon accents
- **Responsive**: Mobile, tablet, dan desktop friendly
- **Interactive Elements**: Hover effects dan micro-animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn
- Supabase account (gratis di [supabase.com](https://supabase.com))

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd web-ristekk
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase**
   - Buat project baru di [supabase.com](https://supabase.com)
   - Copy project URL dan anon key
   - Jalankan SQL migrations di Supabase SQL Editor:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_storage_buckets.sql`

4. **Configure environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` dan isi dengan credentials Supabase kamu:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Run development server**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Project

```
web-ristekk/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles & utilities
│   ├── layout.tsx               # Root layout dengan AuthProvider
│   ├── page.tsx                 # Landing page
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── dashboard/               # Student dashboard
│   ├── instructor/              # Instructor dashboard
│   ├── admin/                   # Admin dashboard
│   ├── courses/                 # Course pages
│   └── auth/callback/           # OAuth callback
├── components/                   # Reusable components
│   ├── Navbar.tsx
│   ├── Hero3D.tsx
│   ├── CourseShowcase.tsx
│   ├── LearningPath.tsx
│   ├── CodePlayground.tsx
│   ├── WinnersShowcase.tsx
│   └── Footer.tsx
├── contexts/                     # React contexts
│   └── AuthContext.tsx          # Authentication context
├── lib/                         # Utilities & helpers
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase
│   │   └── server.ts           # Server-side Supabase
│   └── types/
│       └── database.types.ts    # TypeScript types
├── supabase/                    # Supabase configuration
│   └── migrations/              # Database migrations
├── middleware.ts                # Auth middleware
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🗄️ Database Schema

Platform menggunakan Supabase PostgreSQL dengan schema berikut:

- **profiles** - User profiles dengan role (student, instructor, admin)
- **courses** - Course information dan metadata
- **modules** - Course modules/sections
- **lessons** - Individual lessons dengan content
- **assignments** - Coding assignments
- **submissions** - Student submissions
- **enrollments** - Student course enrollments
- **lesson_progress** - Learning progress tracking
- **certificates** - Course completion certificates
- **discussions** - Discussion forums
- **code_snippets** - Saved code snippets
- **reviews** - Course reviews dan ratings

Semua tables dilengkapi dengan **Row Level Security (RLS)** policies untuk keamanan data.

## 🔐 Authentication

Platform menggunakan Supabase Auth dengan fitur:
- Email/Password authentication
- OAuth providers (Google, GitHub)
- Role-based access control
- Protected routes dengan middleware
- Session management

## 🎨 Tech Stack

- **Framework**: Next.js 15 dengan App Router
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3.4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Code Editor**: Monaco Editor
- **State Management**: Zustand
- **Charts**: Recharts

## 📱 Pages

### Public Pages
- `/` - Landing page dengan hero, courses, learning path
- `/login` - Login dengan email/password atau OAuth
- `/register` - Registration dengan role selection
- `/courses` - Course catalog dengan search & filter
- `/courses/[id]` - Individual course details

### Student Pages
- `/dashboard` - Student dashboard dengan enrolled courses
- `/courses/[id]/learn` - Course learning interface
- `/dashboard/assignments` - Assignment tracking
- `/dashboard/certificates` - Earned certificates

### Instructor Pages
- `/instructor` - Instructor dashboard
- `/instructor/courses` - Manage courses
- `/instructor/courses/create` - Create new course
- `/instructor/submissions` - Review submissions

### Admin Pages
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/courses` - Course moderation

## 🛠️ Development

### Build for Production
```bash
npm run build
npm run start
```

### Lint
```bash
npm run lint
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push code ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables untuk Production
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📝 Supabase Setup Guide

### 1. Create Supabase Project
- Daftar di [supabase.com](https://supabase.com)
- Create new project
- Tunggu setup selesai (~2 menit)

### 2. Run Migrations
- Buka SQL Editor di Supabase Dashboard
- Copy paste isi file `supabase/migrations/001_initial_schema.sql`
- Run query
- Ulangi untuk `002_storage_buckets.sql`

### 3. Configure Authentication
- Buka Authentication > Providers
- Enable Email provider
- (Optional) Enable Google OAuth:
  - Add Google OAuth credentials
  - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`
- (Optional) Enable GitHub OAuth

### 4. Get API Keys
- Buka Settings > API
- Copy `Project URL` dan `anon public` key
- Paste ke `.env.local`

## 🎯 Roadmap

- [ ] Real-time code collaboration
- [ ] Video streaming untuk lessons
- [ ] Mobile app (React Native)
- [ ] AI-powered code review
- [ ] Gamification & badges
- [ ] Payment integration
- [ ] Certificate verification system
- [ ] Advanced analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

CodeCamp - Built with ❤️ using Next.js & Supabase

## 🙏 Acknowledgments

- Next.js Team untuk amazing framework
- Supabase Team untuk powerful backend platform
- Tailwind CSS untuk utility-first CSS
- Lucide untuk beautiful icons
- Vercel untuk hosting platform

---

**Happy Coding! 🚀**
#   m a h a s i  
 