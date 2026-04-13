"use client";

import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  className?: string;
}

const riskConfig = {
  LOW: { bg: "bg-success/15", text: "text-success", border: "border-success/30" },
  MEDIUM: { bg: "bg-warning/15", text: "text-warning", border: "border-warning/30" },
  HIGH: { bg: "bg-swed-orange/15", text: "text-swed-orange", border: "border-swed-orange/30" },
  CRITICAL: { bg: "bg-danger/20", text: "text-danger", border: "border-danger/40" },
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm",
        config.bg,
        config.text,
        config.border,
        (level === "CRITICAL" || level === "HIGH") && "risk-pulse",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          level === "LOW" && "bg-success",
          level === "MEDIUM" && "bg-warning",
          level === "HIGH" && "bg-swed-orange dot-pulse",
          level === "CRITICAL" && "bg-danger dot-pulse"
        )}
      />
      {level}
    </span>
  );
}
