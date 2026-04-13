"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  iconColor?: string;
  className?: string;
  animationDelay?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-swed-orange",
  className,
  animationDelay = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "fade-up accent-line-orange card-glow bg-swed-card border border-swed-border rounded-xl p-4 relative overflow-hidden",
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={cn("p-2 rounded-lg bg-swed-surface/80 backdrop-blur-sm", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              trend.direction === "up"
                ? "text-success bg-success/10"
                : "text-danger bg-danger/10"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3 trend-arrow-up" />
            ) : (
              <TrendingDown className="h-3 w-3 trend-arrow-down" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="font-data text-2xl font-semibold text-white relative z-10 counter-animate">
        {value}
      </div>
      <p className="text-xs text-[#8899AA] mt-1 relative z-10">{title}</p>
    </div>
  );
}
