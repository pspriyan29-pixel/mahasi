'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import Link from 'next/link';
import { 
  MessageSquare, Search, PlusCircle, Pin, CheckCircle2, 
  ChevronRight, Calendar, User, MessageCircle, Tag, X, Check
} from 'lucide-react';

export default function ForumPage() {
  const { threads, createThread, user } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tanya Coding');
  const [content, setContent] = useState('');

  const categories = ['Semua', 'Tanya Coding', 'Tanya Laporan', 'Tanya PPT', 'Request Bantuan', 'Tips FlashWork', 'Testimoni', 'Promo'];

  const filteredThreads = threads.filter(th => {
    // Kategori
    if (selectedCategory !== 'Semua' && th.category !== selectedCategory) return false;
    
    // Pencarian
    return th.title.toLowerCase().includes(search.toLowerCase()) || th.content.toLowerCase().includes(search.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Mohon isi judul dan konten thread!');
      return;
    }

    try {
      await createThread(title, content, category);
      setTitle('');
      setContent('');
      setShowCreateForm(false);
      alert('Thread baru berhasil diposting!');
    } catch (err) {
      alert('Gagal memposting thread.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8">
      
      {/* Banner info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black">Forum Komunitas FlashWork</h2>
          <p className="text-xs text-blue-100/90">
            Tanyakan error pemrograman, format laporan, tips presentasi, atau diskusikan kebutuhan digital Anda dengan admin dan sesama anggota.
          </p>
        </div>
        <button 
          onClick={() => {
            if (!user) {
              alert('Silakan login terlebih dahulu untuk memposting di forum!');
              return;
            }
            setShowCreateForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all shrink-0 hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle className="w-4 h-4" />
          Buat Diskusi Baru
        </button>
      </div>

      {/* Main Grid: Left (List), Right (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Threads List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Create Thread Form */}
          {showCreateForm && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mulai Diskusi Baru</h3>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Judul Diskusi</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Mengapa routing Next.js 16 tidak terdeteksi?"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori Diskusi</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.filter(c => c !== 'Semua').map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Isi Pertanyaan / Penjelasan</label>
                  <textarea
                    rows={4}
                    placeholder="Jelaskan pertanyaan Anda secara lengkap. Berikan screenshot error atau salinan kode jika diperlukan..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-xl transition-all shadow-md shadow-blue-500/10"
                >
                  Posting Diskusi
                </button>
              </form>
            </div>
          )}

          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari thread diskusi..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
              <span>Filter:</span>
              <span className="text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">{selectedCategory}</span>
            </div>
          </div>

          {/* Threads list */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm divide-y divide-slate-100">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold">
                Tidak ada thread diskusi yang ditemukan.
              </div>
            ) : (
              filteredThreads.map(th => (
                <div key={th.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5">
                      {th.is_pinned && <Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full shrink-0">
                        {th.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors truncate">
                        <Link href={`/forum/thread/${th.id}`}>{th.title}</Link>
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 text-[9px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {th.user_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(th.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/50">
                      <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                      {th.replies_count || 0} Balasan
                    </span>
                    <Link 
                      href={`/forum/thread/${th.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Sidebar: Categories filter */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-500" />
            Kategori Diskusi
          </h3>

          <div className="space-y-1">
            {categories.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(c)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                  selectedCategory === c
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <span>{c}</span>
                {selectedCategory === c && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 leading-normal space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-500">
              <Pin className="w-3.5 h-3.5 text-blue-500" />
              Aturan Komunitas
            </div>
            <p>Hormati sesama pengguna forum. Dilarang membagikan tautan spam, malware, atau promosi jasa ilegal di luar platform.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
