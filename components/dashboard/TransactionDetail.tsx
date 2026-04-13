"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";
import { ExplainabilityPanel } from "@/components/shared/ExplainabilityPanel";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Phone,
  Shield,
  MessageSquare,
  User,
  MapPin,
  CreditCard,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

interface TransactionDetailProps {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TransactionFull {
  id: string;
  externalId: string;
  timestamp: string;
  amount: number;
  currency: string;
  type: string;
  merchantName: string;
  merchantCategory: string;
  country: string;
  countryCode: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  aiFlags: string;
  aiExplanation: string | null;
  featureImportance: string;
  customer: {
    id: string;
    anonymizedName: string;
    avgTransaction: number;
    usualCountries: string;
    usualMerchants: string;
    accountAge: number;
    riskProfile: string;
  };
  actions: Array<{
    id: string;
    actionType: string;
    details: string | null;
    timestamp: string;
    user: { id: string; name: string; role: string };
  }>;
  alerts: Array<{
    id: string;
    severity: string;
    status: string;
    description: string;
    createdAt: string;
  }>;
}

export function TransactionDetail({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailProps) {
  const [transaction, setTransaction] = useState<TransactionFull | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transactionId || !open) return;

    setLoading(true);
    fetch(`/api/transactions/${transactionId}`)
      .then((res) => res.json())
      .then((data) => setTransaction(data))
      .catch(() => setTransaction(null))
      .finally(() => setLoading(false));
  }, [transactionId, open]);

  async function handleAction(actionType: string) {
    if (!transactionId) return;
    try {
      await fetch(`/api/transactions/${transactionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType }),
      });
      // Refresh transaction
      const res = await fetch(`/api/transactions/${transactionId}`);
      const data = await res.json();
      setTransaction(data);
    } catch {
      // Handle error silently
    }
  }

  const flags: string[] = transaction
    ? (() => {
        try {
          return JSON.parse(transaction.aiFlags);
        } catch {
          return [];
        }
      })()
    : [];

  const featureImportance: Record<string, number> = transaction
    ? (() => {
        try {
          return JSON.parse(transaction.featureImportance);
        } catch {
          return {};
        }
      })()
    : {};

  const usualCountries: string[] = transaction?.customer
    ? (() => {
        try {
          return JSON.parse(transaction.customer.usualCountries);
        } catch {
          return [];
        }
      })()
    : [];

  const usualMerchants: string[] = transaction?.customer
    ? (() => {
        try {
          return JSON.parse(transaction.customer.usualMerchants);
        } catch {
          return [];
        }
      })()
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-swed-dark border-swed-border overflow-y-auto"
      >
        {loading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-swed-card rounded animate-pulse" />
            ))}
          </div>
        ) : !transaction ? (
          <div className="flex items-center justify-center h-full text-[#8899AA]">
            Transaction not found
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                Transaction {transaction.externalId}
              </SheetTitle>
              <SheetDescription className="text-[#8899AA]">
                {format(new Date(transaction.timestamp), "PPpp")}
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-4 space-y-6">
              {/* Risk Score Gauge */}
              <div className="bg-swed-card border border-swed-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#8899AA]">Risk Score</span>
                  <RiskBadge level={transaction.riskLevel} />
                </div>
                <div className="flex items-end gap-3">
                  <span
                    className={cn(
                      "font-data text-4xl font-bold",
                      transaction.riskScore >= 0.8
                        ? "text-danger"
                        : transaction.riskScore >= 0.6
                        ? "text-swed-orange"
                        : transaction.riskScore >= 0.4
                        ? "text-warning"
                        : "text-success"
                    )}
                  >
                    {(transaction.riskScore * 100).toFixed(1)}%
                  </span>
                  <StatusBadge status={transaction.status} />
                </div>
                <div className="mt-3 h-3 bg-swed-surface rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      transaction.riskScore >= 0.8
                        ? "bg-gradient-to-r from-swed-orange to-danger"
                        : transaction.riskScore >= 0.6
                        ? "bg-gradient-to-r from-warning to-swed-orange"
                        : transaction.riskScore >= 0.4
                        ? "bg-gradient-to-r from-success to-warning"
                        : "bg-success"
                    )}
                    style={{ width: `${transaction.riskScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-swed-card border border-swed-border rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-white">Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-[#8899AA]" />
                    <span className="text-[#8899AA]">Amount</span>
                  </div>
                  <span className="font-data font-medium text-white text-right">
                    {transaction.currency}{" "}
                    {transaction.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-[#8899AA]" />
                    <span className="text-[#8899AA]">Type</span>
                  </div>
                  <span className="text-white text-right">{transaction.type}</span>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#8899AA]" />
                    <span className="text-[#8899AA]">Country</span>
                  </div>
                  <span className="text-white text-right">
                    {transaction.country} ({transaction.countryCode})
                  </span>

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-[#8899AA]" />
                    <span className="text-[#8899AA]">Merchant</span>
                  </div>
                  <span className="text-white text-right truncate">
                    {transaction.merchantName}
                  </span>

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-[#8899AA]" />
                    <span className="text-[#8899AA]">Category</span>
                  </div>
                  <span className="text-white text-right">
                    {transaction.merchantCategory}
                  </span>
                </div>
              </div>

              {/* Explainability Panel */}
              {Object.keys(featureImportance).length > 0 && (
                <ExplainabilityPanel features={featureImportance} />
              )}

              {/* Customer Behavior Summary */}
              <div className="bg-swed-card border border-swed-border rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-[#8899AA]" />
                  Customer Profile
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8899AA]">Name</span>
                    <span className="text-white">
                      {transaction.customer.anonymizedName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8899AA]">Avg Transaction</span>
                    <span className="font-data text-white">
                      EUR{" "}
                      {transaction.customer.avgTransaction.toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8899AA]">Account Age</span>
                    <span className="text-white">
                      {transaction.customer.accountAge} months
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8899AA] text-xs">Usual Countries</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {usualCountries.map((c) => (
                        <span
                          key={c}
                          className="text-xs bg-swed-surface text-[#8899AA] px-2 py-0.5 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#8899AA] text-xs">Usual Merchants</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {usualMerchants.slice(0, 5).map((m) => (
                        <span
                          key={m}
                          className="text-xs bg-swed-surface text-[#8899AA] px-2 py-0.5 rounded-full"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Flags */}
              {flags.length > 0 && (
                <div className="bg-swed-card border border-swed-border rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    AI Detected Anomalies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {flags.map((flag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-danger/10 text-danger border border-danger/20 px-2.5 py-1 rounded-full"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                  {transaction.aiExplanation && (
                    <p className="text-xs text-[#8899AA] mt-2 leading-relaxed">
                      {transaction.aiExplanation}
                    </p>
                  )}
                </div>
              )}

              {/* Action History */}
              {transaction.actions.length > 0 && (
                <div className="bg-swed-card border border-swed-border rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#8899AA]" />
                    Action History
                  </h3>
                  <div className="space-y-2">
                    {transaction.actions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-start gap-3 text-xs"
                      >
                        <span className="text-[#556677] font-mono shrink-0">
                          {format(new Date(action.timestamp), "MMM dd HH:mm")}
                        </span>
                        <div>
                          <span className="text-white font-medium">
                            {action.user.name}
                          </span>
                          <span className="text-[#8899AA]">
                            {" "}
                            performed{" "}
                          </span>
                          <StatusBadge status={action.actionType} />
                          {action.details && (
                            <p className="text-[#8899AA] mt-0.5">
                              {action.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-swed-border" />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleAction("APPROVE")}
                  className="bg-success/15 text-success border border-success/30 hover:bg-success/25 h-9"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleAction("BLOCK")}
                  className="bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25 h-9"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Block
                </Button>
                <Button
                  onClick={() => handleAction("ESCALATE")}
                  variant="outline"
                  className="border-info/30 text-info hover:bg-info/10 h-9"
                >
                  <Phone className="h-4 w-4 mr-1.5" />
                  Escalate to Telecom
                </Button>
                <Button
                  onClick={() => handleAction("ESCALATE")}
                  variant="outline"
                  className="border-swed-orange/30 text-swed-orange hover:bg-swed-orange/10 h-9"
                >
                  <Shield className="h-4 w-4 mr-1.5" />
                  Escalate to Authority
                </Button>
                <Button
                  onClick={() => handleAction("NOTE")}
                  variant="outline"
                  className="col-span-2 border-swed-border text-[#8899AA] hover:bg-swed-surface h-9"
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Request More Info
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
