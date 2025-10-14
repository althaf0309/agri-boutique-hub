import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial, Testimonial } from "@/api/hooks/cms";
import { toast } from "@/hooks/use-toast";

export default function TestimonialsPage() {
  const { data = [], isLoading } = useTestimonials();
  const createMut = useCreateTestimonial();
  const updateMut = useUpdateTestimonial();
  const deleteMut = useDeleteTestimonial();

  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const resetForm = () => {
    setEditing(null);
    setAvatarFile(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...editing, avatar: avatarFile } as any;
    try {
      if (editing?.id) {
        await updateMut.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Updated", description: "Testimonial updated." });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Created", description: "Testimonial created." });
      }
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed", variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return;
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
      {/* List */}
      <Card className="xl:col-span-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Testimonials</h2>
            <Button onClick={() => setEditing({ name: "", rating: 5, testimonial: "", verified: true, is_active: true, sort: 0 })}>
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
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Location</th>
                    <th className="py-2 pr-2">Rating</th>
                    <th className="py-2 pr-2">Verified</th>
                    <th className="py-2 pr-2">Active</th>
                    <th className="py-2 pr-2">Sort</th>
                    <th className="py-2 pr-2 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="py-2 pr-2">{t.name}</td>
                      <td className="py-2 pr-2">{t.location}</td>
                      <td className="py-2 pr-2">{t.rating}</td>
                      <td className="py-2 pr-2">{t.verified ? "Yes" : "No"}</td>
                      <td className="py-2 pr-2">{t.is_active ? "Yes" : "No"}</td>
                      <td className="py-2 pr-2">{t.sort}</td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(t)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(t.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data.length && (
                    <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">No testimonials yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editing?.id ? "Edit Testimonial" : "Create Testimonial"}</h3>
          {!editing ? (
            <p className="text-muted-foreground">Select a testimonial or click “New”.</p>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label>Name</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={editing.location || ""} onChange={(e) => setEditing((p) => ({ ...p!, location: e.target.value }))} />
              </div>
              <div>
                <Label>Product</Label>
                <Input value={editing.product || ""} onChange={(e) => setEditing((p) => ({ ...p!, product: e.target.value }))} />
              </div>
              <div>
                <Label>Rating (1-5)</Label>
                <Input type="number" min={1} max={5} value={editing.rating ?? 5} onChange={(e) => setEditing((p) => ({ ...p!, rating: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Testimonial</Label>
                <textarea className="w-full border rounded-md p-2 text-sm" rows={4}
                  value={editing.testimonial || ""} onChange={(e) => setEditing((p) => ({ ...p!, testimonial: e.target.value }))} required />
              </div>
              <div>
                <Label>Avatar</Label>
                <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                {editing.avatar_url && <img src={editing.avatar_url} alt="" className="h-16 mt-2 rounded" />}
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <Checkbox checked={!!editing.verified} onCheckedChange={(v) => setEditing((p) => ({ ...p!, verified: !!v }))} />
                  <span>Verified</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={!!editing.is_active} onCheckedChange={(v) => setEditing((p) => ({ ...p!, is_active: !!v }))} />
                  <span>Active</span>
                </label>
              </div>
              <div>
                <Label>Sort</Label>
                <Input type="number" value={editing.sort ?? 0} onChange={(e) => setEditing((p) => ({ ...p!, sort: Number(e.target.value) }))} />
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
