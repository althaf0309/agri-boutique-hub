import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useVideoTestimonials, useCreateVideoTestimonial, useUpdateVideoTestimonial, useDeleteVideoTestimonial, VideoTestimonial } from "@/api/hooks/cms";
import { toast } from "@/hooks/use-toast";

export default function VideoTestimonialsPage() {
  const { data = [], isLoading } = useVideoTestimonials();
  const createMut = useCreateVideoTestimonial();
  const updateMut = useUpdateVideoTestimonial();
  const deleteMut = useDeleteVideoTestimonial();

  const [editing, setEditing] = useState<Partial<VideoTestimonial> | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const resetForm = () => {
    setEditing(null);
    setThumb(null);
    setVideoFile(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...editing, thumbnail: thumb, video_file: videoFile } as any;
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
    if (!confirm("Delete this video testimonial?")) return;
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
            <h2 className="text-xl font-semibold">Video Testimonials</h2>
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
                    <th className="py-2 pr-2">Duration</th>
                    <th className="py-2 pr-2">Active</th>
                    <th className="py-2 pr-2">Sort</th>
                    <th className="py-2 pr-2 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((v) => (
                    <tr key={v.id} className="border-b">
                      <td className="py-2 pr-2">{v.name}</td>
                      <td className="py-2 pr-2">{v.duration}</td>
                      <td className="py-2 pr-2">{v.is_active ? "Yes" : "No"}</td>
                      <td className="py-2 pr-2">{v.sort}</td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(v)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(v.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data.length && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No items.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editing?.id ? "Edit" : "Create"} Video Testimonial</h3>
          {!editing ? (
            <p className="text-muted-foreground">Select an item or click “New”.</p>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label>Name</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing((p)=>({ ...p!, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Description</Label>
                <textarea className="w-full border rounded-md p-2 text-sm" rows={3}
                  value={editing.description || ""} onChange={(e) => setEditing((p)=>({ ...p!, description: e.target.value }))} />
              </div>
              <div>
                <Label>Duration (e.g. 3:45)</Label>
                <Input value={editing.duration || ""} onChange={(e) => setEditing((p)=>({ ...p!, duration: e.target.value }))} />
              </div>
              <div>
                <Label>Thumbnail</Label>
                <Input type="file" accept="image/*" onChange={(e) => setThumb(e.target.files?.[0] || null)} />
                {editing.thumbnail_url && <img src={editing.thumbnail_url} alt="" className="h-16 mt-2 rounded" />}
              </div>
              <div>
                <Label>Video File (optional)</Label>
                <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              </div>
              <div>
                <Label>Video URL (optional)</Label>
                <Input value={editing.video_url || ""} onChange={(e) => setEditing((p)=>({ ...p!, video_url: e.target.value }))} />
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
