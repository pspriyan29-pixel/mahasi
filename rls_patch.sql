-- ============================================================
-- PATCH: Tambah RLS policies yang hilang agar createOrder bisa berjalan
-- Jalankan skrip ini di SQL Editor Supabase Anda.
-- ============================================================

-- ─── ORDER FILES ──────────────────────────────────────────
-- User bisa melihat file dari order miliknya
drop policy if exists "Allow users to see own order files" on public.order_files;
create policy "Allow users to see own order files" on public.order_files
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_files.order_id
      and orders.user_id = auth.uid()
    )
  );

-- User bisa upload file ke order miliknya
drop policy if exists "Allow users to insert own order files" on public.order_files;
create policy "Allow users to insert own order files" on public.order_files
  for insert with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from public.orders
      where orders.id = order_files.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Admin full control pada order_files
drop policy if exists "Allow admin full control on order_files" on public.order_files;
create policy "Allow admin full control on order_files" on public.order_files
  using (public.is_admin()) with check (public.is_admin());

-- ─── PAYMENTS ──────────────────────────────────────────────
-- User bisa melihat payment dari order miliknya
drop policy if exists "Allow users to see own payments" on public.payments;
create policy "Allow users to see own payments" on public.payments
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
      and orders.user_id = auth.uid()
    )
  );

-- User bisa update payment miliknya (upload bukti)
drop policy if exists "Allow users to update own payments" on public.payments;
create policy "Allow users to update own payments" on public.payments
  for update using (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Admin full control pada payments
drop policy if exists "Allow admin full control on payments" on public.payments;
create policy "Allow admin full control on payments" on public.payments
  using (public.is_admin()) with check (public.is_admin());

-- System (service_role) bisa insert payments (via webhook)
drop policy if exists "Allow insert payments" on public.payments;
create policy "Allow insert payments" on public.payments
  for insert with check (true);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
-- User hanya melihat notifikasi miliknya
drop policy if exists "Allow users to see own notifications" on public.notifications;
create policy "Allow users to see own notifications" on public.notifications
  for select using (auth.uid() = user_id);

-- User bisa update (mark as read) notifikasinya
drop policy if exists "Allow users to update own notifications" on public.notifications;
create policy "Allow users to update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Siapapun (authenticated) bisa insert notifikasi (diperlukan untuk user → admin notification)
drop policy if exists "Allow authenticated insert notifications" on public.notifications;
create policy "Allow authenticated insert notifications" on public.notifications
  for insert with check (auth.role() = 'authenticated');

-- Admin full control
drop policy if exists "Allow admin full control on notifications" on public.notifications;
create policy "Allow admin full control on notifications" on public.notifications
  using (public.is_admin()) with check (public.is_admin());

-- ─── REVISIONS ──────────────────────────────────────────────
-- User bisa melihat revisi dari order miliknya
drop policy if exists "Allow users to see own revisions" on public.revisions;
create policy "Allow users to see own revisions" on public.revisions
  for select using (auth.uid() = user_id);

-- User bisa insert revisi untuk order miliknya
drop policy if exists "Allow users to insert revisions" on public.revisions;
create policy "Allow users to insert revisions" on public.revisions
  for insert with check (auth.uid() = user_id);

-- Admin full control pada revisions
drop policy if exists "Allow admin full control on revisions" on public.revisions;
create policy "Allow admin full control on revisions" on public.revisions
  using (public.is_admin()) with check (public.is_admin());

-- ─── SETTINGS ──────────────────────────────────────────────
-- Semua user bisa membaca settings
drop policy if exists "Allow public read on settings" on public.settings;
create policy "Allow public read on settings" on public.settings
  for select using (true);

-- Admin bisa update settings
drop policy if exists "Allow admin to update settings" on public.settings;
create policy "Allow admin to update settings" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── PROFILES ─────────────────────────────────────────────
-- User bisa insert profile sendiri (untuk user baru via OTP)
drop policy if exists "Allow users to insert own profile" on public.profiles;
create policy "Allow users to insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- ─── FORUM ────────────────────────────────────────────────
-- User bisa insert forum thread
drop policy if exists "Allow authenticated to insert forum threads" on public.forum_threads;
create policy "Allow authenticated to insert forum threads" on public.forum_threads
  for insert with check (auth.uid() = user_id);

-- User bisa membaca semua forum threads
drop policy if exists "Allow public read on forum threads" on public.forum_threads;
create policy "Allow public read on forum threads" on public.forum_threads
  for select using (true);

-- User bisa insert forum comments
drop policy if exists "Allow authenticated to insert forum comments" on public.forum_comments;
create policy "Allow authenticated to insert forum comments" on public.forum_comments
  for insert with check (auth.uid() = user_id);

-- User bisa membaca semua forum comments  
drop policy if exists "Allow public read on forum comments" on public.forum_comments;
create policy "Allow public read on forum comments" on public.forum_comments
  for select using (true);
