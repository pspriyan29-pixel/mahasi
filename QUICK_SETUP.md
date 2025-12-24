# 🚀 Quick Setup - Instructor Account

## ⚡ CARA TERCEPAT (2 Langkah)

### Langkah 1: Create User di Supabase Dashboard

1. **Buka Supabase Dashboard**
2. **Authentication** > **Users** > **"Add User"**
3. **Fill**:
   - Email: `perdhanariyan@gmail.com`
   - Password: `Riyanganteng01`
4. ✅ **CENTANG**: "Auto Confirm User"
5. **Click**: "Create User"

### Langkah 2: Run SQL

**Copy & paste SQL ini** di Supabase SQL Editor:

```sql
-- Otomatis set role instructor
UPDATE profiles 
SET role = 'instructor', full_name = 'Riyan Perdhana Putra'
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'perdhanariyan@gmail.com'
);
```

**Klik "Run"**

---

## ✅ Verify

```sql
SELECT id, email, full_name, role
FROM profiles
WHERE email = 'perdhanariyan@gmail.com';
```

**Expected**: `role = 'instructor'`

---

## 🔐 Login

- **URL**: `http://localhost:3000/login`
- **Email**: `perdhanariyan@gmail.com`
- **Password**: `Riyanganteng01`

---

## 🆘 Jika Error

### Error: "no rows updated"

**Solusi**: Profile belum dibuat. Run SQL ini:

```sql
INSERT INTO profiles (id, email, role, full_name)
SELECT id, email, 'instructor', 'Riyan Perdhana Putra'
FROM auth.users
WHERE email = 'perdhanariyan@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'instructor', full_name = 'Riyan Perdhana Putra';
```

### Error: "user not found"

**Solusi**: User belum dibuat di Authentication > Users. Ulangi Langkah 1.

---

**File lengkap**: `supabase/INSTRUCTOR_SETUP_EASY.sql`
