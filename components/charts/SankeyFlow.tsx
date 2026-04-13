"use client";

import { useMemo } from "react";
import {
  Building2,
  Phone,
  Shield,
  ArrowRight,
  AlertTriangle,
  Search,
  Gavel,
} from "lucide-react";

interface SankeyFlowProps {
  flows: Array<{ source: string; target: string; value: number }>;
}

const STAGES = [
  {
    key: "Bank",
    label: "Bank",
    subtitle: "Detection & Blocking",
    icon: Building2,
    color: "#FF6100",
    bgColor: "rgba(255, 97, 0, 0.08)",
    borderColor: "rgba(255, 97, 0, 0.25)",
    glowColor: "rgba(255, 97, 0, 0.15)",
    description: "AI monitors transactions, flags anomalies, blocks suspicious activity",
  },
  {
    key: "Telecom",
    label: "Telecom",
    subtitle: "Communication Analysis",
    icon: Phone,
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.08)",
    borderColor: "rgba(59, 130, 246, 0.25)",
    glowColor: "rgba(59, 130, 246, 0.15)",
    description: "Cross-references phone metadata, traces spoofed caller IDs",
  },
  {
    key: "Authority",
    label: "Authority (FID)",
    subtitle: "Investigation & Enforcement",
    icon: Shield,
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.25)",
    glowColor: "rgba(139, 92, 246, 0.15)",
    description: "Issues legal orders, coordinates prosecution, closes cases",
  },
];

const FLOW_LABELS: Record<string, { label: string; icon: typeof ArrowRight; severity: "high" | "medium" | "low" }> = {
  "Bank\u2192Telecom": { label: "Anonymized alert + phone metadata request", icon: AlertTriangle, severity: "high" },
  "Bank\u2192Authority": { label: "Escalated case with evidence bundle", icon: AlertTriangle, severity: "high" },
  "Telecom\u2192Authority": { label: "Communication patterns + trace results", icon: Search, severity: "medium" },
  "Telecom\u2192Bank": { label: "Confirmed spoofed numbers / phishing links", icon: Search, severity: "medium" },
  "Authority\u2192Bank": { label: "Legal orders / account freeze directives", icon: Gavel, severity: "low" },
  "Authority\u2192Telecom": { label: "Number block orders / tap warrants", icon: Gavel, severity: "low" },
};

const SEVERITY_FLOW_COLORS: Record<string, { line: string; glow: string }> = {
  high: { line: "rgba(255, 71, 87, 0.6)", glow: "rgba(255, 71, 87, 0.2)" },
  medium: { line: "rgba(255, 190, 11, 0.6)", glow: "rgba(255, 190, 11, 0.2)" },
  low: { line: "rgba(0, 196, 140, 0.5)", glow: "rgba(0, 196, 140, 0.15)" },
};

