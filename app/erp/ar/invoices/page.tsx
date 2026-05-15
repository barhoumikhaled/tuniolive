"use client";

import { useState, useMemo, useCallback } from "react";
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
import { StatusBadge } from "@/components/erp/shared/StatusBadge";
import { ConfirmDialog } from "@/components/erp/shared/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, X, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { InvoicePrintTemplate } from "@/components/erp/shared/InvoicePrintTemplate";

interface Contact { id: number; name: string; type: string; }

interface ArInvoiceLineItemDetail {
  id: number;
  item?: string | null;
  description?: string | null;
  qtyBox?: string | null;
  priceBox?: string | null;
  priceUnit?: string | null;
}

interface ArInvoiceDetail {
  id: number;
  invoiceNumber?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  paymentTerms?: string | null;
  paymentStatus?: string | null;
  notes?: string | null;
  lineItems?: ArInvoiceLineItemDetail[];
}

interface LineItem {
  id?: number;
  item: string;
  description: string;
  qtyBox: string;
  priceBox: string;
  priceUnit: string;
}

interface ArInvoice {
  id: number;
  invoiceNumber?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  paymentStatus?: string | null;
  paymentDate?: string | null;
  createdAt: string;
}

const emptyLine = (): LineItem => ({ item: "", description: "", qtyBox: "", priceBox: "", priceUnit: "" });

const emptyForm = {
  invoiceNumber: "",
  customerId: 0,
  customerName: "",
  invoiceDate: "",
  dueDate: "",
  paymentTerms: "Net 30",
  notes: "",
  paymentStatus: "Pending",
  paymentDate: "",
  lineItems: [emptyLine()],
};

type FormState = typeof emptyForm;

function calculateDueDate(invoiceDate: string): string {
  if (!invoiceDate) return "";
  const date = new Date(invoiceDate);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split("T")[0];
}

function calcLineTotal(qtyBox: string, priceBox: string): number {
  const qty = parseFloat(qtyBox || "0");
  const price = parseFloat(priceBox || "0");
  return isNaN(qty) || isNaN(price) ? 0 : qty * price;
}

