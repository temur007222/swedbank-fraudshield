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

interface ExplainabilityPanelProps {
  features: Record<string, number>;
}

export function ExplainabilityPanel({ features }: ExplainabilityPanelProps) {
  const data = Object.entries(features)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  const getBarColor = (score: number) => {
    if (score >= 0.7) return "#FF4757";
    if (score >= 0.4) return "#FFBE0B";
    return "#00C48C";
  };

  return (
    <div className="bg-swed-card border border-swed-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-white mb-4">
        AI Risk Factor Breakdown
      </h3>
      <div style={{ width: "100%", height: Math.max(data.length * 40 + 20, 160) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2A3545"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 1]}
              tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
              tick={{ fill: "#8899AA", fontSize: 11 }}
              axisLine={{ stroke: "#2A3545" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: "#FFFFFF", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E2A3A",
                border: "1px solid #2A3545",
                borderRadius: 8,
                color: "#FFFFFF",
                fontSize: 12,
              }}
              formatter={(value) => [
                `${(Number(value) * 100).toFixed(1)}%`,
                "Importance",
              ]}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
