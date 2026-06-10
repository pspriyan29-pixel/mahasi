-- Schema Database FlashWork
-- Jalankan skrip ini di SQL Editor Supabase Anda.

-- 1. Tabel Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin', 'partner')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 2. Tabel Services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null,
  description text,
  base_price integer not null default 0,
  min_price integer,
  max_price integer,
  estimated_time text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.services enable row level security;

-- 3. Tabel Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  title text not null,
  description text not null,
  deadline timestamptz,
  difficulty text default 'normal' check (difficulty in ('easy', 'normal', 'hard', 'complex')),
  priority text default 'normal' check (priority in ('normal', 'cepat', 'express', 'super_urgent')),
  estimated_price integer,
  final_price integer,
  status text not null default 'pending_review' check (status in (
    'draft', 'pending_review', 'need_detail', 'rejected', 'approved', 
    'waiting_payment', 'payment_review', 'queued', 'in_progress', 
    'delivered', 'revision_requested', 'revision_in_progress', 'completed', 'cancelled'
  )),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  revision_limit integer default 3,
  revision_used integer default 0,
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

-- 4. Tabel Order Files
create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  file_name text not null,
  file_url text not null,
  file_size integer,
  file_type text,
  file_category text not null check (file_category in ('user_attachment', 'admin_preview', 'admin_final', 'revision_attachment')),
  created_at timestamptz default now()
);

alter table public.order_files enable row level security;

-- 5. Tabel Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount integer not null,
  method text default 'qris_manual' check (method in ('bank_transfer', 'qris_manual', 'qris_gateway')),
  status text not null default 'unpaid' check (status in ('unpaid', 'pending_verification', 'paid', 'rejected', 'expired', 'refunded')),
  proof_url text,
  gateway_reference text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

-- 6. Tabel Revisions
create table if not exists public.revisions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  revision_number integer not null,
  note text not null,
  attachment_url text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved', 'rejected')),
  admin_response text,
  created_at timestamptz default now()
);

alter table public.revisions enable row level security;

-- 7. Tabel Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general',
  is_read boolean default false,
  link_url text,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

-- 8. Tabel Forum Threads
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null check (category in ('Tanya Coding', 'Tanya Laporan', 'Tanya PPT', 'Request Bantuan', 'Tips FlashWork', 'Testimoni', 'Promo')),
  status text not null default 'open' check (status in ('open', 'solved', 'locked')),
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.forum_threads enable row level security;

-- 9. Tabel Forum Comments
create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.forum_comments enable row level security;

-- 10. Tabel Activity Logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

alter table public.activity_logs enable row level security;

-- 11. Tabel Settings
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;

-- 12. Tabel Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

--------------------------------------------------------------------------------
-- 13. Kebijakan Row Level Security (RLS) - Contoh Dasar

-- Profiles RLS
drop policy if exists "Allow public read on profiles" on public.profiles;
create policy "Allow public read on profiles" on public.profiles
  for select using (true);

drop policy if exists "Allow users to update own profile" on public.profiles;
create policy "Allow users to update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Services RLS (Siapapun bisa melihat, hanya admin yang bisa edit)
drop policy if exists "Allow public read on services" on public.services;
create policy "Allow public read on services" on public.services
  for select using (true);

-- Orders RLS (User hanya melihat miliknya, Admin melihat semua)
drop policy if exists "Allow users to see own orders" on public.orders;
create policy "Allow users to see own orders" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "Allow users to create orders" on public.orders;
create policy "Allow users to create orders" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "Allow users to update own draft/pending orders" on public.orders;
create policy "Allow users to update own draft/pending orders" on public.orders
  for update using (auth.uid() = user_id);

-- Kebijakan Admin untuk semua tabel (diasumsikan role profiles.role = 'admin')
-- Catatan: Supabase policies biasanya membutuhkan pengecekan role secara rekursif atau menggunakan jwt metadata.
-- Di bawah ini adalah pendekatan sederhana menggunakan helper function.

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Tambah kebijakan admin untuk orders
drop policy if exists "Allow admin full control on orders" on public.orders;
create policy "Allow admin full control on orders" on public.orders
  using (public.is_admin()) with check (public.is_admin());

-- Tambah kebijakan admin untuk services
drop policy if exists "Allow admin full control on services" on public.services;
create policy "Allow admin full control on services" on public.services
  using (public.is_admin()) with check (public.is_admin());

--------------------------------------------------------------------------------
-- 14. Trigger untuk mengupdate `updated_at` otomatis
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_profiles_updated_at on public.profiles;
create trigger tr_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_orders_updated_at on public.orders;
create trigger tr_orders_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_forum_threads_updated_at on public.forum_threads;
create trigger tr_forum_threads_updated_at before update on public.forum_threads
  for each row execute function public.handle_updated_at();

--------------------------------------------------------------------------------
-- 15. Trigger otomatis ketika user baru mendaftar di auth.users untuk disinkronkan ke public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role text := 'user';
begin
  -- Jadikan perdhanariyan@gmail.com sebagai admin, sisanya user biasa
  if new.email = 'perdhanariyan@gmail.com' then
    default_role := 'admin';
  end if;

  insert into public.profiles (id, full_name, phone, role, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'phone',
    default_role,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

--------------------------------------------------------------------------------
-- 16. Inisialisasi Data Layanan Default
insert into public.services (name, slug, category, description, base_price, min_price, max_price, estimated_time)
values 
('Laporan & Makalah', 'laporan-makalah', 'document', 'Bantu struktur, penyusunan, perapian, dan revisi dokumen akademik agar lebih rapi dan mudah dipahami.', 20000, 20000, 100000, '1-3 Hari'),
('PPT Presentasi', 'ppt-presentasi', 'document', 'Buat slide presentasi yang lebih modern, ringkas, dan siap dipakai untuk kelas atau seminar.', 20000, 20000, 150000, '1-2 Hari'),
('Coding & Website', 'coding-website', 'tech', 'Bantu debugging, CRUD, database, dashboard, UI, deploy, dan project custom sesuai kebutuhan.', 50000, 50000, 1000000, '2-7 Hari'),
('Custom Digital Request', 'custom-request', 'custom', 'Punya kebutuhan khusus? Ceritakan detailnya, admin akan review dan beri estimasi terbaik.', 30000, 30000, null, 'Sesuai Brief')
on conflict (slug) do nothing;

insert into public.settings (key, value)
values 
('max_active_orders', '1'),
('admin_whatsapp_number', '6281234567890'),
('mode_sibuk', 'false')
on conflict (key) do nothing;
