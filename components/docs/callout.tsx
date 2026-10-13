import React from "react";
import { Info, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

interface CalloutProps {
  type?: "note" | "tip" | "warning" | "security";
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const configs = {
    note: {
      icon: Info,
      border: "border-blue-200 dark:border-blue-500/20",
      bg: "bg-blue-50/60 dark:bg-blue-500/5",
      titleColor: "text-blue-900 dark:text-blue-300",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    tip: {
      icon: CheckCircle2,
      border: "border-emerald-200 dark:border-emerald-500/20",
      bg: "bg-emerald-50/60 dark:bg-emerald-500/5",
      titleColor: "text-emerald-900 dark:text-emerald-300",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      icon: AlertTriangle,
      border: "border-amber-200 dark:border-amber-500/20",
      bg: "bg-amber-50/60 dark:bg-amber-500/5",
      titleColor: "text-amber-900 dark:text-amber-300",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    security: {
      icon: ShieldAlert,
      border: "border-[#ff6600]/30 dark:border-[#ff6600]/20",
      bg: "bg-[#ff6600]/5 dark:bg-[#ff6600]/5",
      titleColor: "text-[#ff6600] dark:text-[#ff771a]",
      iconColor: "text-[#ff6600]",
    },
  };

  const cfg = configs[type];
  const Icon = cfg.icon;

  return (
    <div className={`my-5 rounded-lg border p-4 text-xs leading-relaxed ${cfg.border} ${cfg.bg}`}>
      <div className="flex items-start gap-2.5">
        <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.iconColor}`} />
        <div className="space-y-1">
          {title && <h5 className={`font-semibold ${cfg.titleColor}`}>{title}</h5>}
          <div className="text-zinc-700 dark:text-zinc-300 space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
