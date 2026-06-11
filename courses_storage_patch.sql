-- Eksekusi skrip ini di SQL Editor Supabase Anda untuk menambahkan bucket course-thumbnails

-- ─── BUCKET: course-thumbnails ──────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-thumbnails',
  'course-thumbnails',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set public = true, file_size_limit = 5242880;

drop policy if exists "Allow authenticated course thumbnail uploads" on storage.objects;
create policy "Allow authenticated course thumbnail uploads"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-thumbnails'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Allow authenticated course thumbnail updates" on storage.objects;
create policy "Allow authenticated course thumbnail updates"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'course-thumbnails'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Allow public course thumbnail read" on storage.objects;
create policy "Allow public course thumbnail read"
  on storage.objects for select
  to public
  using (bucket_id = 'course-thumbnails');

drop policy if exists "Allow owner to delete course thumbnail" on storage.objects;
create policy "Allow owner to delete course thumbnail"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'course-thumbnails'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
