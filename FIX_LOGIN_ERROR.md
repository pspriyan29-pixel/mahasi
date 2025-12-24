# 🚨 FIX: Invalid Login Credentials

## Masalah
Error "Invalid login credentials" karena **user belum dibuat** di Supabase Authentication.

---

## ✅ SOLUSI (3 Langkah Mudah)

### Langkah 1: Buka Supabase Dashboard

1. Buka browser, go to: **https://supabase.com**
2. Login ke akun Supabase Anda
3. Pilih project Anda

### Langkah 2: Create User di Authentication

1. Di sidebar kiri, klik **"Authentication"**
2. Klik tab **"Users"**
3. Klik tombol **"Add User"** (hijau, pojok kanan atas)
4. Fill form:
   ```
   Email Address: perdhanariyan@gmail.com
   Password: Riyanganteng01
   ```
5. ✅ **PENTING**: Centang **"Auto Confirm User"**
   - Ini agar user langsung bisa login tanpa verifikasi email
6. Klik **"Create User"**
7. User akan muncul di list dengan status **"Confirmed"**

### Langkah 3: Set Role ke Instructor

1. Di Supabase Dashboard, klik **"SQL Editor"** (sidebar kiri)
2. Klik **"New Query"**
3. Copy & paste SQL ini:

```sql
-- Set role instructor untuk email Anda
UPDATE profiles 
SET 
    role = 'instructor',
    full_name = 'Riyan Perdhana Putra',
    updated_at = NOW()
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'perdhanariyan@gmail.com'
    LIMIT 1
);
```

4. Klik **"Run"** (atau tekan Ctrl+Enter)
5. Seharusnya muncul: **"Success. No rows returned"** atau **"1 row affected"**

### Langkah 4: Verify

Run SQL ini untuk verify:

```sql
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.role,
    p.full_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'perdhanariyan@gmail.com';
```

**Expected result**:
- ✅ `email_confirmed_at`: ada tanggal (bukan null)
- ✅ `role`: 'instructor'
- ✅ `full_name`: 'Riyan Perdhana Putra'

---

## 🔐 Sekarang Login

1. Buka: `http://localhost:3000/login`
2. Login dengan:
   ```
   Email: perdhanariyan@gmail.com
   Password: Riyanganteng01
   ```
3. ✅ **Berhasil!** Redirect ke Instructor Dashboard

---

## 🆘 Troubleshooting

### Masih error "Invalid login credentials"?

**Check 1**: User sudah dibuat?
```sql
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'perdhanariyan@gmail.com';
```
- Jika **tidak ada hasil**: User belum dibuat, ulangi Langkah 2
- Jika **email_confirmed_at = null**: User belum confirmed, centang "Auto Confirm User"

**Check 2**: Password benar?
- Password: `Riyanganteng01` (huruf besar R dan T)
- Jika lupa, reset password di Supabase Dashboard > Authentication > Users > klik user > "Send Password Recovery"

**Check 3**: Profile sudah dibuat?
```sql
SELECT * FROM profiles WHERE email = 'perdhanariyan@gmail.com';
```
- Jika tidak ada, run SQL di Langkah 3

---

## 📝 Summary

**Urutan yang benar**:
1. ✅ Create user di Supabase Dashboard (Authentication > Users)
2. ✅ Auto Confirm User (centang checkbox)
3. ✅ Set role instructor via SQL
4. ✅ Login di aplikasi

**Jangan skip langkah 1!** User HARUS dibuat di Supabase Dashboard dulu.
