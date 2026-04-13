"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { TransactionDetail } from "@/components/dashboard/TransactionDetail";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

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

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "FLAGGED", label: "Flagged" },
  { value: "APPROVED", label: "Approved" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "ESCALATED", label: "Escalated" },
];

const RISK_OPTIONS = [
  { value: "all", label: "All Risk Levels" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "CARD_PAYMENT", label: "Card Payment" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "ATM_WITHDRAWAL", label: "ATM Withdrawal" },
  { value: "ONLINE_PURCHASE", label: "Online Purchase" },
  { value: "P2P_TRANSFER", label: "P2P Transfer" },
  { value: "DIRECT_DEBIT", label: "Direct Debit" },
];

export default function TransactionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Read filters from URL
  const page = parseInt(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "all";
  const riskLevel = searchParams.get("riskLevel") || "all";
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "timestamp";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  // Transaction detail
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Local search input (debounced)
  const [searchInput, setSearchInput] = useState(search);

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Reset to page 1 when filters change (unless page itself is being updated)
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (status !== "all") params.set("status", status);
      if (riskLevel !== "all") params.set("riskLevel", riskLevel);
      if (type !== "all") params.set("type", type);
      if (search) params.set("search", search);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, [page, status, riskLevel, type, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput || undefined });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function handleSort(field: string) {
    if (sortBy === field) {
      updateParams({
        sortBy: field,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
        page: String(page),
      });
    } else {
      updateParams({ sortBy: field, sortOrder: "desc", page: String(page) });
    }
  }

  function handleRowClick(id: string) {
    setSelectedId(id);
    setDetailOpen(true);
  }

  function clearFilters() {
    setSearchInput("");
    router.push(pathname);
  }

  const hasFilters =
    status !== "all" || riskLevel !== "all" || type !== "all" || search !== "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Transactions</h1>
        <p className="text-sm text-[#8899AA] mt-1">
          {total.toLocaleString()} total transactions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8899AA]" />
          <Input
            placeholder="Search transactions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-swed-card border-swed-border text-white placeholder:text-[#556677] focus-visible:ring-swed-orange"
          />
        </div>

        <Select
          value={status}
          onValueChange={(val) => updateParams({ status: val })}
        >
          <SelectTrigger className="w-[160px] bg-swed-card border-swed-border text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-swed-card border-swed-border">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-white focus:bg-swed-surface focus:text-white"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={riskLevel}
          onValueChange={(val) => updateParams({ riskLevel: val })}
        >
          <SelectTrigger className="w-[160px] bg-swed-card border-swed-border text-white">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent className="bg-swed-card border-swed-border">
            {RISK_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-white focus:bg-swed-surface focus:text-white"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={type}
          onValueChange={(val) => updateParams({ type: val })}
        >
          <SelectTrigger className="w-[160px] bg-swed-card border-swed-border text-white">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-swed-card border-swed-border">
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-white focus:bg-swed-surface focus:text-white"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-[#8899AA] hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={handleRowClick}
        loading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-[#8899AA]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="border-swed-border text-[#8899AA] hover:text-white hover:bg-swed-surface disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => updateParams({ page: String(pageNum) })}
                    className={
                      pageNum === page
                        ? "bg-swed-orange text-white hover:bg-swed-orange/90 h-8 w-8 p-0"
                        : "text-[#8899AA] hover:text-white hover:bg-swed-surface h-8 w-8 p-0"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="border-swed-border text-[#8899AA] hover:text-white hover:bg-swed-surface disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Detail Sheet */}
      <TransactionDetail
        transactionId={selectedId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
