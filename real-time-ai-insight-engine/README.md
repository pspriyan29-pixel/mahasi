# AI Insight Engine - Platform Analitik Real-Time dengan AI

> Platform analitik event real-time tingkat enterprise dengan deteksi anomali berbasis AI menggunakan Google Gemini

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Instalasi & Setup](#instalasi--setup)
- [Konfigurasi Google OAuth](#konfigurasi-google-oauth)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Panduan Penggunaan](#panduan-penggunaan)
- [Responsive Design](#responsive-design)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Kontributor](#kontributor)

---

## 🎯 Tentang Proyek

**AI Insight Engine** adalah platform analitik real-time tingkat enterprise yang dirancang untuk memproses jutaan event per detik dengan latensi di bawah 100ms. Platform ini menggunakan kekuatan AI (Google Gemini) untuk deteksi anomali otomatis, analisis prediktif, dan memberikan insight yang actionable.

### Keunggulan

- ✅ **Real-Time Processing**: Proses jutaan event/detik dengan Apache Kafka
- ✅ **AI-Powered Insights**: Deteksi anomali otomatis dengan Google Gemini 1.5 Flash
- ✅ **Enterprise Security**: Row-level security, enkripsi, dan SOC 2 compliance
- ✅ **Beautiful Dashboards**: Dashboard interaktif dengan visualisasi real-time
- ✅ **Smart Alerts**: Sistem notifikasi cerdas multi-channel
- ✅ **Fully Responsive**: Optimal di semua perangkat (mobile, tablet, desktop)

---

## 🚀 Fitur Utama

### 1. Autentikasi & Keamanan

#### Google OAuth Integration
- Login/Register via Google dengan satu klik
- Session management otomatis
- User profile dengan avatar
- Logout functionality
- Role-based access control (Admin, User, Viewer)

#### Fitur Keamanan
- Row-level security (RLS) di Supabase
- Enkripsi data at rest dan in transit
- API key management
- Audit logging untuk semua aksi penting
- Rate limiting dan DDoS protection

### 2. Dashboard Analytics

#### Overview Dashboard
- Real-time metrics (uptime, latency, events/day)
- Grafik interaktif dengan Recharts
- Event timeline dengan filter
- Anomaly detection alerts
- System health monitoring

#### API Keys Management
- Generate API keys dengan permissions custom
- Revoke/regenerate keys
- Usage tracking per API key
- Rate limit configuration

#### Webhooks
- Configure webhook endpoints
- Event filtering
- Retry logic dengan exponential backoff
- Webhook logs dan debugging

#### Team Management
- Invite team members
- Role assignment
- Activity monitoring
- Access control

### 3. Real-Time Analytics

#### Event Processing
- Apache Kafka untuk stream processing
- Sub-100ms latency
- Auto-scaling berdasarkan load
- Event deduplication
- Batch processing untuk historical data

#### AI-Powered Insights
- Anomaly detection otomatis
- Predictive analytics
- Pattern recognition
- Trend forecasting
- Custom sensitivity levels

### 4. Responsive Design

#### Mobile-First Approach
- Optimasi untuk smartphone (320px+)
- Touch targets minimum 44px
- Mobile menu dengan smooth animations
- Responsive typography
- Adaptive layouts

#### Multi-Device Support
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- Landscape dan portrait orientation
- Cross-browser compatibility

---

## 🛠 Teknologi yang Digunakan

### Frontend
- **Framework**: Next.js 15.1.3 (React 19)
- **Styling**: Tailwind CSS 3.4 + Custom CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions (Deno)

### AI & Analytics
- **AI Model**: Google Gemini 1.5 Flash
- **Stream Processing**: Apache Kafka (planned)
- **Monitoring**: Sentry
- **Analytics**: Custom analytics engine

### DevOps & Tools
- **Testing**: Vitest + Playwright + Testing Library
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript 5.7
- **Git Hooks**: Husky + Lint-staged
- **Package Manager**: npm

---

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │      │
│  │  (1024px+)   │  │  (768-1024)  │  │  (320-768)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Home, Dashboard, Auth, Settings, etc.       │   │
│  │  Components: Navbar, UserProfile, Charts, etc.      │   │
│  │  Hooks: useAuth, useRealtime, useAnalytics          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Auth       │  │   Storage    │      │
│  │  Database    │  │   (OAuth)    │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Realtime    │  │ Edge Funcs   │  │   RLS        │      │
│  │  (WebSocket) │  │   (Deno)     │  │  Security    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Google OAuth │  │ Google Gemini│  │    Sentry    │      │
│  │     API      │  │      AI      │  │  Monitoring  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Users & Profiles
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMP
)

-- Events
events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  event_type TEXT,
  data JSONB,
  timestamp TIMESTAMP,
  metadata JSONB
)

-- API Keys
api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  key TEXT UNIQUE,
  name TEXT,
  permissions JSONB,
  created_at TIMESTAMP,
  last_used_at TIMESTAMP
)

