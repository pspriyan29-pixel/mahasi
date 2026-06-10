'use client';

import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in-up">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-800">Terjadi Kesalahan</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Maaf, terjadi kesalahan yang tidak terduga pada halaman ini.
            Silakan coba muat ulang atau kembali ke halaman utama.
          </p>
        </div>

        {/* Error detail (dev mode) */}
        {error?.message && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Detail Error</span>
            <code className="text-xs font-mono text-red-600 break-all leading-relaxed">
              {error.message}
            </code>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <RefreshCcw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
        </div>

        {/* Digest (for support) */}
        {error?.digest && (
          <p className="text-[9px] text-slate-300 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
