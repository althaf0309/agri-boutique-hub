import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAwards, useCreateAward, useUpdateAward, useDeleteAward, Award } from "@/api/hooks/cms";
import { toast } from "@/hooks/use-toast";

const categories = [
  "Industry Recognition",
  "Sustainability",
  "Social Impact",
  "Customer Excellence",
  "Innovation",
  "Quality",
] as const;

export default function AwardsPage() {
  const { data = [], isLoading } = useAwards();
  const createMut = useCreateAward();
  const updateMut = useUpdateAward();
  const deleteMut = useDeleteAward();

  const [editing, setEditing] = useState<Partial<Award> | null>(null);
  const [emblem, setEmblem] = useState<File | null>(null);

  const resetForm = () => {
    setEditing(null);
    setEmblem(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...editing, emblem } as any;
    try {
      if (editing?.id) {
        await updateMut.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Updated" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Created" });
      }
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed", variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this award?")) return;
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
            <h2 className="text-xl font-semibold">Awards & Recognition</h2>
            <Button onClick={() => setEditing({ title: "", category: "Industry Recognition", is_active: true, sort: 0 })}>
              + New
            </Button>
          </div>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">Title</th>
                    <th className="py-2 pr-2">Organization</th>
                    <th className="py-2 pr-2">Year</th>
                    <th className="py-2 pr-2">Category</th>
                    <th className="py-2 pr-2">Active</th>
                    <th className="py-2 pr-2">Sort</th>
                    <th className="py-2 pr-2 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="py-2 pr-2">{a.title}</td>
                      <td className="py-2 pr-2">{a.organization}</td>
                      <td className="py-2 pr-2">{a.year}</td>
                      <td className="py-2 pr-2">{a.category}</td>
                      <td className="py-2 pr-2">{a.is_active ? "Yes" : "No"}</td>
                      <td className="py-2 pr-2">{a.sort}</td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(a)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(a.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data.length && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">No awards.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editing?.id ? "Edit Award" : "Create Award"}</h3>
          {!editing ? (
            <p className="text-muted-foreground">Select an item or click “New”.</p>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label>Title</Label>
                <Input value={editing.title || ""} onChange={(e)=>setEditing((p)=>({ ...p!, title: e.target.value }))} required />
              </div>
              <div>
                <Label>Organization</Label>
                <Input value={editing.organization || ""} onChange={(e)=>setEditing((p)=>({ ...p!, organization: e.target.value }))} />
              </div>
              <div>
                <Label>Year</Label>
                <Input value={editing.year || ""} onChange={(e)=>setEditing((p)=>({ ...p!, year: e.target.value }))} />
              </div>
              <div>
                <Label>Category</Label>
                <select className="w-full border rounded-md p-2 text-sm"
                  value={editing.category as any}
                  onChange={(e)=>setEditing((p)=>({ ...p!, category: e.target.value as Award["category"] }))}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <textarea className="w-full border rounded-md p-2 text-sm" rows={3}
                  value={editing.description || ""} onChange={(e)=>setEditing((p)=>({ ...p!, description: e.target.value }))} />
              </div>
              <div>
                <Label>Emblem</Label>
                <Input type="file" accept="image/*" onChange={(e)=>setEmblem(e.target.files?.[0] || null)} />
                {editing.emblem_url && <img src={editing.emblem_url} alt="" className="h-16 mt-2 rounded" />}
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
