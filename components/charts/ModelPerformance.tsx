"use client";

import { cn } from "@/lib/utils";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Brain, Zap, Target, TrendingUp } from "lucide-react";

interface ModelPerformanceProps {
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    f1Score?: number;
    roc_auc?: number;
    auc?: number;
    confusion_matrix?: number[][];
    totalPredictions?: number;
  };
}

const METRIC_LABELS: Record<string, string> = {
  accuracy: "Accuracy",
  precision: "Precision",
  recall: "Recall",
  f1: "F1 Score",
  roc_auc: "ROC AUC",
};

const METRIC_ICONS: Record<string, typeof Brain> = {
  accuracy: Target,
  precision: Zap,
  recall: Brain,
  f1: TrendingUp,
  roc_auc: Target,
};

function MetricBar({
  label,
  value,
  metricKey,
}: {
  label: string;
  value: number;
  metricKey: string;
}) {
  const percent = value * 100;
  const color =
    value >= 0.9
      ? { bar: "from-[#10B981] to-[#6EE7B7]", text: "text-[#10B981]", glow: "shadow-[#10B981]/20" }
      : value >= 0.7
      ? { bar: "from-[#FF6100] to-[#FF8533]", text: "text-[#FF6100]", glow: "shadow-[#FF6100]/20" }
      : value >= 0.5
      ? { bar: "from-warning to-yellow-300", text: "text-warning", glow: "shadow-warning/20" }
      : { bar: "from-danger to-red-300", text: "text-danger", glow: "shadow-danger/20" };

  const Icon = METRIC_ICONS[metricKey] || Target;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5", color.text)} />
          <span className="text-xs text-[#8899AA] group-hover:text-white transition-colors">
            {label}
          </span>
        </div>
        <span className={cn("font-data text-sm font-bold", color.text)}>
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-swed-surface overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700",
            color.bar
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const CM_LABELS = ["True Neg", "False Pos", "False Neg", "True Pos"];
const CM_COLORS = [
  "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20",
  "bg-danger/15 text-danger border-danger/20",
  "bg-danger/15 text-danger border-danger/20",
  "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20",
];

export function ModelPerformance({ metrics }: ModelPerformanceProps) {
  const normalized = {
    accuracy: metrics.accuracy ?? 0,
    precision: metrics.precision ?? 0,
    recall: metrics.recall ?? 0,
    f1: metrics.f1 ?? metrics.f1Score ?? 0,
    roc_auc: metrics.roc_auc ?? metrics.auc ?? 0,
  };

  const radarData = Object.entries(METRIC_LABELS).map(([key, label]) => ({
    metric: label,
    value: normalized[key as keyof typeof normalized] ?? 0,
  }));

  const avgScore =
    Object.values(normalized).reduce((a, b) => a + b, 0) /
    Object.values(normalized).filter((v) => v > 0).length || 0;

  const cm = metrics.confusion_matrix;

  return (
    <div>
      {/* Overall Score Header */}
      <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-swed-surface/50 border border-swed-border/50">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-[#FF6100]/30 flex items-center justify-center">
            <span className="font-data text-lg font-bold text-[#FF6100]">
              {(avgScore * 100).toFixed(0)}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-[#8899AA]">Overall Model Score</p>
          <p className="text-sm text-white font-medium">
            {avgScore >= 0.9
              ? "Excellent Performance"
              : avgScore >= 0.7
              ? "Good Performance"
              : "Needs Improvement"}
          </p>
        </div>
        {metrics.totalPredictions && (
          <div className="ml-auto text-right">
            <p className="font-data text-lg font-semibold text-white">
              {metrics.totalPredictions.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#8899AA]">predictions</p>
          </div>
        )}
      </div>

      {/* Metric Progress Bars */}
      <div className="space-y-3 mb-5">
        {Object.entries(METRIC_LABELS).map(([key, label]) => (
          <MetricBar
            key={key}
            label={label}
            value={normalized[key as keyof typeof normalized] ?? 0}
            metricKey={key}
          />
        ))}
      </div>

      <div className={cn("grid gap-5", cm ? "grid-cols-2" : "grid-cols-1")}>
        {/* Radar chart */}
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <defs>
                <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6100" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF6100" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="#2A3545" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#8899AA", fontSize: 10 }}
              />
              <PolarRadiusAxis
                domain={[0, 1]}
                tick={{ fill: "#556677", fontSize: 9 }}
                axisLine={false}
              />
              <Radar
                dataKey="value"
                stroke="#FF6100"
                fill="url(#radarGrad)"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Confusion matrix */}
        {cm && (
          <div>
            <p className="text-xs text-[#8899AA] mb-3 text-center">
              Confusion Matrix
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-[220px] mx-auto">
              {[cm[0][0], cm[0][1], cm[1][0], cm[1][1]].map((val, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg p-3 text-center border",
                    CM_COLORS[i]
                  )}
                >
                  <p className="font-data text-lg font-semibold">
                    {val.toLocaleString()}
                  </p>
                  <p className="text-[10px] opacity-70 mt-0.5">
                    {CM_LABELS[i]}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="text-[10px] text-[#8899AA]">Correct</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-danger" />
                <span className="text-[10px] text-[#8899AA]">Error</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
