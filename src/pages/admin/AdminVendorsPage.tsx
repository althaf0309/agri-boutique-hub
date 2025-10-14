// src/pages/admin/AdminVendorsPage.tsx
import { useMemo, useState } from "react";
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor, Vendor } from "@/api/hooks/vendors";
import { useStores } from "@/api/hooks/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Pencil, Search, Store as StoreIcon, Users } from "lucide-react";

export default function AdminVendorsPage() {
  const { data: vendors = [], isLoading } = useVendors();
  const { data: stores = [] } = useStores();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  const { toast } = useToast();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  // includes all writable model/serializer fields; read-only shown separately
  const [form, setForm] = useState<Partial<Vendor>>({
    display_name: "",
    store_id: undefined,  // FK via *_id
    is_active: true,
  });

  const list = Array.isArray(vendors) ? vendors : [];
  const filtered = useMemo(
    () =>
      list.filter((v) =>
        [v.display_name, v.store?.name, String(v.user_id ?? "")]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())
      ),
    [list, q]
  );

  const startCreate = () => {
    setEditing(null);
    setForm({ display_name: "", store_id: undefined, is_active: true });
    setOpen(true);
  };

  const startEdit = (v: Vendor) => {
    setEditing(v);
    setForm({
      display_name: v.display_name,
      store_id: v.store?.id ?? undefined,
      is_active: v.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await updateVendor.mutateAsync({ id: editing.id, ...form });
        toast({ title: "Vendor updated" });
      } else {
        await createVendor.mutateAsync(form);
        toast({ title: "Vendor created" });
      }
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message ?? String(e), variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this vendor?")) return;
    try {
      await deleteVendor.mutateAsync({ id });
      toast({ title: "Vendor deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message ?? String(e), variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" /> Vendors
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-64" placeholder="Search vendors..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-1" />
            New Vendor
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No vendors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-2 text-left">Display Name</th>
                    <th className="px-2 py-2 text-left">Store</th>
                    <th className="px-2 py-2 text-left">User ID</th>
                    <th className="px-2 py-2 text-left">Units Sold</th>
                    <th className="px-2 py-2 text-left">Total Revenue</th>
                    <th className="px-2 py-2 text-left">Active</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id} className="border-b">
                      <td className="px-2 py-2">{v.display_name}</td>
                      <td className="px-2 py-2 flex items-center gap-1">
                        <StoreIcon className="h-3 w-3 text-muted-foreground" />
                        {v.store?.name ?? "—"}
                      </td>
                      <td className="px-2 py-2">{v.user_id ?? "—"}</td>
                      <td className="px-2 py-2">{v.total_units_sold ?? 0}</td>
                      <td className="px-2 py-2">{v.total_revenue ?? "0.00"}</td>
                      <td className="px-2 py-2">
                        <span className={v.is_active ? "text-green-600" : "text-muted-foreground"}>
                          {v.is_active ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Button size="sm" variant="outline" className="mr-2" onClick={() => startEdit(v)}>
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(v.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vendor" : "Create Vendor"}</DialogTitle>
            <DialogDescription className="sr-only">
              Vendors have a display name, an optional store, and active status. User is assigned automatically.
            </DialogDescription>
          </DialogHeader>

          {/* Editable fields (match your model/serializer) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label>Display Name</Label>
              <Input
                value={form.display_name || ""}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Store</Label>
              <Select
                // IMPORTANT: undefined shows placeholder; do NOT use empty string
                value={
                  form.store_id !== undefined && form.store_id !== null
                    ? String(form.store_id)
                    : undefined
                }
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, store_id: v === "none" ? undefined : Number(v) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a store…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 mt-1">
              <Switch
                checked={!!form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
              <span>Active</span>
            </div>

            {/* Read-only fields (from model/serializer) */}
            {editing && (
              <>
                <div>
                  <Label>User ID (read-only)</Label>
                  <Input value={String(editing.user_id ?? "—")} readOnly />
                </div>
                <div>
                  <Label>Total Units Sold (read-only)</Label>
                  <Input value={String(editing.total_units_sold ?? 0)} readOnly />
                </div>
                <div className="sm:col-span-2">
                  <Label>Total Revenue (read-only)</Label>
                  <Input value={String(editing.total_revenue ?? "0.00")} readOnly />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.display_name?.trim()}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
