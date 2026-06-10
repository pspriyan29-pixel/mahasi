import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">
        {/* Large 404 */}
        <div className="relative">
          <h1 className="text-[120px] sm:text-[160px] font-black text-gradient leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 text-[120px] sm:text-[160px] font-black text-blue-500/5 blur-lg leading-none select-none">
            404
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3 -mt-4">
          <h2 className="text-xl font-bold text-slate-800">Halaman Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan. 
            Periksa kembali URL atau kembali ke beranda FlashWork.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all"
          >
            Kunjungi Forum
          </Link>
        </div>
      </div>
    </div>
  );
}
