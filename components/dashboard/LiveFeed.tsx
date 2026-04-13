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

  // Live demo simulation — generates realistic fake transactions client-side
  useEffect(() => {
    if (!isLive) return;

    const merchants = [
      "Rimi Latvia", "Maxima", "Bolt", "Wolt", "Circle K",
      "Lidl", "Amazon EU", "Binance", "Steam", "Telia",
      "Booking.com", "Revolut Top-Up", "Western Union", "AliExpress",
      "Swedbank ATM", "Narvesen", "Elkor", "airBaltic", "Printful",
    ];
    const countries = ["Latvia", "Estonia", "Lithuania", "Germany", "Sweden", "Finland", "Poland", "UK", "Nigeria", "Russia", "China", "Turkey"];
    const countryCodes = ["LV", "EE", "LT", "DE", "SE", "FI", "PL", "GB", "NG", "RU", "CN", "TR"];
    const names = [
      "Customer-A1B2", "Customer-C3D4", "Customer-E5F6", "Customer-G7H8",
      "Customer-I9J0", "Customer-K1L2", "Customer-M3N4", "Customer-O5P6",
    ];
    const riskLevels: Array<FeedTransaction["riskLevel"]> = ["LOW", "LOW", "LOW", "MEDIUM", "MEDIUM", "HIGH", "CRITICAL"];
    const statuses = ["APPROVED", "APPROVED", "APPROVED", "FLAGGED", "BLOCKED", "UNDER_REVIEW", "ESCALATED"];

    function generateTx(): FeedTransaction {
      const countryIdx = Math.random() < 0.75
        ? Math.floor(Math.random() * 8) // safe countries
        : 8 + Math.floor(Math.random() * 4); // risky countries
      const riskLevel = countryIdx >= 8
        ? (Math.random() < 0.6 ? "HIGH" : "CRITICAL")
        : riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const riskScore =
        riskLevel === "CRITICAL" ? 0.85 + Math.random() * 0.15 :
        riskLevel === "HIGH" ? 0.6 + Math.random() * 0.25 :
        riskLevel === "MEDIUM" ? 0.3 + Math.random() * 0.3 :
        Math.random() * 0.3;
      const status =
        riskLevel === "CRITICAL" ? "BLOCKED" :
        riskLevel === "HIGH" ? (Math.random() < 0.5 ? "FLAGGED" : "ESCALATED") :
        riskLevel === "MEDIUM" ? (Math.random() < 0.7 ? "APPROVED" : "FLAGGED") :
        "APPROVED";
      const amount =
        riskLevel === "CRITICAL" ? 2000 + Math.random() * 8000 :
        riskLevel === "HIGH" ? 500 + Math.random() * 3000 :
        5 + Math.random() * 500;

      return {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        externalId: `TXN-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        amount: Math.round(amount * 100) / 100,
        currency: "EUR",
        merchantName: merchants[Math.floor(Math.random() * merchants.length)],
        country: countries[countryIdx],
        riskScore: Math.round(riskScore * 10000) / 10000,
        riskLevel,
        status,
        customer: { anonymizedName: names[Math.floor(Math.random() * names.length)] },
      };
    }

    // Push a new simulated transaction every 2-5 seconds
    const interval = setInterval(() => {
      const tx = generateTx();
      setTransactions((prev) => [tx, ...prev].slice(0, maxItems));
    }, 2000 + Math.random() * 3000);

    // Push one immediately
    setTransactions((prev) => [generateTx(), ...prev].slice(0, maxItems));

    return () => clearInterval(interval);
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
