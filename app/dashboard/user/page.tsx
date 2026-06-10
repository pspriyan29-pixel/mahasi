'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import Link from 'next/link';
import { 
  ClipboardCheck, Clock, CheckCircle2, AlertCircle, 
  PlusCircle, Calendar, ShieldCheck, MessageSquare, 
  HelpCircle, ChevronRight, MessageCircle, Phone, ArrowUpRight
} from 'lucide-react';

export default function UserOverviewPage() {
  const { user, orders, payments, threads, settings } = useApp();

  // Filter orders for the logged-in customer
  const userOrders = orders.filter(ord => ord.user_id === user?.id);
  
  const activeOrders = userOrders.filter(ord => 
    ['pending_review', 'need_detail', 'approved', 'waiting_payment', 'payment_review', 'queued', 'in_progress', 'delivered', 'revision_requested', 'revision_in_progress'].includes(ord.status)
  );
  
  const completedOrders = userOrders.filter(ord => ord.status === 'completed');

  // Cari satu pesanan aktif yang paling mendekati deadline
  const priorityActiveOrder = activeOrders.length > 0 
    ? [...activeOrders].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]
    : null;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; cls: string }> = {
      draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
      pending_review: { label: 'Menunggu Review', cls: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
      need_detail: { label: 'Butuh Detail', cls: 'bg-orange-50 text-orange-600 border-orange-100' },
      rejected: { label: 'Ditolak', cls: 'bg-red-50 text-red-600 border-red-100' },
      approved: { label: 'Disetujui', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
      waiting_payment: { label: 'Menunggu Pembayaran', cls: 'bg-purple-50 text-purple-600 border-purple-100' },
      payment_review: { label: 'Pengecekan Bayar', cls: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
      queued: { label: 'Dalam Antrean', cls: 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' },
      in_progress: { label: 'Diproses', cls: 'bg-blue-50 text-blue-600 border-blue-100 font-semibold' },
      delivered: { label: 'Hasil Dikirim', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100 font-bold' },
      revision_requested: { label: 'Revisi Diminta', cls: 'bg-teal-50 text-teal-600 border-teal-100' },
      revision_in_progress: { label: 'Revisi Diproses', cls: 'bg-sky-50 text-sky-600 border-sky-100' },
      completed: { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      cancelled: { label: 'Dibatalkan', cls: 'bg-slate-100 text-slate-400 border-slate-200' },
    };

    const item = statusMap[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
    return (
      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${item.cls}`}>
        {item.label}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 blur-3xl pointer-events-none rounded-full" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl md:text-3xl font-black">Selamat datang kembali, {user?.full_name}! 👋</h2>
          <p className="text-xs text-blue-100/90 max-w-xl">
            Di sini Anda dapat memantau status pengerjaan dokumen, mengunduh file hasil, serta mengajukan revisi secara transparan.
          </p>
        </div>
        <Link 
          href="/dashboard/user/order" 
          className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-slate-50 px-5 py-3 rounded-xl text-xs font-bold shadow-md transition-all shrink-0 hover:-translate-y-0.5 active:translate-y-0 relative z-10"
        >
          <PlusCircle className="w-4 h-4" />
          Order Layanan Baru
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Pesanan', val: userOrders.length, icon: ClipboardCheck, color: 'text-blue-500 bg-blue-50' },
          { label: 'Pesanan Aktif', val: activeOrders.length, icon: Clock, color: 'text-purple-500 bg-purple-50' },
          { label: 'Selesai', val: completedOrders.length, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Bantuan CS', val: 'Aktif', icon: ShieldCheck, color: 'text-indigo-500 bg-indigo-50' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm card-lift animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
              <span className="text-xl font-extrabold text-slate-800">{stat.val}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Orders history & priority check */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Priority active order card */}
          {priorityActiveOrder && (
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-lg space-y-4 animate-scale-in">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase">PESANAN PRIORITAS</span>
                <span className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded text-white capitalize">{priorityActiveOrder.difficulty}</span>
              </div>
              <div>
                <h4 className="text-sm font-black truncate">{priorityActiveOrder.title}</h4>
                <p className="text-[10px] text-slate-355 line-clamp-2 mt-1 leading-relaxed">{priorityActiveOrder.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-700/60 pt-4 text-[10px] text-slate-300">
                <div>
                  <span className="block text-slate-455 text-[8px] font-bold uppercase">DEADLINE</span>
                  <span className="font-extrabold">{new Date(priorityActiveOrder.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="block text-slate-455 text-[8px] font-bold uppercase">STATUS TERBARU</span>
                  <span className="font-extrabold text-blue-300 capitalize">{priorityActiveOrder.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[8px] font-bold text-slate-300">
                  <span>Progress Pengerjaan</span>
                  <span>{priorityActiveOrder.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${priorityActiveOrder.progress}%` }} />
                </div>
              </div>

              <div className="pt-2">
                <Link 
                  href={`/dashboard/user/order/${priorityActiveOrder.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  Buka Detail Project
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* List order user */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Riwayat Pesanan Anda</h3>
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard/user/order" 
                  className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Buat Order Baru
                </Link>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-2 rounded-full">
                  {userOrders.length} Order
                </span>
              </div>
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-14 border border-dashed border-slate-200 rounded-2xl space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto">
                  <ClipboardCheck className="w-7 h-7 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">Belum ada pesanan</p>
                  <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                    Mulai dengan membuat pesanan pertama Anda. Admin akan mereview brief dan memberi estimasi harga.
                  </p>
                </div>
                <Link 
                  href="/dashboard/user/order"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4" />
                  Buat Pesanan Pertama
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {userOrders.map((ord) => (
                  <div key={ord.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {ord.order_code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[320px]" title={ord.title}>
                          {ord.title}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Deadline: {new Date(ord.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>Harga Final: {ord.final_price ? `Rp ${ord.final_price.toLocaleString('id-ID')}` : 'Menunggu Review'}</span>
                      </div>

                      {/* Progress Bar */}
                      {['in_progress', 'delivered', 'revision_requested', 'revision_in_progress'].includes(ord.status) && (
                        <div className="w-48 pt-1">
                          <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 mb-1">
                            <span>Progress Pengerjaan:</span>
                            <span className="text-blue-600 font-extrabold">{ord.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${ord.progress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                      {getStatusBadge(ord.status)}
                      <Link 
                        href={`/dashboard/user/order/${ord.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-colors"
                        title="Lihat Detail Pesanan"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar: Dynamic Info Widgets */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Quick CS Help Center */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
              Pusat Dukungan & Bantuan
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Memiliki pertanyaan khusus mengenai brief tugas, penawaran harga, atau butuh bantuan pengerjaan darurat akademik? Hubungi admin utama secara instan.
            </p>
            <a 
              href={`https://wa.me/${settings?.admin_whatsapp_number || '6281234567890'}?text=Halo%20Admin%20FlashWork,%20saya%20ingin%20konsultasi%20mengenai%20project...`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <Phone className="w-4 h-4 fill-white" />
              Hubungi Admin via WhatsApp
            </a>
          </div>

          {/* Community Forum Highlight Widget */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4.5 h-4.5 text-blue-500" />
              Diskusi Komunitas Hangat
            </h3>

            <div className="space-y-3">
              {threads.slice(0, 3).map((th) => (
                <div key={th.id} className="text-xs hover:bg-slate-50 p-2.5 rounded-xl transition-colors space-y-1 block">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">{th.category}</span>
                    <span className="text-[8px] text-slate-400 flex items-center gap-0.5">
                      <MessageCircle className="w-3 h-3" /> {th.replies_count || 0}
                    </span>
                  </div>
                  <Link href={`/forum/thread/${th.id}`} className="font-bold text-slate-800 hover:text-blue-600 line-clamp-1 transition-colors">
                    {th.title}
                  </Link>
                </div>
              ))}
            </div>

            <Link 
              href="/forum"
              className="w-full inline-flex items-center justify-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-2 border-t border-slate-100 text-center"
            >
              Buka Forum Diskusi
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* FAQs Helper */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle className="w-4.5 h-4.5 text-slate-500" />
              Panduan Pemula
            </h3>
            
            <div className="space-y-2 text-[10px] text-slate-500 leading-normal font-semibold">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-[8px] font-black">1</div>
                <p>Isi formulir dan upload brief tugas Anda di halaman pesanan.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-[8px] font-black">2</div>
                <p>Tunggu admin mereview brief & menerbitkan nominal tagihan final.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-[8px] font-black">3</div>
                <p>Scan QRIS Dinamis untuk memicu konfirmasi pembayaran instant lunas.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
