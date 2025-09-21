import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories, useDeleteCategory } from "@/api/hooks/categories";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Pencil } from "lucide-react";

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const del = useDeleteCategory();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const idToName = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c: any) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const onDelete = async (id: number) => {
    const ok = window.confirm("Delete this category? This cannot be undone.");
    if (!ok) return;
    setDeletingId(id);
    try {
      await del.mutateAsync({ id });
      toast({ title: "Category deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Server error", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categories</h1>
        <Button asChild>
          <Link to="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading…</div>
          ) : categories.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No categories yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Slug</th>
                    <th className="text-left py-2 px-2">Parent</th>
                    <th className="text-left py-2 px-2">Icon</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-2">{c.name}</td>
                      <td className="py-2 px-2 text-muted-foreground">{c.slug}</td>
                      <td className="py-2 px-2">{c.parent ? idToName.get(c.parent) || `#${c.parent}` : "—"}</td>
                      <td className="py-2 px-2">{c.icon || "—"}</td>
                      <td className="py-2 px-2 text-right">
                        <Button asChild size="sm" variant="outline" className="mr-2">
                          <Link to={`/admin/categories/${c.id}/edit`}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(c.id)}
                          disabled={deletingId === c.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingId === c.id ? "Deleting..." : "Delete"}
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
    </div>
  );
}
