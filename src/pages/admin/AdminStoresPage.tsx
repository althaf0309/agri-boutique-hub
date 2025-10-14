// src/pages/admin/AdminStoresPage.tsx
import { useMemo, useState } from "react";
import { useStores, useCreateStore, useUpdateStore, useDeleteStore, Store } from "@/api/hooks/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Pencil, Search } from "lucide-react";

export default function AdminStoresPage() {
  const { data = [], isLoading } = useStores();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const { toast } = useToast();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form, setForm] = useState<Partial<Store>>({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    country: "India",
    is_active: true,
  });

  const list = Array.isArray(data) ? data : [];
  const filtered = useMemo(
    () =>
      list.filter((s) =>
        [s.name, s.email, s.phone, s.address1, s.address2, s.city, s.state, s.postcode, s.country]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())
      ),
    [list, q]
  );

  const startCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postcode: "",
      country: "India",
      is_active: true,
    });
    setOpen(true);
  };

  const startEdit = (s: Store) => {
    setEditing(s);
    setForm(s);
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await updateStore.mutateAsync({ id: editing.id, ...form });
        toast({ title: "Store updated" });
      } else {
        await createStore.mutateAsync(form);
        toast({ title: "Store created" });
      }
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message ?? String(e), variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this store?")) return;
    try {
      await deleteStore.mutateAsync({ id });
      toast({ title: "Store deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message ?? String(e), variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Stores</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-64" placeholder="Search stores..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-1" />
            New Store
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stores</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No stores found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-2 text-left">Name</th>
                    <th className="px-2 py-2 text-left">Email</th>
                    <th className="px-2 py-2 text-left">Phone</th>
                    <th className="px-2 py-2 text-left">Address</th>
                    <th className="px-2 py-2 text-left">Active</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="px-2 py-2">{s.name}</td>
                      <td className="px-2 py-2">{s.email || "—"}</td>
                      <td className="px-2 py-2">{s.phone || "—"}</td>
                      <td className="px-2 py-2">
                        {[s.address1, s.address2, s.city, s.state, s.postcode, s.country].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-2 py-2">
                        <span className={s.is_active ? "text-green-600" : "text-muted-foreground"}>{s.is_active ? "Yes" : "No"}</span>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Button size="sm" variant="outline" className="mr-2" onClick={() => startEdit(s)}>
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(s.id)}>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Store" : "Create Store"}</DialogTitle>
            <DialogDescription className="sr-only">
              Fill in store details. Name is required. Other fields are optional.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email || ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Address line 1</Label>
              <Input value={form.address1 || ""} onChange={(e) => setForm((f) => ({ ...f, address1: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Address line 2</Label>
              <Input value={form.address2 || ""} onChange={(e) => setForm((f) => ({ ...f, address2: e.target.value }))} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.city || ""} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.state || ""} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
            </div>
            <div>
              <Label>Postcode</Label>
              <Input value={form.postcode || ""} onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country || ""} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 mt-1">
              <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              <span>Active</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.name?.trim()}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
