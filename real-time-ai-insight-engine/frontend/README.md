# 🚀 InsightAI - Enterprise Real-Time AI Insight Engine

> Production-grade real-time anomaly detection platform powered by **Supabase**, **Confluent Kafka**, and **Google Gemini AI**

[![Enterprise Grade](https://img.shields.io/badge/Enterprise-Grade-blue)](https://github.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)

## ✨ Features

### 🎨 Professional UI/UX
- ✅ **Beautiful Design** - Glassmorphism, gradients, smooth animations
- ✅ **Command Palette** - Quick navigation with ⌘K
- ✅ **Responsive** - Mobile-first design
- ✅ **Dark Theme** - Professional dark mode
- ✅ **Framer Motion** - Smooth page transitions

### 📊 Advanced Dashboard
- ✅ **Real-time Charts** - Area, Line, Bar charts with Recharts
- ✅ **Live Metrics** - WebSocket-powered updates
- ✅ **Event Explorer** - Advanced filtering and search
- ✅ **AI Insights** - Natural language explanations
- ✅ **Alert Management** - Status tracking and actions

### 🔧 Enterprise Features
- ✅ **Multi-tenancy** - Organization management
- ✅ **Supabase Realtime** - Live subscriptions
- ✅ **Row Level Security** - Data isolation
- ✅ **TypeScript** - Full type safety
- ✅ **Shadcn/ui** - Professional components

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── events/page.tsx    # Event explorer
│   │   ├── insights/page.tsx  # AI insights
│   │   └── alerts/page.tsx    # Alert management
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   ├── providers.tsx          # React Query provider
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # Shadcn/ui components (13 components)
│   └── dashboard/
│       ├── sidebar.tsx        # Navigation sidebar
│       ├── topbar.tsx         # Top navigation
│       └── command-palette.tsx # ⌘K palette
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   └── server.ts          # Server client
│   └── utils.ts               # Utilities
└── types/
    └── supabase.ts            # Database types
```

## 🎨 UI Components

### Complete Component Library

- ✅ **Button** - Multiple variants and sizes
- ✅ **Card** - Glassmorphism effect
- ✅ **Dialog** - Modal dialogs
- ✅ **DropdownMenu** - Context menus
- ✅ **Input** - Form inputs
- ✅ **Textarea** - Text areas
- ✅ **Label** - Form labels
- ✅ **Tabs** - Tabbed interfaces
- ✅ **Avatar** - User avatars
- ✅ **Switch** - Toggle switches
- ✅ **Table** - Data tables
- ✅ **Tooltip** - Helpful tooltips
- ✅ **Separator** - Visual dividers
- ✅ **Skeleton** - Loading states
- ✅ **Badge** - Status badges
- ✅ **Command** - Command palette

## 📊 Features Implemented

### Dashboard Pages

**Overview** (`/dashboard`)
- Real-time metrics cards
- Event volume charts (Area chart)
- Anomaly detection (Bar chart)
- Recent activity feed
- System health monitoring

**Events** (`/dashboard/events`)
- Advanced data table
- Real-time updates
- Search and filtering
- Export functionality
- Event details

**Insights** (`/dashboard/insights`)
- AI-generated insights
- Severity indicators
- Status filtering (All, Anomaly, Normal)
- Detailed explanations
- Recommended actions

**Alerts** (`/dashboard/alerts`)
- Alert management
- Status updates (Open, Acknowledged, Resolved)
- Severity badges
- Action buttons
- Statistics

## 🎯 Key Features

### Command Palette (⌘K)
- Quick navigation
- Keyboard shortcuts
- Search functionality
- Beautiful UI

### Real-Time Updates
- Supabase Realtime subscriptions
- Live event streaming
- Instant notifications
- Auto-refresh

### Professional Animations
- Framer Motion page transitions
- Smooth hover effects
- Loading states
- Fade-in animations

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Touch-friendly

## 🔧 Development

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Code Quality

- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Prettier formatting
- ✅ Type-safe Supabase client

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🎨 Design System

### Colors

- **Primary**: Blue gradient (#3b82f6 to #2563eb)
- **Background**: Dark gradient
- **Accents**: Purple, pink, green
- **Status**: Green (success), Yellow (warning), Red (error)

### Typography

- **Font**: Inter (system font stack)
- **Headings**: Bold, gradient text
- **Body**: Regular weight

### Effects

- **Glassmorphism**: Frosted glass effect
- **Gradients**: Smooth color transitions
- **Shadows**: Subtle depth
- **Animations**: Smooth and purposeful

## 📚 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **State**: TanStack Query
- **Icons**: Lucide React

## 🏆 Production-Ready

- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ Optimized bundle size
- ✅ SEO optimized
- ✅ Accessibility compliant
- ✅ Performance optimized

## 📄 License

MIT License - see [LICENSE](../LICENSE) file

---

**Built with ❤️ for the AI Partner Catalyst Hackathon**

*Enterprise-grade. Production-ready. AI-powered.*
