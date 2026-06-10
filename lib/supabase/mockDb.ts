// Mock Database Helper menggunakan LocalStorage
// Dipakai jika kunci Supabase tidak terkonfigurasi.

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin' | 'partner';
  email?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  base_price: number;
  min_price?: number;
  max_price?: number;
  estimated_time: string;
}

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  service_id: string;
  title: string;
  description: string;
  deadline: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'complex';
  priority: 'normal' | 'cepat' | 'express' | 'super_urgent';
  estimated_price: number;
  final_price?: number;
  status: string;
  progress: number;
  revision_limit: number;
  revision_used: number;
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderFile {
  id: string;
  order_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  file_category: 'user_attachment' | 'admin_preview' | 'admin_final' | 'revision_attachment';
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  status: 'unpaid' | 'pending_verification' | 'paid' | 'rejected' | 'expired' | 'refunded';
  proof_url?: string;
  gateway_reference?: string;
  paid_at?: string;
  created_at: string;
}

export interface Revision {
  id: string;
  order_id: string;
  user_id: string;
  revision_number: number;
  note: string;
  attachment_url?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  admin_response?: string;
  created_at: string;
}

export interface ForumThread {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  status: 'open' | 'solved' | 'locked';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  replies_count?: number;
}

export interface ForumComment {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

// Default static values
const DEFAULT_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Laporan & Makalah',
    slug: 'laporan-makalah',
    category: 'document',
    description: 'Bantu struktur, penyusunan, perapian, dan revisi dokumen akademik agar lebih rapi dan mudah dipahami.',
    base_price: 1000,
    min_price: 1000,
    max_price: 100000,
    estimated_time: '1-3 Hari'
  },
  {
    id: 's2',
    name: 'PPT Presentasi',
    slug: 'ppt-presentasi',
    category: 'document',
    description: 'Buat slide presentasi yang lebih modern, ringkas, dan siap dipakai untuk kelas atau seminar.',
    base_price: 20000,
    min_price: 20000,
    max_price: 150000,
    estimated_time: '1-2 Hari'
  },
  {
    id: 's3',
    name: 'Coding & Website',
    slug: 'coding-website',
    category: 'tech',
    description: 'Bantu debugging, CRUD, database, dashboard, UI, deploy, dan project custom sesuai kebutuhan.',
    base_price: 50000,
    min_price: 50000,
    max_price: 1000000,
    estimated_time: '2-7 Hari'
  },
  {
    id: 's4',
    name: 'Custom Digital Request',
    slug: 'custom-request',
    category: 'custom',
    description: 'Punya kebutuhan khusus? Ceritakan detailnya, admin akan review dan beri estimasi terbaik.',
    base_price: 30000,
    min_price: 30000,
    estimated_time: 'Sesuai Brief'
  }
];

