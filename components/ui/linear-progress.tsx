"use client";

interface LinearProgressProps {
  isVisible?: boolean;
  className?: string;
}

export function LinearProgress({ isVisible = true, className = "" }: LinearProgressProps) {
  if (!isVisible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className={`fixed top-0 left-0 right-0 h-[2.5px] z-50 overflow-hidden pointer-events-none bg-zinc-200/30 dark:bg-white/[0.04] ${className}`}
    >
      <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#ff6600] to-transparent animate-shimmer-progress shadow-[0_0_10px_rgba(255,102,0,0.6)]" />
    </div>
  );
}
