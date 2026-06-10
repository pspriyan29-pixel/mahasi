'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Service, Order, OrderFile, Payment, Revision, ForumThread, ForumComment, Notification } from '@/lib/types';
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
  completeOrder: (orderId: string) => Promise<void>;

  // Forum Actions
  createThread: (title: string, content: string, category: string) => Promise<ForumThread>;
  addComment: (threadId: string, content: string) => Promise<ForumComment>;

  // Notification Actions
  markNotificationRead: (id: string) => void;

  // Setting Actions
  updateSetting: (key: string, value: string) => Promise<void>;
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

  

  // Load all user-specific data from Supabase (called after auth)
  const loadRealData = async () => {
    try {
      const { data: svcs } = await supabase.from('services').select('*');
      if (svcs && svcs.length > 0) {
        setServices(svcs as any);
      } else {
        setServices(DEFAULT_SERVICES_FALLBACK);
      }

      const { data: setts } = await supabase.from('settings').select('*');
      if (setts && setts.length > 0) {
        const mappedSettings: Record<string, string> = {};
        setts.forEach((s: any) => { mappedSettings[s.key] = s.value; });
        setSettings(mappedSettings);
      }

      const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ords) setOrders(ords as any);

      const { data: fls } = await supabase.from('order_files').select('*');
      if (fls) setFiles(fls as any);

      const { data: pmts } = await supabase.from('payments').select('*');
      if (pmts) setPayments(pmts as any);

      const { data: revs } = await supabase.from('revisions').select('*');
      if (revs) setRevisions(revs as any);

      const { data: thrs } = await supabase.from('forum_threads').select('*, profiles(full_name)').order('created_at', { ascending: false });
      if (thrs) {
        const mapped = thrs.map((t: any) => ({
          ...t,
          user_name: t.profiles?.full_name || 'User'
        }));
        setThreads(mapped as any);
      }

      const { data: cmts } = await supabase.from('forum_comments').select('*, profiles(full_name)');
      if (cmts) {
        const mapped = cmts.map((c: any) => ({
          ...c,
          user_name: c.profiles?.full_name || 'User'
        }));
        setComments(mapped as any);
      }

      const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (ntfs) setNotifications(ntfs as any);
    } catch (e) {
      console.error('Supabase data loading failed', e);
    }
  };

  // Fetch real user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
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
          email: sessionUser?.email || '',
          role: isUserAdmin ? 'admin' : (profile.role || 'user')
        };
        setUser(updatedProfile as any);
        setRole(isUserAdmin ? 'admin' : (profile.role || 'user'));
      } else if (sessionUser) {
        // Profile belum terbuat (misalnya user baru via OTP), buat fallback
        const fallbackProfile: Profile = {
          id: sessionUser.id,
          full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User Baru',
          phone: sessionUser.user_metadata?.phone || '',
          role: isUserAdmin ? 'admin' : 'user',
          email: sessionUser.email || '',
          created_at: sessionUser.created_at
        };
        setUser(fallbackProfile);
        setRole(fallbackProfile.role);
        // Buat profile di database jika belum ada
        await supabase.from('profiles').upsert({
          id: sessionUser.id,
          full_name: fallbackProfile.full_name,
          phone: fallbackProfile.phone,
          role: fallbackProfile.role
        });
      }
      // Setelah user diketahui, muat semua data dengan RLS aktif
      await loadRealData();
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Load Initial Data
  useEffect(() => {
    setServices(DEFAULT_SERVICES_FALLBACK);
    setSettings({
      max_active_orders: '1',
      admin_whatsapp_number: '6281234567890',
      mode_sibuk: 'false'
    });

    // Load public data (services, settings, forum) tanpa auth
    loadRealData();

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
        setOrders([]);
        setPayments([]);
        setFiles([]);
        setRevisions([]);
        setNotifications([]);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  
  ;

  
  const login = async (email: string, roleType: 'user' | 'admin'): Promise<boolean> => {
    return loginWithEmail(email);
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    });
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    });
    if (error) {
      console.error(error);
      return false;
    }
    alert('Link login telah dikirim ke email Anda. Silakan cek inbox/spam.');
    return true;
  };

  const register = async (fullName: string, phone: string, email: string): Promise<boolean> => {
    // Kita gunakan magic link untuk registrasi juga
    return loginWithEmail(email);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('guest');
  };

  const switchRole = (newRole: 'user' | 'admin') => {
    
  };

  // Order Actions
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'order_code' | 'user_id' | 'status' | 'progress' | 'revision_used' | 'created_at' | 'updated_at'>,
    briefFile: { name: string; size: number }
  ): Promise<Order> => {
     if (user) {
      // Supabase Mode
      // Get orders count to determine order code
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      const orderCount = (count || 0) + 1;
      const orderCode = `FW-2026-${String(orderCount).padStart(4, '0')}`;

      let serviceUuid: string | null = orderData.service_id;
      // Map mock s1..s4 service IDs to real UUIDs in Supabase by matching slug
      if (['s1', 's2', 's3', 's4'].includes(serviceUuid)) {
        const mockSvc = DEFAULT_SERVICES_FALLBACK.find(s => s.id === serviceUuid);
        if (mockSvc) {
          const { data: realSvc } = await supabase
            .from('services')
            .select('id')
            .eq('slug', mockSvc.slug)
            .single();
          if (realSvc) {
            serviceUuid = realSvc.id;
          } else {
            serviceUuid = null;
          }
        } else {
          serviceUuid = null;
        }
      }

      // Insert Order
      const { data: insertedOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          user_id: user.id,
          service_id: serviceUuid,
          title: orderData.title,
          description: orderData.description,
          deadline: orderData.deadline,
          difficulty: orderData.difficulty || 'normal',
          priority: orderData.priority || 'normal',
          estimated_price: orderData.estimated_price,
          status: 'pending_review',
          progress: 0,
          revision_limit: 3,
          revision_used: 0
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      // Insert File Brief
      if (briefFile && briefFile.name) {
        const { error: fileErr } = await supabase
          .from('order_files')
          .insert({
            order_id: insertedOrder.id,
            uploaded_by: user.id,
            file_name: briefFile.name,
            file_url: '#',
            file_size: briefFile.size,
            file_type: briefFile.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
            file_category: 'user_attachment'
          });
        if (fileErr) console.error('Error inserting file in Supabase:', fileErr);
      }

      // Notify Admin
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
      if (admins && admins.length > 0) {
        const adminId = admins[0].id;
        await supabase
          .from('notifications')
          .insert({
            user_id: adminId,
            title: 'Pesanan Baru Masuk',
            message: `Order ${orderCode} dari ${user.full_name} menunggu review Anda.`,
            type: 'order',
            link_url: `/dashboard/admin/order/${insertedOrder.id}`
          });
      }

      // Reload state from database
      const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ords) setOrders(ords as any);
      
      const { data: fls } = await supabase.from('order_files').select('*');
      if (fls) setFiles(fls as any);

      const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (ntfs) setNotifications(ntfs as any);

      return insertedOrder as any;
    }
    throw new Error('Not logged in or Supabase not configured');
  };

  const approveOrder = async (orderId: string, finalPrice: number, adminNote?: string) => {
    
      try {
        const { error: orderErr } = await supabase
          .from('orders')
          .update({
            status: 'approved',
            final_price: finalPrice,
            admin_note: adminNote,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        if (orderErr) throw orderErr;

        const { data: order, error: fetchErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (fetchErr) throw fetchErr;

        // Buat Invoice unpaid
        const { error: payErr } = await supabase
          .from('payments')
          .insert({
            order_id: orderId,
            amount: finalPrice,
            method: 'qris_manual',
            status: 'unpaid'
          });
        if (payErr) throw payErr;

        // Kirim Notif ke User
        await supabase
          .from('notifications')
          .insert({
            user_id: order.user_id,
            title: 'Pesanan Disetujui',
            message: `Pesanan ${order.order_code} disetujui dengan harga final Rp ${finalPrice.toLocaleString('id-ID')}. Silakan lakukan pembayaran.`,
            type: 'payment',
            link_url: `/dashboard/user/order/${orderId}`
          });

        // Reload
        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ords) setOrders(ords as any);
        const { data: pmts } = await supabase.from('payments').select('*');
        if (pmts) setPayments(pmts as any);
        const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (ntfs) setNotifications(ntfs as any);
      } catch (err) {
        console.error('Error approving order in Supabase:', err);
      }
    
  };

  const rejectOrder = async (orderId: string, adminNote: string) => {
    
      try {
        const { error: orderErr } = await supabase
          .from('orders')
          .update({
            status: 'rejected',
            admin_note: adminNote,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        if (orderErr) throw orderErr;

        const { data: order, error: fetchErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (fetchErr) throw fetchErr;

        // Kirim Notif ke User
        await supabase
          .from('notifications')
          .insert({
            user_id: order.user_id,
            title: 'Pesanan Ditolak',
            message: `Maaf, pesanan ${order.order_code} ditolak oleh admin dengan alasan: ${adminNote}`,
            type: 'alert',
            link_url: `/dashboard/user/order/${orderId}`
          });

        // Reload
        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ords) setOrders(ords as any);
        const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (ntfs) setNotifications(ntfs as any);
      } catch (err) {
        console.error('Error rejecting order in Supabase:', err);
      }
    
  };

  const payOrder = async (orderId: string, proofName: string) => {
     if (user) {
      try {
        const { error: payErr } = await supabase
          .from('payments')
          .update({
            status: 'pending_verification',
            proof_url: `/uploads/${proofName}`
          })
          .eq('order_id', orderId);
        if (payErr) throw payErr;

        const { error: orderErr } = await supabase
          .from('orders')
          .update({
            status: 'payment_review',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        if (orderErr) throw orderErr;

        const { data: order, error: fetchErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (fetchErr) throw fetchErr;

        // Notif Admin
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin');
        if (admins && admins.length > 0) {
          const adminId = admins[0].id;
          await supabase
            .from('notifications')
            .insert({
              user_id: adminId,
              title: 'Bukti Pembayaran Diunggah',
              message: `Pembayaran ${order.order_code} telah diupload bukti transfernya oleh pelanggan.`,
              type: 'payment',
              link_url: `/dashboard/admin/order/${orderId}`
            });
        }

        // Reload
        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ords) setOrders(ords as any);
        const { data: pmts } = await supabase.from('payments').select('*');
        if (pmts) setPayments(pmts as any);
        const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (ntfs) setNotifications(ntfs as any);
      } catch (err) {
        console.error('Error paying order in Supabase:', err);
      }
    }
  };

  const verifyPayment = async (orderId: string, isValid: boolean) => {
    
      try {
        const { data: order, error: fetchErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (fetchErr || !order) throw fetchErr || new Error('Order not found');

        // Update payment status
        const { error: payErr } = await supabase
          .from('payments')
          .update({
            status: isValid ? 'paid' : 'rejected',
            paid_at: isValid ? new Date().toISOString() : null
          })
          .eq('order_id', orderId);
        if (payErr) throw payErr;

        // Hitung active orders in progress
        const { count: activeCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress');

        // Get max_active_orders
        const { data: maxActiveSetting } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'max_active_orders')
          .single();
        const maxActive = parseInt(maxActiveSetting?.value || '1');

        let targetStatus = 'queued';
        if (isValid) {
          if ((activeCount || 0) < maxActive) {
            targetStatus = 'in_progress';
          } else {
            targetStatus = 'queued';
          }
        } else {
          targetStatus = 'waiting_payment';
        }

        // Update order status
        const { error: orderErr } = await supabase
          .from('orders')
          .update({
            status: targetStatus,
            progress: targetStatus === 'in_progress' ? 10 : 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        if (orderErr) throw orderErr;

        // Kirim Notif User
        await supabase
          .from('notifications')
          .insert({
            user_id: order.user_id,
            title: isValid ? 'Pembayaran Berhasil' : 'Pembayaran Ditolak',
            message: isValid
              ? `Pembayaran Rp ${order.final_price?.toLocaleString('id-ID')} diverifikasi. Status pesanan Anda: ${targetStatus === 'in_progress' ? 'Diproses' : 'Masuk Antrean'}.`
              : `Bukti transfer ditolak. Silakan unggah ulang bukti pembayaran yang sah.`,
            type: isValid ? 'success' : 'alert',
            link_url: `/dashboard/user/order/${orderId}`
          });

        // Reload
        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ords) setOrders(ords as any);
        const { data: pmts } = await supabase.from('payments').select('*');
        if (pmts) setPayments(pmts as any);
        const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (ntfs) setNotifications(ntfs as any);
      } catch (err) {
        console.error('Error verifying payment in Supabase:', err);
      }
    
  };

  const updateOrderProgress = async (orderId: string, progress: number, adminNote: string) => {
    
      try {
        const { error } = await supabase
          .from('orders')
          .update({
            progress: progress,
            admin_note: adminNote,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        if (error) throw error;

        // Reload
        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ords) setOrders(ords as any);
      } catch (err) {
        console.error('Error updating progress in Supabase:', err);
      }
    
  };

  const deliverOrder = async (orderId: string, previewUrl?: string, finalUrl?: string) => {
    
      try {
        const { data: order, error: fetchErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (fetchErr || !order) throw fetchErr || new Error('Order not found');

        const { error: orderErr } = await supabase
          .from('orders')
          .update({
            status: 'delivered',
            progress: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        if (orderErr) throw orderErr;

        // Tambah file admin_preview & admin_final ke order_files
        const currentUserId = user?.id || '';
        if (previewUrl) {
          await supabase
            .from('order_files')
            .insert({
              order_id: orderId,
              uploaded_by: currentUserId,
              file_name: 'hasil_preview_watermark.pdf',
              file_url: previewUrl,
              file_size: 245000,
              file_type: 'application/pdf',
              file_category: 'admin_preview'
            });
        }
        if (finalUrl) {
          await supabase
            .from('order_files')
            .insert({
              order_id: orderId,
              uploaded_by: currentUserId,
              file_name: 'hasil_final_lengkap.zip',
              file_url: finalUrl,
              file_size: 1045000,
              file_type: 'application/zip',
              file_category: 'admin_final'
            });
        }

        // Notif User
        await supabase
          .from('notifications')
          .insert({
            user_id: order.user_id,
            title: 'Hasil Pekerjaan Dikirim',
            message: `Pekerjaan ${order.order_code} telah selesai dan file hasil telah diunggah. Silakan tinjau hasil pekerjaan.`,
            type: 'delivered',
            link_url: `/dashboard/user/order/${orderId}`
          });

        // Reload
        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ords) setOrders(ords as any);
        const { data: fls } = await supabase.from('order_files').select('*');
        if (fls) setFiles(fls as any);
        const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (ntfs) setNotifications(ntfs as any);
      } catch (err) {
        console.error('Error delivering order in Supabase:', err);
      }
    
  };

  const requestRevision = async (orderId: string, note: string) => {
     if (user) {
      try {
        const { data: order, error: fetchErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (fetchErr || !order) throw fetchErr || new Error('Order not found');

        const newRevCount = order.revision_used + 1;
        if (newRevCount > order.revision_limit) {
          alert('Kuota revisi Anda telah habis (Maksimal 3x).');
          return;
        }

        // Update order status
        const { error: orderErr } = await supabase
          .from('orders')
          .update({
            status: 'revision_requested',
            revision_used: newRevCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        if (orderErr) throw orderErr;

        // Insert revision
        const { error: revErr } = await supabase
          .from('revisions')
          .insert({
            order_id: orderId,
            user_id: user.id,
            revision_number: newRevCount,
            note: note,
            status: 'pending'
          });
        if (revErr) throw revErr;

        // Notif Admin
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin');
        if (admins && admins.length > 0) {
          const adminId = admins[0].id;
          await supabase
            .from('notifications')
            .insert({
              user_id: adminId,
              title: 'Revisi Baru Diajukan',
              message: `Pelanggan ${user.full_name} mengajukan revisi #${newRevCount} untuk order ${order.order_code}.`,
              type: 'revision',
              link_url: `/dashboard/admin/order/${orderId}`
            });
        }

        // Reload
        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ords) setOrders(ords as any);
        const { data: revs } = await supabase.from('revisions').select('*');
        if (revs) setRevisions(revs as any);
        const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (ntfs) setNotifications(ntfs as any);
      } catch (err) {
        console.error('Error requesting revision in Supabase:', err);
      }
    }
  };

  const completeOrder = async (orderId: string) => {
    
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'completed', progress: 100, updated_at: new Date().toISOString() })
          .eq('id', orderId);
        if (error) throw error;

        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ords) setOrders(ords as any);

        const order = orders.find(x => x.id === orderId);
        if (order) {
          // Notify Admin dynamically
          const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
          const adminId = (admins && admins.length > 0) ? admins[0].id : null;
          if (adminId) {
            await supabase
              .from('notifications')
              .insert({
                user_id: adminId,
                title: 'Project Selesai',
                message: `Order ${order.order_code} diselesaikan oleh pelanggan.`,
                type: 'success',
                link_url: `/dashboard/admin/order/${orderId}`
              });
          }
          
          const { data: ntfs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
          if (ntfs) setNotifications(ntfs as any);
        }
      } catch (err) {
        console.error('Error completing order in Supabase:', err);
      }
    
  };

  // Forum Actions
  const createThread = async (title: string, content: string, category: string): Promise<ForumThread> => {
     if (user) {
      try {
        const { data: newThread, error } = await supabase
          .from('forum_threads')
          .insert({
            user_id: user.id,
            title,
            content,
            category,
            status: 'open',
            is_pinned: false
          })
          .select()
          .single();
        if (error) throw error;

        // Reload
        const { data: thrs } = await supabase.from('forum_threads').select('*, profiles(full_name)').order('created_at', { ascending: false });
        if (thrs) {
          const mapped = thrs.map((t: any) => ({
            ...t,
            user_name: t.profiles?.full_name || 'User'
          }));
          setThreads(mapped as any);
        }

        return newThread as any;
      } catch (err) {
        console.error('Error creating thread in Supabase:', err);
        throw err;
      }
    }
    throw new Error('Not logged in');
  };

  const addComment = async (threadId: string, content: string): Promise<ForumComment> => {
     if (user) {
      try {
        const { data: newComment, error } = await supabase
          .from('forum_comments')
          .insert({
            thread_id: threadId,
            user_id: user.id,
            content
          })
          .select()
          .single();
        if (error) throw error;

        // Reload
        const { data: cmts } = await supabase.from('forum_comments').select('*, profiles(full_name)');
        if (cmts) {
          const mapped = cmts.map((c: any) => ({
            ...c,
            user_name: c.profiles?.full_name || 'User'
          }));
          setComments(mapped as any);
        }

        return newComment as any;
      } catch (err) {
        console.error('Error adding comment in Supabase:', err);
        throw err;
      }
    }
    throw new Error('Not logged in');
  };

  const markNotificationRead = async (id: string) => {
    
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
        if (error) throw error;

        const { data } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setNotifications(data as any);
      } catch (err) {
        console.error('Error marking notification read in Supabase:', err);
      }
    
  };

  const updateSetting = async (key: string, value: string) => {
    
      try {
        const { error } = await supabase
          .from('settings')
          .upsert({ key, value })
          .eq('key', key);
        if (error) throw error;
        
        // Reload settings
        const { data: setts } = await supabase.from('settings').select('*');
        if (setts) {
          const mappedSettings: Record<string, string> = {
            max_active_orders: '1',
            admin_whatsapp_number: '6281234567890',
            mode_sibuk: 'false'
          };
          setts.forEach((s: any) => {
            mappedSettings[s.key] = s.value;
          });
          setSettings(mappedSettings);
        }
      } catch (err) {
        console.error('Error updating setting in Supabase:', err);
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
        completeOrder,
        createThread,
        addComment,
        markNotificationRead,
        updateSetting
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

const DEFAULT_SERVICES_FALLBACK: Service[] = [
  { id: 's1', name: 'Laporan & Makalah', slug: 'laporan-makalah', category: 'document', description: 'Bantu struktur, penyusunan, perapian, dan revisi dokumen akademik', base_price: 1000, estimated_time: '1-3 Hari' },
  { id: 's2', name: 'PPT Presentasi', slug: 'ppt-presentasi', category: 'document', description: 'Buat slide presentasi yang lebih modern', base_price: 20000, estimated_time: '1-2 Hari' },
  { id: 's3', name: 'Coding & Website', slug: 'coding-website', category: 'tech', description: 'Bantu debugging, CRUD, database, dashboard, UI, deploy', base_price: 50000, estimated_time: '2-7 Hari' },
  { id: 's4', name: 'Custom Digital Request', slug: 'custom-request', category: 'custom', description: 'Punya kebutuhan khusus?', base_price: 30000, estimated_time: 'Sesuai Brief' }
];
