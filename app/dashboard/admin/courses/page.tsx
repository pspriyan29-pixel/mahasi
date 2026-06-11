'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { 
  PlusCircle, Edit2, Trash2, BookOpen, 
  Video, Users, Image as ImageIcon,
  CheckCircle, XCircle
} from 'lucide-react';
import { Course } from '@/lib/types';
import Image from 'next/image';

export default function AdminCoursesPage() {
  const { courses, createCourse, updateCourse, deleteCourse } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'online' | 'offline' | 'hybrid'>('online');
  const [price, setPrice] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setDescription('');
    setMode('online');
    setPrice(0);
    setIsActive(true);
    setThumbnailFile(null);
    setThumbnailPreview('');
    setEditingCourse(null);
  };

  const openModal = (course?: Course) => {
    resetForm();
    if (course) {
      setEditingCourse(course);
      setTitle(course.title);
      setSlug(course.slug);
      setDescription(course.description);
      setMode(course.mode);
      setPrice(course.price);
      setIsActive(course.is_active);
      if (course.thumbnail_url) setThumbnailPreview(course.thumbnail_url);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!editingCourse) {
      setSlug(generateSlug(e.target.value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, {
          title, slug, description, mode, price, is_active: isActive
        }, thumbnailFile);
      } else {
        await createCourse({
          title, slug, description, mode, price, is_active: isActive
        }, thumbnailFile);
      }
      closeModal();
    } catch (err) {
      alert('Gagal menyimpan kursus. Pastikan slug unik.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kursus ini secara permanen?')) {
      try {
        await deleteCourse(id);
      } catch (err) {
        alert('Gagal menghapus kursus.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Kursus</h2>
          <p className="text-xs text-slate-400 font-medium">Kelola program kursus online dan offline yang ditampilkan di landing page.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah Kursus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-3xl">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-sm">Belum ada kursus yang ditambahkan.</p>
          </div>
        )}
        
        {courses.map(course => (
          <div key={course.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col group transition-all hover:shadow-xl hover:border-blue-200">
            <div className="h-40 bg-slate-100 relative w-full border-b border-slate-100">
              {course.thumbnail_url ? (
                <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-slate-300">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/90 shadow-sm ${course.mode === 'online' ? 'text-blue-600' : course.mode === 'offline' ? 'text-emerald-600' : 'text-purple-600'}`}>
                  {course.mode}
                </div>
                {!course.is_active && (
                  <div className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 shadow-sm">
                    Draft
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 flex-1 mb-4">{course.description}</p>
              
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Biaya Investasi</p>
                  <p className="font-black text-slate-800">Rp {course.price.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(course)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h3 className="text-lg font-bold text-slate-800">{editingCourse ? 'Edit Kursus' : 'Tambah Kursus Baru'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Kursus</label>
                    <input 
                      type="text" required
                      value={title} onChange={handleTitleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Slug URL</label>
                    <input 
                      type="text" required
                      value={slug} onChange={e => setSlug(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Kursus</label>
                    <textarea 
                      required rows={4}
                      value={description} onChange={e => setDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mode Pembelajaran</label>
                  <select 
                    value={mode} onChange={e => setMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="online">Online Class</option>
                    <option value="offline">Offline / Tatap Muka</option>
                    <option value="hybrid">Hybrid (Online + Offline)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Harga (Rp)</label>
                  <input 
                    type="number" required min="0"
                    value={price} onChange={e => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Thumbnail (Gambar Cover)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-24 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden shrink-0">
                      {thumbnailPreview ? (
                        <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" accept="image/*"
                        onChange={handleFileChange}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                      />
                      <p className="text-[10px] text-slate-400 mt-2">Format: JPG, PNG, WEBP. Maks: 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <input 
                    type="checkbox" id="isActive"
                    checked={isActive} onChange={e => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    Kursus Aktif & Ditampilkan di Halaman Utama
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" onClick={closeModal}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kursus'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
