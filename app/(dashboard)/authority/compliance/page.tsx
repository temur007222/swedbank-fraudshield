"use client";

import { useEffect, useState, useCallback } from "react";
import { BiasMonitor } from "@/components/charts/BiasMonitor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  explanation: string | null;
  timestamp: string;
}

interface AuditResponse {
  logs: AuditEntry[];
  total?: number;
  page?: number;
  totalPages?: number;
}

const RETENTION_POLICIES = [
  {
    category: "Transaction Data",
    retention: "7 years",
    legal: "PSD2 / AML Directive",
    status: "compliant",
  },
  {
    category: "Communication Logs",
    retention: "3 years",
    legal: "ePrivacy Directive",
    status: "compliant",
  },
  {
    category: "AI Model Decisions",
    retention: "5 years",
    legal: "EU AI Act",
    status: "compliant",
  },
  {
    category: "Personal Data (PII)",
    retention: "2 years",
    legal: "GDPR Art. 5(1)(e)",
    status: "review",
  },
  {
    category: "Audit Logs",
    retention: "10 years",
    legal: "AML 6th Directive",
    status: "compliant",
  },
];

const CONSENT_RECORDS = [
  {
    purpose: "Fraud Detection Processing",
    legalBasis: "Legitimate Interest (Art. 6(1)(f))",
    dataSubjects: "All customers",
    status: "Active",
  },
  {
    purpose: "Cross-Sector Data Sharing",
    legalBasis: "Legal Obligation (Art. 6(1)(c))",
    dataSubjects: "Flagged customers",
    status: "Active",
  },
  {
    purpose: "AI Model Training",
    legalBasis: "Consent (Art. 6(1)(a))",
    dataSubjects: "Opted-in customers",
    status: "Active",
  },
  {
    purpose: "Behavioral Analytics",
    legalBasis: "Legitimate Interest (Art. 6(1)(f))",
    dataSubjects: "All customers",
    status: "Under Review",
  },
];

const BIAS_DATA = [
  { segment: "18-25 Age", truePositiveRate: 0.88, falsePositiveRate: 0.062, count: 4200 },
  { segment: "26-40 Age", truePositiveRate: 0.93, falsePositiveRate: 0.038, count: 12800 },
  { segment: "41-60 Age", truePositiveRate: 0.91, falsePositiveRate: 0.041, count: 9600 },
  { segment: "60+ Age", truePositiveRate: 0.85, falsePositiveRate: 0.055, count: 3100 },
  { segment: "Domestic", truePositiveRate: 0.94, falsePositiveRate: 0.032, count: 21000 },
  { segment: "Cross-Border", truePositiveRate: 0.82, falsePositiveRate: 0.071, count: 8700 },
];

