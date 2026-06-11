-- Eksekusi skrip ini di SQL Editor Supabase Anda untuk menambahkan tabel courses

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text not null,
  mode text not null check (mode in ('online', 'offline', 'hybrid')),
  price integer not null default 0,
  thumbnail_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;

-- RLS Courses: Semua orang bisa melihat kursus aktif
create policy "Public can view active courses"
  on public.courses for select
  using (is_active = true);

create policy "Admin can view all courses"
  on public.courses for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admin can manage courses"
  on public.courses for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Insert dummy data (Opsional)
insert into public.courses (title, slug, description, mode, price, thumbnail_url, is_active)
values 
('Bootcamp Fullstack Web Developer', 'bootcamp-fullstack', 'Belajar dari nol hingga mahir membuat website fullstack dengan React dan Node.js', 'online', 250000, null, true),
('Kelas Offline UI/UX Design', 'kelas-offline-ui-ux', 'Belajar UI/UX Design intensif tatap muka selama 2 hari', 'offline', 500000, null, true)
on conflict (slug) do nothing;
