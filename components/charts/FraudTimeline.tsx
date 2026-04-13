"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FraudTimelineProps {
  data: Array<{ date: string; total: number; fraudulent: number }>;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 border border-white/10 shadow-2xl"
      style={{
        background: "rgba(15, 25, 35, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <p className="text-xs text-[#8899AA] mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-[#8899AA]">{entry.name}</span>
          </div>
          <span className="font-data text-sm font-semibold text-white">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function FraudTimeline({ data }: FraudTimelineProps) {
  return (
    <div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="gradTotalEnhanced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6100" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#FF6100" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#FF6100" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradFraudEnhanced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#EF4444" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2A3545"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8899AA", fontSize: 10 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#8899AA", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#FF6100"
              strokeWidth={2.5}
              fill="url(#gradTotalEnhanced)"
              name="Total"
              dot={false}
              activeDot={{ r: 5, fill: "#FF6100", stroke: "#0F1923", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="fraudulent"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#gradFraudEnhanced)"
              name="Flagged"
              dot={false}
              activeDot={{ r: 4, fill: "#EF4444", stroke: "#0F1923", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#FF6100" }} />
          <span className="text-[11px] text-[#8899AA]">Total Transactions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" />
          <span className="text-[11px] text-[#8899AA]">Flagged</span>
        </div>
      </div>
    </div>
  );
}
