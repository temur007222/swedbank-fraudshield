"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface FraudByTypeProps {
  data: Array<{ type: string; count: number; color?: string }>;
}

const GRADIENT_COLORS = [
  { start: "#FF6100", end: "#FF8533" },
  { start: "#EF4444", end: "#F87171" },
  { start: "#FFBE0B", end: "#FCD34D" },
  { start: "#0096FF", end: "#60A5FA" },
  { start: "#10B981", end: "#6EE7B7" },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 border border-white/10 shadow-2xl"
      style={{
        background: "rgba(15, 25, 35, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <p className="text-xs text-[#8899AA] mb-1">{label}</p>
      <p className="font-data text-lg font-semibold text-white">
        {payload[0].value.toLocaleString()}
        <span className="text-xs text-[#8899AA] ml-1">cases</span>
      </p>
    </div>
  );
}

export function FraudByType({ data }: FraudByTypeProps) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <defs>
            {GRADIENT_COLORS.map((color, i) => (
              <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.start} stopOpacity={1} />
                <stop offset="100%" stopColor={color.end} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#2A3545"
            vertical={false}
          />
          <XAxis
            dataKey="type"
            tick={{ fill: "#8899AA", fontSize: 11 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8899AA", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,97,0,0.06)" }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
            {data.map((_entry, index) => (
              <Cell
                key={index}
                fill={`url(#barGrad${index % GRADIENT_COLORS.length})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
