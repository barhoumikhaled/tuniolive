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
  supplierId: "",
  paymentNumber: "",
  paymentDate: "",
  paymentMethod: "cheque",
  bankAccountCad: "",
  linkedInvoiceId: "none",   // ← was "" which matched nothing
  amountCad: "",
  currency: "CAD",
  amountUsd: "",
  exchangeRate: "",
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

  const { data: unpaidForSupplier = [], isFetching: loadingInvoices } = useQuery<ApInvoice[]>({
    queryKey: ["ap-invoices-unpaid", form.supplierId],
    queryFn: () => apiFetch(`/ap-invoices?supplierId=${form.supplierId}`),
    enabled: !!form.supplierId && form.supplierId !== "",
    select: (data) => data.filter((inv) => inv.status !== "Paid"),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      apiFetch("/ap-payments", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          supplierId: parseInt(data.supplierId),
          linkedInvoiceId:
            data.linkedInvoiceId && data.linkedInvoiceId !== "none"
              ? parseInt(data.linkedInvoiceId)
              : undefined,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ap-payments"] });
      qc.invalidateQueries({ queryKey: ["ap-invoices-unpaid"] }); // ← updated key
      setTimeout(() => toast.success("Payment created"), 0);
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
          linkedInvoiceId:
            data.linkedInvoiceId && data.linkedInvoiceId !== "none"
              ? parseInt(data.linkedInvoiceId)
              : null,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ap-payments"] });
      qc.invalidateQueries({ queryKey: ["ap-invoices-unpaid"] }); // ← updated key
      setTimeout(() => toast.success("Payment updated"), 0);
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/ap-payments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ap-payments"] });
      setTimeout(() => toast.success("Payment deleted"), 0);
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() { setEditing(null); setForm(emptyForm); setDialogOpen(true); }

  function openEdit(p: ApPayment) {
    setEditing(p);
    setForm({
      supplierId: String(p.supplierId),
      paymentNumber: p.paymentNumber ?? "",
      paymentDate: p.paymentDate ? p.paymentDate.split("T")[0] : "",
      paymentMethod: p.paymentMethod ?? "cheque",
      bankAccountCad: p.bankAccountCad ?? "",
      linkedInvoiceId: p.linkedInvoiceId ? String(p.linkedInvoiceId) : "none",  // ← was "none" but fallback was missing
      amountCad: p.amountCad,
      currency: p.currency,
      amountUsd: p.amountUsd ?? "",
      exchangeRate: p.exchangeRate ?? "",
    });
    setDialogOpen(true);
  }

  function handleSupplierChange(v: string) {
    setForm({ ...form, supplierId: v, linkedInvoiceId: "none" }); // ← reset to "none" not ""
  }

  function handleInvoiceLink(v: string) {
    const inv = unpaidForSupplier.find((i) => String(i.id) === v);
    setForm({
      ...form,
      linkedInvoiceId: v,
      // Auto-fill amount from invoice balance only if amount is empty
      amountCad:
        inv && v !== "none" && !form.amountCad
          ? (inv.balance ?? inv.totalCad ?? "")
          : form.amountCad,
    });
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
        <Button onClick={ openCreate } className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> New Payment
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  { ["Payment #", "Supplier", "Date", "Method", "Linked Invoice", "Amount CAD", "Curr", ""].map((h) => (
                    <th key={ h } className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{ h }</th>
                  )) }
                </tr>
              </thead>
              <tbody>
                { isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={ i } className="border-b border-border/50">
                      <td className="px-3 py-3" colSpan={ 8 }><Skeleton className="h-4 w-full" /></td>
                    </tr>
                  ))
                  : payments.length === 0
                    ? (
                      <tr><td colSpan={ 8 } className="px-3 py-10 text-center text-muted-foreground text-sm">No payments yet.</td></tr>
                    )
                    : payments.map((p) => (
                      <tr key={ p.id } className="border-b border-border/50 hover:bg-muted/30 group">
                        <td className="px-3 py-2.5 font-mono text-xs">{ p.paymentNumber ?? "—" }</td>
                        <td className="px-3 py-2.5 font-medium">{ p.supplierName ?? "—" }</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{ fmtDate(p.paymentDate) }</td>
                        <td className="px-3 py-2.5 capitalize text-muted-foreground">{ p.paymentMethod ?? "—" }</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{ p.linkedInvoiceNum ?? "—" }</td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold">{ fmtCad(p.amountCad) }</td>
                        <td className="px-3 py-2.5"><CurrencyBadge currency={ p.currency } /></td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" onClick={ () => openEdit(p) }><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={ () => setDeleteId(p.id) }><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    )) }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{ editing ? "Edit Payment" : "New AP Payment" }</DialogTitle>
          </DialogHeader>
          <form onSubmit={ handleSubmit } className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">

              <div className="col-span-2">
                <Label>Supplier *</Label>
                <SupplierCombobox
                  contacts={ contacts }
                  value={ form.supplierId }
                  onChange={ handleSupplierChange }
                />
              </div>

              <div>
                <Label>Payment Number</Label>
                {/* Your own internal reference e.g. CHQ-001, WT-2025-01, INTERAC-42 */ }
                <Input
                  value={ form.paymentNumber }
                  onChange={ (e) => setForm({ ...form, paymentNumber: e.target.value }) }
                  placeholder="e.g. CHQ-001 or WT-2025-01"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your internal ref # for this payment (cheque #, wire ref, etc.)
                </p>
              </div>

              <div>
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={ form.paymentDate }
                  onChange={ (e) => setForm({ ...form, paymentDate: e.target.value }) }
                  required
                />
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={ form.paymentMethod } onValueChange={ (v) => setForm({ ...form, paymentMethod: v }) }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="interac">Interac e-Transfer</SelectItem>
                    <SelectItem value="wire transfer">Wire Transfer</SelectItem>
                    <SelectItem value="direct deposit">Direct Deposit</SelectItem>
                    <SelectItem value="credit card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Currency</Label>
                <Select value={ form.currency } onValueChange={ (v) => setForm({ ...form, currency: v }) }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount CAD *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={ form.amountCad }
                  onChange={ (e) => setForm({ ...form, amountCad: e.target.value }) }
                  required
                />
              </div>

              <div>
                <Label>Bank Account (CAD)</Label>
                <Input
                  value={ form.bankAccountCad }
                  onChange={ (e) => setForm({ ...form, bankAccountCad: e.target.value }) }
                  placeholder="e.g. TD Business Chequing"
                />
              </div>

              <div className="col-span-2">
                <Label>Link to Unpaid Invoice</Label>
                <Select
                  value={ form.linkedInvoiceId }
                  onValueChange={ handleInvoiceLink }
                  disabled={ !form.supplierId || loadingInvoices }  // ← add loadingInvoices
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !form.supplierId
                          ? "Select a supplier first"
                          : loadingInvoices
                            ? "Loading invoices..."           // ← new loading state
                            : unpaidForSupplier.length === 0
                              ? "No unpaid invoices for this supplier"
                              : "Select an unpaid invoice (optional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    { unpaidForSupplier.map((inv) => (
                      <SelectItem key={ inv.id } value={ String(inv.id) }>
                        { inv.invoiceNumber ?? `Invoice #${inv.id}` }
                        { " · " }Balance: { fmtCad(inv.balance ?? inv.totalCad) }
                        { inv.status === "Partial" ? " (partial)" : "" }
                      </SelectItem>
                    )) }
                  </SelectContent>
                </Select>
                { form.supplierId && unpaidForSupplier.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    All invoices for this supplier are paid.
                  </p>
                ) }
              </div>

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={ () => setDialogOpen(false) }>Cancel</Button>
              <Button type="submit" disabled={ saving }>{ saving ? "Saving…" : "Save" }</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={ deleteId !== null }
        onOpenChange={ (v) => !v && setDeleteId(null) }
        title="Delete Payment"
        description="This will permanently delete the payment record."
        onConfirm={ () => deleteId && deleteMutation.mutate(deleteId) }
        loading={ deleteMutation.isPending }
      />
    </AppLayout>
  );
}