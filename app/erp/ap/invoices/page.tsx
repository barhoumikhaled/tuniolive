"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { fmtCad, fmtDate, calculateTaxes } from "@/lib/formatters";
import { AppLayout } from "@/components/erp/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ApInvoicePrintTemplate } from "@/components/erp/shared/ApInvoicePrintTemplate";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SupplierCombobox } from "@/components/erp/shared/SupplierCombobox";
import { StatusBadge } from "@/components/erp/shared/StatusBadge";
import { CurrencyBadge } from "@/components/erp/shared/CurrencyBadge";
import { ConfirmDialog } from "@/components/erp/shared/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ApInvoicePayment {
  id: number;
  paymentNumber?: string | null;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  amountCad?: string | null;
}

interface ApInvoiceDetail {
  id: number;
  invoiceNumber?: string | null;
  supplierName?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  amountCad?: string | null;
  gst?: string | null;
  qst?: string | null;
  totalCad?: string | null;
  amountPaid?: string | null;
  balance?: string | null;
  status?: string;
  currency?: string | null;
  glAccount?: string | null;
  expenseDescription?: string | null;
  payments?: ApInvoicePayment[];
}

interface Contact { id: number; name: string; country?: string | null; }
interface ApInvoice {
  id: number; supplierId: number; supplierName?: string; invoiceNumber?: string | null;
  invoiceDate: string; dueDate?: string | null; amountCad: string; gst?: string | null;
  qst?: string | null; totalCad: string; currency: string; amountUsd?: string | null;
  exchangeRate?: string | null; amountPaid?: string | null; balance?: string | null;
  glAccount?: string | null; expenseDescription?: string | null; status: string;
}

const emptyForm = {
  supplierId: "", invoiceNumber: "", invoiceDate: "", dueDate: "", poNumber: "",
  amountCad: "", gst: "", qst: "", totalCad: "", currency: "CAD",
  amountUsd: "", exchangeRate: "", glAccount: "", expenseDescription: "",
  referenceId: "", referenceDescription: "",
};

// const GL_ACCOUNTS = ["1200","1210","1250","5001","5010","5020","5050","5100","5200","5210","5300","5400","5500","6020","6050","6060"];
interface GlAccount {
  id: number; accountNumber: string; accountName: string; type: string;
  parentAccount?: string | null; active: boolean; createdAt: string;
}

