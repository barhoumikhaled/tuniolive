"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { fmtCad, fmtDate } from "@/lib/formatters";
import { AppLayout } from "@/components/erp/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyBadge } from "@/components/erp/shared/CurrencyBadge";
import { ConfirmDialog } from "@/components/erp/shared/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GlEntry {
  id: number; entryNumber?: number | null; date: string; documentType?: string | null;
  documentNumber?: string | null; accountNumber: string; currency: string;
  debit?: string | null; credit?: string | null; description?: string | null; amountInCad?: string | null;
  sourceType?: string | null; sourceId?: string | null; isReversing?: boolean | null;
}

interface Line {
  accountNumber: string; currency: string; debit: string; credit: string;
  description: string; amountInCad: string;
}

const emptyLine = (): Line => ({ accountNumber: "", currency: "CAD", debit: "", credit: "", description: "", amountInCad: "" });

// ─── Entry Templates ─────────────────────────────────────────────────────────
const ENTRY_TEMPLATES = [
  {
    id: "equity_injection",
    label: "Equity Injection — Owner deposits cash",
    documentType: "EQ",
    lines: [
      { accountNumber: "1010", description: "Owner equity injection — Bank CAD", debit: "", credit: "", currency: "CAD", amountInCad: "" },
      { accountNumber: "3100", description: "Owner equity injection — Equity", debit: "", credit: "", currency: "CAD", amountInCad: "" },
    ],
    hint: "Dr Bank CAD / Cr Owner Equity",
    swapped: false,
  },
  {
    id: "owner_withdrawal",
    label: "Owner Withdrawal — Owner takes cash out",
    documentType: "EQ",
    lines: [
      { accountNumber: "3100", description: "Owner withdrawal — Equity", debit: "", credit: "", currency: "CAD", amountInCad: "" },
      { accountNumber: "1010", description: "Owner withdrawal — Bank CAD", debit: "", credit: "", currency: "CAD", amountInCad: "" },
    ],
    hint: "Dr Owner Equity / Cr Bank CAD",
    swapped: false,
  },
  {
    id: "depreciation",
    label: "Depreciation — Monthly asset write-down",
    documentType: "DEP",
    lines: [
      { accountNumber: "6100", description: "Depreciation expense", debit: "", credit: "", currency: "CAD", amountInCad: "" },
      { accountNumber: "1510", description: "Accumulated depreciation", debit: "", credit: "", currency: "CAD", amountInCad: "" },
    ],
    hint: "Dr Depreciation Expense / Cr Accumulated Depreciation",
    swapped: false,
  },
  {
    id: "accrual",
    label: "Accrual — Expense incurred, not yet invoiced",
    documentType: "AC",
    lines: [
      { accountNumber: "5000", description: "Accrued expense", debit: "", credit: "", currency: "CAD", amountInCad: "" },
      { accountNumber: "2100", description: "Accrued liabilities", debit: "", credit: "", currency: "CAD", amountInCad: "" },
    ],
    hint: "Dr Expense / Cr Accrued Liabilities",
    swapped: false,
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer — CAD to USD",
    documentType: "BT",
    lines: [
      { accountNumber: "1020", description: "Bank transfer — USD account", debit: "", credit: "", currency: "USD", amountInCad: "" },
      { accountNumber: "1010", description: "Bank transfer — CAD account", debit: "", credit: "", currency: "CAD", amountInCad: "" },
    ],
    hint: "Dr Bank USD / Cr Bank CAD",
    swapped: false,
  },
  {
    id: "opening_balance",
    label: "Opening Balance — Set initial account balance",
    documentType: "OB",
    lines: [
      { accountNumber: "", description: "Opening balance", debit: "", credit: "", currency: "CAD", amountInCad: "" },
      { accountNumber: "3000", description: "Opening balance — Retained earnings", debit: "", credit: "", currency: "CAD", amountInCad: "" },
    ],
    hint: "Dr [Asset/Expense] / Cr Retained Earnings",
    swapped: false,
  },
  {
    id: "manual",
    label: "Manual Entry — Blank entry",
    documentType: "JE",
    lines: [emptyLine(), emptyLine()],
    hint: "Fully manual — fill in all fields",
    swapped: false,
  },
];

