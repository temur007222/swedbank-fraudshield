"use client";

import { useState, useEffect, useRef } from "react";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { Activity, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedTransaction {
  id: string;
  externalId: string;
  timestamp: string;
  amount: number;
  currency: string;
  merchantName: string;
  country: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  customer?: {
    anonymizedName: string;
  };
}

interface LiveFeedProps {
  isLive?: boolean;
  maxItems?: number;
  onTransactionClick?: (id: string) => void;
}

export function LiveFeed({
  isLive = false,
  maxItems = 20,
  onTransactionClick,
}: LiveFeedProps) {
  const [transactions, setTransactions] = useState<FeedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial transactions
  useEffect(() => {
    async function fetchInitial() {
      try {
        const res = await fetch("/api/transactions?limit=10&sortBy=timestamp&sortOrder=desc");
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch {
        // Silently fail, will show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchInitial();
  }, []);

  // SSE connection for live feed
  useEffect(() => {
    if (!isLive) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const es = new EventSource("/api/stream/transactions");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const tx = JSON.parse(event.data) as FeedTransaction;
        setTransactions((prev) => [tx, ...prev].slice(0, maxItems));
      } catch {
        // Ignore malformed messages
      }
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [isLive, maxItems]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="shimmer rounded-lg p-3 h-[88px]"
          >
            <div className="h-4 bg-swed-surface/50 rounded w-3/4 mb-2" />
            <div className="h-3 bg-swed-surface/50 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-[#8899AA]">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          onClick={() => onTransactionClick?.(tx.id)}
          className={cn(
            "slide-in-right bg-swed-card border rounded-lg p-3 cursor-pointer hover-lift",
            "hover:bg-swed-surface/80 transition-all duration-200",
            tx.riskLevel === "CRITICAL"
              ? "border-danger/40 critical-glow"
              : tx.riskLevel === "HIGH"
              ? "border-swed-orange/30 high-glow"
              : "border-swed-border hover:border-swed-border/80"
          )}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#8899AA]">
                {tx.externalId}
              </span>
              <RiskBadge level={tx.riskLevel} />
            </div>
            <span className="font-data text-sm font-semibold text-white">
              {tx.currency} {(tx.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#8899AA]">
              <span>{tx.customer?.anonymizedName || "Unknown"}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{tx.merchantName}</span>
              <span className="text-[#556677]">({tx.country})</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={tx.status} />
              <span className="text-xs text-[#556677]">
                {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
          {/* Risk score bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-swed-surface rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  tx.riskScore >= 0.8
                    ? "bg-gradient-to-r from-danger to-red-400"
                    : tx.riskScore >= 0.6
                    ? "bg-gradient-to-r from-swed-orange to-orange-400"
                    : tx.riskScore >= 0.4
                    ? "bg-gradient-to-r from-warning to-yellow-400"
                    : "bg-gradient-to-r from-success to-emerald-400"
                )}
                style={{ width: `${tx.riskScore * 100}%` }}
              />
            </div>
            <span className="font-data text-xs text-[#8899AA]">
              {(tx.riskScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