export default function ApInvoices() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApInvoice | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: invoices = [], isLoading } = useQuery<ApInvoice[]>({
    queryKey: ["ap-invoices"],
    queryFn: () => apiFetch("/ap-invoices"),
  });

    const { data: accounts = [] } = useQuery<GlAccount[]>({
      queryKey: ["gl-accounts"],
      queryFn: () => apiFetch("/gl-accounts"),
    });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: () => apiFetch("/contacts"),
  });

  const { data: detail } = useQuery<ApInvoiceDetail>({
    queryKey: ["ap-invoice", viewId],
    queryFn: () => apiFetch(`/ap-invoices/${viewId}`),
    enabled: viewId !== null,
  });

  const filtered = invoices.filter((i) => {
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    const matchSearch = !search || (i.supplierName ?? "").toLowerCase().includes(search.toLowerCase()) || (i.invoiceNumber ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => apiFetch("/ap-invoices", { method: "POST", body: JSON.stringify({ ...data, supplierId: parseInt(data.supplierId) }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-invoices"] }); toast.success("Invoice created"); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof emptyForm> }) =>
      apiFetch(`/ap-invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...data,
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
        }),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-invoices"] }); toast.success("Invoice updated"); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/ap-invoices/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-invoices"] }); toast.success("Invoice deleted"); setDeleteId(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleAmountChange(val: string) {
    const amount = parseFloat(val);
    const f = { ...form, amountCad: val };
    if (!isNaN(amount) && form.currency === "CAD") {
      const supplier = contacts.find((c) => c.id === parseInt(form.supplierId));
      const isCanadian = !supplier || (supplier.country !== "Tunisia" && supplier.country !== "TN");
      if (isCanadian) {
        const { gst, qst, total } = calculateTaxes(amount);
        f.gst = gst.toFixed(2);
        f.qst = qst.toFixed(2);
        f.totalCad = total.toFixed(2);
      } else {
        f.gst = "0.00"; f.qst = "0.00"; f.totalCad = val;
      }
    }
    setForm(f);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(inv: ApInvoice) {
    setEditing(inv);
    setForm({
      supplierId: String(inv.supplierId), invoiceNumber: inv.invoiceNumber ?? "",
      invoiceDate: inv.invoiceDate ? inv.invoiceDate.split("T")[0] : "",
      dueDate: inv.dueDate ? inv.dueDate.split("T")[0] : "",
      poNumber: "", amountCad: inv.amountCad, gst: inv.gst ?? "",
      qst: inv.qst ?? "", totalCad: inv.totalCad, currency: inv.currency,
      amountUsd: inv.amountUsd ?? "", exchangeRate: inv.exchangeRate ?? "",
      glAccount: inv.glAccount ?? "", expenseDescription: inv.expenseDescription ?? "",
      referenceId: "", referenceDescription: "",
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout title="AP Invoices">
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search supplier, invoice#…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Button>
      </div>

      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Invoice #", "Supplier", "Date", "Due Date", "Amount CAD", "Curr", "Total CAD", "GL Acct", "Balance", "Status", ""].map((h) => (
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
                  : filtered.map((inv) => (
                      <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 group">
                        <td className="px-3 py-2.5 font-mono text-xs">{inv.invoiceNumber ?? "—"}</td>
                        <td className="px-3 py-2.5 font-medium max-w-[120px] truncate">{inv.supplierName ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(inv.invoiceDate)}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                        <td className="px-3 py-2.5 text-right font-mono">{fmtCad(inv.amountCad)}</td>
                        <td className="px-3 py-2.5"><CurrencyBadge currency={inv.currency} /></td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold">{fmtCad(inv.totalCad)}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{inv.glAccount ?? "—"}</td>
                        <td className="px-3 py-2.5 text-right font-mono">{fmtCad(inv.balance)}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={inv.status} /></td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            <Button size="sm" variant="ghost" onClick={() => setViewId(inv.id)}><Eye className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => openEdit(inv)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(inv.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit AP Invoice" : "New AP Invoice"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Supplier *</Label>
                <SupplierCombobox
                  contacts={contacts}
                  value={form.supplierId}
                  onChange={(v) => setForm({ ...form, supplierId: v })}
                />
              </div>
              <div>
                <Label>Invoice Number</Label>
                <Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} />
              </div>
              <div>
                <Label>GL Account</Label>
                <Select value={form.glAccount} onValueChange={(v) => setForm({ ...form, glAccount: v })}>
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                    { accounts.map((a) => <SelectItem key={a.id} value={a.accountNumber}>{a.accountName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Invoice Date *</Label>
                <Input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} required />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount CAD *</Label>
                <Input type="number" step="0.01" value={form.amountCad} onChange={(e) => handleAmountChange(e.target.value)} required />
              </div>
              {form.currency === "USD" && (
                <>
                  <div>
                    <Label>Amount USD</Label>
                    <Input type="number" step="0.01" value={form.amountUsd} onChange={(e) => setForm({ ...form, amountUsd: e.target.value })} />
                  </div>
                  <div>
                    <Label>Exchange Rate</Label>
                    <Input type="number" step="0.0001" value={form.exchangeRate} onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })} />
                  </div>
                </>
              )}
              <div>
                <Label>GST</Label>
                <Input type="number" step="0.01" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} />
              </div>
              <div>
                <Label>QST</Label>
                <Input type="number" step="0.01" value={form.qst} onChange={(e) => setForm({ ...form, qst: e.target.value })} />
              </div>
              <div>
                <Label>Total CAD *</Label>
                <Input type="number" step="0.01" value={form.totalCad} onChange={(e) => setForm({ ...form, totalCad: e.target.value })} required />
              </div>
              <div className="col-span-2">
                <Label>Expense Description</Label>
                <Input value={form.expenseDescription} onChange={(e) => setForm({ ...form, expenseDescription: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={viewId !== null} onOpenChange={(v) => !v && setViewId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Invoice Detail</DialogTitle>
              {detail && <ApInvoicePrintTemplate invoice={detail} />}
            </div>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Invoice #:</span> <span className="font-mono ml-1">{detail.invoiceNumber ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Supplier:</span> <span className="font-medium ml-1">{detail.supplierName ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="ml-1">{fmtDate(detail.invoiceDate)}</span></div>
                <div><span className="text-muted-foreground">Due Date:</span> <span className="ml-1">{fmtDate(detail.dueDate)}</span></div>
                <div><span className="text-muted-foreground">Amount CAD:</span> <span className="font-mono ml-1">{fmtCad(detail.amountCad)}</span></div>
                <div><span className="text-muted-foreground">Total CAD:</span> <span className="font-mono font-bold ml-1">{fmtCad(detail.totalCad)}</span></div>
                <div><span className="text-muted-foreground">Amount Paid:</span> <span className="font-mono ml-1 text-green-700">{fmtCad(detail.amountPaid)}</span></div>
                <div><span className="text-muted-foreground">Balance:</span> <span className="font-mono ml-1 text-red-600">{fmtCad(detail.balance)}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detail.status ?? "Unpaid"} className="ml-1" /></div>
                <div><span className="text-muted-foreground">GL Account:</span> <span className="font-mono ml-1">{detail.glAccount ?? "—"}</span></div>
              </div>
              {detail.payments && detail.payments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 text-muted-foreground">Linked Payments</p>
                  <table className="w-full text-xs border border-border rounded">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2">Payment #</th>
                        <th className="text-left px-3 py-2">Date</th>
                        <th className="text-left px-3 py-2">Method</th>
                        <th className="text-right px-3 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.payments.map((p) => (
                        <tr key={p.id} className="border-t border-border">
                          <td className="px-3 py-2 font-mono">{p.paymentNumber ?? "—"}</td>
                          <td className="px-3 py-2">{fmtDate(p.paymentDate)}</td>
                          <td className="px-3 py-2">{p.paymentMethod ?? "—"}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmtCad(p.amountCad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete Invoice"
        description="This will permanently delete the invoice."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}

