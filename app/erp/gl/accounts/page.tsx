"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { AppLayout } from "@/components/erp/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/erp/shared/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface GlAccount {
  id: number; accountNumber: string; accountName: string; type: string;
  parentAccount?: string | null; active: boolean; createdAt: string;
}

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
const TYPE_COLORS: Record<string, string> = {
  Asset: "text-blue-700 bg-blue-50 border-blue-200",
  Liability: "text-orange-700 bg-orange-50 border-orange-200",
  Equity: "text-purple-700 bg-purple-50 border-purple-200",
  Revenue: "text-green-700 bg-green-50 border-green-200",
  Expense: "text-red-700 bg-red-50 border-red-200",
};

const emptyForm = { accountNumber: "", accountName: "", type: "Asset", parentAccount: "", active: true };

export default function GlAccounts() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GlAccount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: accounts = [] } = useQuery<GlAccount[]>({
    queryKey: ["gl-accounts"],
    queryFn: () => apiFetch("/gl-accounts"),
  });

  const grouped = ACCOUNT_TYPES.reduce((acc, type) => {
    acc[type] = accounts.filter((a) => a.type === type);
    return acc;
  }, {} as Record<string, GlAccount[]>);

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => apiFetch("/gl-accounts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gl-accounts"] }); toast.success("Account created"); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof emptyForm> }) =>
      apiFetch(`/gl-accounts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gl-accounts"] }); toast.success("Account updated"); setDialogOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/gl-accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gl-accounts"] }); toast.success("Account deleted"); setDeleteId(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() { setEditing(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(a: GlAccount) {
    setEditing(a);
    setForm({ accountNumber: a.accountNumber, accountName: a.accountName, type: a.type, parentAccount: a.parentAccount ?? "", active: a.active });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout title="Chart of Accounts">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> New Account
        </Button>
      </div>

      <div className="space-y-4">
        {ACCOUNT_TYPES.map((type) => (
          <Card key={type} className="border-card-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold border ${TYPE_COLORS[type]}`}>
                  {type}
                </span>
                <span className="text-muted-foreground font-normal">{grouped[type]?.length ?? 0} accounts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/30">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Account #</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Parent</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Active</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[type]?.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-muted/20 group">
                      <td className="px-4 py-2.5 font-mono font-semibold text-primary">{a.accountNumber}</td>
                      <td className="px-4 py-2.5">{a.accountName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{a.parentAccount ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${a.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {a.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(a)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Account" : "New GL Account"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Account Number *</Label>
                <Input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} required />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Account Name *</Label>
                <Input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} required />
              </div>
              <div>
                <Label>Parent Account</Label>
                <Input value={form.parentAccount} onChange={(e) => setForm({ ...form, parentAccount: e.target.value })} placeholder="e.g. 1000" />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Active</Label>
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
        title="Delete Account"
        description="Cannot delete if GL entries exist. This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
