"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { fmtDate } from "@/lib/formatters";
import { AppLayout } from "@/components/erp/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/erp/shared/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Contact {
  id: number;
  name: string;
  type: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  gstNumber?: string | null;
  qstNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = { name: "", type: "Supplier", address: "", city: "", country: "", phone: "", email: "", gstNumber: "", qstNumber: "" };

export default function Contacts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: () => apiFetch("/contacts"),
  });

  const filtered = contacts.filter((c) => {
    const matchType = typeFilter === "all" || c.type === typeFilter;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.country ?? "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => apiFetch("/contacts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contacts"] }); toast.success("Contact created"); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof emptyForm }) =>
      apiFetch(`/contacts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contacts"] }); toast.success("Contact updated"); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/contacts/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contacts"] }); toast.success("Contact deleted"); setDeleteId(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(c: Contact) {
    setEditing(c);
    setForm({ name: c.name, type: c.type, address: c.address ?? "", city: c.city ?? "", country: c.country ?? "", phone: c.phone ?? "", email: c.email ?? "", gstNumber: c.gstNumber ?? "", qstNumber: c.qstNumber ?? "" });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout title="Contacts">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, city, country…" className="pl-9" value={ search } onChange={ (e) => setSearch(e.target.value) } />
        </div>
        <Select value={ typeFilter } onValueChange={ setTypeFilter }>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Supplier">Supplier</SelectItem>
            <SelectItem value="Customer">Customer</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={ openCreate } className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      </div>

      <Card className="border-card-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  { ["ID", "Name", "Address", "City", "Country", "Type", "Actions"].map((h) => (
                    <th key={ h } className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{ h }</th>
                  )) }
                </tr>
              </thead>
              <tbody>
                { isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={ i } className="border-b border-border/50">
                      <td className="px-4 py-3" colSpan={ 8 }><Skeleton className="h-4 w-full" /></td>
                    </tr>
                  ))
                  : filtered.map((c) => (
                    <tr key={ c.id } className="border-b border-border/50 hover:bg-muted/30 group">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{ c.id }</td>
                      <td className="px-4 py-3 font-medium">{ c.name }</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{ c.address }</td>

                      <td className="px-4 py-3 text-muted-foreground">{ c.city ?? "—" }</td>
                      <td className="px-4 py-3 text-muted-foreground">{ c.country ?? "—" }</td>
                      <td className="px-4 py-3">
                        <span className={ `inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${c.type === "Supplier" ? "bg-primary/10 text-primary" : "bg-accent/20 text-amber-800"}` }>{ c.type }</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" onClick={ () => openEdit(c) }><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={ () => setDeleteId(c.id) }><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  )) }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */ }
      <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
        <DialogContent className="w-[95vw] sm:max-w-7xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{ editing ? "Edit Contact" : "New Contact" }</DialogTitle>
          </DialogHeader>
          <form onSubmit={ handleSubmit } className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Name *</Label>
                <Input value={ form.name } onChange={ (e) => setForm({ ...form, name: e.target.value }) } required />
              </div>
              <div className="col-span-2">
                <Label>Type</Label>
                <Select value={ form.type } onValueChange={ (v) => setForm({ ...form, type: v }) }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input value={ form.address } onChange={ (e) => setForm({ ...form, address: e.target.value }) } />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={ form.country } onChange={ (e) => setForm({ ...form, country: e.target.value }) } placeholder="Canada" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={ form.city } onChange={ (e) => setForm({ ...form, city: e.target.value }) } />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={ form.phone } onChange={ (e) => setForm({ ...form, phone: e.target.value }) } />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={ form.email } onChange={ (e) => setForm({ ...form, email: e.target.value }) } />
              </div>
              <div>
                <Label>GST Number</Label>
                <Input value={ form.gstNumber } onChange={ (e) => setForm({ ...form, gstNumber: e.target.value }) } />
              </div>
              <div>
                <Label>QST Number</Label>
                <Input value={ form.qstNumber } onChange={ (e) => setForm({ ...form, qstNumber: e.target.value }) } />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={ () => setDialogOpen(false) }>Cancel</Button>
              <Button type="submit" disabled={ saving }>{ saving ? "Saving…" : "Save" }</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={ deleteId !== null }
        onOpenChange={ (v) => !v && setDeleteId(null) }
        title="Delete Contact"
        description="This will permanently delete the contact. This action cannot be undone."
        onConfirm={ () => deleteId && deleteMutation.mutate(deleteId) }
        loading={ deleteMutation.isPending }
      />
    </AppLayout>
  );
}
