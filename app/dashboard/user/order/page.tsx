'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { calculatePrice } from '@/lib/pricing';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, ClipboardList, Clock, CheckCircle2, ArrowRight,
  UploadCloud, FileText, BadgeInfo, AlertCircle, Loader2
} from 'lucide-react';

export default function CreateOrderPage() {
  const { services, createOrder } = useApp();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [serviceSlug, setServiceSlug] = useState('laporan-makalah');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'complex'>('normal');
  const [priority, setPriority] = useState<'normal' | 'cepat' | 'express' | 'super_urgent'>('normal');
  const [quantity, setQuantity] = useState(5);
  const [isPremiumDesign, setIsPremiumDesign] = useState(false);
  const [needsReferences, setNeedsReferences] = useState(false);
  
  // File state
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedService = services.find(s => s.slug === serviceSlug) || services[0];

  const pricingResult = calculatePrice({
    serviceSlug,
    difficulty,
    priority,
    quantity,
    isPremiumDesign,
    needsReferences
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(file.size);
      setFileObj(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim() || !description.trim() || !deadline) {
      setSubmitError('Mohon lengkapi judul, deskripsi, dan deadline terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createOrder({
        service_id: selectedService?.id || '',
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        difficulty,
        priority,
        estimated_price: pricingResult.totalPrice,
        final_price: undefined,
        revision_limit: 3
      }, fileObj);

      router.push(`/dashboard/user/order/${created.id}`);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Gagal membuat pesanan. Pastikan Anda sudah login dan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Form Pembuatan Pesanan Baru</h2>
          <p className="text-xs text-slate-400 font-medium">Lengkapi detail brief tugas Anda agar admin dapat meninjau dan menentukan harga final.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in-up">
          
          {/* Judul Tugas */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Tugas / Project</label>
            <input 
              type="text"
              placeholder="Contoh: Makalah Manajemen Pemasaran Bab 1-3"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Kategori Layanan */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori Layanan</label>
            <div className="grid grid-cols-2 gap-3">
              {services.map((srv) => (
                <label 
                  key={srv.id}
                  className={`flex flex-col p-4 border rounded-2xl cursor-pointer transition-all ${
                    serviceSlug === srv.slug
                      ? 'border-blue-500 bg-blue-50/20 text-blue-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="radio"
                    name="service"
                    value={srv.slug}
                    checked={serviceSlug === srv.slug}
                    onChange={e => {
                      setServiceSlug(e.target.value);
                      if (e.target.value === 'coding-website') {
                        setQuantity(2);
                      } else {
                        setQuantity(5);
                      }
                    }}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold block mb-1">{srv.name}</span>
                  <span className="text-[9px] text-slate-400 font-medium leading-relaxed">{srv.description.substring(0, 50)}...</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deskripsi Brief */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Lengkap / Brief</label>
            <textarea
              rows={4}
              placeholder="Tuliskan petunjuk pengerjaan, format berkas, referensi buku, software yang digunakan, atau detail spesifik lainnya secara rinci..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Deadline & Kuantitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deadline Pengerjaan</label>
              <input 
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {serviceSlug === 'laporan-makalah' ? 'Jumlah Halaman' : serviceSlug === 'ppt-presentasi' ? 'Jumlah Slide' : 'Jumlah Fitur'}
                </label>
                <span className="text-xs font-bold text-blue-600">{quantity}</span>
              </div>
              <input 
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Difficulty & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kesulitan Tugas</label>
              <select 
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="easy">Easy (Ringan/Format)</option>
                <option value="normal">Normal (+25%)</option>
                <option value="hard">Hard (+75%)</option>
                <option value="complex">Complex (+150%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paket Prioritas</label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="normal">Normal (Antrean Standar)</option>
                <option value="cepat">Cepat (+25%)</option>
                <option value="express">Express (+50%)</option>
                <option value="super_urgent">Super Urgent (+75%)</option>
              </select>
            </div>
          </div>

          {/* Extra options */}
          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPremiumDesign}
                onChange={e => setIsPremiumDesign(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">Gunakan Desain Premium / Custom UI (+Biaya Tambahan)</span>
            </label>

            {(serviceSlug === 'laporan-makalah' || serviceSlug === 'custom-request') && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={needsReferences}
                  onChange={e => setNeedsReferences(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700">Butuh Pencarian Referensi & Daftar Pustaka (+Rp15k)</span>
              </label>
            )}
          </div>

          {/* File Brief Pendukung — opsional */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              File Brief Pendukung <span className="text-slate-300 font-normal normal-case">(opsional)</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
              <input 
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                {fileName ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>{fileName} ({Math.round(fileSize / 1024)} KB)</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-600">Klik atau seret file ke sini untuk mengunggah</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Maksimal file 25 MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Tombol Submit */}
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses Pesanan...</>
              ) : (
                <>Kirim Brief & Buat Order <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

        </div>

        {/* Right: Estimator Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Kalkulator Estimasi Biaya</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black">
                Rp {pricingResult.totalPrice.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] opacity-80 leading-normal space-y-2 border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span>Harga Dasar Layanan:</span>
                  <span>Rp {pricingResult.basePrice.toLocaleString('id-ID')}</span>
                </div>
                {pricingResult.difficultyFee > 0 && (
                  <div className="flex justify-between">
                    <span>Biaya Kesulitan ({difficulty}):</span>
                    <span>Rp {pricingResult.difficultyFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {pricingResult.quantityFee > 0 && (
                  <div className="flex justify-between">
                    <span>Halaman/Slide/Fitur tambahan:</span>
                    <span>Rp {pricingResult.quantityFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {pricingResult.designFee > 0 && (
                  <div className="flex justify-between">
                    <span>Biaya Desain Premium:</span>
                    <span>Rp {pricingResult.designFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {pricingResult.referenceFee > 0 && (
                  <div className="flex justify-between">
                    <span>Pencarian Referensi:</span>
                    <span>Rp {pricingResult.referenceFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {pricingResult.priorityFee > 0 && (
                  <div className="flex justify-between">
                    <span>Paket Prioritas ({priority}):</span>
                    <span>Rp {pricingResult.priorityFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/20 mt-6 space-y-3">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold bg-white text-blue-600 hover:bg-slate-50 py-3.5 rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Memproses...</>
                ) : (
                  <>Kirim Brief & Buat Order <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <div className="flex items-center gap-2 text-[9px] opacity-75 justify-center">
                <BadgeInfo className="w-3.5 h-3.5" />
                Harga di atas merupakan estimasi awal.
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-blue-500" />
              Ketentuan Layanan
            </h4>
            <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1.5 leading-relaxed">
              <li>Pekerjaan baru akan dimulai setelah pembayaran invoice lunas/terverifikasi.</li>
              <li>Revisi yang diajukan tidak boleh merubah topik brief awal.</li>
              <li>Admin berhak menolak pesanan jika deadline terlalu singkat dan slot penuh.</li>
            </ul>
          </div>
        </div>

      </form>
    </div>
  );
}
