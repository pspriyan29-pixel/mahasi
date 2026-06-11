'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { toast } from 'sonner';
import { 
  User, Mail, Phone, Upload, Loader2, Save,
  ShieldCheck, PackageCheck, AlertCircle, Camera
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function UserProfilePage() {
  const { user, updateProfile, orders, revisions } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  // Stats
  const userOrders = orders.filter(o => o.user_id === user.id);
  const totalCompleted = userOrders.filter(o => o.status === 'completed').length;
  const activeOrders = userOrders.filter(o => !['completed', 'cancelled', 'failed', 'rejected'].includes(o.status)).length;
  const userRevisions = revisions.filter(r => r.user_id === user.id).length;

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Nama lengkap tidak boleh kosong!');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone: phone
      });
      toast.success('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (e) {
      toast.error('Gagal memperbarui profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5 MB!');
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      await updateProfile({ avatar_url: publicUrl });
      toast.success('Foto profil berhasil diunggah!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunggah foto profil.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pengaturan Profil</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola informasi pribadi dan preferensi akun Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Col: Avatar & Stats */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-500 to-indigo-600" />
            
            <div className="relative mt-8 mb-4">
              <div className="w-24 h-24 mx-auto bg-white rounded-full p-1 shadow-lg relative group">
                <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-100">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-slate-300">
                      {user.full_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Upload Button overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                />
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-800">{user.full_name}</h2>
            <p className="text-xs font-semibold text-slate-400 capitalize mb-4">{user.role}</p>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
              <div className="text-center">
                <span className="block text-lg font-black text-blue-600">{userOrders.length}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pesanan</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-black text-emerald-600">{totalCompleted}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Selesai</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-black text-amber-600">{userRevisions}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Revisi</span>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-800">Akun Terverifikasi</h4>
              <p className="text-[10px] text-emerald-600 mt-1 leading-relaxed">Akun Anda dilindungi oleh enkripsi Supabase. Data Anda aman bersama kami.</p>
            </div>
          </div>
        </div>

        {/* Right Col: Form Edit */}
        <div className="md:col-span-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" /> Data Pribadi
              </h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit Profil
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(user.full_name || '');
                    setPhone(user.phone || '');
                  }}
                  className="text-xs font-bold text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Batal
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email (Tidak bisa diubah)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    value={user.email || 'email@example.com'}
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-800">Ubah Kata Sandi</h4>
              <p className="text-[10px] text-amber-700 mt-1 leading-relaxed">
                Untuk mengubah kata sandi, silakan logout terlebih dahulu lalu gunakan fitur "Lupa Password" pada halaman login.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
