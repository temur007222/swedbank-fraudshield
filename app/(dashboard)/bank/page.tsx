"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { TransactionDetail } from "@/components/dashboard/TransactionDetail";
import { useDashboard } from "@/lib/dashboard-context";
import {
  Activity,
  AlertTriangle,
  ShieldOff,
  Gauge,
  Shield,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceRole: string;
  description: string;
  status: string;
  createdAt: string;
  transactionId?: string | null;
}

interface Stats {
  totalTransactions: number;
  flaggedToday: number;
  blockedToday: number;
  avgRiskScore: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ThreatGauge({ level }: { level: number }) {
  const clampedLevel = Math.min(100, Math.max(0, level));
  const rotation = (clampedLevel / 100) * 180 - 90;

  const color =
    clampedLevel >= 75
      ? "#EF4444"
      : clampedLevel >= 50
      ? "#FF6100"
      : clampedLevel >= 25
      ? "#FFBE0B"
      : "#10B981";

  const label =
    clampedLevel >= 75
      ? "CRITICAL"
      : clampedLevel >= 50
      ? "ELEVATED"
      : clampedLevel >= 25
      ? "MODERATE"
      : "LOW";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#1E2A3A"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(clampedLevel / 100) * 251.2} 251.2`}
          className="transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="35"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${rotation}, 100, 100)`}
          className="transition-all duration-1000"
        />
        <circle cx="100" cy="100" r="5" fill={color} />
        {/* Value text */}
        <text x="100" y="88" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold" fontFamily="monospace">
          {clampedLevel}%
        </text>
      </svg>
      <span
        className="text-xs font-data font-bold tracking-widest mt-1"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

function RiskDistribution({ stats }: { stats: Stats }) {
  const total = stats.totalTransactions || 1;
  const critical = stats.blockedToday;
  const high = stats.flaggedToday;
  const medium = Math.round(total * 0.05);
  const low = total - critical - high - medium;

  const segments = [
    { label: "LOW", count: Math.max(low, 0), color: "#10B981", percent: Math.max(low, 0) / total * 100 },
    { label: "MEDIUM", count: medium, color: "#FFBE0B", percent: medium / total * 100 },
    { label: "HIGH", count: high, color: "#FF6100", percent: high / total * 100 },
    { label: "CRITICAL", count: critical, color: "#EF4444", percent: critical / total * 100 },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-[#FF6100]" />
        <span className="text-sm font-medium text-white">Risk Distribution</span>
      </div>
      {/* Stacked bar */}
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-swed-surface">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${Math.max(seg.percent, 0.5)}%`,
              backgroundColor: seg.color,
            }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[10px] text-[#8899AA]">{seg.label}</span>
            <span className="font-data text-[10px] text-white font-medium">
              {seg.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BankDashboardPage() {
  const { isLive } = useDashboard();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTransactions: 0,
    flaggedToday: 0,
    blockedToday: 0,
    avgRiskScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [txRes, alertRes] = await Promise.all([
        fetch("/api/transactions?limit=100&sortBy=timestamp&sortOrder=desc"),
        fetch("/api/alerts?targetRole=BANK_ANALYST&limit=10"),
      ]);

      if (txRes.ok) {
        const txData = await txRes.json();
        const transactions = txData.transactions || [];
        const total = txData.total || transactions.length;

        const today = new Date().toISOString().split("T")[0];
        const todayTx = transactions.filter(
          (t: { timestamp: string }) => t.timestamp.split("T")[0] === today
        );

        const flagged = todayTx.filter(
          (t: { status: string }) => t.status === "FLAGGED" || t.status === "ESCALATED"
        ).length;
        const blocked = todayTx.filter(
          (t: { status: string }) => t.status === "BLOCKED"
        ).length;

        const scores = transactions.map((t: { riskScore: number }) => t.riskScore);
        const avgScore =
          scores.length > 0
            ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
            : 0;

        setStats({
          totalTransactions: total,
          flaggedToday: flagged,
          blockedToday: blocked,
          avgRiskScore: Math.round(avgScore * 100),
        });
      }

      if (alertRes.ok) {
        const alertData = await alertRes.json();
        const highAlerts = (alertData.alerts || []).filter(
          (a: Alert) => a.severity === "HIGH" || a.severity === "CRITICAL"
        );
        setAlerts(highAlerts);
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const threatLevel = useMemo(() => {
    if (stats.totalTransactions === 0) return 0;
    const flagRate = (stats.flaggedToday + stats.blockedToday) / Math.max(stats.totalTransactions, 1);
    return Math.min(Math.round(flagRate * 500 + stats.avgRiskScore * 0.5 + alerts.length * 5), 100);
  }, [stats, alerts]);

  const securityStatus = useMemo(() => {
    if (alerts.length === 0 && stats.blockedToday === 0) {
      return { text: "All systems operational. No critical threats detected.", color: "text-[#10B981]" };
    }
    if (alerts.length > 3 || stats.blockedToday > 5) {
      return { text: `${alerts.length} active alerts requiring attention. ${stats.blockedToday} transactions blocked.`, color: "text-danger" };
    }
    return { text: `${alerts.length} alerts active. Monitoring ${stats.flaggedToday} flagged transactions.`, color: "text-[#FF6100]" };
  }, [alerts, stats]);

  function handleTransactionClick(id: string) {
    setSelectedTransactionId(id);
    setDetailOpen(true);
  }

  async function handleAlertAction(alertId: string, status: string) {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch {
      // Silently handle errors
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-swed-card border border-swed-border rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-swed-card border border-swed-border rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-swed-card border border-swed-border rounded-xl animate-pulse" />
          <div className="h-96 bg-swed-card border border-swed-border rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-swed-card via-swed-card to-[#1E2A3A] border border-swed-border rounded-xl p-5">
        <div className="absolute top-0 right-0 w-64 h-full opacity-[0.03]">
          <Shield className="w-full h-full" />
        </div>
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {getGreeting()}, Analyst
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <CalendarDays className="h-3.5 w-3.5 text-[#8899AA]" />
              <span className="text-sm text-[#8899AA]">{formatDate()}</span>
            </div>
            <div className={cn("flex items-center gap-2 mt-2")}>
              <span className={cn("h-2 w-2 rounded-full", securityStatus.color === "text-[#10B981]" ? "bg-[#10B981]" : securityStatus.color === "text-danger" ? "bg-danger animate-pulse" : "bg-[#FF6100] animate-pulse")} />
              <span className={cn("text-xs", securityStatus.color)}>
                {securityStatus.text}
              </span>
            </div>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs text-[#10B981] font-medium">Live Monitoring</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row + Threat Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Stat Cards */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions.toLocaleString()}
            icon={Activity}
            iconColor="text-info"
            trend={{ value: 12, direction: "up" }}
          />
          <StatCard
            title="Flagged Today"
            value={stats.flaggedToday}
            icon={AlertTriangle}
            iconColor="text-warning"
            trend={
              stats.flaggedToday > 0
                ? { value: stats.flaggedToday, direction: "up" }
                : undefined
            }
          />
          <StatCard
            title="Blocked Today"
            value={stats.blockedToday}
            icon={ShieldOff}
            iconColor="text-danger"
          />
          <StatCard
            title="Avg Risk Score"
            value={`${stats.avgRiskScore}%`}
            icon={Gauge}
            iconColor="text-swed-orange"
          />
        </div>

        {/* Threat Level Gauge */}
        <div className="lg:col-span-4 bg-swed-card border border-swed-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-[#FF6100]" />
            <span className="text-sm font-medium text-white">Threat Level</span>
          </div>
          <ThreatGauge level={threatLevel} />
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-swed-card border border-swed-border rounded-xl p-5">
        <RiskDistribution stats={stats} />
      </div>

      {/* Two Columns: Live Feed + Alert Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Live Transaction Feed</h2>
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs text-[#10B981]">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                Live
              </span>
            )}
          </div>
          <LiveFeed
            isLive={isLive}
            maxItems={20}
            onTransactionClick={handleTransactionClick}
          />
        </div>

        {/* Alert Queue */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Priority Alerts
            </h2>
            {alerts.length > 0 && (
              <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-danger/20 text-danger text-[10px] font-data font-bold">
                {alerts.length}
              </span>
            )}
          </div>
          {alerts.length === 0 ? (
            <div className="bg-swed-card border border-swed-border rounded-xl p-8 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-[#10B981] opacity-50" />
              <p className="text-sm text-[#10B981] font-medium">All Clear</p>
              <p className="text-xs text-[#8899AA] mt-1">No high-priority alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={(id) => handleAlertAction(id, "ACKNOWLEDGED")}
                  onResolve={(id) => handleAlertAction(id, "RESOLVED")}
                  onDismiss={(id) => handleAlertAction(id, "DISMISSED")}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Sheet */}
      <TransactionDetail
        transactionId={selectedTransactionId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
