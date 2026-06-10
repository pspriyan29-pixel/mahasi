'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, User, MessageCircle, Send, 
  AlertCircle, Pin, Tag
} from 'lucide-react';

export default function ForumThreadDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { threads, comments, addComment, user } = useApp();
  const [commentInput, setCommentInput] = useState('');

  const thread = threads.find(t => t.id === id);
  if (!thread) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">Thread Tidak Ditemukan</h3>
        <p className="text-xs text-slate-400">Thread diskusi dengan ID {id} tidak terdaftar.</p>
        <Link href="/forum" className="text-xs font-bold text-blue-600 mt-4 inline-block hover:underline">
          Kembali ke Forum
        </Link>
      </div>
    );
  }

  const threadComments = comments.filter(c => c.thread_id === thread.id);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan login terlebih dahulu untuk mengirim komentar!');
      return;
    }
    if (!commentInput.trim()) {
      alert('Mohon isi komentar!');
      return;
    }

    try {
      await addComment(thread.id, commentInput);
      setCommentInput('');
      alert('Komentar berhasil ditambahkan!');
    } catch (err) {
      alert('Gagal mengirimkan komentar.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
      
      {/* Back button */}
      <div>
        <Link 
          href="/forum"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Forum
        </Link>
      </div>

      {/* Main Thread Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          {thread.is_pinned && <span className="flex items-center gap-1 text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100"><Pin className="w-3 h-3" /> Pinned</span>}
          <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
            {thread.category}
          </span>
        </div>

        <h1 className="text-lg md:text-xl font-black text-slate-800">{thread.title}</h1>

        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold border-b border-slate-100 pb-4">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {thread.user_name}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(thread.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Content */}
        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap pt-2">
          {thread.content}
        </p>

      </div>

      {/* Comments section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <MessageCircle className="w-4.5 h-4.5 text-blue-500" />
          Diskusi ({threadComments.length} Balasan)
        </h3>

        {/* Comments list */}
        <div className="space-y-4">
          {threadComments.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-white text-xs text-slate-400 font-bold">
              Belum ada tanggapan. Jadilah yang pertama menanggapi diskusi ini!
            </div>
          ) : (
            threadComments.map((com, idx) => (
              <div key={com.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] uppercase">
                      {com.user_name?.substring(0, 2)}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{com.user_name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    {new Date(com.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-9">
                  {com.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Submit comment form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tulis Balasan Tanggapan</label>
              <textarea
                rows={3}
                placeholder={user ? "Ketik tanggapan Anda secara sopan..." : "Silakan login untuk membalas diskusi ini."}
                disabled={!user}
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!user}
                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed py-2 px-5 rounded-xl transition-all shadow-md shadow-blue-500/10"
              >
                <Send className="w-4 h-4" />
                Kirim Balasan
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
