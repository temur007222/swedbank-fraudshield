"use client";

import { useEffect, useState, useCallback } from "react";
import { SankeyFlow } from "@/components/charts/SankeyFlow";
import { ChainOfResponsibility } from "@/components/dashboard/ChainOfResponsibility";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Loader2,
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Network,
  CheckCircle2,
  Activity,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface ChainStep {
  role: string;
  action: string;
  timestamp: string;
  status: string;
}

interface Alert {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceRole: string;
  targetRole: string;
  description: string;
  status: string;
  createdAt: string;
  transactionId?: string | null;
  chainOfResponsibility?: string;
}

interface Flow {
  source: string;
  target: string;
  value: number;
}

const ROLE_LABELS: Record<string, string> = {
  BANK_ANALYST: "Bank",
  TELECOM_OPERATOR: "Telecom",
  AUTHORITY_OFFICER: "Authority",
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#FF4757",
  HIGH: "#FF6100",
  MEDIUM: "#FFBE0B",
  LOW: "#00C48C",
};

export default function ChainPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : data.alerts ?? []);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const parseChain = (raw?: string): ChainStep[] => {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  // Build flow data from alert source->target roles
  const flows: Flow[] = (() => {
    const flowMap = new Map<string, number>();
    alerts.forEach((a) => {
      const from = ROLE_LABELS[a.sourceRole] ?? a.sourceRole;
      const to = ROLE_LABELS[a.targetRole] ?? a.targetRole;
      const key = `${from}|||${to}`;
      flowMap.set(key, (flowMap.get(key) ?? 0) + 1);
    });
    return Array.from(flowMap.entries()).map(([key, value]) => {
      const [source, target] = key.split("|||");
      return { source, target, value };
    });
  })();

  // Get alerts that have chain data
  const casesWithChain = alerts.filter((a) => {
    const chain = parseChain(a.chainOfResponsibility);
    return chain.length > 0;
  });

  // Also show recent alerts without chain for completeness
  const recentAlerts = alerts
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 20);

  const activeFlows = alerts.filter(
    (a) => a.status === "OPEN" || a.status === "IN_PROGRESS"
  ).length;
  const resolvedFlows = alerts.filter(
    (a) => a.status === "RESOLVED" || a.status === "DISMISSED"
  ).length;
  const resolutionRate =
    alerts.length > 0
      ? Math.round((resolvedFlows / alerts.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-swed-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-swed-card to-swed-surface border border-swed-border rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-swed-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3B82F6]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-swed-orange/10 rounded-xl border border-swed-orange/20">
              <Network className="h-5 w-5 text-swed-orange" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Chain of Responsibility
              </h1>
              <p className="text-sm text-[#8899AA] mt-0.5">
                Cross-sector fraud case flow and responsibility tracking
              </p>
            </div>
          </div>
          <p className="text-xs text-[#667788] max-w-2xl leading-relaxed mt-2">
            This visualization shows how fraud cases flow between Bank, Telecom, and Authority sectors.
            Each alert is routed through a chain of responsibility, with actions tracked at every step
            to ensure full accountability and rapid response.
          </p>
        </div>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-swed-card border border-swed-border rounded-xl p-4 hover:border-swed-orange/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-[#3B82F6]/10">
              <ArrowLeftRight className="h-3.5 w-3.5 text-[#3B82F6]" />
            </div>
            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-medium">
              Total Routed
            </p>
          </div>
          <p className="font-data text-2xl font-semibold text-white">{alerts.length}</p>
          <p className="text-[10px] text-[#667788] mt-1">alerts across sectors</p>
        </div>

        <div className="bg-swed-card border border-swed-border rounded-xl p-4 hover:border-swed-orange/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-swed-orange/10">
              <Activity className="h-3.5 w-3.5 text-swed-orange" />
            </div>
            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-medium">
              Active Flows
            </p>
          </div>
          <p className="font-data text-2xl font-semibold text-swed-orange">{activeFlows}</p>
          <p className="text-[10px] text-[#667788] mt-1">currently in progress</p>
        </div>

        <div className="bg-swed-card border border-swed-border rounded-xl p-4 hover:border-swed-orange/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-success/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            </div>
            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-medium">
              Resolution Rate
            </p>
          </div>
          <p className="font-data text-2xl font-semibold text-success">{resolutionRate}%</p>
          <p className="text-[10px] text-[#667788] mt-1">{resolvedFlows} cases resolved</p>
        </div>

        <div className="bg-swed-card border border-swed-border rounded-xl p-4 hover:border-swed-orange/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-[#8B5CF6]/10">
              <Shield className="h-3.5 w-3.5 text-[#8B5CF6]" />
            </div>
            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-medium">
              Chain Tracked
            </p>
          </div>
          <p className="font-data text-2xl font-semibold text-white">{casesWithChain.length}</p>
          <p className="text-[10px] text-[#667788] mt-1">with full audit trail</p>
        </div>
      </div>

      {/* Sankey Flow Visualization */}
      <SankeyFlow flows={flows} />

      {/* Recent Cases with Chain Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-white">Recent Cases</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-swed-surface text-[#8899AA] border border-swed-border font-data">
              {recentAlerts.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => {
              const count = recentAlerts.filter((a) => a.severity === sev).length;
              if (count === 0) return null;
              return (
                <span
                  key={sev}
                  className="flex items-center gap-1 text-[10px] font-data"
                  style={{ color: SEVERITY_COLORS[sev] }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: SEVERITY_COLORS[sev] }}
                  />
                  {count} {sev.toLowerCase()}
                </span>
              );
            })}
          </div>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="bg-swed-card border border-swed-border rounded-xl p-12 text-center">
            <AlertTriangle className="h-8 w-8 text-[#556677] mx-auto mb-3" />
            <p className="text-sm text-[#8899AA]">No cases found</p>
            <p className="text-xs text-[#556677] mt-1">Cases will appear here as alerts are routed between sectors</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAlerts.map((alert) => {
              const chain = parseChain(alert.chainOfResponsibility);
              const isExpanded = expandedId === alert.id;
              const severityColor = SEVERITY_COLORS[alert.severity] || "#8899AA";

              return (
                <div
                  key={alert.id}
                  className="bg-swed-card border border-swed-border rounded-xl overflow-hidden hover:border-swed-border/80 transition-all"
                  style={{
                    borderLeftWidth: "3px",
                    borderLeftColor: severityColor,
                  }}
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-swed-surface/20 transition-colors"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : alert.id)
                    }
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-[#8899AA] shrink-0 transition-transform" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#8899AA] shrink-0 transition-transform" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <RiskBadge level={alert.severity} />
                            <StatusBadge status={alert.status} />
                            {chain.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 font-medium">
                                {chain.length} step{chain.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white truncate">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#8899AA] shrink-0">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: SEVERITY_COLORS[alert.severity] }}
                          />
                          {ROLE_LABELS[alert.sourceRole] ?? alert.sourceRole}
                          {" \u2192 "}
                          {ROLE_LABELS[alert.targetRole] ?? alert.targetRole}
                        </span>
                        <span className="font-data text-[#667788]">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && chain.length > 0 && (
                    <div className="border-t border-swed-border p-4 bg-swed-surface/20">
                      <ChainOfResponsibility chain={chain} />
                    </div>
                  )}

                  {isExpanded && chain.length === 0 && (
                    <div className="border-t border-swed-border p-4 bg-swed-surface/20">
                      <p className="text-xs text-[#8899AA] text-center py-4">
                        No chain of responsibility data available for this case
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
