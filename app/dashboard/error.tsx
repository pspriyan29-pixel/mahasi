'use client';

import { AlertTriangle, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-sm w-full text-center space-y-6 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-800">Halaman Gagal Dimuat</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Terjadi kesalahan pada modul dashboard ini. Silakan coba lagi atau kembali ke halaman sebelumnya.
          </p>
        </div>

        {error?.message && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
            <code className="text-[10px] font-mono text-red-600 break-all">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shadow-md transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Muat Ulang
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
