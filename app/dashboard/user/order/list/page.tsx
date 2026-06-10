'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import Link from 'next/link';
import { 
  ClipboardList, Calendar, Search, ChevronRight, 
  PlusCircle, AlertCircle
} from 'lucide-react';

export default function UserOrderListPage() {
  const { user, orders, payments } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const userOrders = orders.filter(ord => ord.user_id === user?.id);

  const filteredOrders = userOrders.filter(ord => {
    // Kategori filter status
    const isActive = ['pending_review', 'need_detail', 'approved', 'waiting_payment', 'payment_review', 'queued', 'in_progress', 'delivered', 'revision_requested', 'revision_in_progress'].includes(ord.status);
    
    if (filter === 'active' && !isActive) return false;
    if (filter === 'completed' && ord.status !== 'completed') return false;

    // Search query
    return ord.title.toLowerCase().includes(search.toLowerCase()) || ord.order_code.toLowerCase().includes(search.toLowerCase());
  });

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
      failed: { label: 'Batal / Kadaluarsa', cls: 'bg-red-50 text-red-600 border-red-100' },
    };

    const item = statusMap[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
    return (
      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${item.cls}`}>
        {item.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daftar Pesanan Saya</h2>
          <p className="text-xs text-slate-400 font-medium">Lihat seluruh riwayat pesanan bimbingan dan layanan digital Anda di FlashWork.</p>
        </div>
        <Link 
          href="/dashboard/user/order" 
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/15 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Pesan Baru
        </Link>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari kode atau judul pesanan..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'active', label: 'Aktif' },
            { id: 'completed', label: 'Selesai' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`flex-1 md:flex-none text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                filter === btn.id
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table/Cards container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400 font-bold">Tidak ada pesanan yang cocok dengan kriteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map(ord => {
              const pay = payments.find(p => p.order_id === ord.id);
              return (
                <div key={ord.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {ord.order_code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[320px]">
                        {ord.title}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline: {new Date(ord.deadline).toLocaleDateString('id-ID')}
                      </span>
                      <span>•</span>
                      <span>Harga Final: {ord.final_price ? `Rp ${ord.final_price.toLocaleString('id-ID')}` : 'Menunggu Review'}</span>
                    </div>

                    {/* Progress */}
                    {['in_progress', 'delivered', 'revision_requested', 'revision_in_progress'].includes(ord.status) && (
                      <div className="w-48 pt-1">
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
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