export default function GlEntries() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("manual");
  const [form, setForm] = useState({
    date: "", documentType: "JE", documentNumber: "", lines: [emptyLine(), emptyLine()],
  });

  function applyTemplate(templateId: string) {
    const tmpl = ENTRY_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    setSelectedTemplate(templateId);
    setForm((prev) => ({
      ...prev,
      documentType: tmpl.documentType,
      lines: tmpl.lines.map((l) => ({ ...l })),
    }));
  }

  const { data: entries = [], isLoading } = useQuery<GlEntry[]>({
    queryKey: ["gl-entries"],
    queryFn: () => apiFetch("/gl-entries"),
  });

  const { data: accounts = [] } = useQuery<{ id: number; accountNumber: string; accountName: string }[]>({
    queryKey: ["gl-accounts"],
    queryFn: () => apiFetch("/gl-accounts"),
  });

  const filtered = entries.filter((e) => {
    if (dateFrom && new Date(e.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(e.date) > new Date(dateTo)) return false;
    return true;
  });

  const totalDebit = form.lines.reduce((s, l) => s + parseFloat(l.debit || "0"), 0);
  const totalCredit = form.lines.reduce((s, l) => s + parseFloat(l.credit || "0"), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch("/gl-entries", {
        method: "POST",
        body: JSON.stringify({
          date: form.date,
          documentType: form.documentType,
          documentNumber: form.documentNumber,
          lines: form.lines.map((l) => ({
            accountNumber: l.accountNumber,
            currency: l.currency,
            debit: l.debit || null,
            credit: l.credit || null,
            description: l.description || null,
            amountInCad: l.amountInCad || l.debit || l.credit || null,
          })),
        }),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gl-entries"] }); setTimeout(() => toast.success("Journal entry created"), 0); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/gl-entries/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gl-entries"] }); setTimeout(() => toast.success("Entry deleted"), 0); setDeleteId(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setForm({ date: "", documentType: "JE", documentNumber: "", lines: [emptyLine(), emptyLine()] });
    setDialogOpen(true);
  }

  function updateLine(idx: number, field: keyof Line, value: string) {
    setForm((f) => ({ ...f, lines: f.lines.map((l, i) => i === idx ? { ...l, [field]: value } : l) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBalanced) { toast.error("Journal entry must balance: debits must equal credits"); return; }
    createMutation.mutate();
  }

  return (
    <AppLayout title="Journal Entries">
      <div className="flex flex-wrap gap-3 mb-4">
        <Input type="date" placeholder="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        <Input type="date" placeholder="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        <div className="flex-1" />
        <Button onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> New Entry
        </Button>
      </div>

      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Entry#", "Date", "Doc Type", "Doc #", "Account", "Curr", "Debit", "Credit", "Description", ""].map((h) => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-3 py-3" colSpan={10}><Skeleton className="h-4 w-full" /></td>
                      </tr>
                    ))
                  : filtered.map((e) => (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 group">
                        <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{e.entryNumber ?? "—"}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{fmtDate(e.date)}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{e.documentType ?? "—"}</td>
                        <td className="px-3 py-2.5 font-mono text-xs">{e.documentNumber ?? "—"}</td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-primary">{e.accountNumber}</td>
                        <td className="px-3 py-2.5"><CurrencyBadge currency={e.currency} /></td>
                        <td className="px-3 py-2.5 text-right font-mono text-green-700">{e.debit ? fmtCad(e.debit) : "—"}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-red-600">{e.credit ? fmtCad(e.credit) : "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground text-xs max-w-[160px] truncate">{e.description ?? "—"}</td>
                        <td className="px-3 py-2.5">
                          <Button size="sm" variant="ghost" className="text-destructive opacity-0 group-hover:opacity-100" onClick={() => setDeleteId(e.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Date *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <Label>Doc Type</Label>
                <Select value={form.documentType} onValueChange={(v) => setForm({ ...form, documentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["JE", "AP", "AR", "PY"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Doc Number</Label>
                <Input value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} />
              </div>
            </div>

            {/* Balance indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isBalanced ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              {!isBalanced && <AlertTriangle className="w-4 h-4" />}
              <span>Debit: {fmtCad(totalDebit)} | Credit: {fmtCad(totalCredit)}</span>
              {isBalanced ? <span className="ml-auto text-xs">✓ Balanced</span> : <span className="ml-auto text-xs">Difference: {fmtCad(Math.abs(totalDebit - totalCredit))}</span>}
            </div>

            {/* Lines */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Account</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-20">Curr</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Debit</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Credit</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Description</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.lines.map((line, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="px-2 py-1.5">
                        <Select value={line.accountNumber} onValueChange={(v) => updateLine(idx, "accountNumber", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>
                            {accounts.map((a) => (
                              <SelectItem key={a.accountNumber} value={a.accountNumber}>
                                {a.accountNumber} — {a.accountName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1.5">
                        <Select value={line.currency} onValueChange={(v) => updateLine(idx, "currency", v)}>
                          <SelectTrigger className="h-8 text-xs w-20"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1.5">
                        <Input className="h-8 text-xs w-28" type="number" step="0.01" value={line.debit} onChange={(e) => updateLine(idx, "debit", e.target.value)} placeholder="0.00" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input className="h-8 text-xs w-28" type="number" step="0.01" value={line.credit} onChange={(e) => updateLine(idx, "credit", e.target.value)} placeholder="0.00" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input className="h-8 text-xs" value={line.description} onChange={(e) => updateLine(idx, "description", e.target.value)} placeholder="Description" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }))}>
                          <X className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, lines: [...f.lines, emptyLine()] }))}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Line
            </Button>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!isBalanced || createMutation.isPending}>
                {createMutation.isPending ? "Saving…" : "Post Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete Entry"
        description="This will permanently delete this GL entry."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
