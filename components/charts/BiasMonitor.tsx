"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

interface BiasMonitorProps {
  data: Array<{
    segment: string;
    truePositiveRate: number;
    falsePositiveRate: number;
    count: number;
  }>;
}

function hasBias(value: number, allValues: number[]): boolean {
  if (allValues.length === 0) return false;
  const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
  return Math.abs(value - avg) > 0.1;
}

export function BiasMonitor({ data }: BiasMonitorProps) {
  const allTprs = data.map((d) => d.truePositiveRate);
  const allFprs = data.map((d) => d.falsePositiveRate);

  const flaggedSegments = data.filter(
    (d) =>
      hasBias(d.truePositiveRate, allTprs) ||
      hasBias(d.falsePositiveRate, allFprs)
  );

  return (
    <div className="bg-swed-card border border-swed-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">
            Fairness / Bias Monitor
          </h3>
          <p className="text-xs text-[#8899AA] mt-0.5">
            Model performance across demographic segments
          </p>
        </div>
        {flaggedSegments.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning/10 text-warning">
            {flaggedSegments.length} segment
            {flaggedSegments.length > 1 ? "s" : ""} flagged
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-[#8899AA] py-8 text-center">
          No bias data available
        </p>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2A3545"
                vertical={false}
              />
              <XAxis
                dataKey="segment"
                tick={{ fill: "#8899AA", fontSize: 11 }}
                axisLine={{ stroke: "#2A3545" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                tick={{ fill: "#8899AA", fontSize: 11 }}
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
                formatter={(value, name) => [
                  `${(Number(value) * 100).toFixed(1)}%`,
                  String(name),
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#8899AA" }} />
              <Bar
                dataKey="truePositiveRate"
                name="True Positive Rate"
                radius={[4, 4, 0, 0]}
                barSize={20}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      hasBias(entry.truePositiveRate, allTprs)
                        ? "#FFBE0B"
                        : "#00C48C"
                    }
                  />
                ))}
              </Bar>
              <Bar
                dataKey="falsePositiveRate"
                name="False Positive Rate"
                radius={[4, 4, 0, 0]}
                barSize={20}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      hasBias(entry.falsePositiveRate, allFprs)
                        ? "#FFBE0B"
                        : "#FF4757"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Flagged segments */}
      {flaggedSegments.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {flaggedSegments.map((seg) => (
            <div
              key={seg.segment}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/5 border border-warning/20"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
              <span className="text-[11px] text-[#8899AA]">
                <span className="text-white font-medium">{seg.segment}</span>
                {" — performance differs significantly from average"}
                <span className="font-data text-[#556677] ml-1">
                  (n={seg.count.toLocaleString()})
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
