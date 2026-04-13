"use client";

import { cn } from "@/lib/utils";

interface LiveDemoToggleProps {
  isLive: boolean;
  onToggle: (live: boolean) => void;
}

export function LiveDemoToggle({ isLive, onToggle }: LiveDemoToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isLive)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-swed-border bg-swed-surface hover:bg-swed-card transition-colors"
    >
      <span className="relative flex h-2.5 w-2.5">
        {isLive && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-livePulse" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full transition-colors",
            isLive ? "bg-success" : "bg-[#556677]"
          )}
        />
      </span>
      <span className="text-xs font-medium text-white whitespace-nowrap">
        Live Demo
      </span>
      <div
        className={cn(
          "relative w-7 h-4 rounded-full transition-colors",
          isLive ? "bg-success/30" : "bg-swed-border"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 h-3 w-3 rounded-full transition-all duration-200",
            isLive
              ? "left-3.5 bg-success"
              : "left-0.5 bg-[#556677]"
          )}
        />
      </div>
    </button>
  );
}
