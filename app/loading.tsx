export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo Pulse */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/25 animate-pulse-glow">
            F
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-[3px] border-[#F8FAFC] animate-bounce" />
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h3 className="text-sm font-bold text-slate-800">Memuat FlashWork...</h3>
          <p className="text-[10px] font-medium text-slate-400">Menyiapkan dashboard dan layanan Anda</p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
            style={{
              animation: 'shimmer 1.5s ease-in-out infinite',
              backgroundSize: '200% 100%',
              width: '60%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