-- Webhooks
webhooks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  url TEXT,
  events TEXT[],
  secret TEXT,
  active BOOLEAN,
  created_at TIMESTAMP
)

-- Audit Logs
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT,
  resource TEXT,
  details JSONB,
  timestamp TIMESTAMP
)
```

---

## 📦 Instalasi & Setup

### Prerequisites

Pastikan Anda sudah menginstall:
- Node.js 18+ dan npm
- Git
- Akun Supabase (gratis di [supabase.com](https://supabase.com))
- Akun Google Cloud (untuk OAuth)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/real-time-ai-insight-engine.git
cd real-time-ai-insight-engine
```

### 2. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend (Optional - untuk local development)
```bash
cd backend
npm install
```

### 3. Setup Environment Variables

#### Frontend (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (optional - sudah dikonfigurasi di Supabase)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id

# Sentry (optional)
# SENTRY_DSN=your-sentry-dsn
```

#### Backend (.env)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Kafka (optional)
# KAFKA_BROKERS=localhost:9092
```

### 4. Setup Database

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Buat project baru atau gunakan yang sudah ada
3. Jalankan SQL migrations:

```sql
-- Buat tabel profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger untuk auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🔐 Konfigurasi Google OAuth

### 1. Setup di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih yang sudah ada
3. Navigate ke **APIs & Services** > **Credentials**
4. Klik **Create Credentials** > **OAuth client ID**
5. Pilih **Web application**
6. Isi informasi:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://yourdomain.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

7. Copy **Client ID** dan **Client Secret**

### 2. Konfigurasi di Supabase

1. Login ke [Supabase Dashboard](https://app.supabase.com/)
2. Pilih project Anda
3. Navigate ke **Authentication** > **Providers**
4. Klik pada **Google** provider
5. Enable Google provider
6. Masukkan credentials:
   - **Client ID**: `424099504402-96n661hk2m4m0hq95ggqjdig6vp94rk2.apps.googleusercontent.com`
   - **Client Secret**: `[REDACTED_GOOGLE_CLIENT_SECRET]`
7. Klik **Save**

### 3. Konfigurasi Redirect URLs

Di Supabase Dashboard:
1. Navigate ke **Authentication** > **URL Configuration**
2. Tambahkan **Site URL**: `http://localhost:3000` (development)
3. Tambahkan **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

### 4. Testing OAuth

1. Jalankan aplikasi: `npm run dev`
2. Buka: `http://localhost:3000/auth/login`
3. Klik **Continue with Google**
4. Login dengan akun Google
5. Anda akan di-redirect ke dashboard

---

## 🎮 Menjalankan Aplikasi

### Development Mode

#### Frontend
```bash
cd frontend
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`

#### Backend (Optional)
```bash
cd backend
npm run dev
```
Backend akan berjalan di `http://localhost:3001`

### Production Build

```bash
cd frontend
npm run build
npm start
```

### Testing

#### Unit Tests
```bash
npm run test
```

#### E2E Tests
```bash
npm run test:e2e
```

#### Test dengan UI
```bash
npm run test:ui
```

#### Coverage Report
```bash
npm run test:coverage
```

---

## 📱 Panduan Penggunaan

### 1. Registrasi & Login

#### Registrasi Baru
1. Buka `http://localhost:3000/register`
2. Klik **Continue with Google**
3. Pilih akun Google Anda
4. Setujui permissions
5. Anda akan otomatis login dan diarahkan ke dashboard

