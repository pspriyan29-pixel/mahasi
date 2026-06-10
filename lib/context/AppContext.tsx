'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb, Profile, Service, Order, OrderFile, Payment, Revision, ForumThread, ForumComment, Notification } from '@/lib/supabase/mockDb';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { calculatePrice } from '@/lib/pricing';
import { getWhatsAppLink } from '@/lib/whatsapp';

interface AppContextType {
  user: Profile | null;
  role: 'guest' | 'user' | 'admin' | 'partner';
  services: Service[];
  orders: Order[];
  files: OrderFile[];
  payments: Payment[];
  revisions: Revision[];
  threads: ForumThread[];
  comments: ForumComment[];
  notifications: Notification[];
  settings: Record<string, string>;
  isMockMode: boolean;
  isLoading: boolean;
  
  // Auth Actions
  login: (email: string, roleType: 'user' | 'admin') => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string) => Promise<boolean>;
  register: (fullName: string, phone: string, email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (newRole: 'user' | 'admin') => void;

  // Order Actions
  createOrder: (order: Omit<Order, 'id' | 'order_code' | 'user_id' | 'status' | 'progress' | 'revision_used' | 'created_at' | 'updated_at'>, briefFile: { name: string; size: number }) => Promise<Order>;
  approveOrder: (orderId: string, finalPrice: number, adminNote?: string) => Promise<void>;
  rejectOrder: (orderId: string, adminNote: string) => Promise<void>;
  payOrder: (orderId: string, proofName: string) => Promise<void>;
  verifyPayment: (orderId: string, isValid: boolean) => Promise<void>;
  updateOrderProgress: (orderId: string, progress: number, adminNote: string) => Promise<void>;
  deliverOrder: (orderId: string, previewUrl?: string, finalUrl?: string) => Promise<void>;
  requestRevision: (orderId: string, note: string) => Promise<void>;

  // Forum Actions
  createThread: (title: string, content: string, category: string) => Promise<ForumThread>;
  addComment: (threadId: string, content: string) => Promise<ForumComment>;

  // Notification Actions
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<'guest' | 'user' | 'admin' | 'partner'>('guest');
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const isMockMode = !isSupabaseConfigured;

  // Fetch real user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
    if (isMockMode) return;
    try {
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      const isUserAdmin = sessionUser?.email === 'perdhanariyan@gmail.com';

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profile) {
        const updatedProfile = {
          ...profile,
          role: isUserAdmin ? 'admin' : 'user'
        };
        setUser(updatedProfile as any);
        setRole(isUserAdmin ? 'admin' : 'user');
      } else if (sessionUser) {
        const fallbackProfile: Profile = {
          id: sessionUser.id,
          full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User Baru',
          phone: sessionUser.user_metadata?.phone || '',
          role: isUserAdmin ? 'admin' : 'user',
          created_at: sessionUser.created_at
        };
        setUser(fallbackProfile);
        setRole(fallbackProfile.role);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Load Initial Data
  useEffect(() => {
    if (isMockMode) {
      // Load from localStorage via helper
      setServices(mockDb.services);
      setOrders(mockDb.orders);
      setFiles(mockDb.files);
      setPayments(mockDb.payments);
      setRevisions(mockDb.revisions);
      setThreads(mockDb.threads);
      setComments(mockDb.comments);
      setNotifications(mockDb.notifications);
      setSettings(mockDb.settings);

      // Check Session
      const loggedUser = mockDb.currentUser;
      if (loggedUser) {
        setUser(loggedUser);
        setRole(loggedUser.role === 'admin' ? 'admin' : 'user');
      }
      setIsLoading(false);
    } else {
      setServices(DEFAULT_SERVICES_FALLBACK);
      setSettings({
        max_active_orders: '1',
        admin_whatsapp_number: '6281234567890',
        mode_sibuk: 'false'
      });

      // Load session
      supabase.auth.getSession().then((res: any) => {
        const session = res.data?.session;
        if (session) {
          fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      });

      // Listen Auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setRole('guest');
        }
        setIsLoading(false);
      });

      // Fetch dynamic tables
      const loadRealData = async () => {
        try {
          const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (ords) setOrders(ords as any);

          const { data: fls } = await supabase.from('order_files').select('*');
          if (fls) setFiles(fls as any);

          const { data: pmts } = await supabase.from('payments').select('*');
          if (pmts) setPayments(pmts as any);

          const { data: revs } = await supabase.from('revisions').select('*');
          if (revs) setRevisions(revs as any);

          const { data: thrs } = await supabase.from('forum_threads').select('*').order('created_at', { ascending: false });
          if (thrs) setThreads(thrs as any);

          const { data: cmts } = await supabase.from('forum_comments').select('*');
          if (cmts) setComments(cmts as any);

          const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
          if (ntfs) setNotifications(ntfs as any);
        } catch (e) {
          console.warn('Real Supabase loading failed, fallback to mock DB.', e);
          setOrders(mockDb.orders);
          setFiles(mockDb.files);
          setPayments(mockDb.payments);
          setRevisions(mockDb.revisions);
          setThreads(mockDb.threads);
          setComments(mockDb.comments);
          setNotifications(mockDb.notifications);
        }
      };

      loadRealData();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isMockMode]);

  // Sync state to localstorage in mock mode
  const syncMockDb = (key: 'orders' | 'files' | 'payments' | 'revisions' | 'threads' | 'comments' | 'notifications' | 'profiles', data: any) => {
    if (!isMockMode) return;
    if (key === 'orders') {
      mockDb.orders = data;
      setOrders(data);
    } else if (key === 'files') {
      mockDb.files = data;
      setFiles(data);
    } else if (key === 'payments') {
      mockDb.payments = data;
      setPayments(data);
    } else if (key === 'revisions') {
      mockDb.revisions = data;
      setRevisions(data);
    } else if (key === 'threads') {
      mockDb.threads = data;
      setThreads(data);
    } else if (key === 'comments') {
      mockDb.comments = data;
      setComments(data);
    } else if (key === 'notifications') {
      mockDb.notifications = data;
      setNotifications(data);
    }
  };

  const login = async (email: string, roleType: 'user' | 'admin'): Promise<boolean> => {
    const isUserAdmin = (email === 'perdhanariyan@gmail.com' || roleType === 'admin');
    const selectedId = isUserAdmin ? 'user-id-riyan' : 'user-id-customer';
    const found = mockDb.profiles.find(x => x.id === selectedId);
    if (found) {
      const updatedProfile: Profile = {
        ...found,
        email: isUserAdmin ? 'perdhanariyan@gmail.com' : (email || 'demo@flashwork.com'),
        role: isUserAdmin ? 'admin' : 'user'
      };
      setUser(updatedProfile);
      setRole(updatedProfile.role);
      mockDb.currentUser = updatedProfile;
      return true;
    }
    return false;
  };

  const loginWithGoogle = async () => {
    if (!isMockMode) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/user` : undefined
        }
      });
      if (error) throw error;
    } else {
      // Fallback: login instant as customer
      await login('customer@demo.com', 'user');
    }
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    if (!isMockMode) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/user` : undefined
        }
      });
      if (error) throw error;
      return true;
    } else {
      const roleType = (email === 'perdhanariyan@gmail.com') ? 'admin' : 'user';
      return await login(email, roleType);
    }
  };

  const register = async (fullName: string, phone: string, email: string): Promise<boolean> => {
    if (isMockMode) {
      const newProfile: Profile = {
        id: 'user-id-' + Math.random().toString(36).substring(2, 9),
        full_name: fullName,
        phone: phone,
        role: 'user',
        email: email,
        created_at: new Date().toISOString()
      };
      const allProfiles = [...mockDb.profiles, newProfile];
      mockDb.profiles = allProfiles;
      setUser(newProfile);
      setRole('user');
      mockDb.currentUser = newProfile;
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (!isMockMode) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setRole('guest');
    mockDb.currentUser = null;
  };

  const switchRole = (newRole: 'user' | 'admin') => {
    if (isMockMode) {
      const profile = mockDb.profiles.find(x => x.role === newRole);
      if (profile) {
        setUser(profile);
        setRole(newRole);
        mockDb.currentUser = profile;
      }
    }
  };

  // Order Actions
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'order_code' | 'user_id' | 'status' | 'progress' | 'revision_used' | 'created_at' | 'updated_at'>,
    briefFile: { name: string; size: number }
  ): Promise<Order> => {
    if (isMockMode && user) {
      const count = orders.length + 1;
      const orderCode = `FW-2026-${String(count).padStart(4, '0')}`;
      
      const newOrder: Order = {
        ...orderData,
        id: 'ord-' + Math.random().toString(36).substring(2, 9),
        order_code: orderCode,
        user_id: user.id,
        status: 'pending_review',
        progress: 0,
        revision_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newFile: OrderFile = {
        id: 'file-' + Math.random().toString(36).substring(2, 9),
        order_id: newOrder.id,
        uploaded_by: user.id,
        file_name: briefFile.name,
        file_url: '#',
        file_size: briefFile.size,
        file_type: briefFile.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
        file_category: 'user_attachment',
        created_at: new Date().toISOString()
      };

      const updatedOrders = [newOrder, ...orders];
      const updatedFiles = [newFile, ...files];

      // Tambahkan WhatsApp Log Mock
      console.log(`[WA_REDIRECT_LINK]: ${getWhatsAppLink(orderCode, user.full_name, 'Layanan', newOrder.deadline, newOrder.estimated_price)}`);

      // Push notification ke admin
      const adminNotification: Notification = {
        id: 'notif-' + Math.random().toString(36).substring(2, 9),
        user_id: 'user-id-riyan', // admin
        title: 'Pesanan Baru Masuk',
        message: `Order ${orderCode} dari ${user.full_name} menunggu review Anda.`,
        type: 'order',
        is_read: false,
        link_url: `/dashboard/admin/order/${newOrder.id}`,
        created_at: new Date().toISOString()
      };

      syncMockDb('orders', updatedOrders);
      syncMockDb('files', updatedFiles);
      syncMockDb('notifications', [adminNotification, ...notifications]);

      return newOrder;
    }
    throw new Error('Not logged in or Supabase not configured');
  };

  const approveOrder = async (orderId: string, finalPrice: number, adminNote?: string) => {
    if (isMockMode) {
      const updated = orders.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'approved',
            final_price: finalPrice,
            admin_note: adminNote,
            updated_at: new Date().toISOString()
          };
        }
        return ord;
      });

      const order = orders.find(x => x.id === orderId);
      if (order) {
        // Buat Invoice unpaid
        const newPayment: Payment = {
          id: 'pay-' + Math.random().toString(36).substring(2, 9),
          order_id: orderId,
          amount: finalPrice,
          method: 'qris_manual',
          status: 'unpaid',
          created_at: new Date().toISOString()
        };
        syncMockDb('payments', [newPayment, ...payments]);

        // Kirim Notif ke User
        const userNotif: Notification = {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          user_id: order.user_id,
          title: 'Pesanan Disetujui',
          message: `Pesanan ${order.order_code} disetujui dengan harga final Rp ${finalPrice.toLocaleString('id-ID')}. Silakan lakukan pembayaran.`,
          type: 'payment',
          is_read: false,
          link_url: `/dashboard/user/order/${orderId}`,
          created_at: new Date().toISOString()
        };
        syncMockDb('notifications', [userNotif, ...notifications]);
      }

      syncMockDb('orders', updated);
    }
  };

  const rejectOrder = async (orderId: string, adminNote: string) => {
    if (isMockMode) {
      const updated = orders.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'rejected',
            admin_note: adminNote,
            updated_at: new Date().toISOString()
          };
        }
        return ord;
      });

      const order = orders.find(x => x.id === orderId);
      if (order) {
        // Kirim Notif ke User
        const userNotif: Notification = {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          user_id: order.user_id,
          title: 'Pesanan Ditolak',
          message: `Maaf, pesanan ${order.order_code} ditolak oleh admin dengan alasan: ${adminNote}`,
          type: 'alert',
          is_read: false,
          link_url: `/dashboard/user/order/${orderId}`,
          created_at: new Date().toISOString()
        };
        syncMockDb('notifications', [userNotif, ...notifications]);
      }

      syncMockDb('orders', updated);
    }
  };

  const payOrder = async (orderId: string, proofName: string) => {
    if (isMockMode && user) {
      const updatedPayments = payments.map(pay => {
        if (pay.order_id === orderId) {
          return {
            ...pay,
            status: 'pending_verification' as const,
            proof_url: `/uploads/${proofName}`
          };
        }
        return pay;
      });

      const updatedOrders = orders.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'payment_review',
            updated_at: new Date().toISOString()
          };
        }
        return ord;
      });

      const order = orders.find(x => x.id === orderId);
      if (order) {
        // Notif Admin
        const adminNotif: Notification = {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          user_id: 'user-id-riyan',
          title: 'Bukti Pembayaran Diunggah',
          message: `Pembayaran ${order.order_code} telah diupload bukti transfernya oleh pelanggan.`,
          type: 'payment',
          is_read: false,
          link_url: `/dashboard/admin/order/${orderId}`,
          created_at: new Date().toISOString()
        };
        syncMockDb('notifications', [adminNotif, ...notifications]);
      }

      syncMockDb('payments', updatedPayments);
      syncMockDb('orders', updatedOrders);
    }
  };

  const verifyPayment = async (orderId: string, isValid: boolean) => {
    if (isMockMode) {
      const order = orders.find(x => x.id === orderId);
      if (!order) return;

      const updatedPayments = payments.map(pay => {
        if (pay.order_id === orderId) {
          return {
            ...pay,
            status: (isValid ? 'paid' : 'rejected') as any,
            paid_at: isValid ? new Date().toISOString() : undefined
          };
        }
        return pay;
      });

      // Workload control: periksa jumlah active order
      const activeCount = orders.filter(x => x.status === 'in_progress').length;
      const maxActive = parseInt(settings.max_active_orders || '1');

      let targetStatus = 'queued';
      if (isValid) {
        if (activeCount < maxActive) {
          targetStatus = 'in_progress';
        } else {
          targetStatus = 'queued';
        }
      } else {
        targetStatus = 'waiting_payment';
      }

      const updatedOrders = orders.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: targetStatus,
            progress: targetStatus === 'in_progress' ? 10 : 0,
            updated_at: new Date().toISOString()
          };
        }
        return ord;
      });

      // Kirim Notif User
      const userNotif: Notification = {
        id: 'notif-' + Math.random().toString(36).substring(2, 9),
        user_id: order.user_id,
        title: isValid ? 'Pembayaran Berhasil' : 'Pembayaran Ditolak',
        message: isValid
          ? `Pembayaran Rp ${order.final_price?.toLocaleString('id-ID')} diverifikasi. Status pesanan Anda: ${targetStatus === 'in_progress' ? 'Diproses' : 'Masuk Antrean'}.`
          : `Bukti transfer ditolak. Silakan unggah ulang bukti pembayaran yang sah.`,
        type: isValid ? 'success' : 'alert',
        is_read: false,
        link_url: `/dashboard/user/order/${orderId}`,
        created_at: new Date().toISOString()
      };

      syncMockDb('payments', updatedPayments);
      syncMockDb('orders', updatedOrders);
      syncMockDb('notifications', [userNotif, ...notifications]);
    }
  };

  const updateOrderProgress = async (orderId: string, progress: number, adminNote: string) => {
    if (isMockMode) {
      const updatedOrders = orders.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            progress,
            admin_note: adminNote,
            updated_at: new Date().toISOString()
          };
        }
        return ord;
      });

      syncMockDb('orders', updatedOrders);
    }
  };

  const deliverOrder = async (orderId: string, previewUrl?: string, finalUrl?: string) => {
    if (isMockMode) {
      const order = orders.find(x => x.id === orderId);
      if (!order) return;

      const updatedOrders = orders.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'delivered',
            progress: 100,
            updated_at: new Date().toISOString()
          };
        }
        return ord;
      });

      // Tambah file admin_preview & admin_final
      const newFiles: OrderFile[] = [];
      if (previewUrl) {
        newFiles.push({
          id: 'file-' + Math.random().toString(36).substring(2, 9),
          order_id: orderId,
          uploaded_by: 'user-id-riyan',
          file_name: 'hasil_preview_watermark.pdf',
          file_url: previewUrl,
          file_size: 245000,
          file_type: 'application/pdf',
          file_category: 'admin_preview',
          created_at: new Date().toISOString()
        });
      }
      if (finalUrl) {
        newFiles.push({
          id: 'file-' + Math.random().toString(36).substring(2, 9),
          order_id: orderId,
          uploaded_by: 'user-id-riyan',
          file_name: 'hasil_final_lengkap.zip',
          file_url: finalUrl,
          file_size: 1045000,
          file_type: 'application/zip',
          file_category: 'admin_final',
          created_at: new Date().toISOString()
        });
      }

      syncMockDb('files', [...newFiles, ...files]);
      syncMockDb('orders', updatedOrders);

      // Notif User
      const userNotif: Notification = {
        id: 'notif-' + Math.random().toString(36).substring(2, 9),
        user_id: order.user_id,
        title: 'Hasil Pekerjaan Dikirim',
        message: `Pekerjaan ${order.order_code} telah selesai dan file hasil telah diunggah. Silakan tinjau hasil pekerjaan.`,
        type: 'delivered',
        is_read: false,
        link_url: `/dashboard/user/order/${orderId}`,
        created_at: new Date().toISOString()
      };
      syncMockDb('notifications', [userNotif, ...notifications]);
    }
  };

  const requestRevision = async (orderId: string, note: string) => {
    if (isMockMode && user) {
      const order = orders.find(x => x.id === orderId);
      if (!order) return;

      const newRevCount = order.revision_used + 1;
      if (newRevCount > order.revision_limit) {
        alert('Kuota revisi Anda telah habis (Maksimal 3x).');
        return;
      }

      const updatedOrders = orders.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'revision_requested',
            revision_used: newRevCount,
            updated_at: new Date().toISOString()
          };
        }
        return ord;
      });

      const newRevision: Revision = {
        id: 'rev-' + Math.random().toString(36).substring(2, 9),
        order_id: orderId,
        user_id: user.id,
        revision_number: newRevCount,
        note,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Notif Admin
      const adminNotif: Notification = {
        id: 'notif-' + Math.random().toString(36).substring(2, 9),
        user_id: 'user-id-riyan',
        title: 'Revisi Baru Diajukan',
        message: `Pelanggan ${user.full_name} mengajukan revisi #${newRevCount} untuk order ${order.order_code}.`,
        type: 'revision',
        is_read: false,
        link_url: `/dashboard/admin/order/${orderId}`,
        created_at: new Date().toISOString()
      };

      syncMockDb('revisions', [newRevision, ...revisions]);
      syncMockDb('orders', updatedOrders);
      syncMockDb('notifications', [adminNotif, ...notifications]);
    }
  };

  // Forum Actions
  const createThread = async (title: string, content: string, category: string): Promise<ForumThread> => {
    if (isMockMode && user) {
      const newThread: ForumThread = {
        id: 'thread-' + Math.random().toString(36).substring(2, 9),
        user_id: user.id,
        title,
        content,
        category,
        status: 'open',
        is_pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_name: user.full_name,
        replies_count: 0
      };

      const updatedThreads = [newThread, ...threads];
      syncMockDb('threads', updatedThreads);
      return newThread;
    }
    throw new Error('Not logged in');
  };

  const addComment = async (threadId: string, content: string): Promise<ForumComment> => {
    if (isMockMode && user) {
      const newComment: ForumComment = {
        id: 'comment-' + Math.random().toString(36).substring(2, 9),
        thread_id: threadId,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
        user_name: user.full_name
      };

      const updatedComments = [...comments, newComment];
      const updatedThreads = threads.map(th => {
        if (th.id === threadId) {
          return {
            ...th,
            replies_count: (th.replies_count || 0) + 1,
            updated_at: new Date().toISOString()
          };
        }
        return th;
      });

      syncMockDb('comments', updatedComments);
      syncMockDb('threads', updatedThreads);
      return newComment;
    }
    throw new Error('Not logged in');
  };

  const markNotificationRead = (id: string) => {
    if (isMockMode) {
      const updated = notifications.map(notif => {
        if (notif.id === id) {
          return { ...notif, is_read: true };
        }
        return notif;
      });
      syncMockDb('notifications', updated);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        services,
        orders,
        files,
        payments,
        revisions,
        threads,
        comments,
        notifications,
        settings,
        isMockMode,
        isLoading,
        login,
        loginWithGoogle,
        loginWithEmail,
        register,
        logout,
        switchRole,
        createOrder,
        approveOrder,
        rejectOrder,
        payOrder,
        verifyPayment,
        updateOrderProgress,
        deliverOrder,
        requestRevision,
        createThread,
        addComment,
        markNotificationRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

const DEFAULT_SERVICES_FALLBACK: Service[] = mockDb.services;
