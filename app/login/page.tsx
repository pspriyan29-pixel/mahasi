'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Sparkles, User, ShieldCheck, ArrowLeft, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithGoogle, loginWithEmail, user } = useApp();
  const router = useRouter();

  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  React.useEffect(() => {
    if (user) {
      router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user');
    }
  }, [user, router]);


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      alert('Mohon masukkan email Anda!');
      return;
    }
    setIsLoading(true);
    try {
      const success = await loginWithEmail(emailInput.trim());
      if (success) {
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim link login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      alert(err.message || 'Gagal login via Google.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-blue-200/20 to-indigo-200/25 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-purple-200/10 blur-3xl pointer-events-none rounded-full" />

      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4 animate-fade-in-up">
        <Logo size="lg" withText={false} className="justify-center" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke FlashWork</h2>
        <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto">
          Masuk untuk membuat pesanan baru, memantau tugas, atau berdiskusi di forum akademik.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 border border-slate-200/80 shadow-2xl rounded-3xl sm:px-10 space-y-6 animate-scale-in">
          
          {magicLinkSent ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-800">Tautan Masuk Terkirim!</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Kami telah mengirimkan tautan masuk khusus ke email <strong>{emailInput}</strong>. Periksa folder masuk atau spam Anda.
                </p>
              </div>
              <button 
                onClick={() => setMagicLinkSent(false)}
                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
              >
                Gunakan email lain
              </button>
            </div>
          ) : (
            <>
              {/* Google OAuth Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-extrabold transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02C6.21 7.42 8.87 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.63z" />
                    <path fill="#FBBC05" d="M5.28 14.78c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.39 7.56C.5 9.35 0 11.35 0 13.5s.5 4.15 1.39 5.94l3.89-3.66z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.73-2.89c-1.03.69-2.35 1.11-4.23 1.11-3.13 0-5.79-2.38-6.72-5.54l-3.89 3.02C3.37 20.33 7.35 23 12 23z" />
                  </svg>
                )}
                Masuk dengan Google
              </button>

              {/* Separator */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-100 w-full" />
                <span className="bg-white px-3 text-[10px] font-black text-slate-450 uppercase tracking-widest absolute">ATAU EMAIL</span>
              </div>

              {/* Email Magic Link Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Alamat Email Anda</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      placeholder="nama@email.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-50 border border-slate-250 hover:border-slate-350 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      Kirim Link Masuk Ke Email
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>

    </div>
  );
}
