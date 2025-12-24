'use client';

import { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(onClose, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <XCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
    };

    const styles = {
        success: 'border-green-500/30 bg-green-500/10',
        error: 'border-red-500/30 bg-red-500/10',
        warning: 'border-yellow-500/30 bg-yellow-500/10',
        info: 'border-blue-500/30 bg-blue-500/10',
    };

    return (
        <div
            className={`glass-strong border ${styles[toast.type]} rounded-xl p-4 shadow-xl animate-slide-in-right flex items-start gap-3 min-w-[300px]`}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <p className="flex-1 text-sm text-white">{toast.message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
