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
import { SupplierCombobox } from "@/components/erp/shared/SupplierCombobox";
import { CurrencyBadge } from "@/components/erp/shared/CurrencyBadge";
import { ConfirmDialog } from "@/components/erp/shared/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Contact { id: number; name: string; }
interface ApInvoice {
  id: number;
  supplierId: number;
  invoiceNumber?: string | null;
  supplierName?: string;
  totalCad?: string | null;
  balance?: string | null;
  status?: string;
}
interface ApPayment {
  id: number; supplierId: number; supplierName?: string | null; paymentNumber?: string | null;
  paymentDate: string; bankAccountCad?: string | null; paymentMethod?: string | null;
  linkedInvoiceNum?: string | null; linkedInvoiceId?: number | null;
  amountCad: string; currency: string; amountUsd?: string | null; exchangeRate?: string | null;
}

const emptyForm = {
  supplierId: "", paymentNumber: "", paymentDate: "", paymentMethod: "cheque",
  bankAccountCad: "", linkedInvoiceId: "", amountCad: "", currency: "CAD",
  amountUsd: "", exchangeRate: "",
};

export default function ApPayments() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApPayment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: payments = [], isLoading } = useQuery<ApPayment[]>({
    queryKey: ["ap-payments"],
    queryFn: () => apiFetch("/ap-payments"),
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: () => apiFetch("/contacts"),
  });

  const { data: invoices = [] } = useQuery<ApInvoice[]>({
    queryKey: ["ap-invoices"],
    queryFn: () => apiFetch("/ap-invoices"),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      apiFetch("/ap-payments", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          supplierId: parseInt(data.supplierId),
          linkedInvoiceId: data.linkedInvoiceId && data.linkedInvoiceId !== "none" ? parseInt(data.linkedInvoiceId) : undefined,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ap-payments"] });
      qc.invalidateQueries({ queryKey: ["ap-invoices"] });
      toast.success("Payment created");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof emptyForm> }) =>
      apiFetch(`/ap-payments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...data,
          supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
          linkedInvoiceId: data.linkedInvoiceId && data.linkedInvoiceId !== "none"
            ? parseInt(data.linkedInvoiceId) : null,
        }),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-payments"] }); qc.invalidateQueries({ queryKey: ["ap-invoices"] }); toast.success("Payment updated"); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/ap-payments/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ap-payments"] }); toast.success("Payment deleted"); setDeleteId(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() { setEditing(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(p: ApPayment) {
    setEditing(p);
    setForm({
      supplierId: String(p.supplierId), paymentNumber: p.paymentNumber ?? "",
      paymentDate: p.paymentDate ? p.paymentDate.split("T")[0] : "",
      paymentMethod: p.paymentMethod ?? "cheque", bankAccountCad: p.bankAccountCad ?? "",
      linkedInvoiceId: p.linkedInvoiceId ? String(p.linkedInvoiceId) : "none", amountCad: p.amountCad,
      currency: p.currency, amountUsd: p.amountUsd ?? "", exchangeRate: p.exchangeRate ?? "",
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
    <AppLayout title="AP Payments">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> New Payment
        </Button>
      </div>

      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Payment #", "Supplier", "Date", "Method", "Linked Invoice", "Amount CAD", "Curr", ""].map((h) => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-3 py-3" colSpan={8}><Skeleton className="h-4 w-full" /></td>
                      </tr>
                    ))
                  : payments.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 group">
                        <td className="px-3 py-2.5 font-mono text-xs">{p.paymentNumber ?? "—"}</td>
                        <td className="px-3 py-2.5 font-medium">{p.supplierName ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(p.paymentDate)}</td>
                        <td className="px-3 py-2.5 capitalize text-muted-foreground">{p.paymentMethod ?? "—"}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{p.linkedInvoiceNum ?? "—"}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold">{fmtCad(p.amountCad)}</td>
                        <td className="px-3 py-2.5"><CurrencyBadge currency={p.currency} /></td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Payment" : "New AP Payment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Supplier *</Label>
                <SupplierCombobox
                  contacts={contacts}
                  value={form.supplierId}
                  onChange={(v) => setForm({ ...form, supplierId: v, linkedInvoiceId: "" })}
                />
              </div>
              <div>
                <Label>Payment Number</Label>
                <Input value={form.paymentNumber} onChange={(e) => setForm({ ...form, paymentNumber: e.target.value })} />
              </div>
              <div>
                <Label>Payment Date *</Label>
                <Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} required />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["cheque", "wire transfer", "credit card", "cash"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Input type="number" step="0.01" value={form.amountCad} onChange={(e) => setForm({ ...form, amountCad: e.target.value })} required />
              </div>
              <div>
                <Label>Bank Account (CAD)</Label>
                <Input value={form.bankAccountCad} onChange={(e) => setForm({ ...form, bankAccountCad: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Link to Unpaid Invoice</Label>
                <Select
                  value={form.linkedInvoiceId}
                  onValueChange={(v) => {
                    const inv = invoices.find((i) => String(i.id) === v);
                    setForm({
                      ...form,
                      linkedInvoiceId: v,
                      amountCad: inv && v !== "none" && !form.amountCad ? (inv.balance ?? inv.totalCad ?? "") : form.amountCad,
                    });
                  }}
                  disabled={!form.supplierId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.supplierId ? "Optional — select an unpaid invoice" : "Select supplier first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {invoices
                      .filter((inv) => String(inv.supplierId) === form.supplierId && inv.status !== "Paid")
                      .map((inv) => (
                        <SelectItem key={inv.id} value={String(inv.id)}>
                          {inv.invoiceNumber ?? `Invoice #${inv.id}`} — Balance {fmtCad(inv.balance ?? inv.totalCad)}
                        </SelectItem>
                      ))}
                    {form.supplierId && invoices.filter((i) => String(i.supplierId) === form.supplierId && i.status !== "Paid").length === 0 && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">No unpaid invoices for this supplier</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete Payment"
        description="This will permanently delete the payment record."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
