// src/pages/admin/CategoriesPage.tsx
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCategories, useDeleteCategory } from "@/api/hooks/categories";
import { useToast } from "@/hooks/use-toast";
import type { ID } from "@/types";

type Cat = {
  id: ID;
  name?: string;
  slug?: string;
  image?: string;
  icon?: string;
  parent?: ID | { id: ID; name?: string } | null;
  parent_id?: ID | null;
  // backend may send these, we just use them via (c as any)
  created_at?: string;
};

function toFlatCats(data: unknown): Cat[] {
  if (Array.isArray(data)) return data as Cat[];
  if (data && typeof data === "object") {
    const anyObj = data as any;
    if (Array.isArray(anyObj.list)) return anyObj.list as Cat[];
    if (Array.isArray(anyObj.results)) return anyObj.results as Cat[];
    if (Array.isArray(anyObj.items)) return anyObj.items as Cat[];
  }
  return [];
}

/** Normalize to string-key Id, or null if missing. */
function toKey(id: unknown): string | null {
  if (id === null || id === undefined) return null;
  if (typeof id === "string" && id.trim() === "") return null;
  return String(id);
}

/** Extract parent id from whatever shape backend sends. */
function getParentId(c: Cat): string | null {
  const anyC: any = c;
  const parentField = anyC.parent;
  const parentIdField = anyC.parent_id;

  // 1) explicit parent_id
  if (parentIdField != null) {
    return toKey(parentIdField);
  }

  // 2) parent can be id or object
  if (parentField != null) {
    if (typeof parentField === "string" || typeof parentField === "number") {
      return toKey(parentField);
    }
    if (typeof parentField === "object" && parentField.id != null) {
      return toKey(parentField.id);
    }
  }

  return null;
}

/** Sort categories newest-first (latest added first). */
function sortCategoriesNewFirst(cats: Cat[]): Cat[] {
  const copy = [...cats];
  copy.sort((a, b) => {
    const aAny: any = a;
    const bAny: any = b;

    const aTs = aAny.created_at ? new Date(aAny.created_at).getTime() : 0;
    const bTs = bAny.created_at ? new Date(bAny.created_at).getTime() : 0;

    // if created_at available, use it
    if (aTs !== bTs) return bTs - aTs;

    // fallback to id desc
    const aId = Number(aAny.id) || 0;
    const bId = Number(bAny.id) || 0;
    return bId - aId;
  });
  return copy;
}

export function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const rawCategories = toFlatCats(data);

  // ✅ newest first
  const categories = useMemo(
    () => sortCategoriesNewFirst(rawCategories),
    [rawCategories]
  );

  const { toast } = useToast();
  const del = useDeleteCategory();

  const [search, setSearch] = useState("");

  // 🔢 pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // reset to page 1 whenever search text or total categories change
  useEffect(() => {
    setPage(1);
  }, [search, categories.length]);

  const idToName = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      const key = toKey((c as any).id);
      if (!key) return;
      map.set(key, c.name || `#${key}`);
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
      const pname = pid ? idToName.get(pid) || `#${pid}` : "";
      return (
        name.includes(q) ||
        slug.includes(q) ||
        (pid != null && String(pid).toLowerCase().includes(q)) ||
        pname.toLowerCase().includes(q)
      );
    });
  }, [categories, search, idToName]);

  // 🔢 derive pagination values from filtered list
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const pageItems = filtered.slice(startIndex, endIndex);

  const onDelete = async (id: any, name?: string) => {
    if (
      !confirm(
        `Delete category "${name || `#${id}`}"? This cannot be undone.`
      )
    )
      return;
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
          <p className="text-sm text-muted-foreground">
            Create and organize your product taxonomy
          </p>
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
            <div className="py-10 text-center text-muted-foreground">
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No categories found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Image</th>
                      <th className="text-left py-2 px-2">Name</th>
                      <th className="text-left py-2 px-2">Slug</th>
                      <th className="text-left py-2 px-2">Parent</th>
                      <th className="text-right py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((c) => {
                      const pid = getParentId(c);
                      const parentLabel = pid
                        ? idToName.get(pid) || `#${pid}`
                        : "—";
                      const key = toKey((c as any).id) || String(c.id);

                      return (
                        <tr
                          key={key}
                          className="border-b hover:bg-muted/30"
                        >
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
                          <td className="py-2 px-2">
                            {c.name || "—"}
                          </td>
                          <td className="py-2 px-2 text-muted-foreground">
                            {c.slug || "—"}
                          </td>
                          <td className="py-2 px-2">{parentLabel}</td>
                          <td className="py-2 px-2 text-right">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="mr-2"
                            >
                              <Link
                                to={`/admin/categories/${c.id}/edit`}
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                onDelete(c.id, c.name)
                              }
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

              {/* pagination footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-muted-foreground">
                <div>
                  {totalCount > 0 && (
                    <span>
                      Showing <strong>{startIndex + 1}</strong>–
                      <strong>{endIndex}</strong> of{" "}
                      <strong>{totalCount}</strong> categories
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                  >
                    Previous
                  </Button>
                  <span>
                    Page <strong>{currentPage}</strong> of{" "}
                    <strong>{totalPages}</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPage((p) =>
                        Math.min(totalPages, p + 1)
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