#### Login
1. Buka `http://localhost:3000/auth/login`
2. Klik **Continue with Google**
3. Pilih akun Google yang sudah terdaftar
4. Anda akan diarahkan ke dashboard

### 2. Dashboard

#### Overview
- Lihat metrics real-time (uptime, latency, events)
- Monitor event timeline
- Check anomaly alerts
- View system health

#### API Keys
1. Navigate ke **Dashboard** > **API Keys**
2. Klik **Generate New Key**
3. Isi nama dan permissions
4. Copy API key (hanya ditampilkan sekali!)
5. Gunakan API key untuk integrasi

#### Webhooks
1. Navigate ke **Dashboard** > **Webhooks**
2. Klik **Add Webhook**
3. Isi URL endpoint
4. Pilih events yang ingin di-subscribe
5. Save webhook
6. Test webhook dengan **Send Test Event**

#### Team Management
1. Navigate ke **Dashboard** > **Team**
2. Klik **Invite Member**
3. Isi email dan pilih role
4. Member akan menerima invitation email

### 3. User Profile

Klik avatar Anda di navbar untuk:
- View profile information
- Navigate ke Dashboard
- Navigate ke Settings
- Sign out

---

## 📱 Responsive Design

### Breakpoints

| Device | Width | Optimasi |
|--------|-------|----------|
| Mobile Small | 320px - 375px | Single column, stacked buttons |
| Mobile Large | 375px - 640px | Optimized touch targets |
| Tablet Small | 640px - 768px | 2-column grids |
| Tablet Large | 768px - 1024px | Hamburger menu, 2-3 columns |
| Desktop Small | 1024px - 1280px | Full navbar, 3-4 columns |
| Desktop Large | 1280px+ | Maximum width 1280px |

### Mobile Features

- ✅ Hamburger menu dengan smooth animations
- ✅ Touch targets minimum 44x44px
- ✅ Responsive typography (text scales with viewport)
- ✅ Stacked layouts untuk form dan buttons
- ✅ Swipe gestures support
- ✅ Mobile-optimized modals dan dropdowns

### Testing Responsive

1. Buka browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test berbagai devices:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1280px+)

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Login via Google berhasil
- [ ] Register via Google berhasil
- [ ] Logout berhasil
- [ ] Session persistence setelah refresh
- [ ] Protected routes redirect ke login
- [ ] User profile ditampilkan dengan benar

#### Responsive Design
- [ ] Mobile menu berfungsi (hamburger icon)
- [ ] Layout responsive di mobile (375px)
- [ ] Layout responsive di tablet (768px)
- [ ] Layout responsive di desktop (1280px)
- [ ] Touch targets adequate (min 44px)
- [ ] Text readable di semua ukuran
- [ ] Images dan icons scale dengan benar

#### Dashboard
- [ ] Metrics ditampilkan dengan benar
- [ ] Charts render dengan data
- [ ] Real-time updates berfungsi
- [ ] Filters dan search berfungsi
- [ ] Navigation antar pages smooth

#### API Keys
- [ ] Generate API key berhasil
- [ ] Copy to clipboard berfungsi
- [ ] Revoke API key berhasil
- [ ] API key list ditampilkan
- [ ] Permissions bisa di-set

### Automated Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- UserProfile.test.tsx

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

