import React from "react";

export function ProgressiveBlur({ className = "" }: { className?: string }) {
  return (
    <div
      className={`progressive-blur progressive-blur-top ${className}`}
      aria-hidden="true"
    >
      {/* <div className="blur-layer layer-1" />
      <div className="blur-layer layer-2" />
      <div className="blur-layer layer-3" />
      <div className="blur-layer layer-4" />
      <div className="blur-layer layer-5" />
      <div className="blur-layer layer-6" />
      <div className="blur-layer layer-7" />
      <div className="blur-layer layer-8" /> */}
      <div className="gradient-layer" />
    </div>
  );
}
