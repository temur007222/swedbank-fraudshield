"use client";

import { useEffect, useState, useMemo } from "react";
import { FraudByType } from "@/components/charts/FraudByType";
import { FraudTimeline } from "@/components/charts/FraudTimeline";
import { GeoHeatmap } from "@/components/charts/GeoHeatmap";
import { ModelPerformance } from "@/components/charts/ModelPerformance";
import {
  BarChart3,
  TrendingUp,
  Globe,
  Brain,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FraudByTypeData {
  type: string;
  count: number;
  totalAmount: number;
}

interface FraudTimelineData {
  date: string;
  total: number;
  flagged: number;
  amount: number;
}

interface GeoData {
  country: string;
  countryCode: string;
  count: number;
  totalAmount: number;
}

interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  totalPredictions?: number;
  falsePositiveRate?: number;
  falseNegativeRate?: number;
  avgLatencyMs?: number;
  modelVersion?: string;
}

interface AnalyticsData {
  fraudByType: FraudByTypeData[];
  fraudOverTime: FraudTimelineData[];
  geographicDistribution: GeoData[];
  topPatterns: { pattern: string; count: number }[];
  modelMetrics: {
    totalTransactions: number;
    flaggedTransactions: number;
    flagRate: number;
    riskDistribution: Record<string, number>;
  };
}

