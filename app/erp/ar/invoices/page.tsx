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
import { StatusBadge } from "@/components/erp/shared/StatusBadge";
import { ConfirmDialog } from "@/components/erp/shared/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { InvoicePrintTemplate } from "@/components/erp/shared/InvoicePrintTemplate";

interface ArInvoiceLineItemDetail {
  id: number;
  description?: string | null;
  qtyBox?: string | null;
  priceBox?: string | null;
  gst?: string | null;
  qst?: string | null;
  extendedPrice?: string | null;
}

interface ArInvoiceDetail {
  id: number;
  invoiceNumber?: string | null;
  customerName?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  paymentStatus?: string | null;
  notes?: string | null;
  lineItems?: ArInvoiceLineItemDetail[];
}

interface LineItem {
  id?: number;
  description: string;
  qtyBox: string;
  priceBox: string;
  gst?: string;
  qst?: string;
  extendedPrice?: string;
}

interface ArInvoice {
  id: number;
  invoiceNumber?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  notes?: string | null;
  paymentStatus?: string | null;
  paymentDate?: string | null;
  createdAt: string;
}

const emptyLine = (): LineItem => ({ description: "", qtyBox: "", priceBox: "" });

const emptyForm = {
  invoiceNumber: "",
  customerName: "",
  invoiceDate: "",
  dueDate: "",
  notes: "",
  paymentStatus: "Pending",
  paymentDate: "",
  lineItems: [emptyLine()],
};

type FormState = typeof emptyForm;

function computeLineTotal(line: LineItem) {
  const qty = parseFloat(line.qtyBox || "0");
  const price = parseFloat(line.priceBox || "0");
  const subtotal = qty * price;
  const gst = subtotal * 0.05;
  const qst = subtotal * 0.09975;
  return { gst, qst, total: subtotal + gst + qst };
}

