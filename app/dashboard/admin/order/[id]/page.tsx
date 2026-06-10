'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Calendar, ArrowLeft, ShieldCheck, Download, 
  AlertCircle, FileText, CheckCircle, RefreshCw,
  Upload, Check, ClipboardList, Info, Trash, X, Play, Settings as SettingsIcon
} from 'lucide-react';

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { 
    orders, payments, files, revisions, services, settings,
    approveOrder, rejectOrder, verifyPayment, updateOrderProgress, deliverOrder, completeOrder
  } = useApp();

  // Dialog / Form states
  const [priceInput, setPriceInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [progressInput, setProgressInput] = useState(50);
  const [previewFile, setPreviewFile] = useState('');
  const [finalFile, setFinalFile] = useState('');
  const [previewFileObj, setPreviewFileObj] = useState<File | null>(null);
  const [finalFileObj, setFinalFileObj] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Retrieve data
  const order = orders.find(ord => ord.id === id);
  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-base font-extrabold text-slate-800">Order Tidak Ditemukan</h3>
        <p className="text-xs text-slate-400">Order dengan ID {id} tidak terdaftar di sistem admin.</p>
        <Link 
          href="/dashboard/admin" 
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Overview
        </Link>
      </div>
    );
  }

  const payment = payments.find(p => p.order_id === order.id);
  const orderFiles = files.filter(f => f.order_id === order.id);
  const orderRevisions = revisions.filter(r => r.order_id === order.id);
  const service = services.find(s => s.id === order.service_id);

  const activeWorkload = orders.filter(x => x.status === 'in_progress').length;
  const maxActive = parseInt(settings.max_active_orders || '1');

  const getStatusStyle = (status: string) => {
    const maps: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Draft' },
      pending_review: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Menunggu Review Admin' },
      need_detail: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Butuh Detail Tambahan' },
      rejected: { bg: 'bg-red-50', text: 'text-red-500', label: 'Ditolak' },
      approved: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Disetujui' },
      waiting_payment: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Menunggu Pembayaran' },
      payment_review: { bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Bukti Bayar Ditinjau' },
      queued: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Masuk Antrean (Queued)' },
      in_progress: { bg: 'bg-blue-500 text-white', text: 'text-white', label: 'Sedang Diproses' },
      delivered: { bg: 'bg-emerald-500 text-white', text: 'text-white', label: 'Hasil Dikirim (Delivered)' },
      revision_requested: { bg: 'bg-teal-50', text: 'text-teal-600', label: 'Revisi Diminta' },
      revision_in_progress: { bg: 'bg-sky-50', text: 'text-sky-600', label: 'Revisi Sedang Diproses' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Selesai' },
      cancelled: { bg: 'bg-slate-100', text: 'text-slate-400', label: 'Dibatalkan' },
      failed: { bg: 'bg-red-50', text: 'text-red-500', label: 'Gagal / Kadaluarsa' }
    };
    return maps[status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status };
  };

  const statusStyle = getStatusStyle(order.status);

  // Actions
  const handleApprove = () => {
    const price = priceInput ? Number(priceInput) : order.estimated_price;
    if (isNaN(price) || price <= 0) {
      alert('Mohon masukkan harga final berupa nominal angka yang valid!');
      return;
    }
    approveOrder(order.id, price, noteInput);
    alert('Pesanan berhasil disetujui. Tagihan telah diterbitkan ke pelanggan.');
    setPriceInput('');
    setNoteInput('');
  };

  const handleReject = () => {
    if (!noteInput.trim()) {
      alert('Mohon tuliskan alasan penolakan di kolom catatan admin!');
      return;
    }
    rejectOrder(order.id, noteInput);
    alert('Pesanan telah ditolak.');
    setNoteInput('');
  };

  const handleStartWork = () => {
    if (activeWorkload >= maxActive) {
      if (!confirm(`Peringatan: Kapasitas kerja aktif saat ini penuh (${activeWorkload}/${maxActive}). Apakah Anda ingin memaksa memulai pengerjaan pesanan ini?`)) {
        return;
      }
    }
    updateOrderProgress(order.id, 10, 'Pekerjaan mulai dikerjakan secara aktif oleh admin.');
    order.status = 'in_progress';
    setActionSuccess('Status pesanan berhasil diubah menjadi Diproses (in_progress).');
  };

  const handleUpdateProgress = async () => {
    setIsSubmitting(true);
    await updateOrderProgress(order.id, progressInput, noteInput);
    setActionSuccess('Progress pengerjaan berhasil diperbarui!');
    setNoteInput('');
    setIsSubmitting(false);
  };

  const handleDeliver = async () => {
    if (!finalFileObj && !finalFile) {
      setActionSuccess('File final wajib diisi!');
      return;
    }
    setIsSubmitting(true);
    try {
      const { supabase } = await import('@/lib/supabase/client');
      
      let uploadedPreviewUrl = previewFile;
      let uploadedFinalUrl = finalFile;
      
      if (previewFileObj) {
        const fileExt = previewFileObj.name.split('.').pop();
        const fileName = `${Date.now()}_preview_${order.id}.${fileExt}`;
        const { error } = await supabase.storage.from('order-files').upload(fileName, previewFileObj);
        if (!error) {
          const { data } = supabase.storage.from('order-files').getPublicUrl(fileName);
          uploadedPreviewUrl = data.publicUrl;
        } else {
          console.error('Preview upload error:', error);
        }
      }
      
      if (finalFileObj) {
        const fileExt = finalFileObj.name.split('.').pop();
        const fileName = `${Date.now()}_final_${order.id}.${fileExt}`;
        const { error } = await supabase.storage.from('order-files').upload(fileName, finalFileObj);
        if (!error) {
          const { data } = supabase.storage.from('order-files').getPublicUrl(fileName);
          uploadedFinalUrl = data.publicUrl;
        } else {
          console.error('Final upload error:', error);
        }
      }

      let previewData: any = uploadedPreviewUrl;
      if (previewFileObj && uploadedPreviewUrl) {
        previewData = {
          url: uploadedPreviewUrl,
          name: previewFileObj.name,
          size: previewFileObj.size,
          type: previewFileObj.type || 'application/octet-stream'
        };
      }
      
      let finalData: any = uploadedFinalUrl;
      if (finalFileObj && uploadedFinalUrl) {
        finalData = {
          url: uploadedFinalUrl,
          name: finalFileObj.name,
          size: finalFileObj.size,
          type: finalFileObj.type || 'application/octet-stream'
        };
      }

      await deliverOrder(order.id, previewData || undefined, finalData);
      setActionSuccess('Hasil pekerjaan berhasil diunggah dan dikirim ke pelanggan!');
      setPreviewFile('');
      setFinalFile('');
      setPreviewFileObj(null);
      setFinalFileObj(null);
    } catch (error) {
      console.error(error);
      setActionSuccess('Gagal mengirim file.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/admin/queue" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Antrean Kerja
        </Link>

        {/* Workload Indicator */}
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm text-[10px] font-bold text-slate-600">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          Slot Aktif: <span className="text-blue-600">{activeWorkload}</span> / {maxActive}
        </div>
      </div>

      {/* Header Info */}
      {actionSuccess && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fade-in-up">
          <CheckCircle className="w-5 h-5" />
          {actionSuccess}
          <button onClick={() => setActionSuccess(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {order.order_code}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">{order.title}</h2>
          <p className="text-xs font-medium text-slate-400">
            Dibuat pada: {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Price status */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-right">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Harga Kesepakatan</span>
          <span className="text-lg font-black text-slate-800">
            {order.final_price ? `Rp ${order.final_price.toLocaleString('id-ID')}` : `Est. Rp ${order.estimated_price.toLocaleString('id-ID')}`}
          </span>
        </div>
      </div>

      {/* Admin Operations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Actions & Controls) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Action 1: Review & Price Setting */}
          {order.status === 'pending_review' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-yellow-500" />
                Review & Konfirmasi Harga Order
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Tentukan harga final dan catatan tambahan untuk dikirimkan kepada pelanggan. Pelanggan akan mendapatkan tagihan pembayaran setelah Anda menyetujui order ini.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Harga Estimasi Sistem</label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600">
                    Rp {order.estimated_price.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Set Harga Final (Rp)</label>
                  <input 
                    type="number" 
                    placeholder={`Contoh: ${order.estimated_price}`}
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Catatan Instruksi / Ketentuan Admin</label>
                <textarea 
                  rows={3} 
                  placeholder="Tuliskan spesifikasi pengerjaan, deadline konfirmasi, atau catatan revisi awal..."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 resize-none focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-4 pt-2">
                  <button 
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    Tolak / Minta Detail Tambahan
                  </button>
                  <button 
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    Setujui & Terbitkan Tagihan Harga
                  </button>
              </div>
            </div>
          )}

          {/* Action 2: Verify Payment */}
          {order.status === 'payment_review' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Verifikasi Pembayaran Pelanggan
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Pelanggan telah mengunggah bukti pembayaran. Silakan periksa keabsahan transfer berdasarkan data di bawah ini.
              </p>

              {payment && (
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Metode Pembayaran</span>
                      <span className="font-extrabold text-slate-700 uppercase">{payment.method.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Nominal Tagihan</span>
                      <span className="font-extrabold text-slate-700">Rp {payment.amount.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Tanggal Unggah</span>
                      <span className="font-extrabold text-slate-700">
                        {new Date(payment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {payment.proof_url && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Bukti Transfer (File Preview)</span>
                      <div className="border border-slate-200 rounded-xl p-3 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-5 h-5 text-indigo-500" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block truncate">{payment.proof_url.split('/').pop()}</span>
                            <span className="text-[9px] text-slate-400">Bukti Unggahan Pelanggan</span>
                          </div>
                        </div>
                        <a 
                          href={payment.proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Lihat File
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => {
                    verifyPayment(order.id, false);
                    alert('Bukti pembayaran ditolak.');
                  }}
                  className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all"
                >
                  Tolak Bukti Bayar
                </button>
                <button 
                  onClick={() => {
                    verifyPayment(order.id, true);
                    alert('Bukti pembayaran diverifikasi lunas!');
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Verifikasi & Setujui Lunas
                </button>
              </div>
            </div>
          )}

          {/* Action 3: Queued State Control */}
          {order.status === 'queued' && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Pesanan Berada di Antrean Penuh (Queued)
              </h3>
              <p className="text-xs text-amber-700 leading-normal">
                Pembayaran valid dan lunas, namun antrean kerja Anda saat ini penuh ({activeWorkload}/{maxActive} slot aktif). Pesanan akan secara otomatis berjalan ketika slot pesanan aktif lainnya diselesaikan. Anda dapat memaksa memulai pengerjaan jika memiliki waktu luang tambahan.
              </p>
              <button 
                onClick={handleStartWork}
                className="inline-flex items-center gap-2 py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" /> Paksa Mulai Kerja Sekarang
              </button>
            </div>
          )}

          {/* Manual Completion for Admin (If user forgets to click complete) */}
          {order.status === 'delivered' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 space-y-4 animate-scale-in">
              <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Pekerjaan Hasil Akhir Telah Dikirim
              </h3>
              <p className="text-xs text-emerald-700 leading-normal font-medium">
                Pekerjaan project telah terkirim. Jika pelanggan menyetujui atau lupa menekan tombol selesai di dasbor mereka, Anda dapat menandai pesanan ini selesai secara manual untuk menutup project.
              </p>
              <button 
                onClick={async () => {
                  if (confirm('Apakah Anda yakin ingin menyelesaikan pesanan ini secara manual?')) {
                    setIsSubmitting(true);
                    await completeOrder(order.id);
                    setActionSuccess('Pesanan berhasil diselesaikan secara manual!');
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-white" /> {isSubmitting ? 'Memproses...' : 'Selesaikan Pesanan (Manual)'}
              </button>
            </div>
          )}

          {/* Action 4: Progress & Work Update */}
          {['in_progress', 'revision_in_progress', 'revision_requested'].includes(order.status) && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                Update Progress & Pengerjaan Project
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">Atur Persentase Progress</span>
                    <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{progressInput}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={100} 
                    step={5}
                    value={progressInput}
                    onChange={e => setProgressInput(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Catatan/Log Progress Terbaru</label>
                  <textarea 
                    rows={2} 
                    placeholder="Contoh: Mengintegrasikan layout sidebar, menyusun Bab 1 pendahuluan..."
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 resize-none focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button 
                  onClick={handleUpdateProgress}
                  disabled={isSubmitting}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  Perbarui Progress Kerja
                </button>
              </div>
            </div>
          )}

          {/* Action 5: Final Submission (Delivery) */}
          {['in_progress', 'revision_in_progress', 'revision_requested', 'delivered'].includes(order.status) && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                Kirim File Hasil Pekerjaan (Delivery)
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Unggah hasil akhir project. Tentukan link preview (jika ada watermark/PDF) dan file ZIP final lengkap yang aman. Pelanggan baru dapat mengunduh berkas final setelah status pembayaran terverifikasi lunas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Upload Preview File (Watermark / PDF)</label>
                  <input 
                    type="file" 
                    onChange={e => setPreviewFileObj(e.target.files?.[0] || null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {!previewFileObj && (
                    <input 
                      type="text" 
                      placeholder="Atau masukkan URL..."
                      value={previewFile}
                      onChange={e => setPreviewFile(e.target.value)}
                      className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Upload Final File (ZIP/Asli) - Wajib</label>
                  <input 
                    type="file" 
                    onChange={e => setFinalFileObj(e.target.files?.[0] || null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {!finalFileObj && (
                    <input 
                      type="text" 
                      placeholder="Atau masukkan URL..."
                      value={finalFile}
                      onChange={e => setFinalFile(e.target.value)}
                      className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              </div>

              <button 
                onClick={handleDeliver}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                Upload & Kirim ke Dashboard Pelanggan
              </button>
            </div>
          )}

          {/* Section: Brief Detail */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              Rincian Spesifikasi & Brief Pelanggan
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Deskripsi Tugas / Brief</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-2xl whitespace-pre-wrap">
                  {order.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Layanan</span>
                  <span className="text-xs font-bold text-slate-700">{service?.name || 'Custom Digital Request'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batas Waktu (Deadline)</span>
                  <span className="text-xs font-bold text-slate-700">
                    {new Date(order.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tingkat Kesulitan</span>
                  <span className="text-xs font-bold text-slate-700 capitalize">{order.difficulty}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paket SLA</span>
                  <span className="text-xs font-bold text-slate-700 capitalize">{order.priority}</span>
                </div>
              </div>

              {/* Brief Attachments */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">File Brief yang Terunggah</span>
                {orderFiles.filter(f => f.file_category === 'user_attachment').length === 0 ? (
                  <span className="text-xs text-slate-400 font-medium italic">Tidak ada file lampiran brief dari user.</span>
                ) : (
                  orderFiles.filter(f => f.file_category === 'user_attachment').map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{file.file_name}</p>
                          <span className="text-[9px] text-slate-400">File Brief Pelanggan</span>
                        </div>
                      </div>
                      <a 
                        href={file.file_url} 
                        download
                        className="p-2 text-slate-500 hover:text-blue-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (Sidebar Details) */}
        <div className="lg:col-span-4 space-y-8 animate-fade-in-up">
          
          {/* Workload Control Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <SettingsIcon className="w-4.5 h-4.5 text-slate-500" />
              Workload Control Settings
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Beban Kerja Aktif:</span>
                <span className="font-bold text-slate-700">{activeWorkload} Pesanan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Batas Maksimal:</span>
                <span className="font-bold text-slate-700">{maxActive} Pesanan</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    activeWorkload >= maxActive ? 'bg-amber-500' : 'bg-blue-500'
                  }`} 
                  style={{ width: `${Math.min((activeWorkload / maxActive) * 100, 100)}%` }} 
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Sistem akan menahan pesanan berbayar yang baru masuk di antrean jika kapasitas kerja aktif penuh (`queued`).
              </p>
            </div>
          </div>

          {/* Revisions Control Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <RefreshCw className="w-4.5 h-4.5 text-slate-500" />
              Status Revisi Terbatas
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Batas Revisi Maksimal:</span>
                <span className="font-extrabold text-slate-700">{order.revision_limit}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Revisi yang Digunakan:</span>
                <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{order.revision_used}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium font-bold">Sisa Kuota Revisi:</span>
                <span className={`font-extrabold ${order.revision_limit - order.revision_used <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {Math.max(0, order.revision_limit - order.revision_used)}x
                </span>
              </div>
            </div>

            {/* Revisions list */}
            {orderRevisions.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Riwayat Pengajuan Revisi</span>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {orderRevisions.map((rev, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2 text-[11px]">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-700">Revisi #{rev.revision_number}</span>
                        <span className="text-[9px] text-slate-400">{new Date(rev.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <p className="text-slate-600 leading-normal">{rev.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Profile Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Info className="w-4.5 h-4.5 text-slate-500" />
              Profil Pelanggan
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200 uppercase shrink-0">
                P
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-slate-800 block truncate">Pelanggan FlashWork</span>
                <span className="text-[10px] text-slate-400 block font-medium">WhatsApp: {order.user_id === 'user-id-customer' ? '089988776655' : 'Terdaftar'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