function formatDateRange(): string {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} - ${end.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

function ChartCard({
  title,
  icon: Icon,
  insight,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  insight?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-swed-card border border-swed-border rounded-xl overflow-hidden", className)}>
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <div className="p-1.5 rounded-lg bg-[#FF6100]/10">
          <Icon className="h-4 w-4 text-[#FF6100]" />
        </div>
        <h3 className="text-sm font-medium text-white">{title}</h3>
      </div>
      <div className="px-5 pb-4">{children}</div>
      {insight && (
        <div className="px-5 py-3 border-t border-swed-border/50 bg-swed-surface/30">
          <p className="text-xs text-[#8899AA] flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-[#FF6100] shrink-0" />
            {insight}
          </p>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [aiMetrics, setAiMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, metricsRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/ai/model-metrics"),
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }

        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setAiMetrics(data);
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const fraudTypeInsight = useMemo(() => {
    if (!analytics?.fraudByType?.length) return undefined;
    const sorted = [...analytics.fraudByType].sort((a, b) => b.count - a.count);
    const top = sorted[0];
    if (!top) return undefined;
    const total = sorted.reduce((sum, d) => sum + d.count, 0);
    const pct = total > 0 ? Math.round((top.count / total) * 100) : 0;
    return `${top.type} accounts for ${pct}% of all fraud attempts (${top.count.toLocaleString()} cases)`;
  }, [analytics]);

  const timelineInsight = useMemo(() => {
    if (!analytics?.fraudOverTime?.length) return undefined;
    const data = analytics.fraudOverTime;
    if (data.length < 7) return undefined;
    const recentWeek = data.slice(-7);
    const prevWeek = data.slice(-14, -7);
    const recentFlagged = recentWeek.reduce((s, d) => s + d.flagged, 0);
    const prevFlagged = prevWeek.reduce((s, d) => s + d.flagged, 0);
    if (prevFlagged === 0) return `${recentFlagged} flagged transactions this week`;
    const change = Math.round(((recentFlagged - prevFlagged) / prevFlagged) * 100);
    const dir = change >= 0 ? "increased" : "decreased";
    return `Flagged transactions ${dir} ${Math.abs(change)}% compared to previous week`;
  }, [analytics]);

  const geoInsight = useMemo(() => {
    if (!analytics?.geographicDistribution?.length) return undefined;
    const sorted = [...analytics.geographicDistribution].sort((a, b) => b.count - a.count);
    return `${sorted[0]?.country} leads with ${sorted[0]?.count.toLocaleString()} flagged transactions across ${sorted.length} countries`;
  }, [analytics]);

  const modelInsight = useMemo(() => {
    if (!aiMetrics) return undefined;
    const acc = aiMetrics.accuracy;
    if (acc && acc > 0) {
      return `Model accuracy at ${(acc * 100).toFixed(1)}% with ${(aiMetrics.totalPredictions ?? 0).toLocaleString()} predictions processed`;
    }
    return undefined;
  }, [aiMetrics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-swed-card border border-swed-border rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-96 bg-swed-card border border-swed-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-swed-card via-swed-card to-[#1E2A3A] border border-swed-border rounded-xl p-5">
        <div className="absolute top-0 right-0 w-48 h-full opacity-[0.03]">
          <BarChart3 className="w-full h-full" />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Fraud Analytics</h1>
            <p className="text-sm text-[#8899AA] mt-1">
              AI-powered fraud detection insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-swed-surface/50 border border-swed-border/50">
              <CalendarDays className="h-3.5 w-3.5 text-[#FF6100]" />
              <span className="text-xs text-[#8899AA] font-data">{formatDateRange()}</span>
            </div>
            {analytics && (
              <div className="text-right">
                <span className="font-data text-lg font-semibold text-white">
                  {analytics.modelMetrics.totalTransactions.toLocaleString()}
                </span>
                <p className="text-[10px] text-[#8899AA]">transactions analyzed</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats strip */}
        {analytics && (
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-swed-border/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#10B981]" />
              <span className="text-xs text-[#8899AA]">
                Flag Rate:{" "}
                <span className="font-data font-semibold text-white">
                  {(analytics.modelMetrics.flagRate * 100).toFixed(1)}%
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#FF6100]" />
              <span className="text-xs text-[#8899AA]">
                Flagged:{" "}
                <span className="font-data font-semibold text-white">
                  {analytics.modelMetrics.flaggedTransactions.toLocaleString()}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-info" />
              <span className="text-xs text-[#8899AA]">
                Patterns:{" "}
                <span className="font-data font-semibold text-white">
                  {analytics.topPatterns.length}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Fraud by Transaction Type"
          icon={BarChart3}
          insight={fraudTypeInsight}
        >
          <FraudByType data={analytics?.fraudByType || []} />
        </ChartCard>

        <ChartCard
          title="Fraud Trend (30 Days)"
          icon={TrendingUp}
          insight={timelineInsight}
        >
          <FraudTimeline
            data={(analytics?.fraudOverTime || []).map((d: FraudTimelineData) => ({
              date: d.date,
              total: d.total,
              fraudulent: d.flagged,
            }))}
          />
        </ChartCard>

        <ChartCard
          title="Geographic Distribution"
          icon={Globe}
          insight={geoInsight}
        >
          <GeoHeatmap
            data={(analytics?.geographicDistribution || []).map((d: GeoData) => ({
              country: d.country,
              countryCode: d.countryCode,
              count: d.count,
              fraudCount: d.count,
            }))}
          />
        </ChartCard>

        <ChartCard
          title="AI Model Performance"
          icon={Brain}
          insight={modelInsight}
        >
          <ModelPerformance
            metrics={
              aiMetrics || {
                accuracy: analytics?.modelMetrics.flagRate,
                totalPredictions: analytics?.modelMetrics.totalTransactions,
              }
            }
          />
        </ChartCard>
      </div>

      {/* Top Detected Patterns */}
      {analytics && analytics.topPatterns.length > 0 && (
        <div className="bg-swed-card border border-swed-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <div className="p-1.5 rounded-lg bg-[#FF6100]/10">
              <ShieldCheck className="h-4 w-4 text-[#FF6100]" />
            </div>
            <h3 className="text-sm font-medium text-white">
              Top Detected Fraud Patterns
            </h3>
          </div>
          <div className="px-5 pb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {analytics.topPatterns.map((pattern, index) => (
                <div
                  key={pattern.pattern}
                  className={cn(
                    "bg-swed-surface border border-swed-border rounded-lg p-3 text-center transition-colors hover:border-[#FF6100]/30",
                    index === 0 && "border-[#FF6100]/20 bg-[#FF6100]/5"
                  )}
                >
                  <span className="font-data text-lg font-semibold text-white">
                    {pattern.count}
                  </span>
                  {index === 0 && (
                    <span className="ml-1 text-[9px] text-[#FF6100] font-bold uppercase">top</span>
                  )}
                  <p className="text-xs text-[#8899AA] mt-1 line-clamp-2">
                    {pattern.pattern}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
