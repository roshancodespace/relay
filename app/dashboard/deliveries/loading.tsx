export default function DeliveriesLoading() {
  return (
    <div className="flex-1 flex flex-col font-sans animate-pulse">
      <header className="h-13 px-6 sm:px-8 border-b border-[#e7e7e5] dark:border-white/[0.08] bg-[#fbfbfa]/95 dark:bg-[#09090b]/95 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-white/[0.08] rounded" />
          <div className="h-3 w-48 bg-zinc-200/60 dark:bg-white/[0.04] rounded hidden md:block" />
        </div>
        <div className="h-7 w-16 bg-zinc-200/60 dark:bg-white/[0.05] rounded-md" />
      </header>

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#e7e7e5] dark:border-white/[0.08]">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-7 w-16 bg-zinc-200/50 dark:bg-white/[0.04] rounded-md" />
            ))}
          </div>
          <div className="h-8 w-full sm:w-72 bg-zinc-200/50 dark:bg-white/[0.04] rounded-md" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e7e7e5] dark:border-white/[0.08] text-xs text-zinc-500 dark:text-zinc-400">
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Event</th>
                <th className="py-2.5 px-3 font-medium">Destination</th>
                <th className="py-2.5 px-3 font-medium text-center">Attempts</th>
                <th className="py-2.5 px-3 font-medium">Created</th>
                <th className="py-2.5 px-3 font-medium">Next Retry</th>
                <th className="py-2.5 px-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e7e5] dark:divide-white/[0.06] text-xs">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="py-3 px-3">
                    <div className="h-5 w-16 bg-zinc-200/70 dark:bg-white/[0.06] rounded-full" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-24 bg-zinc-200/70 dark:bg-white/[0.06] rounded" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-40 bg-zinc-200/50 dark:bg-white/[0.04] rounded" />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="h-4 w-8 bg-zinc-200/50 dark:bg-white/[0.04] rounded mx-auto" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-16 bg-zinc-200/50 dark:bg-white/[0.04] rounded" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-12 bg-zinc-200/40 dark:bg-white/[0.03] rounded" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="h-4 w-12 bg-zinc-200/50 dark:bg-white/[0.04] rounded ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
