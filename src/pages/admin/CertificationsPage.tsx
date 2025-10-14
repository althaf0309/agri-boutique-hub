import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCertifications, useCreateCertification, useUpdateCertification, useDeleteCertification, Certification } from "@/api/hooks/cms";
import { toast } from "@/hooks/use-toast";

export default function CertificationsPage() {
  const { data = [], isLoading } = useCertifications();
  const createMut = useCreateCertification();
  const updateMut = useUpdateCertification();
  const deleteMut = useDeleteCertification();

  const [editing, setEditing] = useState<Partial<Certification> | null>(null);

  const resetForm = () => setEditing(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing?.id) {
        await updateMut.mutateAsync({ id: editing.id, ...editing });
        toast({ title: "Updated" });
      } else {
        await createMut.mutateAsync(editing as any);
        toast({ title: "Created" });
      }
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed", variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this certification?")) return;
    try {
      await deleteMut.mutateAsync({ id });
      toast({ title: "Deleted" });
      if (editing?.id === id) resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed", variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card className="xl:col-span-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Certifications</h2>
            <Button onClick={() => setEditing({ name: "", is_active: true, sort: 0 })}>+ New</Button>
          </div>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Authority</th>
                    <th className="py-2 pr-2">Valid Until</th>
                    <th className="py-2 pr-2">Active</th>
                    <th className="py-2 pr-2">Sort</th>
                    <th className="py-2 pr-2 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 pr-2">{c.name}</td>
                      <td className="py-2 pr-2">{c.authority}</td>
                      <td className="py-2 pr-2">{c.valid_until}</td>
                      <td className="py-2 pr-2">{c.is_active ? "Yes" : "No"}</td>
                      <td className="py-2 pr-2">{c.sort}</td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(c)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data.length && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No certifications.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editing?.id ? "Edit Certification" : "Create Certification"}</h3>
          {!editing ? (
            <p className="text-muted-foreground">Select an item or click “New”.</p>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label>Name</Label>
                <Input value={editing.name || ""} onChange={(e)=>setEditing((p)=>({ ...p!, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Authority</Label>
                <Input value={editing.authority || ""} onChange={(e)=>setEditing((p)=>({ ...p!, authority: e.target.value }))} />
              </div>
              <div>
                <Label>Valid Until</Label>
                <Input value={editing.valid_until || ""} onChange={(e)=>setEditing((p)=>({ ...p!, valid_until: e.target.value }))} />
              </div>
              <div>
                <Label>Description</Label>
                <textarea className="w-full border rounded-md p-2 text-sm" rows={3}
                  value={editing.description || ""} onChange={(e)=>setEditing((p)=>({ ...p!, description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <Checkbox checked={!!editing.is_active} onCheckedChange={(v)=>setEditing((p)=>({ ...p!, is_active: !!v }))} />
                  <span>Active</span>
                </label>
              </div>
              <div>
                <Label>Sort</Label>
                <Input type="number" value={editing.sort ?? 0} onChange={(e)=>setEditing((p)=>({ ...p!, sort: Number(e.target.value) }))} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editing.id ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
