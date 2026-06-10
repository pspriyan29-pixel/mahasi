'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { 
  Sparkles, Calendar, DollarSign, ArrowRight, Check, X,
  Clock, Plus, MessageSquare, ShieldAlert, FileText, Upload, RefreshCw
} from 'lucide-react';

export default function AdminQueueKanbanPage() {
  const { 
    orders, payments, files, revisions, approveOrder, rejectOrder, 
    verifyPayment, updateOrderProgress, deliverOrder, settings 
  } = useApp();

  // Dialog / Edit states
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [progressInput, setProgressInput] = useState(50);
  
  // Delivery inputs
  const [previewFile, setPreviewFile] = useState('');
  const [finalFile, setFinalFile] = useState('');

  const activeWorkload = orders.filter(x => x.status === 'in_progress').length;
  const maxActive = parseInt(settings.max_active_orders || '1');

  // Columns classification
  const columns = [
    {
      title: 'Review Brief',
      statusGroup: ['pending_review', 'need_detail'],
      color: 'bg-yellow-500/10 border-yellow-200 text-yellow-700'
    },
    {
      title: 'Menunggu Pembayaran',
      statusGroup: ['approved', 'waiting_payment', 'payment_review'],
      color: 'bg-purple-500/10 border-purple-200 text-purple-700'
    },
    {
      title: 'Antrean (Queued)',
      statusGroup: ['queued'],
      color: 'bg-amber-500/10 border-amber-200 text-amber-700'
    },
    {
      title: 'Diproses',
      statusGroup: ['in_progress', 'revision_requested', 'revision_in_progress'],
      color: 'bg-blue-500/10 border-blue-200 text-blue-700'
    },
    {
      title: 'Selesai / Delivered',
      statusGroup: ['delivered', 'completed', 'rejected', 'cancelled'],
      color: 'bg-emerald-500/10 border-emerald-200 text-emerald-700'
    }
  ];

  const handleApprove = (id: string) => {
    if (!priceInput || isNaN(Number(priceInput))) {
      alert('Mohon masukkan harga final berupa nominal angka!');
      return;
    }
    approveOrder(id, Number(priceInput), noteInput);
    setSelectedOrder(null);
    setPriceInput('');
    setNoteInput('');
    alert('Pesanan berhasil disetujui. Tagihan telah diterbitkan ke pelanggan.');
  };

  const handleReject = (id: string) => {
    if (!noteInput.trim()) {
      alert('Mohon tuliskan alasan penolakan di kolom catatan admin!');
      return;
    }
    rejectOrder(id, noteInput);
    setSelectedOrder(null);
    setNoteInput('');
    alert('Pesanan ditolak.');
  };

  const handleStartWork = (id: string) => {
    if (activeWorkload >= maxActive) {
      alert(`Peringatan: Kapasitas kerja aktif saat ini penuh (${activeWorkload}/${maxActive}). Selesaikan pesanan aktif terlebih dahulu atau ubah pengaturan beban kerja.`);
      return;
    }
    updateOrderProgress(id, 10, 'Pekerjaan mulai dikerjakan oleh admin.');
    // Ubah status ke in_progress
    const order = orders.find(x => x.id === id);
    if (order) order.status = 'in_progress';
    alert('Order dipindahkan ke kolom Diproses.');
  };

  const handleUpdateProgress = (id: string) => {
    updateOrderProgress(id, progressInput, noteInput);
    setSelectedOrder(null);
    setNoteInput('');
    alert('Progress berhasil diperbarui.');
  };

  const handleDeliver = (id: string) => {
    if (!finalFile) {
      alert('Mohon tentukan nama file final untuk dikirim!');
      return;
    }
    deliverOrder(id, previewFile || undefined, finalFile);
    setSelectedOrder(null);
    setPreviewFile('');
    setFinalFile('');
    alert('Hasil pekerjaan berhasil dikirim ke dashboard pelanggan.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Antrean Kerja (Kanban Board)</h2>
          <p className="text-xs text-slate-400 font-medium">Kelola seluruh status order menggunakan workload control.</p>
        </div>
        
        {/* Workload Indicator */}
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-xs font-bold text-slate-600">
            Kapasitas Kerja: <span className="text-blue-600 font-extrabold">{activeWorkload}</span> / {maxActive} Order Aktif
          </span>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start overflow-x-auto min-h-[500px] pb-6">
        {columns.map((col, idx) => {
          const colOrders = orders.filter(ord => col.statusGroup.includes(ord.status));
          
          return (
            <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-3xl p-4 flex flex-col gap-4 min-w-[220px] animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
              {/* Column Header */}
              <div className={`px-3 py-1.5 rounded-full border text-[10px] font-black text-center ${col.color}`}>
                {col.title} ({colOrders.length})
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] min-h-[150px]">
                {colOrders.length === 0 ? (
                  <div className="text-center py-8 text-[10px] text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl bg-white">
                    Kosong
                  </div>
                ) : (
                  colOrders.map(ord => {
                    const pay = payments.find(p => p.order_id === ord.id);
                    const isSelected = selectedOrder === ord.id;
                    const orderFiles = files.filter(f => f.order_id === ord.id);
                    
                    return (
                      <div key={ord.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 text-left card-lift">
                        {/* Header card */}
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {ord.order_code}
                          </span>
                          <span className="text-slate-400 font-semibold capitalize">
                            {ord.difficulty}
                          </span>
                        </div>

                        {/* Title & Desc */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{ord.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{ord.description}</p>
                        </div>

                        {/* Order info details */}
                        <div className="text-[9px] text-slate-400 font-medium space-y-1">
                          <div className="flex justify-between">
                            <span>Deadline:</span>
                            <span className="font-bold text-slate-600">
                              {new Date(ord.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Harga Final:</span>
                            <span className="font-bold text-slate-600">
                              {ord.final_price ? `Rp ${ord.final_price.toLocaleString('id-ID')}` : `Est. Rp ${ord.estimated_price.toLocaleString('id-ID')}`}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar (Jika diproses) */}
                        {['in_progress', 'revision_in_progress', 'revision_requested'].includes(ord.status) && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-bold text-slate-400">
                              <span>Progress:</span>
                              <span className="text-blue-600 font-extrabold">{ord.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${ord.progress}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Action details block */}
                        {isSelected ? (
                          <div className="pt-3 border-t border-slate-100 space-y-3">
                            
                            {/* Actions for REVIEW column */}
                            {ord.status === 'pending_review' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Set Harga Final</label>
                                  <input 
                                    type="text" 
                                    placeholder="Nominal rupiah (misal: 250000)" 
                                    value={priceInput}
                                    onChange={e => setPriceInput(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Catatan Admin</label>
                                  <textarea 
                                    rows={2} 
                                    placeholder="Tulis instruksi/catatan tambahan..."
                                    value={noteInput}
                                    onChange={e => setNoteInput(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px] font-semibold text-slate-800 resize-none"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleReject(ord.id)}
                                    className="flex-1 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg"
                                  >
                                    Tolak
                                  </button>
                                  <button 
                                    onClick={() => handleApprove(ord.id)}
                                    className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow-sm"
                                  >
                                    Setujui
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Actions for IN_PROGRESS / REVISIONS */}
                            {['in_progress', 'revision_in_progress', 'revision_requested'].includes(ord.status) && (
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-[8px] font-bold text-slate-400 mb-1">
                                    <span>Set Progress</span>
                                    <span>{progressInput}%</span>
                                  </div>
                                  <input 
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={progressInput}
                                    onChange={e => setProgressInput(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-100 accent-blue-600 cursor-pointer"
                                  />
                                </div>
                                
                                {ord.status === 'revision_requested' && (
                                  <div className="bg-teal-50 border border-teal-100 p-2 rounded-lg text-[9px] text-teal-800 leading-normal mb-1">
                                    <span className="font-bold">Revisi Diminta:</span>
                                    {revisions.find(r => r.order_id === ord.id && r.status === 'pending')?.note}
                                  </div>
                                )}

                                <div>
                                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">File Pengiriman (File Vault)</label>
                                  <input 
                                    type="text" 
                                    placeholder="Nama File Preview (opsional)" 
                                    value={previewFile}
                                    onChange={e => setPreviewFile(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-semibold mb-1"
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="Nama File Hasil Final (contoh: final.zip)" 
                                    value={finalFile}
                                    onChange={e => setFinalFile(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-semibold"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleUpdateProgress(ord.id)}
                                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg"
                                  >
                                    Update Progress
                                  </button>
                                  <button 
                                    onClick={() => handleDeliver(ord.id)}
                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-sm"
                                  >
                                    Deliver Files
                                  </button>
                                </div>
                              </div>
                            )}

                            <button 
                              onClick={() => setSelectedOrder(null)}
                              className="w-full text-center text-[9px] font-bold text-slate-400 hover:text-slate-600"
                            >
                              Tutup Aksi
                            </button>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            {ord.status === 'pending_review' && (
                              <button 
                                onClick={() => {
                                  setSelectedOrder(ord.id);
                                  setPriceInput(String(ord.estimated_price));
                                }}
                                className="w-full py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 text-[10px] font-bold rounded-lg text-center"
                              >
                                Tinjau Brief
                              </button>
                            )}

                            {ord.status === 'payment_review' && (
                              <div className="flex gap-1.5 w-full">
                                <button 
                                  onClick={() => verifyPayment(ord.id, false)}
                                  className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg text-center"
                                >
                                  Tolak
                                </button>
                                <button 
                                  onClick={() => verifyPayment(ord.id, true)}
                                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg text-center shadow-sm"
                                >
                                  Terima
                                </button>
                              </div>
                            )}

                            {ord.status === 'queued' && (
                              <button 
                                onClick={() => handleStartWork(ord.id)}
                                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg text-center shadow-sm"
                              >
                                Kerjakan Sekarang
                              </button>
                            )}

                            {['in_progress', 'revision_in_progress', 'revision_requested'].includes(ord.status) && (
                              <button 
                                onClick={() => {
                                  setSelectedOrder(ord.id);
                                  setProgressInput(ord.progress);
                                }}
                                className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg text-center"
                              >
                                Kelola Pekerjaan
                              </button>
                            )}

                            {['delivered', 'completed', 'rejected', 'cancelled'].includes(ord.status) && (
                              <div className="text-[9px] font-medium text-slate-400 text-center w-full py-1">
                                Status Selesai / Arsip
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
