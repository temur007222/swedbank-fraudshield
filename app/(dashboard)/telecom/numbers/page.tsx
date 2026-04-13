"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronRight,
  Phone,
  MessageSquare,
  Mail,
  Loader2,
} from "lucide-react";

interface Communication {
  id: string;
  type: string;
  senderNumber: string | null;
  senderEmail: string | null;
  content: string | null;
  timestamp: string;
  fraudScore: number;
  classification: string;
  patterns: string;
  linkedAlerts?: Array<{
    id: string;
    severity: string;
    description: string;
    status: string;
  }>;
}

interface NumberEntry {
  number: string;
  type: string;
  volume: number;
  maxFraudScore: number;
  classification: string;
  status: string;
  communications: Communication[];
}

export default function PhoneNumberReputationPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (classFilter !== "ALL") params.set("classification", classFilter);
      const res = await fetch(`/api/communications?${params.toString()}`);
      const data = await res.json();
      setCommunications(Array.isArray(data) ? data : data.communications ?? []);
    } catch (err) {
      console.error("Failed to fetch communications", err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, classFilter]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Aggregate by phone number
  const numberEntries: NumberEntry[] = useMemo(() => {
    const map = new Map<string, NumberEntry>();

    communications.forEach((c) => {
      const num = c.senderNumber ?? c.senderEmail ?? "Unknown";
      const existing = map.get(num);
      if (existing) {
        existing.volume += 1;
        existing.maxFraudScore = Math.max(existing.maxFraudScore, c.fraudScore);
        if (c.classification === "FRAUD") existing.classification = "FRAUD";
        existing.communications.push(c);
        if (!existing.type.includes(c.type)) {
          existing.type = `${existing.type}, ${c.type}`;
        }
      } else {
        const status =
          c.fraudScore >= 0.8
            ? "BLOCKED"
            : c.fraudScore >= 0.5
              ? "FLAGGED"
              : "APPROVED";
        map.set(num, {
          number: num,
          type: c.type,
          volume: 1,
          maxFraudScore: c.fraudScore,
          classification: c.classification,
          status,
          communications: [c],
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.maxFraudScore - a.maxFraudScore
    );
  }, [communications]);

  const typeIcon = (type: string) => {
    if (type.includes("PHONE_CALL")) return <Phone className="h-3.5 w-3.5" />;
    if (type.includes("SMS")) return <MessageSquare className="h-3.5 w-3.5" />;
    return <Mail className="h-3.5 w-3.5" />;
  };

  const riskLevel = (score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" => {
    if (score >= 0.9) return "CRITICAL";
    if (score >= 0.7) return "HIGH";
    if (score >= 0.5) return "MEDIUM";
    return "LOW";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-swed-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Phone Number Reputation
        </h1>
        <p className="text-sm text-[#8899AA] mt-1">
          Communications analysis and number scoring
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-swed-card border-swed-border text-white text-sm h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-swed-card border-swed-border">
              <SelectItem value="ALL" className="text-white text-sm">All Types</SelectItem>
              <SelectItem value="SMS" className="text-white text-sm">SMS</SelectItem>
              <SelectItem value="PHONE_CALL" className="text-white text-sm">Phone Call</SelectItem>
              <SelectItem value="EMAIL" className="text-white text-sm">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="bg-swed-card border-swed-border text-white text-sm h-9">
              <SelectValue placeholder="Classification" />
            </SelectTrigger>
            <SelectContent className="bg-swed-card border-swed-border">
              <SelectItem value="ALL" className="text-white text-sm">All Classifications</SelectItem>
              <SelectItem value="FRAUD" className="text-white text-sm">Fraud</SelectItem>
              <SelectItem value="SUSPICIOUS" className="text-white text-sm">Suspicious</SelectItem>
              <SelectItem value="LEGITIMATE" className="text-white text-sm">Legitimate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-[#8899AA] ml-auto">
          {numberEntries.length} number{numberEntries.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Table */}
      <div className="bg-swed-card border border-swed-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-swed-border hover:bg-transparent">
              <TableHead className="text-[#8899AA] text-xs w-8" />
              <TableHead className="text-[#8899AA] text-xs">Number</TableHead>
              <TableHead className="text-[#8899AA] text-xs">Type</TableHead>
              <TableHead className="text-[#8899AA] text-xs text-right">Volume</TableHead>
              <TableHead className="text-[#8899AA] text-xs text-right">Fraud Score</TableHead>
              <TableHead className="text-[#8899AA] text-xs">Classification</TableHead>
              <TableHead className="text-[#8899AA] text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {numberEntries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-sm text-[#8899AA] py-12"
                >
                  No communications found
                </TableCell>
              </TableRow>
            ) : (
              numberEntries.map((entry) => (
                <>
                  <TableRow
                    key={entry.number}
                    className="border-swed-border cursor-pointer hover:bg-swed-surface/50 transition-colors"
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === entry.number ? null : entry.number
                      )
                    }
                  >
                    <TableCell className="text-[#8899AA]">
                      {expandedRow === entry.number ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8899AA]">
                          {typeIcon(entry.type)}
                        </span>
                        <span className="font-data text-sm text-white">
                          {entry.number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#8899AA]">
                      {entry.type}
                    </TableCell>
                    <TableCell className="text-right font-data text-sm text-white">
                      {entry.volume}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-data text-sm text-white">
                          {(entry.maxFraudScore * 100).toFixed(0)}%
                        </span>
                        <RiskBadge level={riskLevel(entry.maxFraudScore)} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-white">
                        {entry.classification}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={entry.status} />
                    </TableCell>
                  </TableRow>

                  {/* Expanded details */}
                  {expandedRow === entry.number && (
                    <TableRow
                      key={`${entry.number}-details`}
                      className="border-swed-border bg-swed-surface/30"
                    >
                      <TableCell colSpan={7} className="p-4">
                        <div className="space-y-3">
                          <h4 className="text-xs font-medium text-white">
                            Communication History
                          </h4>
                          {entry.communications.map((c) => {
                            let patterns: string[] = [];
                            try {
                              patterns = JSON.parse(c.patterns);
                            } catch {
                              /* empty */
                            }
                            return (
                              <div
                                key={c.id}
                                className="bg-swed-card border border-swed-border rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#8899AA]">
                                      {typeIcon(c.type)}
                                    </span>
                                    <span className="text-xs text-[#8899AA]">
                                      {new Date(c.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-data text-xs text-white">
                                      Score: {(c.fraudScore * 100).toFixed(0)}%
                                    </span>
                                    <RiskBadge level={riskLevel(c.fraudScore)} />
                                  </div>
                                </div>
                                {c.content && (
                                  <p className="text-xs text-[#8899AA] mb-2 line-clamp-2">
                                    {c.content}
                                  </p>
                                )}
                                {patterns.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {patterns.map((p, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-swed-surface text-[#8899AA] border border-swed-border"
                                      >
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {c.linkedAlerts && c.linkedAlerts.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-swed-border">
                                    <p className="text-[10px] text-[#8899AA] mb-1">
                                      Linked Alerts:
                                    </p>
                                    {c.linkedAlerts.map((a) => (
                                      <span
                                        key={a.id}
                                        className="text-[10px] text-info mr-2"
                                      >
                                        {a.id.slice(0, 8)}... ({a.status})
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