export default function CompliancePage() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const pageSize = 15;

  const fetchAuditLog = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (entityFilter !== "ALL") params.set("entityType", entityFilter);
      const res = await fetch(`/api/audit-log?${params.toString()}`);
      const data: AuditResponse = await res.json();
      setAuditLog(data.logs ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch audit log", err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter]);

  useEffect(() => {
    setLoading(true);
    fetchAuditLog();
  }, [fetchAuditLog]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          GDPR & Compliance
        </h1>
        <p className="text-sm text-[#8899AA] mt-1">
          Audit trail, data retention policies, consent management, and model fairness
        </p>
      </div>

      {/* Audit Log */}
      <div>
        <h2 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#8899AA]" />
          Audit Log
        </h2>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-48">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-swed-card border-swed-border text-white text-sm h-9">
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent className="bg-swed-card border-swed-border">
                <SelectItem value="ALL" className="text-white text-sm">All Actions</SelectItem>
                <SelectItem value="APPROVE" className="text-white text-sm">Approve</SelectItem>
                <SelectItem value="BLOCK" className="text-white text-sm">Block</SelectItem>
                <SelectItem value="FLAG" className="text-white text-sm">Flag</SelectItem>
                <SelectItem value="ESCALATE" className="text-white text-sm">Escalate</SelectItem>
                <SelectItem value="DISMISS" className="text-white text-sm">Dismiss</SelectItem>
                <SelectItem value="NOTE" className="text-white text-sm">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-swed-card border-swed-border text-white text-sm h-9">
                <SelectValue placeholder="Entity type" />
              </SelectTrigger>
              <SelectContent className="bg-swed-card border-swed-border">
                <SelectItem value="ALL" className="text-white text-sm">All Entities</SelectItem>
                <SelectItem value="Transaction" className="text-white text-sm">Transaction</SelectItem>
                <SelectItem value="Alert" className="text-white text-sm">Alert</SelectItem>
                <SelectItem value="Communication" className="text-white text-sm">Communication</SelectItem>
                <SelectItem value="User" className="text-white text-sm">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-[#8899AA] ml-auto">
            {total} record{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="bg-swed-card border border-swed-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-swed-orange" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-swed-border hover:bg-transparent">
                  <TableHead className="text-[#8899AA] text-xs">Timestamp</TableHead>
                  <TableHead className="text-[#8899AA] text-xs">Action</TableHead>
                  <TableHead className="text-[#8899AA] text-xs">Entity Type</TableHead>
                  <TableHead className="text-[#8899AA] text-xs">Entity ID</TableHead>
                  <TableHead className="text-[#8899AA] text-xs">User</TableHead>
                  <TableHead className="text-[#8899AA] text-xs">Explanation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm text-[#8899AA] py-12"
                    >
                      No audit log entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLog.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="border-swed-border hover:bg-swed-surface/30"
                    >
                      <TableCell className="font-data text-xs text-[#8899AA]">
                        {new Date(entry.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-white bg-swed-surface px-2 py-0.5 rounded">
                          {entry.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-white">
                        {entry.entityType}
                      </TableCell>
                      <TableCell className="font-data text-xs text-[#8899AA]">
                        {entry.entityId.slice(0, 12)}...
                      </TableCell>
                      <TableCell className="font-data text-xs text-[#8899AA]">
                        {entry.userId ? entry.userId.slice(0, 8) + "..." : "System"}
                      </TableCell>
                      <TableCell className="text-xs text-[#8899AA] max-w-[200px] truncate">
                        {entry.explanation ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-swed-border">
              <span className="text-xs text-[#8899AA]">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-[#8899AA]"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-[#8899AA]"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Retention Policy */}
      <div>
        <h2 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#8899AA]" />
          Data Retention Policy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {RETENTION_POLICIES.map((policy) => (
            <div
              key={policy.category}
              className="bg-swed-card border border-swed-border rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-4 w-4 text-[#8899AA]" />
                {policy.status === "compliant" ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
              </div>
              <p className="text-sm font-medium text-white mb-1">
                {policy.category}
              </p>
              <p className="font-data text-lg text-swed-orange">
                {policy.retention}
              </p>
              <p className="text-[10px] text-[#8899AA] mt-1">
                {policy.legal}
              </p>
              <span
                className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  policy.status === "compliant"
                    ? "bg-success/15 text-success"
                    : "bg-warning/15 text-warning"
                }`}
              >
                {policy.status === "compliant" ? "Compliant" : "Under Review"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Consent Management */}
      <div>
        <h2 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#8899AA]" />
          Consent Management
        </h2>
        <div className="bg-swed-card border border-swed-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-swed-border hover:bg-transparent">
                <TableHead className="text-[#8899AA] text-xs">Purpose</TableHead>
                <TableHead className="text-[#8899AA] text-xs">Legal Basis</TableHead>
                <TableHead className="text-[#8899AA] text-xs">Data Subjects</TableHead>
                <TableHead className="text-[#8899AA] text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONSENT_RECORDS.map((record) => (
                <TableRow
                  key={record.purpose}
                  className="border-swed-border hover:bg-swed-surface/30"
                >
                  <TableCell className="text-sm text-white">
                    {record.purpose}
                  </TableCell>
                  <TableCell className="text-xs text-[#8899AA]">
                    {record.legalBasis}
                  </TableCell>
                  <TableCell className="text-xs text-[#8899AA]">
                    {record.dataSubjects}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        record.status === "Active"
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-warning/15 text-warning border border-warning/30"
                      }`}
                    >
                      {record.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bias Monitor */}
      <div>
        <h2 className="text-lg font-medium text-white mb-3">
          AI Model Fairness
        </h2>
        <BiasMonitor data={BIAS_DATA} />
      </div>
    </div>
  );
}