export function SankeyFlow({ flows }: SankeyFlowProps) {
  const flowMap = useMemo(() => {
    const m = new Map<string, number>();
    flows.forEach((f) => {
      m.set(`${f.source}\u2192${f.target}`, f.value);
    });
    return m;
  }, [flows]);

  const totalFlows = flows.reduce((sum, f) => sum + f.value, 0);

  if (flows.length === 0) {
    return (
      <div className="bg-swed-card border border-swed-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-4">
          Cross-Sector Case Flow
        </h3>
        <p className="text-sm text-[#8899AA] py-8 text-center">
          No flow data available
        </p>
      </div>
    );
  }

  // Get flows between stages
  const stageFlows: Array<{
    from: number;
    to: number;
    value: number;
    key: string;
  }> = [];

  STAGES.forEach((s, si) => {
    STAGES.forEach((t, ti) => {
      if (si !== ti) {
        const key = `${s.key}\u2192${t.key}`;
        const val = flowMap.get(key);
        if (val && val > 0) {
          stageFlows.push({ from: si, to: ti, value: val, key });
        }
      }
    });
  });

  const maxFlowValue = Math.max(...stageFlows.map((f) => f.value), 1);

  return (
    <div className="bg-swed-card border border-swed-border rounded-2xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Cross-Sector Case Flow
          </h3>
          <p className="text-[11px] text-[#667788] mt-0.5">
            Real-time routing between detection, analysis, and enforcement
          </p>
        </div>
        <span className="text-xs font-mono text-swed-orange bg-swed-orange/10 px-3 py-1.5 rounded-lg border border-swed-orange/20 font-semibold">
          {totalFlows} total
        </span>
      </div>

      {/* Main flow diagram */}
      <div className="relative">
        {/* Stage cards */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const inbound = flows
              .filter((f) => f.target === stage.key)
              .reduce((s, f) => s + f.value, 0);
            const outbound = flows
              .filter((f) => f.source === stage.key)
              .reduce((s, f) => s + f.value, 0);

            return (
              <div
                key={stage.key}
                className="rounded-xl p-4 text-center relative group hover:scale-[1.02] transition-transform duration-200"
                style={{
                  background: stage.bgColor,
                  border: `1px solid ${stage.borderColor}`,
                  boxShadow: `0 0 30px ${stage.glowColor}`,
                }}
              >
                {/* Step number */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                  style={{
                    background: stage.color,
                    color: "#0A1628",
                    boxShadow: `0 0 12px ${stage.glowColor}`,
                  }}
                >
                  {i + 1}
                </div>

                <div
                  className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 mt-1"
                  style={{
                    background: `${stage.color}15`,
                    border: `1px solid ${stage.color}25`,
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: stage.color }}
                  />
                </div>

                <h4
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: stage.color }}
                >
                  {stage.label}
                </h4>
                <p className="text-[10px] text-[#8899AA] font-medium uppercase tracking-wider mb-2">
                  {stage.subtitle}
                </p>
                <p className="text-[11px] text-[#8899AA] leading-relaxed mb-3">
                  {stage.description}
                </p>

                {/* Stats */}
                <div className="flex justify-center gap-3 text-[10px]">
                  {inbound > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${stage.color}10`,
                        border: `1px solid ${stage.color}20`,
                        color: "#00C48C",
                      }}
                    >
                      &darr; {inbound} in
                    </span>
                  )}
                  {outbound > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${stage.color}10`,
                        border: `1px solid ${stage.color}20`,
                        color: stage.color,
                      }}
                    >
                      &uarr; {outbound} out
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Flow arrows between stages */}
        <div className="mt-5 space-y-2">
          {stageFlows.map((flow) => {
            const info = FLOW_LABELS[flow.key];
            const fromStage = STAGES[flow.from];
            const toStage = STAGES[flow.to];
            const isForward = flow.from < flow.to;
            const FlowIcon = info?.icon || ArrowRight;
            const severity = info?.severity || "medium";
            const sevColors = SEVERITY_FLOW_COLORS[severity];
            const barWidth = Math.max(20, (flow.value / maxFlowValue) * 100);

            return (
              <div
                key={flow.key}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 group hover:bg-swed-surface/50 transition-all duration-200 cursor-default relative overflow-hidden"
                style={{
                  background: "rgba(30, 42, 58, 0.3)",
                }}
              >
                {/* Background intensity bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-xl opacity-[0.08] transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(to right, ${fromStage.color}, ${toStage.color})`,
                  }}
                />

                {/* Source badge */}
                <span
                  className="relative text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={{
                    color: fromStage.color,
                    background: `${fromStage.color}15`,
                    border: `1px solid ${fromStage.color}30`,
                  }}
                >
                  {fromStage.key}
                </span>

                {/* Arrow with gradient line */}
                <div className="relative flex items-center gap-1.5 flex-1 min-w-0">
                  <div
                    className="h-[2px] flex-1 rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${fromStage.color}60, ${sevColors.line})`,
                      boxShadow: `0 0 6px ${sevColors.glow}`,
                    }}
                  />
                  <div
                    className="p-1 rounded-full shrink-0"
                    style={{
                      background: sevColors.glow,
                    }}
                  >
                    <FlowIcon
                      className="h-3 w-3 shrink-0"
                      style={{
                        color: isForward ? toStage.color : fromStage.color,
                      }}
                    />
                  </div>
                  <div
                    className="h-[2px] flex-1 rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${sevColors.line}, ${toStage.color}60)`,
                      boxShadow: `0 0 6px ${sevColors.glow}`,
                    }}
                  />
                </div>

                {/* Target badge */}
                <span
                  className="relative text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={{
                    color: toStage.color,
                    background: `${toStage.color}15`,
                    border: `1px solid ${toStage.color}30`,
                  }}
                >
                  {toStage.key}
                </span>

                {/* Flow count */}
                <span
                  className="relative text-xs font-mono font-bold shrink-0 ml-1 px-2 py-0.5 rounded-md"
                  style={{
                    color: sevColors.line,
                    background: `${sevColors.glow}`,
                  }}
                >
                  {flow.value}
                </span>

                {/* Description */}
                <p className="relative text-[10px] text-[#8899AA] truncate hidden lg:block ml-1 group-hover:text-[#AABBCC] transition-colors">
                  {info?.label || "Cross-sector data exchange"}
                </p>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-swed-border/50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#667788] uppercase tracking-wider font-medium">Severity</span>
            <div className="flex items-center gap-3">
              {[
                { label: "High", color: SEVERITY_FLOW_COLORS.high.line },
                { label: "Medium", color: SEVERITY_FLOW_COLORS.medium.line },
                { label: "Low", color: SEVERITY_FLOW_COLORS.low.line },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-[2px] rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-[10px] text-[#8899AA]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#667788] uppercase tracking-wider font-medium">Sectors</span>
            <div className="flex items-center gap-3">
              {STAGES.map((stage) => (
                <div key={stage.key} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: stage.color }}
                  />
                  <span className="text-[10px] text-[#8899AA]">{stage.key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
