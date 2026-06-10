export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo Pulse */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 animate-pulse-glow overflow-hidden">
            <svg viewBox="0 0 32 32" fill="none" className="w-9 h-9">
              <path d="M20 4L8 18h10l-6 10 16-16H18L20 4z" fill="white" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-[3px] border-[#F8FAFC] animate-bounce" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h3 className="text-sm font-black text-slate-800 tracking-tight">FlashWork</h3>
          <p className="text-[10px] font-medium text-slate-400">Memuat layanan Anda...</p>
        </div>

        {/* Animated shimmer bar */}
        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 animate-gradient"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
