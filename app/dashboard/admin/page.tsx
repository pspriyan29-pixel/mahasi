'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import Link from 'next/link';
import { 
  ClipboardList, RefreshCw, DollarSign, Clock, 
  ArrowRight, Users, CheckSquare, Settings as SettingsIcon,
  ShieldAlert, Activity, ToggleLeft, ToggleRight, Sparkles, TrendingUp
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { orders, payments, verifyPayment, settings, updateSetting } = useApp();

  // Dialog / State settings local
  const [maxActiveOrders, setMaxActiveOrders] = useState(Number(settings.max_active_orders || '1'));
  const [isModeSibuk, setIsModeSibuk] = useState(settings.mode_sibuk === 'true');

  React.useEffect(() => {
    setMaxActiveOrders(Number(settings.max_active_orders || '1'));
    setIsModeSibuk(settings.mode_sibuk === 'true');
  }, [settings]);

  // Statistics
  const pendingReviewOrders = orders.filter(ord => ord.status === 'pending_review');
  const pendingPaymentReviews = orders.filter(ord => ord.status === 'payment_review');
  const activeProgressOrders = orders.filter(ord => ord.status === 'in_progress' || ord.status === 'revision_in_progress');
  
  // Total income (paid payments)
  const totalIncome = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; cls: string }> = {
      draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600' },
      pending_review: { label: 'Review Brief', cls: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
      need_detail: { label: 'Butuh Detail', cls: 'bg-orange-50 text-orange-600 border-orange-100' },
      rejected: { label: 'Ditolak', cls: 'bg-red-50 text-red-600 border-red-100' },
      approved: { label: 'Disetujui', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
      waiting_payment: { label: 'Menunggu Bayar', cls: 'bg-purple-50 text-purple-600 border-purple-100' },
      payment_review: { label: 'Review Bayar', cls: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
      queued: { label: 'Di Antrean', cls: 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' },
      in_progress: { label: 'Diproses', cls: 'bg-blue-500 text-white border-blue-600' },
      delivered: { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
      revision_requested: { label: 'Revisi Masuk', cls: 'bg-teal-50 text-teal-600 border-teal-100' },
      revision_in_progress: { label: 'Revisi Diproses', cls: 'bg-sky-50 text-sky-600 border-sky-100' },
      completed: { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-800' }
    };

    const item = statusMap[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${item.cls}`}>
        {item.label}
      </span>
    );
  };

  const handleUpdateWorkload = async (newLimit: number) => {
    setMaxActiveOrders(newLimit);
    await updateSetting('max_active_orders', newLimit.toString());
  };

  const handleToggleModeSibuk = async () => {
    const nextVal = !isModeSibuk;
    setIsModeSibuk(nextVal);
    await updateSetting('mode_sibuk', nextVal.toString());
  };

  // Hitung pendapatan per bulan dari payments yang sudah paid (data real)
  const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = new Date().getFullYear();
  const monthlyData = MONTHS_ID.map((month, idx) => {
    const sales = payments
      .filter(p => p.status === 'paid' && p.paid_at)
      .filter(p => {
        const d = new Date(p.paid_at!);
        return d.getFullYear() === currentYear && d.getMonth() === idx;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    return { month, sales };
  });
  const maxSales = Math.max(...monthlyData.map(d => d.sales), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ringkasan Bisnis FlashWork</h2>
          <p className="text-xs text-slate-400 font-medium">Panel kontrol eksekutif untuk memantau pesanan masuk, administrasi pembayaran, dan performa keuangan.</p>
        </div>
        
        {/* Busy mode banner info */}
        {isModeSibuk && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-bold shadow-sm animate-pulse">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            Mode Sibuk Aktif
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Review Pesanan', val: pendingReviewOrders.length, icon: ClipboardList, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Pengecekan Bayar', val: pendingPaymentReviews.length, icon: RefreshCw, color: 'text-indigo-600 bg-indigo-50 animate-spin-slow' },
          { label: 'Sedang Dikerjakan', val: activeProgressOrders.length, icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Pendapatan', val: `Rp ${totalIncome.toLocaleString('id-ID')}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' }
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

      {/* Admin Central Configuration (Workload & Busy Mode Settings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Workload Control & Sibuk Toggle */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in-up delay-150">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <SettingsIcon className="w-4.5 h-4.5 text-blue-600" />
            Konfigurasi Workload Instan
          </h3>

          {/* Slider Workload Capacity */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-500">Maks Slot Aktif</span>
              <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{maxActiveOrders} Order</span>
            </div>
            <input 
              type="range" 
              min={1} 
              max={5} 
              step={1}
              value={maxActiveOrders}
              onChange={e => handleUpdateWorkload(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[9px] text-slate-400 leading-normal">
              Mengubah kapasitas antrean kerja maksimal admin yang berjalan aktif.
            </p>
          </div>

          {/* Mode Sibuk Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 block">Mode Sibuk Admin</span>
              <span className="text-[9px] text-slate-400 block font-semibold">Beri peringatan order di client</span>
            </div>
            <button 
              onClick={handleToggleModeSibuk}
              className="text-slate-500 transition-colors"
            >
              {isModeSibuk ? (
                <ToggleRight className="w-9 h-9 text-red-500 cursor-pointer" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-300 cursor-pointer" />
              )}
            </button>
          </div>
        </div>

        {/* Visual Sales Chart (Monthly) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in-up delay-200">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
            Statistik Pendapatan Bulanan ({currentYear})
          </h3>
          
          {totalIncome === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-slate-200 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400 font-bold">Belum ada pendapatan yang tercatat</p>
              <p className="text-[10px] text-slate-300 mt-1">Data akan muncul setelah ada pembayaran lunas</p>
            </div>
          ) : (
            <div className="flex justify-between items-end h-44 pt-6 border-b border-slate-200 px-4">
              {monthlyData.map((item, index) => {
                const heightPct = maxSales > 0 ? Math.max((item.sales / maxSales) * 100, item.sales > 0 ? 8 : 0) : 0;
                return (
                  <div key={index} className="flex flex-col items-center gap-2 group w-1/12 relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-8 whitespace-nowrap pointer-events-none shadow-md z-10">
                      Rp {item.sales.toLocaleString('id-ID')}
                    </div>
                    <div
                      className="w-5 rounded-t-lg transition-all duration-500 bg-gradient-to-t from-blue-500 to-indigo-500 group-hover:from-indigo-600 group-hover:to-purple-600 shadow-md"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] font-bold text-slate-400">{item.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Lists Panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Review Orders */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Menunggu Review Brief</h3>
            <span className="text-[10px] font-extrabold bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">
              {pendingReviewOrders.length} Baru
            </span>
          </div>

          {pendingReviewOrders.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-400 font-bold">Semua pesanan baru telah ditinjau.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingReviewOrders.map(ord => (
                <div key={ord.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {ord.order_code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[200px]" title={ord.title}>
                        {ord.title}
                      </h4>
                    </div>
                    <span className="text-[9px] text-slate-400 block font-medium">
                      Est. Harga: Rp {ord.estimated_price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <Link 
                    href={`/dashboard/admin/order/${ord.id}`}
                    className="shrink-0 inline-flex items-center justify-center text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Review
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Payment Reviews */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Verifikasi Transfer Pembayaran</h3>
            <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
              {pendingPaymentReviews.length} Perlu Verifikasi
            </span>
          </div>

          {pendingPaymentReviews.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-400 font-bold">Tidak ada pembayaran yang tertunda.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingPaymentReviews.map(ord => {
                const pay = payments.find(p => p.order_id === ord.id);
                return (
                  <div key={ord.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {ord.order_code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[200px]">
                          {ord.title}
                        </h4>
                      </div>
                      <span className="text-[9px] text-slate-400 block font-bold text-indigo-600">
                        Nominal Transfer: Rp {pay?.amount.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex gap-1.5 shrink-0 items-center">
                      <Link
                        href={`/dashboard/admin/order/${ord.id}`}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"
                      >
                        Detail
                      </Link>
                      <button 
                        onClick={async () => {
                          await verifyPayment(ord.id, false);
                        }}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Tolak
                      </button>
                      <button 
                        onClick={async () => {
                          await verifyPayment(ord.id, true);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm"
                      >
                        Setujui
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