class MockDatabase {
  private isBrowser = typeof window !== 'undefined';

  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;
    const item = localStorage.getItem(key);
    if (!item) {
      this.setStorageItem(key, defaultValue);
      return defaultValue;
    }
    try {
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Getters
  get profiles(): Profile[] {
    return this.getStorageItem<Profile[]>('mock_profiles', [
      {
        id: 'user-id-riyan',
        full_name: 'Riyan Perdhana Putra',
        phone: '6281234567890',
        role: 'admin',
        email: 'perdhanariyan@gmail.com',
        created_at: new Date().toISOString()
      },
      {
        id: 'user-id-customer',
        full_name: 'Budi Santoso',
        phone: '6289988776655',
        role: 'user',
        email: 'demo@flashwork.com',
        created_at: new Date().toISOString()
      }
    ]);
  }

  set profiles(val: Profile[]) {
    this.setStorageItem('mock_profiles', val);
  }

  get services(): Service[] {
    return this.getStorageItem<Service[]>('mock_services', DEFAULT_SERVICES);
  }

  get orders(): Order[] {
    return this.getStorageItem<Order[]>('mock_orders', [
      {
        id: 'ord-1',
        order_code: 'FW-2026-0001',
        user_id: 'user-id-customer',
        service_id: 's3',
        title: 'Pembuatan Web Portfolio Next.js',
        description: 'Tolong buatkan website portfolio modern 3D soft white menggunakan Tailwind CSS dan Framer Motion. Struktur halaman utama harus memukau dengan navigasi yang halus.',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        difficulty: 'normal',
        priority: 'normal',
        estimated_price: 250000,
        final_price: 250000,
        status: 'in_progress',
        progress: 45,
        revision_limit: 3,
        revision_used: 0,
        admin_note: 'Project sedang didevelop bagian Frontend visual.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'ord-2',
        order_code: 'FW-2026-0002',
        user_id: 'user-id-customer',
        service_id: 's1',
        title: 'Perapian Bab 1-3 Makalah Manajemen',
        description: 'Merapikan format penulisan, margin, spasi, daftar pustaka APA style, serta struktur bab 1-3 makalah manajemen bisnis.',
        deadline: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        difficulty: 'easy',
        priority: 'cepat',
        estimated_price: 45000,
        final_price: 50000,
        status: 'waiting_payment',
        progress: 0,
        revision_limit: 3,
        revision_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  }

  set orders(val: Order[]) {
    this.setStorageItem('mock_orders', val);
  }

  get files(): OrderFile[] {
    return this.getStorageItem<OrderFile[]>('mock_files', [
      {
        id: 'f-1',
        order_id: 'ord-1',
        uploaded_by: 'user-id-customer',
        file_name: 'brief_portfolio.docx',
        file_url: '#',
        file_size: 15240,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        file_category: 'user_attachment',
        created_at: new Date().toISOString()
      }
    ]);
  }

  set files(val: OrderFile[]) {
    this.setStorageItem('mock_files', val);
  }

  get payments(): Payment[] {
    return this.getStorageItem<Payment[]>('mock_payments', [
      {
        id: 'pay-1',
        order_id: 'ord-1',
        amount: 250000,
        method: 'qris_manual',
        status: 'paid',
        proof_url: '/dummy_proof.jpg',
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 'pay-2',
        order_id: 'ord-2',
        amount: 50000,
        method: 'qris_manual',
        status: 'unpaid',
        created_at: new Date().toISOString()
      }
    ]);
  }

  set payments(val: Payment[]) {
    this.setStorageItem('mock_payments', val);
  }

  get revisions(): Revision[] {
    return this.getStorageItem<Revision[]>('mock_revisions', []);
  }

  set revisions(val: Revision[]) {
    this.setStorageItem('mock_revisions', val);
  }

  get threads(): ForumThread[] {
    return this.getStorageItem<ForumThread[]>('mock_threads', [
      {
        id: 't-1',
        user_id: 'user-id-customer',
        title: 'Rekomendasi Library Animasi Selain Framer Motion',
        content: 'Halo teman-teman, apakah ada rekomendasi library animasi web yang ringan dan mudah digunakan selain Framer Motion? Untuk project Next.js.',
        category: 'Tanya Coding',
        status: 'open',
        is_pinned: false,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        updated_at: new Date().toISOString(),
        user_name: 'Budi Santoso',
        replies_count: 1
      },
      {
        id: 't-2',
        user_id: 'user-id-riyan',
        title: 'Tips Penulisan Bab 1 Laporan Penelitian Biar Cepat Di-Approve',
        content: 'Ada beberapa kesalahan umum mahasiswa saat menulis bab 1. Simak tips dari admin: 1. Latar belakang harus mengerucut, 2. Batasan masalah jelas, 3. Rumusan masalah sejalan dengan tujuan.',
        category: 'Tips FlashWork',
        status: 'open',
        is_pinned: true,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        updated_at: new Date().toISOString(),
        user_name: 'Riyan Perdhana Putra (Admin)',
        replies_count: 0
      }
    ]);
  }

  set threads(val: ForumThread[]) {
    this.setStorageItem('mock_threads', val);
  }

  get comments(): ForumComment[] {
    return this.getStorageItem<ForumComment[]>('mock_comments', [
      {
        id: 'c-1',
        thread_id: 't-1',
        user_id: 'user-id-riyan',
        content: 'Anda bisa coba GSAP untuk animasi yang sangat kompleks, atau anime.js jika ingin yang super ringan tanpa binding khusus React. Tapi untuk Next.js, Framer Motion adalah yang paling terintegrasi.',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        user_name: 'Riyan Perdhana Putra (Admin)'
      }
    ]);
  }

  set comments(val: ForumComment[]) {
    this.setStorageItem('mock_comments', val);
  }

  get notifications(): Notification[] {
    return this.getStorageItem<Notification[]>('mock_notifications', [
      {
        id: 'n-1',
        user_id: 'user-id-customer',
        title: 'Pembayaran Diterima',
        message: 'Pembayaran untuk order FW-2026-0001 berhasil diverifikasi. Pesanan Anda kini masuk ke pengerjaan.',
        type: 'payment',
        is_read: false,
        link_url: '/dashboard/user/order/ord-1',
        created_at: new Date().toISOString()
      }
    ]);
  }

  set notifications(val: Notification[]) {
    this.setStorageItem('mock_notifications', val);
  }

  get settings(): Record<string, string> {
    return this.getStorageItem<Record<string, string>>('mock_settings', {
      max_active_orders: '1',
      admin_whatsapp_number: '6281234567890',
      mode_sibuk: 'false'
    });
  }

  set settings(val: Record<string, string>) {
    this.setStorageItem('mock_settings', val);
  }

  // Session mock
  get currentUser(): Profile | null {
    if (!this.isBrowser) return null;
    const session = localStorage.getItem('mock_session');
    if (!session) return null;
    try {
      const p = this.profiles.find(x => x.id === session);
      return p || null;
    } catch {
      return null;
    }
  }

  set currentUser(profile: Profile | null) {
    if (!this.isBrowser) return;
    if (profile) {
      localStorage.setItem('mock_session', profile.id);
    } else {
      localStorage.removeItem('mock_session');
    }
  }
}

export const mockDb = new MockDatabase();
