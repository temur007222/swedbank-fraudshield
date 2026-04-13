"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  externalId: string;
  timestamp: string;
  amount: number;
  currency: string;
  type: string;
  merchantName: string;
  country: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  customer?: {
    id: string;
    anonymizedName: string;
    riskProfile: string;
  };
}

interface TransactionTableProps {
  transactions: Transaction[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  onRowClick?: (id: string) => void;
  loading?: boolean;
}

export function TransactionTable({
  transactions,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  loading,
}: TransactionTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  function SortIcon({ field }: { field: string }) {
    if (sortBy !== field)
      return <ArrowUpDown className="h-3 w-3 ml-1 text-[#556677]" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 text-swed-orange" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 text-swed-orange" />
    );
  }

  function SortableHead({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) {
    return (
      <TableHead
        className="cursor-pointer select-none hover:text-white transition-colors text-[#8899AA]"
        onClick={() => onSort?.(field)}
      >
        <span className="flex items-center">
          {children}
          <SortIcon field={field} />
        </span>
      </TableHead>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-swed-card border border-swed-border rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="border border-swed-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-swed-border bg-swed-surface/50 hover:bg-swed-surface/50">
            <SortableHead field="externalId">ID</SortableHead>
            <SortableHead field="timestamp">Time</SortableHead>
            <TableHead className="text-[#8899AA]">Customer</TableHead>
            <SortableHead field="amount">Amount</SortableHead>
            <TableHead className="text-[#8899AA]">Type</TableHead>
            <TableHead className="text-[#8899AA]">Merchant</TableHead>
            <TableHead className="text-[#8899AA]">Country</TableHead>
            <SortableHead field="riskScore">Risk Score</SortableHead>
            <SortableHead field="status">Status</SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-8 text-[#8899AA]"
              >
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className={cn(
                  "border-swed-border cursor-pointer transition-colors",
                  hoveredRow === tx.id ? "bg-swed-surface" : "bg-swed-card",
                  tx.riskLevel === "CRITICAL" && "bg-danger/5"
                )}
                onMouseEnter={() => setHoveredRow(tx.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onRowClick?.(tx.id)}
              >
                <TableCell className="font-mono text-xs text-[#8899AA]">
                  {tx.externalId.slice(0, 10)}
                </TableCell>
                <TableCell className="text-xs text-[#8899AA]">
                  {format(new Date(tx.timestamp), "MMM dd HH:mm")}
                </TableCell>
                <TableCell className="text-sm text-white">
                  {tx.customer?.anonymizedName || "Unknown"}
                </TableCell>
                <TableCell className="font-data text-sm font-medium text-white">
                  {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#8899AA] bg-swed-surface px-2 py-0.5 rounded-full">
                    {tx.type}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-[#8899AA] max-w-[150px] truncate">
                  {tx.merchantName}
                </TableCell>
                <TableCell className="text-sm text-[#8899AA]">
                  {tx.country}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-swed-surface rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          tx.riskScore >= 0.8
                            ? "bg-danger"
                            : tx.riskScore >= 0.6
                            ? "bg-swed-orange"
                            : tx.riskScore >= 0.4
                            ? "bg-warning"
                            : "bg-success"
                        )}
                        style={{ width: `${tx.riskScore * 100}%` }}
                      />
                    </div>
                    <span className="font-data text-xs text-[#8899AA]">
                      {(tx.riskScore * 100).toFixed(0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={tx.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
