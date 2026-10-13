import React from "react";

export type DeliveryStatus = "pending" | "retrying" | "delivered" | "failed";

interface StatusBadgeProps {
  status: DeliveryStatus | string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  let bg = "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
  let dot = "bg-blue-500";
  let label = "Pending";

  switch (status) {
    case "delivered":
      bg = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      dot = "bg-emerald-500";
      label = "Delivered";
      break;
    case "retrying":
      bg = "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      dot = "bg-amber-500";
      label = "Retrying";
      break;
    case "failed":
      bg = "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20";
      dot = "bg-red-500";
      label = "Failed";
      break;
    case "pending":
    default:
      bg = "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
      dot = "bg-blue-500";
      label = "Pending";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] border font-medium ${bg} ${className || ""}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dot} ${status === "retrying" ? "animate-pulse" : ""}`}
        />
      )}
      <span>{label}</span>
    </span>
  );
}