export default function ArInvoices() {
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ArInvoice | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: invoices = [], isLoading } = useQuery<ArInvoice[]>({
    queryKey: ["ar-invoices"],
    queryFn: () => apiFetch("/ar-invoices"),
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: () => apiFetch("/contacts"),
  });

  const { data: detail } = useQuery<ArInvoiceDetail>({
    queryKey: ["ar-invoice", viewId],
    queryFn: () => apiFetch(`/ar-invoices/${viewId}`),
    enabled: viewId !== null && viewDialogOpen,
  });

  const filtered = useMemo(() => {
    let result = invoices;
    if (filterStatus !== "all") {
      result = result.filter((inv) =>
        (inv.paymentStatus ?? "Pending").toLowerCase() === filterStatus.toLowerCase()
      );
    }
    if (filterSearch.trim()) {
      const q = filterSearch.trim().toLowerCase();
      result = result.filter(
        (inv) =>
          (inv.invoiceNumber ?? "").toLowerCase().includes(q) ||
          (inv.customerName ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [invoices, filterStatus, filterSearch]);

  const createMutation = useMutation({
    mutationFn: (data: FormState) =>
      apiFetch("/ar-invoices", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          lineItems: data.lineItems
            .filter((l) => l.item || l.description || l.qtyBox || l.priceBox)
            .map((l) => ({ item: l.item, description: l.description, qtyBox: l.qtyBox, priceBox: l.priceBox, priceUnit: l.priceUnit })),
        }),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ar-invoices"] }); toast.success("Invoice created"); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormState }) =>
      apiFetch(`/ar-invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...data,
          lineItems: data.lineItems
            .filter((l) => l.item || l.description || l.qtyBox || l.priceBox)
            .map((l) => ({ item: l.item, description: l.description, qtyBox: l.qtyBox, priceBox: l.priceBox, priceUnit: l.priceUnit })),
        }),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ar-invoices"] }); toast.success("Invoice updated"); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/ar-invoices/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ar-invoices"] }); toast.success("Invoice deleted"); setDeleteId(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = useCallback(() => { setEditing(null); setForm(emptyForm); setDialogOpen(true); }, []);

  const openEdit = useCallback((inv: ArInvoice) => {
    setEditing(inv);
    apiFetch<ArInvoiceDetail>(`/ar-invoices/${inv.id}`).then((d) => {
      setForm({
        invoiceNumber: inv.invoiceNumber ?? "",
        customerId: inv.customerId ?? 0,
        customerName: inv.customerName ?? "",
        invoiceDate: inv.invoiceDate ? inv.invoiceDate.split("T")[0] : "",
        dueDate: inv.dueDate ? inv.dueDate.split("T")[0] : "",
        paymentTerms: d.paymentTerms ?? "Net 30",
        notes: inv.notes ?? "",
        paymentStatus: inv.paymentStatus ?? "Pending",
        paymentDate: inv.paymentDate ? inv.paymentDate.split("T")[0] : "",
        lineItems: d.lineItems?.length
          ? d.lineItems.map((l) => ({ id: l.id, item: l.item ?? "", description: l.description ?? "", qtyBox: l.qtyBox ?? "", priceBox: l.priceBox ?? "", priceUnit: l.priceUnit ?? "" }))
          : [emptyLine()],
      });
    });
    setDialogOpen(true);
  }, []);

  const openView = useCallback((id: number) => { setViewId(id); setViewDialogOpen(true); }, []);
  const closeView = useCallback((open: boolean) => { if (!open) { setViewDialogOpen(false); setTimeout(() => setViewId(null), 300); } }, []);
  const closeEdit = useCallback((open: boolean) => { if (!open) setDialogOpen(false); }, []);
  const closeDelete = useCallback((open: boolean) => { if (!open) setDeleteId(null); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  }

  function updateLine(idx: number, field: keyof LineItem, value: string) {
    setForm((f) => ({ ...f, lineItems: f.lineItems.map((l, i) => (i === idx ? { ...l, [field]: value } : l)) }));
  }

  function handleCustomerSelect(contactId: string) {
    const contact = contacts.find((c) => c.id === parseInt(contactId));
    if (contact) setForm((f) => ({ ...f, customerId: contact.id, customerName: contact.name }));
  }

  const subtotal = form.lineItems.reduce((s, l) => s + calcLineTotal(l.qtyBox, l.priceBox), 0);
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout title="AR Invoices">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoice # or customer…" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:ml-auto">
          <Button onClick={openCreate} className="bg-primary text-primary-foreground h-9">
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Invoice #", "Customer", "Date", "Due Date", "Status", "Notes", ""].map((h) => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-3 py-3" colSpan={7}><Skeleton className="h-4 w-full" /></td>
                      </tr>
                    ))
                  : filtered.length === 0
                  ? (
                    <tr><td colSpan={7} className="px-3 py-10 text-center text-muted-foreground text-sm">
                      {invoices.length === 0 ? "No invoices yet." : "No invoices match your filters."}
                    </td></tr>
                  )
                  : filtered.map((inv) => (
                      <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 group">
                        <td className="px-3 py-2.5 font-mono text-xs">{inv.invoiceNumber ?? "—"}</td>
                        <td className="px-3 py-2.5 font-medium">{inv.customerName ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(inv.invoiceDate)}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={inv.paymentStatus ?? "Pending"} /></td>
                        <td className="px-3 py-2.5 text-muted-foreground text-xs max-w-[180px] truncate">{inv.notes ?? "—"}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" onClick={() => openView(inv.id)}><Eye className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => openEdit(inv)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(inv.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {!isLoading && invoices.length > 0 && (
            <div className="px-3 py-2 border-t border-border/50 text-xs text-muted-foreground">
              Showing {filtered.length} of {invoices.length} invoices
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={closeEdit}>
        <DialogContent className="w-[95vw] sm:max-w-7xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit AR Invoice" : "New AR Invoice"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Invoice Number</Label>
                <Input className="mt-1" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="e.g. 10072" />
              </div>
              <div className="col-span-3">
                <Label>Customer *</Label>
                <Select value={form.customerId?.toString() ?? ""} onValueChange={handleCustomerSelect}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select customer from address book" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Invoice Date *</Label>
                <Input className="mt-1" type="date" value={form.invoiceDate}
                  onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value, dueDate: f.dueDate || calculateDueDate(e.target.value) }))} required />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input className="mt-1" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Select value={form.paymentTerms} onValueChange={(v) => setForm({ ...form, paymentTerms: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input className="mt-1" type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
              </div>
              <div className="col-span-full">
                <Label>Delivery Instructions / Notes</Label>
                <Textarea className="mt-1" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Delivery instructions, special notes…" />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <p className="text-sm font-semibold mb-2">Line Items</p>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 border-b border-border">
                    <tr>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">Item #</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">Description</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Qty (Box)</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Price/Box</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Price/Btl</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Total</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.lineItems.map((line, idx) => {
                      const total = calcLineTotal(line.qtyBox, line.priceBox);
                      return (
                        <tr key={idx} className="border-t border-border hover:bg-muted/20">
                          <td className="px-3 py-2"><Input className="h-8 text-xs w-20" value={line.item} onChange={(e) => updateLine(idx, "item", e.target.value)} placeholder="1" /></td>
                          <td className="px-3 py-2"><Input className="h-8 text-xs min-w-[240px]" value={line.description} onChange={(e) => updateLine(idx, "description", e.target.value)} placeholder="Extra Virgin Olive Oil 1L (1 Box × 12 Btl.)" /></td>
                          <td className="px-3 py-2"><Input className="h-8 text-xs text-right w-20" type="number" step="0.001" value={line.qtyBox} onChange={(e) => updateLine(idx, "qtyBox", e.target.value)} placeholder="0" /></td>
                          <td className="px-3 py-2"><Input className="h-8 text-xs text-right w-24" type="number" step="0.01" value={line.priceBox} onChange={(e) => updateLine(idx, "priceBox", e.target.value)} placeholder="0.00" /></td>
                          <td className="px-3 py-2"><Input className="h-8 text-xs text-right w-24" type="number" step="0.01" value={line.priceUnit} onChange={(e) => updateLine(idx, "priceUnit", e.target.value)} placeholder="0.00" /></td>
                          <td className="px-3 py-2 text-right text-xs font-semibold font-mono whitespace-nowrap">{total > 0 ? fmtCad(total) : "—"}</td>
                          <td className="px-2 py-2">
                            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => setForm((f) => ({ ...f, lineItems: f.lineItems.filter((_, i) => i !== idx) }))}>
                              <X className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-border bg-muted/30">
                    <tr>
                      <td colSpan={5} className="px-3 py-2.5 text-xs font-semibold">Subtotal</td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-sm">{subtotal > 0 ? fmtCad(subtotal) : "—"}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-3 pb-3 font-bold">Total</td>
                      <td className="px-3 pb-3 text-right font-mono font-bold text-base">{subtotal > 0 ? fmtCad(subtotal) : "—"}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-3"
                onClick={() => setForm((f) => ({ ...f, lineItems: [...f.lineItems, emptyLine()] }))}>
                <Plus className="w-4 h-4 mr-2" /> Add Line
              </Button>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Invoice"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={viewDialogOpen} onOpenChange={closeView}>
        <DialogContent className="w-[95vw] sm:max-w-7xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>AR Invoice Detail</DialogTitle>
              {detail && <InvoicePrintTemplate invoice={detail} />}
            </div>
          </DialogHeader>
          {detail ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/30 rounded-lg p-4">
                <div><p className="text-xs font-semibold text-muted-foreground mb-1">Invoice #</p><p className="font-mono font-semibold">{detail.invoiceNumber ?? "—"}</p></div>
                <div><p className="text-xs font-semibold text-muted-foreground mb-1">Customer</p><p className="font-medium">{detail.customerName ?? "—"}</p></div>
                <div><p className="text-xs font-semibold text-muted-foreground mb-1">Invoice Date</p><p>{fmtDate(detail.invoiceDate)}</p></div>
                <div><p className="text-xs font-semibold text-muted-foreground mb-1">Due Date</p><p>{fmtDate(detail.dueDate)}</p></div>
                <div><p className="text-xs font-semibold text-muted-foreground mb-1">Terms</p><p>{detail.paymentTerms ?? "—"}</p></div>
                <div><p className="text-xs font-semibold text-muted-foreground mb-1">Status</p><StatusBadge status={detail.paymentStatus ?? "Pending"} /></div>
                {detail.notes && <div className="col-span-2 md:col-span-4"><p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p><p className="text-sm">{detail.notes}</p></div>}
              </div>
              {detail.lineItems && detail.lineItems.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Line Items</p>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>{["Item #", "Description", "Qty (Box)", "Price/Box", "Price/Btl", "Total"].map((h) => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold whitespace-nowrap">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {detail.lineItems.map((item) => {
                          const total = calcLineTotal(item.qtyBox ?? "", item.priceBox ?? "");
                          return (
                            <tr key={item.id} className="border-t border-border">
                              <td className="px-4 py-3 font-mono text-xs">{item.item ?? "—"}</td>
                              <td className="px-4 py-3">{item.description ?? "—"}</td>
                              <td className="px-4 py-3 text-right">{item.qtyBox ?? "—"}</td>
                              <td className="px-4 py-3 text-right font-mono">{fmtCad(item.priceBox)}</td>
                              <td className="px-4 py-3 text-right font-mono">{fmtCad(item.priceUnit)}</td>
                              <td className="px-4 py-3 text-right font-mono font-semibold">{fmtCad(total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {(() => {
                        const tot = detail.lineItems!.reduce((s, l) => s + calcLineTotal(l.qtyBox ?? "", l.priceBox ?? ""), 0);
                        return (
                          <tfoot className="border-t-2 border-border bg-muted/30">
                            <tr><td colSpan={5} className="px-4 py-2.5 text-xs font-semibold">Subtotal</td><td className="px-4 py-2.5 text-right font-mono font-semibold">{fmtCad(tot)}</td></tr>
                            <tr><td colSpan={5} className="px-4 pb-3 font-bold">Total</td><td className="px-4 pb-3 text-right font-mono font-bold text-base">{fmtCad(tot)}</td></tr>
                          </tfoot>
                        );
                      })()}
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 py-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-40 w-full" /></div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={closeDelete}
        title="Delete Invoice"
        description="This will permanently delete the AR invoice and all its line items."
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        loading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
