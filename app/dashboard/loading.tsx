export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col font-sans animate-pulse">
      {/* Header Skeleton */}
      <header className="h-13 px-6 sm:px-8 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa]/95 dark:bg-[#09090b]/95 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-4 w-28 bg-zinc-200 dark:bg-white/[0.08] rounded" />
          <div className="h-3 w-44 bg-zinc-200/60 dark:bg-white/[0.04] rounded hidden md:block" />
        </div>
        <div className="h-7 w-16 bg-zinc-200/60 dark:bg-white/[0.05] rounded-md" />
      </header>

      {/* Main Content Skeleton */}
      <main className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pb-8 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-2.5 w-16 bg-zinc-200/60 dark:bg-white/[0.04] rounded" />
              <div className="h-6 w-20 bg-zinc-200 dark:bg-white/[0.08] rounded" />
              <div className="h-2.5 w-24 bg-zinc-200/40 dark:bg-white/[0.03] rounded" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-white/[0.08] rounded" />
          <div className="h-48 w-full bg-zinc-200/40 dark:bg-white/[0.03] rounded-lg border border-[#e7e7e5]/60 dark:border-white/[0.04]" />
        </div>
      </main>
    </div>
  );
}
