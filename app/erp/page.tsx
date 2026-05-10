"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { fmtCad, fmtDate } from "@/lib/formatters";
import { AppLayout } from "@/components/erp/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/erp/shared/StatusBadge";
import { CurrencyBadge } from "@/components/erp/shared/CurrencyBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Package, Car, AlertCircle } from "lucide-react";

interface DashboardSummary {
  totalApOutstanding: number;
  totalArOutstanding: number;
  oliveOilInventoryValue: number;
  vehicleInventoryValue: number;
  unpaidInvoiceCount: number;
}

const COLORS = ["#1E4D2B", "#C9A84C", "#6B9E7B", "#8B7355", "#4A8B6F", "#D4A96A"];

export default function Dashboard() {
  const { data: summary, isLoading: sumLoading } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiFetch("/dashboard/summary"),
  });

  const { data: recentInvoices = [], isLoading: invLoading } = useQuery<any[]>({
    queryKey: ["recent-ap-invoices"],
    queryFn: () => apiFetch("/dashboard/recent-ap-invoices"),
  });

  const { data: recentEntries = [], isLoading: entLoading } = useQuery<any[]>({
    queryKey: ["recent-gl-entries"],
    queryFn: () => apiFetch("/dashboard/recent-gl-entries"),
  });

  const { data: expenseByCategory = [] } = useQuery<{ category: string; total: number }[]>({
    queryKey: ["expense-by-category"],
    queryFn: () => apiFetch("/dashboard/expense-by-category"),
  });

  const { data: monthlySpend = [] } = useQuery<{ month: string; total: number }[]>({
    queryKey: ["monthly-spend"],
    queryFn: () => apiFetch("/dashboard/monthly-spend"),
  });

  const kpiCards = [
    {
      title: "AP Outstanding",
      value: summary?.totalApOutstanding,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
      sub: `${summary?.unpaidInvoiceCount ?? 0} unpaid invoices`,
    },
    {
      title: "AR Outstanding",
      value: summary?.totalArOutstanding,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      sub: "Receivable balance",
    },
    {
      title: "Olive Oil Inventory",
      value: summary?.oliveOilInventoryValue,
      icon: Package,
      color: "text-[#C9A84C]",
      bg: "bg-amber-50",
      sub: "Account 1200",
    },
    {
      title: "Vehicle Inventory",
      value: summary?.vehicleInventoryValue,
      icon: Car,
      color: "text-primary",
      bg: "bg-primary/10",
      sub: "Account 1210",
    },
  ];

  return (
    <AppLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-card-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                    {sumLoading ? (
                      <Skeleton className="h-8 w-32 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold mt-1 font-serif">
                        {fmtCad(card.value ?? 0)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlySpend.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtCad(v)} />
                <Bar dataKey="total" fill="#1E4D2B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Expense by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmtCad(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent AP Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Supplier</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total CAD</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="px-4 py-2.5" colSpan={4}>
                            <Skeleton className="h-4 w-full" />
                          </td>
                        </tr>
                      ))
                    : recentInvoices.slice(0, 8).map((inv: any) => (
                        <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-2.5 font-medium truncate max-w-[120px]">{inv.supplierName ?? "—"}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(inv.invoiceDate)}</td>
                          <td className="px-4 py-2.5 text-right font-mono">{fmtCad(inv.totalCad)}</td>
                          <td className="px-4 py-2.5"><StatusBadge status={inv.status} /></td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent GL Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Account</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Debit</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {entLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="px-4 py-2.5" colSpan={4}>
                            <Skeleton className="h-4 w-full" />
                          </td>
                        </tr>
                      ))
                    : recentEntries.slice(0, 8).map((e: any) => (
                        <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(e.date)}</td>
                          <td className="px-4 py-2.5">
                            <span className="font-mono text-xs text-primary font-semibold">{e.accountNumber}</span>
                            {e.accountName && <span className="ml-1.5 text-xs text-muted-foreground">{e.accountName}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-green-700">{e.debit ? fmtCad(e.debit) : "—"}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-red-600">{e.credit ? fmtCad(e.credit) : "—"}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
