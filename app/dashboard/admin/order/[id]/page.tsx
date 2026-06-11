'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  Sparkles, Calendar, ArrowLeft, ShieldCheck, Download, 
  AlertCircle, FileText, CheckCircle, RefreshCw,
  Upload, Check, ClipboardList, Info, X, Play, 
  Settings as SettingsIcon, User, Phone, Mail,
  Clock, DollarSign, TrendingUp, Zap, Eye, 
  PackageCheck, Loader2, ChevronRight, CreditCard, 
  RotateCcw, Ban, Star, Send
} from 'lucide-react';
import { Profile } from '@/lib/types';

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
  const [previewFileObj, setPreviewFileObj] = useState<File | null>(null);
  const [finalFileObj, setFinalFileObj] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState('');
  const [finalFile, setFinalFile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<Profile | null>(null);

  // Retrieve data
  const order = orders.find(ord => ord.id === id);

  // Load customer profile
  useEffect(() => {
    if (!order?.user_id) return;
    const fetchProfile = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', order.user_id)
          .single();
        if (data) setCustomerProfile(data as Profile);
      } catch (e) { /* silent */ }
    };
    fetchProfile();
  }, [order?.user_id]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800">Order Tidak Ditemukan</h3>
        <p className="text-xs text-slate-400">Order dengan ID {id} tidak terdaftar di sistem admin.</p>
        <Link 
          href="/dashboard/admin" 
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors"
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
  const maxActive = parseInt(settings.max_active_orders || '3');

  // Deadline urgency
  const daysLeft = Math.ceil((new Date(order.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const deadlineColor = daysLeft <= 1 ? 'text-red-600 bg-red-50' : daysLeft <= 3 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';

  const STATUS_MAP: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    draft:                { bg: 'bg-slate-100',   text: 'text-slate-600',  dot: 'bg-slate-400',   label: 'Draft' },
    pending_review:       { bg: 'bg-yellow-50',   text: 'text-yellow-700', dot: 'bg-yellow-500',  label: 'Menunggu Review' },
    need_detail:          { bg: 'bg-orange-50',   text: 'text-orange-700', dot: 'bg-orange-500',  label: 'Butuh Detail' },
    rejected:             { bg: 'bg-red-50',      text: 'text-red-600',    dot: 'bg-red-500',     label: 'Ditolak' },
    approved:             { bg: 'bg-blue-50',     text: 'text-blue-700',   dot: 'bg-blue-500',    label: 'Disetujui' },
    waiting_payment:      { bg: 'bg-purple-50',   text: 'text-purple-700', dot: 'bg-purple-500',  label: 'Menunggu Pembayaran' },
    payment_review:       { bg: 'bg-indigo-50',   text: 'text-indigo-700', dot: 'bg-indigo-500',  label: 'Verifikasi Bayar' },
    queued:               { bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-500',   label: 'Dalam Antrean' },
    in_progress:          { bg: 'bg-blue-500',    text: 'text-white',      dot: 'bg-white',       label: 'Sedang Diproses' },
    delivered:            { bg: 'bg-emerald-500', text: 'text-white',      dot: 'bg-white',       label: 'Delivered' },
    revision_requested:   { bg: 'bg-teal-50',     text: 'text-teal-700',   dot: 'bg-teal-500',    label: 'Revisi Diminta' },
    revision_in_progress: { bg: 'bg-sky-50',      text: 'text-sky-700',    dot: 'bg-sky-500',     label: 'Revisi Diproses' },
    completed:            { bg: 'bg-emerald-100', text: 'text-emerald-800',dot: 'bg-emerald-600', label: 'Selesai ✓' },
    cancelled:            { bg: 'bg-slate-100',   text: 'text-slate-500',  dot: 'bg-slate-400',   label: 'Dibatalkan' },
    failed:               { bg: 'bg-red-50',      text: 'text-red-600',    dot: 'bg-red-500',     label: 'Gagal' },
  };
  const statusStyle = STATUS_MAP[order.status] ?? { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', label: order.status };

  // ─── Action handlers ──────────────────────────────────────────────────────────

  const handleApprove = async () => {
    const price = priceInput ? Number(priceInput) : order.estimated_price;
    if (isNaN(price) || price <= 0) {
      toast.error('Masukkan harga final yang valid!');
      return;
    }
    setIsSubmitting(true);
    try {
      await approveOrder(order.id, price, noteInput);
      toast.success(`Pesanan disetujui! Tagihan Rp ${price.toLocaleString('id-ID')} telah diterbitkan ke pelanggan.`);
      setPriceInput('');
      setNoteInput('');
    } catch (e) {
      toast.error('Gagal menyetujui pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!noteInput.trim()) {
      toast.error('Tuliskan alasan penolakan terlebih dahulu!');
      return;
    }
    setIsSubmitting(true);
    try {
      await rejectOrder(order.id, noteInput);
      toast.success('Pesanan telah ditolak dan pelanggan dinotifikasi.');
      setNoteInput('');
    } catch (e) {
      toast.error('Gagal menolak pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWork = async () => {
    setIsSubmitting(true);
    try {
      await updateOrderProgress(order.id, 10, 'Pekerjaan mulai dikerjakan secara aktif.');
      toast.success('Status berubah ke In Progress. Semangat mengerjakan!');
    } catch (e) {
      toast.error('Gagal memulai pekerjaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgress = async () => {
    setIsSubmitting(true);
    try {
      await updateOrderProgress(order.id, progressInput, noteInput);
      toast.success(`Progress diperbarui ke ${progressInput}%!`);
      setNoteInput('');
    } catch (e) {
      toast.error('Gagal memperbarui progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliver = async () => {
    if (!finalFileObj && !finalFile) {
      toast.error('File final (ZIP/asli) wajib diisi!');
      return;
    }
    setIsSubmitting(true);
    try {
      const { supabase } = await import('@/lib/supabase/client');
      let uploadedPreviewUrl = previewFile;
      let uploadedFinalUrl = finalFile;

      if (previewFileObj) {
        const ext = previewFileObj.name.split('.').pop();
        const fname = `${Date.now()}_preview_${order.id}.${ext}`;
        const { error } = await supabase.storage.from('order-files').upload(fname, previewFileObj);
        if (!error) {
          const { data } = supabase.storage.from('order-files').getPublicUrl(fname);
          uploadedPreviewUrl = data.publicUrl;
        }
      }
      if (finalFileObj) {
        const ext = finalFileObj.name.split('.').pop();
        const fname = `${Date.now()}_final_${order.id}.${ext}`;
        const { error } = await supabase.storage.from('order-files').upload(fname, finalFileObj);
        if (!error) {
          const { data } = supabase.storage.from('order-files').getPublicUrl(fname);
          uploadedFinalUrl = data.publicUrl;
        }
      }

      const previewData = previewFileObj && uploadedPreviewUrl 
        ? { url: uploadedPreviewUrl, name: previewFileObj.name, size: previewFileObj.size, type: previewFileObj.type }
        : uploadedPreviewUrl;
      const finalData = finalFileObj && uploadedFinalUrl 
        ? { url: uploadedFinalUrl, name: finalFileObj.name, size: finalFileObj.size, type: finalFileObj.type }
        : uploadedFinalUrl;

      await deliverOrder(order.id, previewData || undefined, finalData);
      toast.success('Hasil pekerjaan berhasil diunggah dan dikirim ke pelanggan! 🎉');
      setPreviewFile(''); setFinalFile('');
      setPreviewFileObj(null); setFinalFileObj(null);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengirim file hasil pekerjaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPayment = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await verifyPayment(order.id, approved);
      if (approved) {
        toast.success('Pembayaran diverifikasi LUNAS! Pesanan masuk antrean pengerjaan.');
      } else {
        toast.error('Bukti pembayaran ditolak. Pelanggan telah dinotifikasi.');
      }
    } catch (e) {
      toast.error('Gagal memverifikasi pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteManual = async () => {
    setIsSubmitting(true);
    try {
      await completeOrder(order.id);
      toast.success('Pesanan diselesaikan secara manual. Project ditutup!');
    } catch (e) {
      toast.error('Gagal menyelesaikan pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Timeline ─────────────────────────────────────────────────────────────────
  const TIMELINE = [
    { key: 'pending_review', label: 'Review' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'payment_review', label: 'Verifikasi Bayar' },
    { key: 'in_progress', label: 'Diproses' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'completed', label: 'Selesai' },
  ];
  const tlIdx = TIMELINE.findIndex(t => t.key === order.status);
  const currentTlIdx = tlIdx >= 0 ? tlIdx : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Top nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link 
          href="/dashboard/admin/queue" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Antrean
        </Link>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full border ${activeWorkload >= maxActive ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            <div className={`w-2 h-2 rounded-full ${activeWorkload >= maxActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            Workload: {activeWorkload}/{maxActive} Aktif
          </div>
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg tracking-wide">
                {order.order_code}
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg capitalize">
                {service?.name || 'Custom'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg capitalize ${deadlineColor}`}>
                <Clock className="w-3 h-3 inline mr-1" />
                {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Overdue!'}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-800 leading-tight">{order.title}</h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Dibuat: {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 text-right min-w-[140px]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Nilai Project</span>
              <span className="text-xl font-black block">
                {order.final_price ? `Rp ${order.final_price.toLocaleString('id-ID')}` : `~Rp ${order.estimated_price.toLocaleString('id-ID')}`}
              </span>
              <span className="text-[9px] text-slate-400">{order.final_price ? 'Harga Final' : 'Estimasi Sistem'}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="pt-2">
          <div className="flex items-center gap-0">
            {TIMELINE.map((step, idx) => {
              const isDone = idx < currentTlIdx;
              const isCurrent = idx === currentTlIdx;
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-1 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black transition-all border-2 ${
                      isDone ? 'bg-blue-600 border-blue-600 text-white' :
                      isCurrent ? 'bg-white border-blue-600 text-blue-600 shadow-lg shadow-blue-200' :
                      'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className={`text-[8px] font-bold whitespace-nowrap ${isCurrent ? 'text-blue-600' : isDone ? 'text-slate-500' : 'text-slate-300'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < TIMELINE.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 mx-1 rounded-full transition-all ${isDone ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left column — Actions */}
        <div className="lg:col-span-8 space-y-6">

          {/* Action: Review & Approve */}
          {order.status === 'pending_review' && (
            <div className="bg-white border border-yellow-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Review & Konfirmasi Harga</h3>
                  <p className="text-[11px] text-slate-400">Tentukan harga final dan kirim tagihan ke pelanggan.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Estimasi Sistem</label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-extrabold text-slate-700">
                    Rp {order.estimated_price.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Set Harga Final (Rp)</label>
                  <input 
                    type="number" 
                    placeholder={`${order.estimated_price}`}
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm font-extrabold text-slate-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Catatan Admin (Instruksi / Ketentuan)</label>
                <textarea 
                  rows={3} 
                  placeholder="Tuliskan spesifikasi pengerjaan, catatan revisi awal, atau ketentuan tambahan..."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs font-semibold text-slate-800 resize-none focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button 
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" /> Tolak Pesanan
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Setujui & Terbitkan Tagihan
                </button>
              </div>
            </div>
          )}

          {/* Action: Verify Payment */}
          {order.status === 'payment_review' && (
            <div className="bg-white border border-indigo-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Verifikasi Pembayaran</h3>
                  <p className="text-[11px] text-slate-400">Pelanggan telah mengunggah bukti bayar. Periksa dan konfirmasi.</p>
                </div>
              </div>

              {payment && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Metode</span>
                      <span className="font-extrabold text-slate-700 uppercase">{payment.method.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Nominal</span>
                      <span className="font-extrabold text-slate-700">Rp {payment.amount.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Diunggah</span>
                      <span className="font-extrabold text-slate-700">
                        {new Date(payment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {payment.proof_url && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase mb-2">Bukti Transfer</span>
                      {payment.proof_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <div className="rounded-xl overflow-hidden border border-slate-200">
                          <img src={payment.proof_url} alt="Bukti bayar" className="w-full max-h-48 object-contain bg-white" />
                        </div>
                      ) : (
                        <div className="border border-slate-200 rounded-xl p-3 bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-800 truncate">{payment.proof_url.split('/').pop()}</span>
                          </div>
                          <a 
                            href={payment.proof_url} target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Lihat
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => handleVerifyPayment(false)}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Tolak Bukti Bayar
                </button>
                <button 
                  onClick={() => handleVerifyPayment(true)}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Verifikasi Lunas ✓
                </button>
              </div>
            </div>
          )}

          {/* Action: Queued — Start Work */}
          {order.status === 'queued' && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-800">Pesanan dalam Antrean</h3>
                  <p className="text-xs text-amber-700 leading-relaxed mt-1">
                    Pembayaran sudah lunas, namun slot aktif penuh ({activeWorkload}/{maxActive}). 
                    Pesanan akan otomatis mulai saat slot kosong.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleStartWork}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 py-2.5 px-5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                Paksa Mulai Sekarang
              </button>
            </div>
          )}

          {/* Action: Progress Update */}
          {['in_progress', 'revision_in_progress', 'revision_requested'].includes(order.status) && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Update Progress Pengerjaan</h3>
                  <p className="text-[11px] text-slate-400">Update persentase dan catatan kerja yang tampil di dashboard pelanggan.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">Persentase Progress</span>
                  <span className="font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">{progressInput}%</span>
                </div>
                <input 
                  type="range" min={0} max={100} step={5}
                  value={progressInput}
                  onChange={e => setProgressInput(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all" style={{ width: `${progressInput}%` }} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Catatan Progress / Log Kerja</label>
                <textarea 
                  rows={2} 
                  placeholder="Contoh: Mengintegrasikan layout sidebar, menyelesaikan Bab 2..."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs font-semibold text-slate-800 resize-none focus:outline-none"
                />
              </div>

              <button 
                onClick={handleUpdateProgress}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Perbarui Progress
              </button>
            </div>
          )}

          {/* Action: Deliver Files */}
          {['in_progress', 'revision_in_progress', 'revision_requested', 'delivered'].includes(order.status) && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Kirim File Hasil Pekerjaan</h3>
                  <p className="text-[11px] text-slate-400">Upload dan deliver hasil ke pelanggan. File final terkunci sampai pembayaran lunas.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Preview File (Watermark/PDF)</label>
                  <label className="flex items-center gap-2 w-full border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 cursor-pointer transition-colors group">
                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 truncate">
                      {previewFileObj ? previewFileObj.name : 'Pilih file preview...'}
                    </span>
                    <input type="file" className="hidden" onChange={e => setPreviewFileObj(e.target.files?.[0] || null)} />
                  </label>
                  {!previewFileObj && (
                    <input 
                      type="text" placeholder="Atau URL preview..."
                      value={previewFile}
                      onChange={e => setPreviewFile(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Final File (ZIP/Asli) — Wajib</label>
                  <label className="flex items-center gap-2 w-full border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-xl p-3 cursor-pointer transition-colors group">
                    <PackageCheck className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-700 truncate">
                      {finalFileObj ? finalFileObj.name : 'Pilih file final...'}
                    </span>
                    <input type="file" className="hidden" onChange={e => setFinalFileObj(e.target.files?.[0] || null)} />
                  </label>
                  {!finalFileObj && (
                    <input 
                      type="text" placeholder="Atau URL file final..."
                      value={finalFile}
                      onChange={e => setFinalFile(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              </div>

              <button 
                onClick={handleDeliver}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Upload & Kirim ke Dashboard Pelanggan
              </button>
            </div>
          )}

          {/* Action: Manual complete */}
          {order.status === 'delivered' && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-800">Hasil sudah dikirim ke pelanggan</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Jika pelanggan lupa klik selesai, Anda bisa tutup project secara manual.</p>
              </div>
              <button 
                onClick={handleCompleteManual}
                disabled={isSubmitting}
                className="shrink-0 inline-flex items-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Selesaikan Manual
              </button>
            </div>
          )}

          {/* Brief Detail */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              Spesifikasi & Brief Pelanggan
            </h3>

            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Deskripsi Brief</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-2xl whitespace-pre-wrap">
                  {order.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Layanan', val: service?.name || 'Custom' },
                  { label: 'Deadline', val: new Date(order.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  { label: 'Kesulitan', val: order.difficulty },
                  { label: 'Prioritas SLA', val: order.priority },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{item.label}</span>
                    <span className="text-xs font-bold text-slate-700 capitalize">{item.val}</span>
                  </div>
                ))}
              </div>

              {order.admin_note && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Catatan Admin Sebelumnya</span>
                  <p className="text-xs text-blue-800 font-medium leading-relaxed">{order.admin_note}</p>
                </div>
              )}

              {/* Brief files */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">File Brief Pelanggan</span>
                {orderFiles.filter(f => f.file_category === 'user_attachment').length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center">
                    <span className="text-xs text-slate-400 italic">Tidak ada file lampiran dari pelanggan.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orderFiles.filter(f => f.file_category === 'user_attachment').map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{file.file_name}</p>
                            <span className="text-[9px] text-slate-400">
                              {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'Brief Pelanggan'}
                            </span>
                          </div>
                        </div>
                        <a 
                          href={file.file_url} download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold transition-all"
                        >
                          <Download className="w-3 h-3" /> Unduh
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivered files */}
              {orderFiles.filter(f => ['admin_preview', 'admin_final'].includes(f.file_category)).length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">File Hasil Terkirim</span>
                  <div className="space-y-2">
                    {orderFiles.filter(f => ['admin_preview', 'admin_final'].includes(f.file_category)).map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-emerald-200 rounded-xl bg-emerald-50/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${file.file_category === 'admin_final' ? 'bg-emerald-100' : 'bg-teal-100'}`}>
                            <PackageCheck className={`w-4 h-4 ${file.file_category === 'admin_final' ? 'text-emerald-600' : 'text-teal-600'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{file.file_name}</p>
                            <span className="text-[9px] text-emerald-600 font-bold">{file.file_category === 'admin_final' ? 'File Final' : 'Preview'}</span>
                          </div>
                        </div>
                        <a 
                          href={file.file_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold transition-all"
                        >
                          <Eye className="w-3 h-3" /> Lihat
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-5">

          {/* Customer Profile */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Profil Pelanggan
            </h3>
            {customerProfile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-200">
                    {customerProfile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-slate-800 block">{customerProfile.full_name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Pelanggan FlashWork</span>
                  </div>
                </div>
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  {customerProfile.phone && (
                    <a 
                      href={`https://wa.me/${customerProfile.phone.replace(/\D/g,'')}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      {customerProfile.phone}
                    </a>
                  )}
                  {customerProfile.email && (
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      {customerProfile.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Bergabung {new Date(customerProfile.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <a 
                  href={`https://wa.me/${customerProfile.phone?.replace(/\D/g,'')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" /> Hubungi via WhatsApp
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                <div className="space-y-2">
                  <div className="w-28 h-3 bg-slate-200 rounded" />
                  <div className="w-20 h-2 bg-slate-100 rounded" />
                </div>
              </div>
            )}
          </div>

          {/* Payment Info */}
          {payment && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-500" /> Info Pembayaran
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Status', val: payment.status.replace('_', ' ').toUpperCase(), color: payment.status === 'paid' ? 'text-emerald-600 font-extrabold' : payment.status === 'unpaid' ? 'text-red-500' : 'text-amber-600' },
                  { label: 'Jumlah', val: `Rp ${payment.amount.toLocaleString('id-ID')}`, color: 'text-slate-800 font-extrabold' },
                  { label: 'Metode', val: payment.method.replace('_', ' '), color: 'text-slate-700' },
                  { label: 'Dibuat', val: new Date(payment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), color: 'text-slate-500' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">{item.label}</span>
                    <span className={item.color}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workload */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-slate-500" /> Workload
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Slot Aktif</span>
                <span className="font-bold text-slate-700">{activeWorkload}/{maxActive}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${activeWorkload >= maxActive ? 'bg-amber-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min((activeWorkload / maxActive) * 100, 100)}%` }} 
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Pesanan berbayar baru akan masuk antrean jika slot penuh.
              </p>
            </div>
          </div>

          {/* Revisions */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-500" /> Kuota Revisi
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Batas Revisi</span>
                <span className="font-bold text-slate-700">{order.revision_limit}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Terpakai</span>
                <span className="font-bold text-orange-600">{order.revision_used}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sisa</span>
                <span className={`font-extrabold ${order.revision_limit - order.revision_used <= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {Math.max(0, order.revision_limit - order.revision_used)}x
                </span>
              </div>
            </div>

            {orderRevisions.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2 max-h-52 overflow-y-auto pr-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Riwayat Revisi</span>
                {orderRevisions.map((rev, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-700">Revisi #{rev.revision_number}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        rev.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 
                        rev.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{rev.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-normal">{rev.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
