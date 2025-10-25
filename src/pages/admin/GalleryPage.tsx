import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGalleryItems,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
  GalleryItem,
} from "@/api/hooks/cms";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Farming & Agriculture",
  "Events & Workshops",
  "Certifications",
  "Community Impact",
] as const;
type Category = typeof categories[number];

export default function GalleryPage() {
  const [filterCat, setFilterCat] = useState<GalleryItem["category"] | "">("");
  const { data = [], isLoading } = useGalleryItems(filterCat || undefined);

  const createMut = useCreateGalleryItem();
  const updateMut = useUpdateGalleryItem();
  const deleteMut = useDeleteGalleryItem();
  const { toast } = useToast();

  const [editing, setEditing] = useState<Partial<GalleryItem> | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const resetForm = () => {
    setEditing(null);
    setImage(null);
  };

  const items = useMemo(() => data, [data]);

  // normalize unknown category coming from backend
  const normalizeCategory = (value: any): Category => {
    return categories.includes(value as Category) ? (value as Category) : categories[0];
  };

  // Build a safe payload (never include id, only known fields)
  const buildPayload = (src: Partial<GalleryItem>, file?: File | null) => {
    const safeCategory: Category = normalizeCategory(src.category);
    // whitelist fields
    const base = {
      title: src.title?.trim() ?? "",
      category: safeCategory,
      location: src.location ?? "",
      date_label: src.date_label ?? "",
      description: src.description ?? "",
      attendees: src.attendees ?? "",
      is_active: !!src.is_active,
      sort: Number.isFinite(src.sort as any) ? Number(src.sort) : 0,
    };

    // Only attach image if a new file is selected
    if (file instanceof File) {
      // Let the hook decide whether to convert to FormData; we just pass the File
      return { ...base, image: file } as any;
    }
    return base as any;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      if (editing?.id) {
        const payload = buildPayload(editing, image);
        await updateMut.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Updated" });
      } else {
        const payload = buildPayload(editing, image);
        await createMut.mutateAsync(payload);
        toast({ title: "Created" });
      }
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed", variant: "destructive" });
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this gallery item?")) return;
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
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Gallery</h2>
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={filterCat}
                onChange={(e) => {
                  setFilterCat(e.target.value as any);
                  // prevent editing stale item when switching filter
                  resetForm();
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() =>
                setEditing({
                  title: "",
                  category: categories[0],
                  is_active: true,
                  sort: 0,
                })
              }
            >
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
                    <th className="py-2 pr-2">Category</th>
                    <th className="py-2 pr-2">Location</th>
                    <th className="py-2 pr-2">Date</th>
                    <th className="py-2 pr-2">Active</th>
                    <th className="py-2 pr-2">Sort</th>
                    <th className="py-2 pr-2 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((g) => (
                    <tr key={g.id} className="border-b">
                      <td className="py-2 pr-2">{g.title}</td>
                      <td className="py-2 pr-2">{g.category}</td>
                      <td className="py-2 pr-2">{g.location}</td>
                      <td className="py-2 pr-2">{g.date_label}</td>
                      <td className="py-2 pr-2">{g.is_active ? "Yes" : "No"}</td>
                      <td className="py-2 pr-2">{g.sort}</td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditing({
                                // clone from server but normalize category
                                id: g.id,
                                title: g.title,
                                category: normalizeCategory(g.category),
                                location: g.location,
                                date_label: g.date_label,
                                description: g.description,
                                attendees: g.attendees,
                                is_active: g.is_active,
                                sort: g.sort,
                                image_url: (g as any).image_url, // keep for preview if your type lacks it
                              })
                            }
                          >
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(g.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!items.length && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground">
                        No items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editing?.id ? "Edit Gallery Item" : "Create Gallery Item"}
          </h3>
          {!editing ? (
            <p className="text-muted-foreground">Select an item or click “New”.</p>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label>Category</Label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={normalizeCategory(editing.category)}
                  onChange={(e) =>
                    setEditing((p) => ({
                      ...p!,
                      category: e.target.value as Category,
                    }))
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={editing.title || ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={editing.location || ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, location: e.target.value }))}
                />
              </div>

              <div>
                <Label>Date Label</Label>
                <Input
                  value={editing.date_label || ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, date_label: e.target.value }))}
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm"
                  rows={3}
                  value={editing.description || ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, description: e.target.value }))}
                />
              </div>

              <div>
                <Label>Attendees (events)</Label>
                <Input
                  value={editing.attendees || ""}
                  onChange={(e) => setEditing((p) => ({ ...p!, attendees: e.target.value }))}
                />
              </div>

              <div>
                <Label>Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
                {editing.image_url && !image && (
                  <img src={editing.image_url as any} alt="" className="h-16 mt-2 rounded" />
                )}
                {image && (
                  <div className="text-xs text-muted-foreground mt-1">
                    New image selected: {image.name}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={!!editing.is_active}
                    onCheckedChange={(v) => setEditing((p) => ({ ...p!, is_active: !!v }))}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div>
                <Label>Sort</Label>
                <Input
                  type="number"
                  value={editing.sort ?? 0}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p!, sort: Number(e.target.value || 0) }))
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={!editing.title?.trim()}>
                  {editing.id ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
