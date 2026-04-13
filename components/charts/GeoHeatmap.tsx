"use client";

import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface GeoHeatmapProps {
  data: Array<{
    country: string;
    countryCode: string;
    count: number;
    fraudCount: number;
  }>;
}

function getFraudRateColor(rate: number): string {
  if (rate >= 0.1) return "bg-danger/20 text-danger border-danger/30";
  if (rate >= 0.05) return "bg-warning/20 text-warning border-warning/30";
  if (rate >= 0.02) return "bg-info/20 text-info border-info/30";
  return "bg-success/20 text-success border-success/30";
}

function getBarColor(rate: number): string {
  if (rate >= 0.1) return "from-danger to-danger/60";
  if (rate >= 0.05) return "from-warning to-warning/60";
  if (rate >= 0.02) return "from-[#FF6100] to-[#FF8533]";
  return "from-success to-success/60";
}

function getBarWidth(rate: number, maxRate: number): string {
  if (maxRate === 0) return "0%";
  return `${Math.max((rate / maxRate) * 100, 6)}%`;
}

export function GeoHeatmap({ data }: GeoHeatmapProps) {
  const sorted = [...data].sort((a, b) => b.fraudCount - a.fraudCount);
  const maxRate =
    sorted.length > 0
      ? Math.max(...sorted.map((d) => (d.count > 0 ? d.fraudCount / d.count : 0)))
      : 0;

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#8899AA]">
        <Globe className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm">No geographic data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-swed-surface/50 border border-swed-border/50">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#FF6100]" />
          <span className="text-xs text-[#8899AA]">
            <span className="text-white font-data font-semibold">{sorted.length}</span> countries monitored
          </span>
        </div>
        <div className="h-3 w-px bg-swed-border" />
        <span className="text-xs text-[#8899AA]">
          Highest risk: <span className="text-danger font-data font-medium">
            {sorted[0]?.country}
          </span>
        </span>
      </div>

      <div className="space-y-1">
        {sorted.map((row, index) => {
          const rate = row.count > 0 ? row.fraudCount / row.count : 0;
          const rateColor = getFraudRateColor(rate);
          const barColor = getBarColor(rate);

          return (
            <div
              key={row.countryCode}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-swed-surface/60",
                index === 0 && "bg-swed-surface/30"
              )}
            >
              {/* Rank */}
              <span className="font-data text-[10px] text-[#556677] w-4 text-right">
                {index + 1}
              </span>

              {/* Country */}
              <div className="flex items-center gap-2 w-28 shrink-0">
                <span className="font-data text-[10px] text-[#556677] bg-swed-surface px-1.5 py-0.5 rounded">
                  {row.countryCode}
                </span>
                <span className="text-sm text-white truncate">{row.country}</span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-2.5 rounded-full bg-swed-surface overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                    barColor
                  )}
                  style={{ width: getBarWidth(rate, maxRate) }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-data text-xs text-[#8899AA] w-12 text-right">
                  {row.fraudCount.toLocaleString()}
                </span>
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-[10px] font-data font-semibold border w-14 text-center",
                    rateColor
                  )}
                >
                  {(rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-swed-border/50">
        {[
          { label: "Low", color: "bg-success" },
          { label: "Medium", color: "bg-info" },
          { label: "High", color: "bg-warning" },
          { label: "Critical", color: "bg-danger" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", item.color)} />
            <span className="text-[10px] text-[#8899AA]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
