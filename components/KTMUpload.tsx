'use client';

import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/contexts/ToastContext';

interface KTMUploadProps {
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
}

export default function KTMUpload({ onUploadComplete, currentUrl }: KTMUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const toast = useToast();
    const supabase = createClient();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('Ukuran file maksimal 5MB');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Format file harus JPG, PNG, atau PDF');
            return;
        }

        setUploading(true);

        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `ktm/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('ktm-uploads')
                .upload(filePath, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('ktm-uploads')
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onUploadComplete(publicUrl);
            toast.success('KTM berhasil diupload');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Gagal mengupload KTM');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setPreview(null);
        onUploadComplete('');
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-300">
                Upload Kartu Tanda Mahasiswa (KTM) <span className="text-red-400">*</span>
            </label>

            {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 transition-colors glass">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG atau PDF (Max. 5MB)</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            ) : (
                <div className="relative glass-strong rounded-xl p-4">
                    <button
                        onClick={removeFile}
                        className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-red-400" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">KTM Uploaded</p>
                            <p className="text-xs text-gray-400">File berhasil diupload</p>
                        </div>
                    </div>
                </div>
            )}

            {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                    Uploading...
                </div>
            )}
        </div>
    );
}
