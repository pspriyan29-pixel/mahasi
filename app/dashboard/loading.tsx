export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Skeleton Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-6 w-56" />
          <div className="skeleton h-3 w-80" />
        </div>
        <div className="skeleton h-10 w-32 rounded-xl" />
      </div>

      {/* Skeleton Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Skeleton Content */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4">
        <div className="skeleton h-5 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="space-y-2 flex-1">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-64" />
              </div>
              <div className="skeleton h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
