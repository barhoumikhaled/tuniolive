"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { fmtCad, fmtDate } from "@/lib/formatters";
import { AppLayout } from "@/components/erp/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Download, CheckCircle, XCircle } from "lucide-react";

function exportCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface TrialBalanceAccount {
  accountNumber: string;
  accountName: string;
  type: string;
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

interface TrialBalanceData {
  accounts: TrialBalanceAccount[];
  totalDebits: number;
  totalCredits: number;
}

interface ProfitLossLine {
  accountNumber: string;
  accountName: string;
  amount: number;
}

interface ProfitLossData {
  revenue: ProfitLossLine[];
  expenses: ProfitLossLine[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

interface BalanceSheetLine {
  accountNumber: string;
  accountName: string;
  balance: number;
}

interface BalanceSheetData {
  assets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  equity: BalanceSheetLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  balanced: boolean;
}

function TrialBalance() {
  const [asOf, setAsOf] = useState(new Date().toISOString().split("T")[0]);
  const { data, isLoading } = useQuery<TrialBalanceData>({
    queryKey: ["trial-balance", asOf],
    queryFn: () => apiFetch(`/reports/trial-balance?asOf=${asOf}`),
  });

  function handleExport() {
    if (!data) return;
    exportCsv(
      "trial-balance.csv",
      ["Account #", "Account Name", "Type", "Total Debits", "Total Credits", "Balance"],
      data.accounts.map((r) => [r.accountNumber, r.accountName, r.type, fmtCad(r.totalDebits), fmtCad(r.totalCredits), fmtCad(r.balance)]),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <Label className="text-xs">As of Date</Label>
          <Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="w-44" />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>
      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Account #", "Account Name", "Type", "Total Debits", "Total Credits", "Balance"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-4 py-2.5 text-muted-foreground animate-pulse" colSpan={6}>Loading…</td>
                      </tr>
                    ))
                  : data?.accounts?.map((r) => (
                      <tr key={r.accountNumber} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-2.5 font-mono font-semibold text-primary">{r.accountNumber}</td>
                        <td className="px-4 py-2.5">{r.accountName}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{r.type}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-green-700">{fmtCad(r.totalDebits)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-red-600">{fmtCad(r.totalCredits)}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold">{fmtCad(r.balance)}</td>
                      </tr>
                    ))}
              </tbody>
              {data && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/50 font-bold">
                    <td className="px-4 py-2.5 font-semibold" colSpan={3}>Totals</td>
                    <td className="px-4 py-2.5 text-right font-mono text-green-700">{fmtCad(data.totalDebits)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-red-600">{fmtCad(data.totalCredits)}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{fmtCad(data.totalDebits - data.totalCredits)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfitLoss() {
  const today = new Date().toISOString().split("T")[0];
  // Default to a wide range so seeded historical data is visible
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState(today);
  const { data, isLoading } = useQuery<ProfitLossData>({
    queryKey: ["profit-loss", dateFrom, dateTo],
    queryFn: () => apiFetch(`/reports/profit-loss?dateFrom=${dateFrom}&dateTo=${dateTo}`),
  });

  function handleExport() {
    if (!data) return;
    const rows = [
      ["Revenue", "", ""],
      ...(data.revenue ?? []).map((r) => [r.accountNumber, r.accountName, fmtCad(r.amount)]),
      ["TOTAL REVENUE", "", fmtCad(data.totalRevenue)],
      ["", "", ""],
      ["Expenses", "", ""],
      ...(data.expenses ?? []).map((e) => [e.accountNumber, e.accountName, fmtCad(e.amount)]),
      ["TOTAL EXPENSES", "", fmtCad(data.totalExpenses)],
      ["", "", ""],
      ["NET INCOME", "", fmtCad(data.netIncome)],
    ];
    exportCsv("profit-loss.csv", ["Section", "Account", "Amount CAD"], rows);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <Label className="text-xs">From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-44" />
        </div>
        <div>
          <Label className="text-xs">To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-44" />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-card-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm text-green-700">Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {data.revenue?.map((r) => (
                    <tr key={r.accountNumber} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.accountNumber}</td>
                      <td className="px-4 py-2.5">{r.accountName}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-700">{fmtCad(r.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-green-200 bg-green-50 font-bold">
                    <td className="px-4 py-2.5" colSpan={2}>Total Revenue</td>
                    <td className="px-4 py-2.5 text-right font-mono text-green-800">{fmtCad(data.totalRevenue)}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm text-red-700">Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {data.expenses?.map((e) => (
                    <tr key={e.accountNumber} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{e.accountNumber}</td>
                      <td className="px-4 py-2.5">{e.accountName}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-red-600">{fmtCad(e.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-red-200 bg-red-50 font-bold">
                    <td className="px-4 py-2.5" colSpan={2}>Total Expenses</td>
                    <td className="px-4 py-2.5 text-right font-mono text-red-800">{fmtCad(data.totalExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card className={`border-2 lg:col-span-2 ${data.netIncome >= 0 ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-lg font-serif font-bold">Net Income</span>
              <span className={`text-2xl font-bold font-mono ${data.netIncome >= 0 ? "text-green-800" : "text-red-800"}`}>
                {fmtCad(data.netIncome)}
              </span>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function BalanceSheet() {
  const [asOf, setAsOf] = useState(new Date().toISOString().split("T")[0]);
  const { data, isLoading } = useQuery<BalanceSheetData>({
    queryKey: ["balance-sheet", asOf],
    queryFn: () => apiFetch(`/reports/balance-sheet?asOf=${asOf}`),
  });

  function handleExport() {
    if (!data) return;
    const rows: string[][] = [
      ["Assets", "", ""],
      ...(data.assets ?? []).map((a) => [a.accountNumber, a.accountName, fmtCad(a.balance)]),
      ["TOTAL ASSETS", "", fmtCad(data.totalAssets)],
      ["", "", ""],
      ["Liabilities", "", ""],
      ...(data.liabilities ?? []).map((l) => [l.accountNumber, l.accountName, fmtCad(l.balance)]),
      ["TOTAL LIABILITIES", "", fmtCad(data.totalLiabilities)],
      ["", "", ""],
      ["Equity", "", ""],
      ...(data.equity ?? []).map((e) => [e.accountNumber, e.accountName, fmtCad(e.balance)]),
      ["TOTAL EQUITY", "", fmtCad(data.totalEquity)],
    ];
    exportCsv("balance-sheet.csv", ["Section", "Account", "Amount CAD"], rows);
  }

  function SectionTable({ title, rows, total, color }: { title: string; rows: BalanceSheetLine[]; total: number; color: string }) {
    return (
      <Card className="border-card-border">
        <CardHeader className="py-3 px-4">
          <CardTitle className={`text-sm ${color}`}>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r) => (
                <tr key={r.accountNumber} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.accountNumber}</td>
                  <td className="px-4 py-2.5">{r.accountName}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{fmtCad(r.balance)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-border bg-muted/50 font-bold">
                <td className="px-4 py-2.5 font-semibold" colSpan={2}>Total {title}</td>
                <td className="px-4 py-2.5 text-right font-mono">{fmtCad(total)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <Label className="text-xs">As of Date</Label>
          <Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="w-44" />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : data ? (
        <div className="space-y-4">
          <SectionTable title="Assets" rows={data.assets ?? []} total={data.totalAssets} color="text-blue-700" />
          <SectionTable title="Liabilities" rows={data.liabilities ?? []} total={data.totalLiabilities} color="text-orange-700" />
          <SectionTable title="Equity" rows={data.equity ?? []} total={data.totalEquity} color="text-purple-700" />
          <Card className={`border-2 ${data.balanced ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
            <CardContent className="p-4 flex items-center gap-3">
              {data.balanced
                ? <CheckCircle className="w-5 h-5 text-green-700" />
                : <XCircle className="w-5 h-5 text-red-700" />}
              <span className="font-medium">
                Assets ({fmtCad(data.totalAssets)}) = Liabilities ({fmtCad(data.totalLiabilities)}) + Equity ({fmtCad(data.totalEquity)})
                {data.balanced ? " ✓ Balanced" : " ✗ Imbalanced"}
              </span>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

export default function Reports() {
  return (
    <AppLayout title="Reports">
      <Tabs defaultValue="trial-balance">
        <TabsList className="mb-4">
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        </TabsList>
        <TabsContent value="trial-balance"><TrialBalance /></TabsContent>
        <TabsContent value="profit-loss"><ProfitLoss /></TabsContent>
        <TabsContent value="balance-sheet"><BalanceSheet /></TabsContent>
      </Tabs>
    </AppLayout>
  );
}