export default function ArInvoices() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ArInvoice | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: invoices = [], isLoading } = useQuery<ArInvoice[]>({
    queryKey: ["ar-invoices"],
    queryFn: () => apiFetch("/ar-invoices"),
  });

  const { data: detail } = useQuery<ArInvoiceDetail>({
    queryKey: ["ar-invoice", viewId],
    queryFn: () => apiFetch(`/ar-invoices/${viewId}`),
    enabled: viewId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormState) =>
      apiFetch("/ar-invoices", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          lineItems: data.lineItems
            .filter((l) => l.description || l.qtyBox || l.priceBox)
            .map((l) => ({ description: l.description, qtyBox: l.qtyBox, priceBox: l.priceBox })),
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
            .filter((l) => l.description || l.qtyBox || l.priceBox)
            .map((l) => ({ description: l.description, qtyBox: l.qtyBox, priceBox: l.priceBox })),
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

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(inv: ArInvoice) {
    setEditing(inv);
    // Will populate line items after fetching detail
    apiFetch<ArInvoiceDetail>(`/ar-invoices/${inv.id}`).then((detail) => {
      setForm({
        invoiceNumber: inv.invoiceNumber ?? "",
        customerName: inv.customerName ?? "",
        invoiceDate: inv.invoiceDate ? inv.invoiceDate.split("T")[0] : "",
        dueDate: inv.dueDate ? inv.dueDate.split("T")[0] : "",
        notes: inv.notes ?? "",
        paymentStatus: inv.paymentStatus ?? "Pending",
        paymentDate: inv.paymentDate ? inv.paymentDate.split("T")[0] : "",
        lineItems: detail.lineItems?.length
          ? detail.lineItems.map((l) => ({
              id: l.id,
              description: l.description ?? "",
              qtyBox: l.qtyBox ?? "",
              priceBox: l.priceBox ?? "",
            }))
          : [emptyLine()],
      });
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  }

  function updateLine(idx: number, field: keyof LineItem, value: string) {
    setForm((f) => ({
      ...f,
      lineItems: f.lineItems.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    }));
  }

  const invoiceSubtotal = form.lineItems.reduce((s, l) => {
    const qty = parseFloat(l.qtyBox || "0");
    const price = parseFloat(l.priceBox || "0");
    return s + qty * price;
  }, 0);

  const totalGst = invoiceSubtotal * 0.05;
  const totalQst = invoiceSubtotal * 0.09975;
  const invoiceTotal = invoiceSubtotal + totalGst + totalQst;

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout title="AR Invoices">
      <div className="flex justify-end mb-4">
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
                  : invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 group">
                        <td className="px-3 py-2.5 font-mono text-xs">{inv.invoiceNumber ?? "—"}</td>
                        <td className="px-3 py-2.5 font-medium">{inv.customerName ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(inv.invoiceDate)}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={inv.paymentStatus ?? "Pending"} /></td>
                        <td className="px-3 py-2.5 text-muted-foreground text-xs max-w-[200px] truncate">{inv.notes ?? "—"}</td>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit AR Invoice" : "New AR Invoice"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Header fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Invoice Number</Label>
                <Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} />
              </div>
              <div>
                <Label>Customer Name</Label>
                <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
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
                <Label>Payment Status</Label>
                <Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <Label className="mb-2 block">Line Items</Label>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Description</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-24">Qty (Box)</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-28">Price/Box</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground w-28">GST</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground w-28">QST</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground w-28">Total</th>
                      <th className="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.lineItems.map((line, idx) => {
                      const { gst, qst, total } = computeLineTotal(line);
                      return (
                        <tr key={idx} className="border-t border-border">
                          <td className="px-2 py-1.5">
                            <Input
                              className="h-8 text-xs"
                              value={line.description}
                              onChange={(e) => updateLine(idx, "description", e.target.value)}
                              placeholder="e.g. Olive Oil Extra Virgin 4L"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input
                              className="h-8 text-xs w-24"
                              type="number"
                              step="0.001"
                              value={line.qtyBox}
                              onChange={(e) => updateLine(idx, "qtyBox", e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input
                              className="h-8 text-xs w-28"
                              type="number"
                              step="0.01"
                              value={line.priceBox}
                              onChange={(e) => updateLine(idx, "priceBox", e.target.value)}
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-right text-xs text-muted-foreground font-mono">
                            {gst > 0 ? fmtCad(gst) : "—"}
                          </td>
                          <td className="px-2 py-1.5 text-right text-xs text-muted-foreground font-mono">
                            {qst > 0 ? fmtCad(qst) : "—"}
                          </td>
                          <td className="px-2 py-1.5 text-right text-xs font-semibold font-mono">
                            {total > 0 ? fmtCad(total) : "—"}
                          </td>
                          <td className="px-2 py-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted-foreground"
                              onClick={() => setForm((f) => ({ ...f, lineItems: f.lineItems.filter((_, i) => i !== idx) }))}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t-2 border-border">
                    <tr>
                      <td className="px-3 py-2 text-xs font-semibold" colSpan={3}>Totals</td>
                      <td className="px-3 py-2 text-right text-xs font-mono">{totalGst > 0 ? fmtCad(totalGst) : "—"}</td>
                      <td className="px-3 py-2 text-right text-xs font-mono">{totalQst > 0 ? fmtCad(totalQst) : "—"}</td>
                      <td className="px-3 py-2 text-right text-xs font-semibold font-mono">{invoiceTotal > 0 ? fmtCad(invoiceTotal) : "—"}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setForm((f) => ({ ...f, lineItems: [...f.lineItems, emptyLine()] }))}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Line
              </Button>
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
            <div className="flex items-center justify-between pr-6">
              <DialogTitle>AR Invoice Detail</DialogTitle>
              {detail && <InvoicePrintTemplate invoice={detail} />}
            </div>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Invoice #:</span> <span className="font-mono ml-1">{detail.invoiceNumber ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium ml-1">{detail.customerName ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="ml-1">{fmtDate(detail.invoiceDate)}</span></div>
                <div><span className="text-muted-foreground">Due Date:</span> <span className="ml-1">{fmtDate(detail.dueDate)}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detail.paymentStatus ?? "Pending"} className="ml-1" /></div>
                {detail.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> <span className="ml-1">{detail.notes}</span></div>}
              </div>
              {detail.lineItems && detail.lineItems.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Line Items</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-border rounded">
                      <thead className="bg-muted/50">
                        <tr>
                          {["Description", "Qty (Box)", "Price/Box", "GST", "QST", "Total"].map((h) => (
                            <th key={h} className="text-left px-2 py-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.lineItems.map((item) => (
                          <tr key={item.id} className="border-t border-border">
                            <td className="px-2 py-1.5">{item.description ?? "—"}</td>
                            <td className="px-2 py-1.5">{item.qtyBox ?? "—"}</td>
                            <td className="px-2 py-1.5 font-mono">{fmtCad(item.priceBox)}</td>
                            <td className="px-2 py-1.5 font-mono">{fmtCad(item.gst)}</td>
                            <td className="px-2 py-1.5 font-mono">{fmtCad(item.qst)}</td>
                            <td className="px-2 py-1.5 font-mono font-semibold">{fmtCad(item.extendedPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
        description="This will permanently delete the AR invoice and all its line items."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
