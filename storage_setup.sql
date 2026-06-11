-- ============================================================
-- STORAGE SETUP: Buat bucket order-files + Storage Policies
-- Jalankan skrip ini di SQL Editor Supabase Anda.
-- ============================================================

-- 1. Buat bucket order-files (public agar file bisa diakses via publicUrl)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-files',
  'order-files',
  true,
  52428800,  -- 50 MB limit
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800;

-- 2. Storage Policy: User authenticated bisa upload ke bucket order-files
drop policy if exists "Allow authenticated uploads" on storage.objects;
create policy "Allow authenticated uploads"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'order-files');

-- 3. Storage Policy: Semua orang bisa baca/download file (karena bucket public)
drop policy if exists "Allow public read" on storage.objects;
create policy "Allow public read"
  on storage.objects for select
  to public
  using (bucket_id = 'order-files');

-- 4. Storage Policy: User bisa hapus file miliknya sendiri
drop policy if exists "Allow owner to delete own files" on storage.objects;
create policy "Allow owner to delete own files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'order-files' and auth.uid() = owner);

-- 5. Storage Policy: Admin full control
drop policy if exists "Allow admin full control on storage" on storage.objects;
create policy "Allow admin full control on storage"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'order-files'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    bucket_id = 'order-files'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
