'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Sparkles, Calendar, ArrowRight, ShieldCheck, Download, 
  HelpCircle, AlertCircle, FileText, CheckCircle, RefreshCcw,
  QrCode, CreditCard, Upload, Check, ClipboardList, Info, Loader2
} from 'lucide-react';

export default function UserOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { 
    orders, payments, files, revisions, payOrder, requestRevision, user, services, verifyPayment, completeOrder
  } = useApp();

  const [paymentFile, setPaymentFile] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  // KlikQRIS states
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [qrisLoading, setQrisLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Retrieve states
  const order = orders.find(ord => ord.id === id);
  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">Order Tidak Ditemukan</h3>
        <p className="text-xs text-slate-400">Order dengan ID {id} tidak terdaftar di sistem.</p>
      </div>
    );
  }

  const payment = payments.find(p => p.order_id === order.id);
  const orderFiles = files.filter(f => f.order_id === order.id);
  const orderRevisions = revisions.filter(r => r.order_id === order.id);
  const service = services.find(s => s.id === order.service_id);

  // Handle Payment Submit
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFile) {
      toast.error('Mohon pilih file bukti transfer/pembayaran!');
      return;
    }
    payOrder(order.id, paymentFile);
    toast.success('Bukti pembayaran berhasil diunggah! Status berubah menjadi Pengecekan Bayar.');
  };

  // Guard to prevent duplicate auto-generate calls
  const qrisCalledRef = useRef(false);

  const generateQris = useCallback(async () => {
    const payAmount = payment?.amount || order?.final_price;
    if (!payAmount || !order) return;
    setQrisLoading(true);
    try {
      const response = await fetch('/api/payments/create-qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.order_code,
          amount: payAmount,
          keterangan: `Pembayaran Project FlashWork ${order.order_code}`
        })
      });
      const data = await response.json();
      if (data.status) {
        setQrisImage(data.data.qris_image || data.data.qris_url);
        setTotalAmount(Number(data.data.total_amount));
        setSignature(data.data.signature);
        toast.success('QRIS siap! Silakan scan untuk membayar.');
      } else {
        toast.error('Gagal menghasilkan QRIS: ' + data.message);
        qrisCalledRef.current = false; // allow retry
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saat menghubungkan ke gateway pembayaran.');
      qrisCalledRef.current = false; // allow retry
    } finally {
      setQrisLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.order_code, order?.final_price, payment?.amount]);

  // KlikQRIS integrations
  React.useEffect(() => {
    if (signature) {
      const script = document.createElement('script');
      script.src = "https://klikqris.com/js/payment-snap.js?t=" + new Date().getTime();
      document.body.appendChild(script);
    }
  }, [signature]);

  // Auto-generate QRIS when order is waiting_payment — runs as soon as data is ready
  React.useEffect(() => {
    if (
      order?.status === 'waiting_payment' &&
      !qrisImage &&
      !qrisCalledRef.current &&
      (payment?.status === 'unpaid' || order?.final_price)
    ) {
      qrisCalledRef.current = true;
      generateQris();
    }
  }, [order?.status, order?.final_price, payment?.status, qrisImage, generateQris]);


  const handleCheckQrisStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await fetch(`/api/payments/check-status?orderId=${order.order_code}`);
      const data = await response.json();
      if (data.status && (data.data.status === 'SUCCESS' || data.data.status === 'PAID')) {
        await verifyPayment(order.id, true);
        toast.success('Pembayaran terdeteksi LUNAS! Status pesanan otomatis diproses.');
      } else {
        toast.info(`Status pembayaran saat ini: ${data.data?.status || 'PENDING'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memverifikasi status pembayaran.');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Handle Revision Submit
  const handleRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote.trim()) {
      toast.error('Mohon tulis catatan revisi!');
      return;
    }
    requestRevision(order.id, revisionNote);
    setRevisionNote('');
    setShowRevisionForm(false);
    toast.success('Revisi berhasil dikirimkan ke Admin!');
  };

  // Timeline steps
  const getTimelineStep = () => {
    switch (order.status) {
      case 'pending_review': return 1;
      case 'need_detail': return 1;
      case 'rejected': return 0;
      case 'approved': return 2;
      case 'waiting_payment': return 2;
      case 'payment_review': return 3;
      case 'queued': return 4;
      case 'in_progress': return 5;
      case 'delivered': return 6;
      case 'revision_requested': return 6;
      case 'revision_in_progress': return 6;
      case 'completed': return 7;
      default: return 1;
    }
  };

  const currentStep = getTimelineStep();

  const getStatusStyle = (status: string) => {
    const maps: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Draft' },
      pending_review: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Menunggu Review Admin' },
      need_detail: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Butuh Detail Tambahan' },
      rejected: { bg: 'bg-red-50', text: 'text-red-500', label: 'Ditolak' },
      approved: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Disetujui' },
      waiting_payment: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Menunggu Pembayaran' },
      payment_review: { bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Bukti Bayar Ditinjau' },
      queued: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Masuk Antrean Penuh' },
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* Header Info */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
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

        {/* Big Price Tag */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-right">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Harga Akhir Kesepakatan</span>
          <span className="text-lg font-black text-slate-800">
            {order.final_price ? `Rp ${order.final_price.toLocaleString('id-ID')}` : 'Menunggu Review'}
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-x-auto animate-fade-in-up delay-100">
        <div className="flex items-center justify-between min-w-[600px] py-2">
          {[
            { step: 1, label: 'Review Brief' },
            { step: 2, label: 'Pembayaran' },
            { step: 3, label: 'Verifikasi' },
            { step: 4, label: 'Antrean' },
            { step: 5, label: 'Diproses' },
            { step: 6, label: 'Delivered' },
            { step: 7, label: 'Selesai' }
          ].map((item, idx) => {
            const isDone = currentStep >= item.step;
            const isCurrent = currentStep === item.step;
            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                    {isDone ? <Check className="w-4 h-4" /> : item.step}
                  </div>
                  <span className={`text-[10px] font-bold ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>{item.label}</span>
                </div>
                {idx < 6 && (
                  <div className={`flex-1 h-0.5 min-w-[40px] -mt-5 ${currentStep > item.step ? 'bg-blue-600' : 'bg-slate-100'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Dashboard details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Brief & Files) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Brief Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in-up delay-200">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ClipboardList className="w-4.5 h-4.5 text-blue-500" />
              Detail Brief & Spesifikasi
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Deskripsi Brief</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-2xl whitespace-pre-wrap">
                  {order.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori</span>
                  <span className="text-xs font-bold text-slate-700">{service?.name || 'Layanan'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batas Waktu (Deadline)</span>
                  <span className="text-xs font-bold text-slate-700">
                    {new Date(order.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kesulitan</span>
                  <span className="text-xs font-bold text-slate-700 capitalize">{order.difficulty}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLA Prioritas</span>
                  <span className="text-xs font-bold text-slate-700 capitalize">{order.priority}</span>
                </div>
              </div>

              {/* Brief Attachments */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Berkas Brief Terunggah</span>
                {orderFiles.filter(f => f.file_category === 'user_attachment').map((file, idx) => (
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
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-500 hover:text-blue-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors inline-block"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* File Vault (Final Delivery) */}
          {['delivered', 'completed', 'revision_requested', 'revision_in_progress'].includes(order.status) && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in-up delay-300">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                File Vault (Pengiriman File Hasil)
              </h3>

              <div className="space-y-4">
                {/* Check lunas */}
                {payment?.status !== 'paid' ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs leading-normal">
                      <p className="font-bold">File Final Terkunci</p>
                      <p className="opacity-90">Selesaikan pembayaran terlebih dahulu agar Anda dapat mengunduh berkas pekerjaan final lengkap.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs leading-normal">
                      <p className="font-bold">Pembayaran Lunas - Akses File Terbuka</p>
                      <p className="opacity-90">Terima kasih, pembayaran Anda telah lunas. Anda dapat mengunduh file final di bawah ini.</p>
                    </div>
                  </div>
                )}

                {/* List Files */}
                <div className="space-y-3">
                  {orderFiles.filter(f => ['admin_preview', 'admin_final'].includes(f.file_category)).map((file, idx) => {
                    const isLocked = file.file_category === 'admin_final' && payment?.status !== 'paid';
                    return (
                      <div key={idx} className={`flex items-center justify-between p-3 border rounded-xl ${
                        isLocked ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white hover:shadow-sm'
                      }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className={`w-5 h-5 shrink-0 ${isLocked ? 'text-slate-400' : 'text-emerald-500'}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{file.file_name}</p>
                            <span className="text-[9px] text-slate-400">
                              {file.file_category === 'admin_preview' ? 'Preview Watermark (PDF)' : 'File Hasil Akhir Lengkap'}
                            </span>
                          </div>
                        </div>
                        <button 
                          disabled={isLocked}
                          onClick={() => {
                            if (isLocked) {
                              alert('Pembayaran belum dikonfirmasi lunas.');
                              return;
                            }
                            window.open(file.file_url, '_blank');
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isLocked 
                              ? 'text-slate-300 bg-slate-100 border border-slate-200 cursor-not-allowed'
                              : 'text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (Payment & Revision Control) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Payment & Invoice Card */}
          {(payment || ['approved', 'waiting_payment', 'payment_review'].includes(order.status)) && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in-up delay-200">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-purple-500" />
                Status Invoice & QRIS
              </h3>

              {(!payment || payment.status === 'unpaid') && (
                <div className="space-y-4">
                  {/* QRIS dinamis dari KlikQRIS */}
                  {!qrisImage ? (
                    <div className="space-y-4 text-center">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Metode Pembayaran Instan</span>
                        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-3">
                          <QrCode className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-slate-500 text-center leading-normal">
                          {qrisLoading ? 'Sedang menyiapkan QRIS dinamis...' : 'Sistem sedang menyiapkan QRIS untuk pembayaran otomatis instan via GoPay, OVO, Dana, LinkAja, ShopeePay, atau Mobile Banking.'}
                        </span>
                        {qrisLoading && (
                          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-blue-600">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Memproses...
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center space-y-4 animate-scale-in">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">PINDAI QRIS UNTUK MEMBAYAR</span>
                      
                      <div className="bg-white border border-slate-300 rounded-2xl p-3 shadow-md relative group">
                        {/* Jika qrisImage berupa data URL Base64 atau URL biasa */}
                        <img 
                          src={qrisImage} 
                          alt="KlikQRIS Dynamic QR Code" 
                          className="w-44 h-44 object-contain rounded-lg"
                        />
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] text-slate-550 block font-semibold">Total Tagihan (termasuk kode unik):</span>
                        <span className="text-lg font-black text-blue-600 block mt-0.5">
                          Rp {(totalAmount || payment?.amount || order.final_price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Snap button overlay */}
                      {signature && (
                        <button 
                          id="btnPay" 
                          data-signature={signature} 
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md text-center"
                        >
                          Tampilkan Overlay Snap
                        </button>
                      )}

                      {/* Manual verification button */}
                      <button
                        onClick={handleCheckQrisStatus}
                        disabled={checkingStatus}
                        className="w-full inline-flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                      >
                        {checkingStatus ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            Memverifikasi Transaksi...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Saya Sudah Membayar
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => {
                          setQrisImage(null);
                          setSignature(null);
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Batal & Buat Ulang
                      </button>
                    </div>
                  )}

                  {/* Manual proof fallback */}
                  <div className="relative flex items-center justify-center py-2">
                    <div className="border-t border-slate-100 w-full" />
                    <span className="bg-white px-3 text-[9px] font-black text-slate-400 uppercase tracking-wider absolute">ATAU TRANSFER MANUAL</span>
                  </div>

                  <form onSubmit={handlePayment} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unggah Bukti Transfer</label>
                      <input 
                        type="text" 
                        placeholder="Masukkan nama berkas bukti (misal: bayar.jpg)" 
                        value={paymentFile}
                        onChange={e => setPaymentFile(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Gunakan Bukti Transfer Manual
                    </button>
                  </form>
                </div>
              )}

              {payment?.status === 'pending_verification' && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                    <RefreshCcw className="w-6 h-6 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Menunggu Verifikasi Pembayaran</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Bukti transfer Anda telah diunggah. Admin sedang memverifikasi dana transfer masuk.
                    </p>
                  </div>
                </div>
              )}

              {payment?.status === 'paid' && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Pembayaran Terverifikasi</p>
                    <p className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 py-1 px-3 rounded-full inline-block font-bold">
                      Invoice LUNAS (Paid)
                    </p>
                    <p className="text-[9px] text-slate-400 pt-1">
                      Dibayar pada: {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                </div>
              )}

              {payment?.status === 'rejected' && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-inner">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Pembayaran Ditolak</p>
                    <p className="text-[10px] text-slate-400">Bukti pembayaran Anda dinilai tidak valid oleh admin.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (payment) {
                        payment.status = 'unpaid';
                        router.refresh();
                      }
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Unggah Bukti Ulang
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Action: Selesaikan Project */}
          {order.status === 'delivered' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4 animate-scale-in">
              <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Pekerjaan Selesai & Siap Ditinjau
              </h3>
              <p className="text-xs text-emerald-700 leading-normal font-medium">
                Pekerjaan Anda telah selesai dikerjakan oleh tim kami. Jika Anda sudah memeriksa file hasil dan merasa puas dengan hasilnya, silakan klik tombol selesai di bawah ini untuk menutup order.
              </p>
              <button
                onClick={async () => {
                  if (confirm('Apakah Anda puas dengan pekerjaan kami dan ingin menyelesaikan pesanan ini?')) {
                    await completeOrder(order.id);
                    alert('Terima kasih! Pesanan berhasil diselesaikan. Kami senang bisa membantu Anda.');
                  }
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all active:scale-[0.98]"
              >
                Tandai Selesai & Tutup Order
              </button>
            </div>
          )}

          {/* Revision Control Card */}
          {['delivered', 'completed', 'revision_requested', 'revision_in_progress'].includes(order.status) && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in-up delay-300">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <RefreshCcw className="w-4.5 h-4.5 text-teal-500" />
                  Sistem Revisi Terbatas
                </span>
                <span className="text-[10px] font-extrabold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                  Revisi: {order.revision_used} / {order.revision_limit}
                </span>
              </h3>

              {order.status === 'delivered' && order.revision_used < order.revision_limit && (
                <div className="space-y-4">
                  {!showRevisionForm ? (
                    <button
                      onClick={() => setShowRevisionForm(true)}
                      className="w-full py-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl text-xs font-bold text-teal-600 transition-colors"
                    >
                      Ajukan Request Revisi
                    </button>
                  ) : (
                    <form onSubmit={handleRevision} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Revisi</label>
                        <textarea
                          rows={3}
                          placeholder="Jelaskan secara detail bagian mana saja yang perlu diperbaiki sesuai brief awal..."
                          value={revisionNote}
                          onChange={e => setRevisionNote(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRevisionForm(false)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md shadow-teal-500/10"
                        >
                          Kirim Revisi
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {order.revision_used >= order.revision_limit && (
                <div className="bg-slate-50 text-slate-500 p-4 rounded-xl text-[10px] leading-relaxed border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Kuota Revisi Habis</span>
                  Kuota revisi gratis Anda telah mencapai batas maksimal 3x. Segala revisi tambahan selanjutnya akan dikenakan biaya order baru.
                </div>
              )}

              {/* Revision History */}
              {orderRevisions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Riwayat Revisi</span>
                  <div className="space-y-3 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {orderRevisions.map((rev, idx) => (
                      <div key={idx} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                          <span className="text-teal-600">Revisi #{rev.revision_number}</span>
                          <span className="text-slate-400">{new Date(rev.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">{rev.note}</p>
                        {rev.admin_response && (
                          <div className="mt-2 bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-[10px] text-slate-500 leading-normal">
                            <span className="font-bold text-slate-600 block">Tanggapan Admin:</span>
                            {rev.admin_response}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
