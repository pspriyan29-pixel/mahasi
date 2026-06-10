'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { calculatePrice, PricingInput } from '@/lib/pricing';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { 
  Sparkles, BookOpen, Presentation, Code, Cpu, CheckCircle, 
  ArrowRight, ShieldCheck, HelpCircle, FileText, ChevronDown, 
  MessageSquare, User, LogOut, Check, ChevronRight, Menu, X,
  Zap, Clock, Star, ExternalLink
} from 'lucide-react';

// ─── Intersection Observer Hook ───
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

export default function LandingPage() {
  const { user, role, logout, services, login } = useApp();
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State Estimator
  const [estService, setEstService] = useState('laporan-makalah');
  const [estDifficulty, setEstDifficulty] = useState<'easy' | 'normal' | 'hard' | 'complex'>('normal');
  const [estPriority, setEstPriority] = useState<'normal' | 'cepat' | 'express' | 'super_urgent'>('normal');
  const [estQuantity, setEstQuantity] = useState(5);
  const [estPremiumDesign, setEstPremiumDesign] = useState(false);
  const [estReferences, setEstReferences] = useState(false);

  // Scroll animation sections
  const heroSection = useInView(0.1);
  const problemSection = useInView();
  const servicesSection = useInView();
  const howSection = useInView();
  const estimatorSection = useInView();
  const faqSection = useInView();

  // Scroll progress for navbar
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pricingResult = calculatePrice({
    serviceSlug: estService,
    difficulty: estDifficulty,
    priority: estPriority,
    quantity: estQuantity,
    isPremiumDesign: estPremiumDesign,
    needsReferences: estReferences
  });

  const faqs = [
    {
      q: "Apakah estimasi harga dari sistem ini sudah pasti?",
      a: "Sistem memberikan estimasi harga awal yang realistis. Harga final akan dikonfirmasi oleh Admin setelah meninjau detail brief dan berkas pendukung yang Anda unggah."
    },
    {
      q: "Berapa banyak kuota revisi yang saya dapatkan?",
      a: "Setiap pesanan mendapatkan kuota maksimal 3x revisi. Revisi harus sesuai dengan detail brief awal yang telah disepakati bersama."
    },
    {
      q: "Apakah layanan coding mencakup deployment ke server?",
      a: "Ya, layanan Coding & Website kami dapat mencakup proses deployment ke hosting/server seperti Vercel, Netlify, atau cPanel sesuai dengan kesepakatan awal."
    },
    {
      q: "Bagaimana cara hasil akhir dikirimkan kepada saya?",
      a: "Semua file hasil pekerjaan akan diunggah ke detail pesanan di dashboard Anda. Anda dapat melihat preview file dan mengunduh berkas final secara langsung."
    },
    {
      q: "Bagaimana sistem antrean (pending queue) bekerja?",
      a: "Untuk menjaga kualitas pengerjaan, admin memiliki slot kerja aktif yang terbatas. Jika pembayaran Anda valid saat slot penuh, pesanan Anda akan otomatis masuk antrean prioritas."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">


      {/* Navigation */}
      <header className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled 
          ? 'border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm' 
          : 'border-transparent bg-slate-50/60 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-blue-600 transition-colors relative group">
              Layanan
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all group-hover:w-full" />
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors relative group">
              Cara Kerja
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all group-hover:w-full" />
            </a>
            <a href="#estimator" className="hover:text-blue-600 transition-colors relative group">
              Estimasi Harga
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all group-hover:w-full" />
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors relative group">
              FAQ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all group-hover:w-full" />
            </a>
            <Link href="/forum" className="hover:text-blue-600 transition-colors relative group">
              Forum
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all group-hover:w-full" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'}
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
                >
                  <User className="w-4 h-4" />
                  Dashboard ({user.role === 'admin' ? 'Admin' : 'Pelanggan'})
                </Link>
                <button 
                  onClick={logout}
                  className="text-slate-500 hover:text-red-500 p-2 rounded-lg transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link 
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 transition-colors"
                >
                  Masuk User
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-fade-in-down">
            <div className="px-4 py-4 space-y-1">
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Layanan</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Cara Kerja</a>
              <a href="#estimator" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Estimasi Harga</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">FAQ</a>
              <Link href="/forum" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Forum</Link>
              
              {!user && (
                <div className="pt-3 border-t border-slate-100">
                  <Link 
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-4 py-3 rounded-xl transition-colors"
                  >
                    Masuk User
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section ref={heroSection.ref} className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 bg-gradient-to-b from-slate-50 via-[#F1F5F9]/50 to-slate-50">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-r from-blue-200/20 to-purple-200/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-indigo-100/30 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className={`lg:col-span-7 space-y-8 text-center lg:text-left ${heroSection.isInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100/80 text-blue-600 text-xs font-semibold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Platform Pendampingan Akademik & Digital Terpercaya
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Bantuan Akademik & Coding <br />
                <span className="text-gradient">
                  Cepat, Rapi, & Terarah
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Atur kebutuhan tugas, perapian makalah, desain presentasi, hingga coding website dalam satu dashboard interaktif. Dilengkapi pelacakan status real-time, kuota revisi, dan file vault aman.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link 
                  href={user ? (user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user/order') : '/login'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  Mulai Order Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#estimator" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-8 py-4 rounded-2xl transition-all hover:shadow-md"
                >
                  Cek Estimasi Harga
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">100%</h4>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aman & Terjaga</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">Maks 3x</h4>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Garansi Revisi</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">&lt; 24 Jam</h4>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Response Time</p>
                </div>
              </div>
            </div>

            {/* Visual Floating Cards */}
            <div className={`lg:col-span-5 relative flex justify-center ${heroSection.isInView ? 'animate-slide-in-right delay-200' : 'opacity-0'}`}>
              <div className="relative w-full max-w-[420px] aspect-[4/5] bg-gradient-to-br from-white to-slate-50 rounded-[32px] p-6 shadow-2xl border border-slate-200/50 flex flex-col justify-between overflow-hidden animate-float">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-400/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-400/10 rounded-full blur-2xl" />

                {/* Dashboard Header Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">FW</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Order: FW-2026-0001</h5>
                      <span className="text-[10px] text-slate-400 font-medium">Nama Pelanggan</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold">
                    Diproses (45%)
                  </span>
                </div>

                {/* Timeline Step */}
                <div className="py-6 space-y-4 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm"><Check className="w-3.5 h-3.5" /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Order Dibuat</p>
                      <span className="text-[9px] text-slate-400">Brief disetujui admin</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm"><Check className="w-3.5 h-3.5" /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Pembayaran Terverifikasi</p>
                      <span className="text-[9px] text-slate-400">Status Invoice: LUNAS</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-500 text-blue-600 flex items-center justify-center text-[10px] font-bold animate-pulse-glow">3</div>
                    <div>
                      <p className="text-xs font-semibold text-blue-600">Pengerjaan Aktif</p>
                      <span className="text-[9px] text-blue-500 font-medium">Admin sedang mengerjakan project</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 opacity-40">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center text-[10px]">4</div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Hasil & File Vault</p>
                      <span className="text-[9px] text-slate-400">Preview hasil dikirim</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Detail */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-500 font-medium">Layanan:</span>
                    <span className="font-bold text-slate-800">Coding & Website</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Harga Final:</span>
                    <span className="font-extrabold text-blue-600">Rp 250.000</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section ref={problemSection.ref} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-3xl mx-auto text-center space-y-4 ${problemSection.isInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Sering Mengalami Kendala Ini Saat Kuliah & Bekerja?
            </h2>
            <p className="text-slate-500 text-lg">
              FlashWork hadir menyelesaikan masalah Anda secara rapi dan profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: <Clock className="w-5 h-5" />,
                title: "Order Tugas Berantakan",
                desc: "Mengontak admin lewat chat WA sering tertumpuk. Di FlashWork, status pesanan, brief, dan histori revisi terdokumentasi rapi di dashboard."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Harga Tidak Jelas",
                desc: "Tidak ada patokan harga standar sehingga rawan salah hitung. Gunakan Smart Price Estimator kami untuk memperkirakan harga secara transparan."
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: "File Hasil Tercecer",
                desc: "File brief, revisi, dan hasil final acak-acakan di chat. Unduh file final secara aman dari File Vault khusus setelah pembayaran sah."
              }
            ].map((prob, idx) => (
              <div 
                key={idx} 
                className={`bg-[#F8FAFC] border border-slate-200/50 rounded-2xl p-6 card-lift ${
                  problemSection.isInView ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${(idx + 1) * 150}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
                  {prob.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{prob.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{prob.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesSection.ref} id="services" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-3xl mx-auto text-center space-y-4 mb-16 ${servicesSection.isInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kategori Layanan Kami</h2>
            <p className="text-slate-500">
              Pilih pendampingan yang sesuai dengan kebutuhan akademik dan digital Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <BookOpen className="w-6 h-6 text-blue-600" />,
                title: "Laporan & Makalah",
                desc: "Pendampingan penyusunan, perapian makalah, laporan praktikum, margin, daftar pustaka.",
                price: "Rp20k - Rp100k",
                slug: "laporan-makalah",
                gradient: "from-blue-500/10 to-indigo-500/5"
              },
              {
                icon: <Presentation className="w-6 h-6 text-purple-600" />,
                title: "PPT Presentasi",
                desc: "Pembuatan slide presentasi modern, rapi, dan meyakinkan untuk tugas kelas atau seminar.",
                price: "Rp20k - Rp150k",
                slug: "ppt-presentasi",
                gradient: "from-purple-500/10 to-pink-500/5"
              },
              {
                icon: <Code className="w-6 h-6 text-indigo-600" />,
                title: "Coding & Website",
                desc: "Debugging error, integrasi database, pembuatan web dashboard, deploy, project custom.",
                price: "Rp50k - Rp1jt+",
                slug: "coding-website",
                gradient: "from-indigo-500/10 to-blue-500/5"
              },
              {
                icon: <Cpu className="w-6 h-6 text-emerald-600" />,
                title: "Custom Digital Request",
                desc: "Desain UI/UX Figma, penyusunan flowchart ERD, prompt engineering AI, revisi dokumen teknis.",
                price: "Custom",
                slug: "custom-request",
                gradient: "from-emerald-500/10 to-teal-500/5"
              }
            ].map((srv, idx) => (
              <div 
                key={idx} 
                className={`bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between card-lift ${
                  servicesSection.isInView ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${srv.gradient} flex items-center justify-center`}>
                    {srv.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{srv.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{srv.desc}</p>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Mulai</span>
                    <span className="text-sm font-extrabold text-slate-800">{srv.price}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setEstService(srv.slug);
                      const el = document.getElementById('estimator');
                      if(el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white flex items-center justify-center text-slate-600 transition-all hover:shadow-md hover:shadow-blue-500/20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howSection.ref} id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-3xl mx-auto text-center space-y-4 mb-16 ${howSection.isInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bagaimana Alur Pemesanan Bekerja?</h2>
            <p className="text-slate-500">Transparan dari pengisian brief hingga serah terima hasil final.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { t: "Isi Brief & Detail", d: "Pilih kategori layanan, upload file soal/panduan, isi deadline, dan lihat estimasi.", icon: <FileText className="w-5 h-5" /> },
              { t: "Review & Harga Final", d: "Admin memverifikasi brief Anda dan menentukan harga final yang adil.", icon: <CheckCircle className="w-5 h-5" /> },
              { t: "Pembayaran & Antrean", d: "Lakukan pembayaran QRIS, upload bukti. Pesanan Anda mulai diproses admin.", icon: <Zap className="w-5 h-5" /> },
              { t: "File Delivery & Revisi", d: "Unduh file dari dashboard. Jika ada kekurangan, ajukan revisi maksimal 3x.", icon: <Star className="w-5 h-5" /> }
            ].map((step, idx) => (
              <div 
                key={idx} 
                className={`relative space-y-4 ${howSection.isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(idx + 1) * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/25">
                  {idx + 1}
                </div>
                <h4 className="text-md font-bold text-slate-900">{step.t}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Pricing Estimator */}
      <section ref={estimatorSection.ref} id="estimator" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${estimatorSection.isInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                Hitung Estimasi Biaya Pesanan Anda
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Gunakan kalkulator interaktif ini untuk memperkirakan biaya pekerjaan Anda secara instan. Hasil estimasi didasarkan pada kategori, deadline, kuantitas, tingkat kesulitan, dan fitur tambahan.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  Transparansi harga tanpa biaya tersembunyi
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  Maksimal 3x revisi gratis sesuai kesepakatan brief
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  Pembayaran aman QRIS dengan verifikasi otomatis/manual
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Form inputs */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Layanan</label>
                  <select 
                    value={estService} 
                    onChange={e => setEstService(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="laporan-makalah">Laporan & Makalah</option>
                    <option value="ppt-presentasi">PPT Presentasi</option>
                    <option value="coding-website">Coding & Website</option>
                    <option value="custom-request">Custom Digital Request</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kesulitan</label>
                    <select 
                      value={estDifficulty} 
                      onChange={e => setEstDifficulty(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="easy">Ringan</option>
                      <option value="normal">Normal (+25%)</option>
                      <option value="hard">Sulit (+75%)</option>
                      <option value="complex">Kompleks (+150%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paket Prioritas</label>
                    <select 
                      value={estPriority} 
                      onChange={e => setEstPriority(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="normal">Normal (Sesuai Antrean)</option>
                      <option value="cepat">Cepat (+25%)</option>
                      <option value="express">Express (+50%)</option>
                      <option value="super_urgent">Super Urgent (+75%)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {estService === 'laporan-makalah' ? 'Jumlah Halaman' : estService === 'ppt-presentasi' ? 'Jumlah Slide' : 'Jumlah Fitur'}
                    </label>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{estQuantity}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={estQuantity}
                    onChange={e => setEstQuantity(parseInt(e.target.value))}
                    className="w-full" 
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={estPremiumDesign} 
                      onChange={e => setEstPremiumDesign(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" 
                    />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Desain Premium / Kustomisasi Khusus (+Biaya Tambahan)</span>
                  </label>
                  {(estService === 'laporan-makalah' || estService === 'custom-request') && (
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={estReferences} 
                        onChange={e => setEstReferences(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" 
                      />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Butuh Pencarian Referensi / Daftar Pustaka (+Rp15k)</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Price display output */}
              <div className="md:col-span-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg animate-gradient relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                
                <div className="space-y-4 relative">
                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-85">Estimasi Biaya</span>
                  <div className="text-3xl font-black">
                    Rp {pricingResult.totalPrice.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] opacity-75 leading-relaxed space-y-1">
                    <div className="flex justify-between">
                      <span>Harga Dasar:</span>
                      <span>Rp {pricingResult.basePrice.toLocaleString('id-ID')}</span>
                    </div>
                    {pricingResult.difficultyFee > 0 && (
                      <div className="flex justify-between">
                        <span>Biaya Kesulitan:</span>
                        <span>Rp {pricingResult.difficultyFee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pricingResult.quantityFee > 0 && (
                      <div className="flex justify-between">
                        <span>Tambahan Kuantitas:</span>
                        <span>Rp {pricingResult.quantityFee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pricingResult.designFee > 0 && (
                      <div className="flex justify-between">
                        <span>Biaya Desain:</span>
                        <span>Rp {pricingResult.designFee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pricingResult.referenceFee > 0 && (
                      <div className="flex justify-between">
                        <span>Biaya Referensi:</span>
                        <span>Rp {pricingResult.referenceFee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pricingResult.priorityFee > 0 && (
                      <div className="flex justify-between">
                        <span>Biaya Urgent:</span>
                        <span>Rp {pricingResult.priorityFee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20 mt-6 relative">
                  <Link 
                    href={user ? '/dashboard/user/order' : '/login'}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold bg-white text-blue-600 hover:bg-slate-50 py-3 rounded-xl shadow-md transition-all active:scale-95 hover:-translate-y-0.5"
                  >
                    Pesan Layanan Ini
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqSection.ref} id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center space-y-4 mb-12 ${faqSection.isInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tanya & Jawab (FAQ)</h2>
            <p className="text-slate-500">Pertanyaan umum seputar layanan pendampingan FlashWork.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white hover:shadow-sm ${
                    faqSection.isInView ? 'animate-fade-in-up' : 'opacity-0'
                  } ${isOpen ? 'shadow-md border-blue-200/50' : ''}`}
                  style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                >
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between font-bold text-left text-sm text-slate-800 hover:bg-slate-50/50 focus:outline-none transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-slate-50 py-12 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo size="sm" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform layanan pendampingan akademik dan digital yang cepat, rapi, dan terarah.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">Layanan</h5>
            <ul className="space-y-2.5 text-xs">
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Laporan & Makalah</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">PPT Presentasi</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Coding & Website</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Custom Digital Request</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">Fitur</h5>
            <ul className="space-y-2.5 text-xs">
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Order Tracker</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">File Vault</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Revisi 3x</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Forum Komunitas</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">Pemilik Produk</h5>
            <p className="text-xs text-slate-500 mb-2 font-semibold">Riyan Perdhana Putra</p>
            <p className="text-xs text-slate-400">Hubungi WhatsApp: +62 812 3456 7890</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} FlashWork. Hak Cipta Dilindungi.</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-blue-600 transition-colors font-bold text-slate-500">Portal Masuk</Link>

          </div>
        </div>
      </footer>
    </div>
  );
}
