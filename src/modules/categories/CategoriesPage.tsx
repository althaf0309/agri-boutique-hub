import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCategories, useDeleteCategory } from "@/api/hooks/categories";
import { useToast } from "@/hooks/use-toast";

type Cat = {
  id: number;
  name?: string;
  slug?: string;
  image?: string;
  icon?: string;
  parent?: number | { id: number; name?: string } | null;
  parent_id?: number | null;
};

function toFlatCats(data: unknown): Cat[] {
  if (Array.isArray(data)) return data as Cat[];
  if (data && typeof data === "object") {
    // support { list }, { results }, { items }
    const anyObj = data as any;
    if (Array.isArray(anyObj.list)) return anyObj.list as Cat[];
    if (Array.isArray(anyObj.results)) return anyObj.results as Cat[];
    if (Array.isArray(anyObj.items)) return anyObj.items as Cat[];
  }
  return [];
}

function getParentId(c: Cat): number | null {
  if (typeof c.parent === "number") return c.parent || null;
  if (c.parent && typeof c.parent === "object") return (c.parent as any).id ?? null;
  if (typeof c.parent_id === "number") return c.parent_id || null;
  return null;
}

export function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const categories = toFlatCats(data);
  const { toast } = useToast();
  const del = useDeleteCategory();

  const [search, setSearch] = useState("");

  const idToName = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c) => {
      if (typeof c.id === "number") map.set(c.id, c.name || `#${c.id}`);
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const slug = (c.slug || "").toLowerCase();
      const pid = getParentId(c);
      const pname = pid ? (idToName.get(pid) || `#${pid}`) : "";
      return (
        name.includes(q) ||
        slug.includes(q) ||
        (pid != null && String(pid).includes(q)) ||
        pname.toLowerCase().includes(q)
      );
    });
  }, [categories, search, idToName]);

  const onDelete = async (id: number, name?: string) => {
    if (!confirm(`Delete category "${name || `#${id}`}"? This cannot be undone.`)) return;
    try {
      await del.mutateAsync({ id });
      toast({ title: "Category deleted" });
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.message || "Server error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">Create and organize your product taxonomy</p>
        </div>
        <Button asChild>
          <Link to="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name/slug/parent…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No categories found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Image</th>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Slug</th>
                    <th className="text-left py-2 px-2">Parent</th>
                    <th className="text-left py-2 px-2">Icon</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const pid = getParentId(c);
                    const parentLabel = pid ? idToName.get(pid) || `#${pid}` : "—";
                    return (
                      <tr key={c.id} className="border-b hover:bg-muted/30">
                        <td className="py-2 px-2">
                          {c.image ? (
                            <img
                              src={c.image}
                              alt={c.name}
                              className="h-10 w-10 rounded object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded border bg-muted/30" />
                          )}
                        </td>
                        <td className="py-2 px-2">{c.name || "—"}</td>
                        <td className="py-2 px-2 text-muted-foreground">{c.slug || "—"}</td>
                        <td className="py-2 px-2">{parentLabel}</td>
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
                            onClick={() => onDelete(c.id, c.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
