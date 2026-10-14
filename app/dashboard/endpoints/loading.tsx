export default function EndpointsLoading() {
  return (
    <div className="flex-1 flex flex-col font-sans animate-pulse">
      <header className="h-13 px-6 sm:px-8 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa]/95 dark:bg-[#09090b]/95 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-white/[0.08] rounded" />
          <div className="h-3 w-52 bg-zinc-200/60 dark:bg-white/[0.04] rounded hidden md:block" />
        </div>
        <div className="h-7 w-16 bg-zinc-200/60 dark:bg-white/[0.05] rounded-md" />
      </header>

      <main className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7e7e5] dark:border-white/[0.08]">
              <div className="space-y-1">
                <div className="h-4 w-36 bg-zinc-200 dark:bg-white/[0.08] rounded" />
                <div className="h-3 w-52 bg-zinc-200/60 dark:bg-white/[0.04] rounded" />
              </div>
              <div className="h-3.5 w-12 bg-zinc-200/50 dark:bg-white/[0.04] rounded" />
            </div>

            <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-48 bg-zinc-200/70 dark:bg-white/[0.06] rounded" />
                        <div className="h-4 w-14 bg-zinc-200/50 dark:bg-white/[0.04] rounded-full" />
                      </div>
                      <div className="h-3 w-64 bg-zinc-200/40 dark:bg-white/[0.03] rounded" />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="h-7 w-7 bg-zinc-200/40 dark:bg-white/[0.04] rounded" />
                      <div className="h-7 w-7 bg-zinc-200/40 dark:bg-white/[0.04] rounded" />
                    </div>
                  </div>
                  <div className="h-8 w-full max-w-md bg-zinc-200/30 dark:bg-white/[0.03] rounded-md" />
                </div>
              ))}
            </div>
          </section>

          <aside className="border border-[#e7e7e5] dark:border-white/[0.08] rounded-xl p-5 bg-[#fafaf9] dark:bg-[#09090b] space-y-4 h-fit">
            <div className="space-y-1">
              <div className="h-4 w-28 bg-zinc-200 dark:bg-white/[0.08] rounded" />
              <div className="h-3 w-44 bg-zinc-200/60 dark:bg-white/[0.04] rounded" />
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-8 w-full bg-zinc-200/50 dark:bg-white/[0.04] rounded-md" />
              <div className="h-8 w-full bg-zinc-200/50 dark:bg-white/[0.04] rounded-md" />
              <div className="h-8 w-full bg-zinc-200/50 dark:bg-white/[0.04] rounded-md" />
              <div className="h-8 w-full bg-zinc-200 dark:bg-white/[0.08] rounded-md mt-4" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
