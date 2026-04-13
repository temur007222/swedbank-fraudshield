"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-warning/15", text: "text-warning", border: "border-warning/30" },
  APPROVED: { bg: "bg-success/15", text: "text-success", border: "border-success/30" },
  FLAGGED: { bg: "bg-swed-orange/15", text: "text-swed-orange", border: "border-swed-orange/30" },
  BLOCKED: { bg: "bg-danger/15", text: "text-danger", border: "border-danger/30" },
  UNDER_REVIEW: { bg: "bg-info/15", text: "text-info", border: "border-info/30" },
  ESCALATED: { bg: "bg-danger/15", text: "text-danger", border: "border-danger/30" },
  OPEN: { bg: "bg-warning/15", text: "text-warning", border: "border-warning/30" },
  ACKNOWLEDGED: { bg: "bg-info/15", text: "text-info", border: "border-info/30" },
  IN_PROGRESS: { bg: "bg-swed-orange/15", text: "text-swed-orange", border: "border-swed-orange/30" },
  RESOLVED: { bg: "bg-success/15", text: "text-success", border: "border-success/30" },
  DISMISSED: { bg: "bg-[#8899AA]/15", text: "text-[#8899AA]", border: "border-[#8899AA]/30" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {label}
    </span>
  );
}
