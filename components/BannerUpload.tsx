'use client';

import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/contexts/ToastContext';

interface BannerUploadProps {
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
}

export default function BannerUpload({ onUploadComplete, currentUrl }: BannerUploadProps) {
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

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Format file harus JPG, PNG, atau WEBP');
            return;
        }

        setUploading(true);

        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `banner_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage (course-thumbnails bucket)
            const { data, error } = await supabase.storage
                .from('course-thumbnails')
                .upload(filePath, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('course-thumbnails')
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onUploadComplete(publicUrl);
            toast.success('Banner berhasil diupload');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Gagal mengupload banner');
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
                Banner Lomba
            </label>

            {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 transition-colors glass">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG, WEBP (Max. 5MB)</p>
                        <p className="text-xs text-gray-600 mt-2">Rekomendasi: 1200x600 px</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            ) : (
                <div className="relative glass-strong rounded-xl overflow-hidden group">
                    <img
                        src={preview}
                        alt="Banner Preview"
                        className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
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