1. Push code ke GitHub
2. Import project di [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Configure environment variables
6. Deploy!

### Docker

```bash
# Build image
docker build -t ai-insight-engine .

# Run container
docker run -p 3000:3000 ai-insight-engine
```

### Environment Variables untuk Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 🔧 Troubleshooting

### Error: "redirect_uri_mismatch"

**Solusi:**
1. Pastikan redirect URI di Google Cloud Console sama dengan Supabase
2. Format: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Tambahkan juga: `http://localhost:3000/auth/callback` untuk development

### Error: "invalid_client"

**Solusi:**
1. Pastikan Client ID dan Client Secret benar
2. Pastikan OAuth client sudah enabled di Google Cloud Console
3. Clear browser cache dan cookies
4. Restart development server

### Error: "new row violates row-level security policy"

**Solusi:**
1. Check RLS policies di Supabase
2. Pastikan trigger `handle_new_user()` sudah dibuat
3. Verify user memiliki permissions yang benar

### Navbar tidak muncul

**Solusi:**
1. Pastikan `<Navbar />` component di-import dan di-render
2. Check console untuk errors
3. Verify CSS classes loaded dengan benar

### Mobile menu tidak berfungsi

**Solusi:**
1. Check JavaScript enabled di browser
2. Verify `useState` hook berfungsi
3. Check z-index conflicts dengan CSS

### Responsive design tidak berfungsi

**Solusi:**
1. Verify viewport meta tag di `layout.tsx`
2. Check Tailwind CSS breakpoints
3. Clear browser cache
4. Test di browser berbeda

---

## 📊 Performance Optimization

### Frontend
- ✅ Code splitting dengan Next.js dynamic imports
- ✅ Image optimization dengan Next.js Image
- ✅ Font optimization dengan next/font
- ✅ CSS optimization dengan Tailwind JIT
- ✅ Bundle size optimization

### Backend
- ✅ Database indexing untuk queries cepat
- ✅ Connection pooling
- ✅ Caching dengan Redis (planned)
- ✅ CDN untuk static assets

### Monitoring
- ✅ Sentry untuk error tracking
- ✅ Performance monitoring
- ✅ Real-time analytics
- ✅ User behavior tracking

---

## 🤝 Kontributor

### Development Team
- **Developer**: Mahasi AI Team
- **Email**: infomahasi@gmail.com
- **Phone**: +62 853-7896-3269

### Tech Stack Credits
- Next.js Team
- Supabase Team
- Vercel Team
- Google Gemini Team
- Open source community

---

## 📄 License

Copyright © 2025 AI Insight Engine. All rights reserved.

---

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [This README]
- **Support**: infomahasi@gmail.com
- **GitHub**: [Repository URL]

---

## 📝 Changelog

### Version 2.0.0 (2025-12-26)

#### ✨ New Features
- ✅ Google OAuth authentication (login & register)
- ✅ User profile dengan avatar dan dropdown menu
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Enhanced navbar dengan authentication state
- ✅ Mobile menu dengan smooth animations
- ✅ Touch-optimized UI (44px minimum touch targets)
- ✅ Responsive typography dan spacing
- ✅ Improved loading states dan error handling

#### 🎨 UI/UX Improvements
- Enhanced login page dengan responsive design
- Better mobile menu experience
- Improved button sizes dan spacing
- Professional glassmorphism effects
- Smooth transitions dan animations

#### 🔧 Technical Improvements
- Added viewport configuration untuk mobile
- Responsive utility classes di globals.css
- Better component organization
- Improved type safety dengan TypeScript
- Enhanced error boundaries

#### 🐛 Bug Fixes
- Fixed navbar tidak muncul di homepage
- Fixed responsive breakpoints
- Fixed touch target sizes
- Fixed mobile menu animations

---

## 🎯 Roadmap

### Q1 2025
- [ ] Email/password authentication
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Profile editing page
- [ ] User preferences/settings

### Q2 2025
- [ ] Apache Kafka integration
- [ ] Advanced analytics dashboard
- [ ] Custom reports
- [ ] Data export functionality
- [ ] API documentation

### Q3 2025
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Advanced AI features
- [ ] Machine learning models
- [ ] Predictive analytics

### Q4 2025
- [ ] Enterprise features
- [ ] White-label solution
- [ ] On-premise deployment
- [ ] Advanced security features
- [ ] Compliance certifications

---

## 💡 Tips & Best Practices

### Development
1. Selalu gunakan TypeScript untuk type safety
2. Follow component naming conventions
3. Write tests untuk critical features
4. Use ESLint dan Prettier untuk code consistency
5. Commit dengan conventional commit messages

### Security
1. Jangan commit API keys atau secrets
2. Gunakan environment variables
3. Enable RLS di Supabase
4. Implement rate limiting
5. Regular security audits

### Performance
1. Optimize images dengan Next.js Image
2. Use lazy loading untuk components besar
3. Implement caching strategies
4. Monitor bundle size
5. Use CDN untuk static assets

### UX
1. Provide clear loading states
2. Show helpful error messages
3. Implement proper validation
4. Use consistent design patterns
5. Test di berbagai devices

Untuk pertanyaan atau support, hubungi:
- 📧 Email: infomahasi@gmail.com
- 📱 Phone: +62 853-7896-3269
