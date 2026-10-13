export interface ParameterItem {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  defaultVal?: string;
}

interface ParamTableProps {
  title?: string;
  params: ParameterItem[];
}

export function ParamTable({ title, params }: ParamTableProps) {
  return (
    <div className="my-6 font-sans">
      {title && (
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
          {title}
        </h4>
      )}
      <div className="divide-y divide-[#e7e7e5] dark:divide-white/[0.08] border-y border-[#e7e7e5] dark:border-white/[0.08]">
        {params.map((p) => (
          <div key={p.name} className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 text-xs">
            <div className="sm:w-1/3 shrink-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-semibold text-[#111111] dark:text-white">
                  {p.name}
                </span>
                {p.required ? (
                  <span className="text-[10px] font-medium text-red-600 dark:text-red-400">
                    required
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    optional
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  {p.type}
                </span>
                {p.defaultVal && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    = {p.defaultVal}
                  </span>
                )}
              </div>
            </div>
            <div className="sm:w-2/3 text-zinc-600 dark:text-zinc-300 leading-relaxed text-xs">
              {p.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
