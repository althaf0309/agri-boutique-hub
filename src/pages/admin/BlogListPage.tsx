import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBlogPosts, useBlogCategories, useDeleteBlogPost } from "@/api/hooks/blog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Pencil, Trash2, Search, Tag, Eye, EyeOff, Star, Loader2, RefreshCcw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import api from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

export default function BlogListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: categories = [] } = useBlogCategories();

  // local UI state for filters
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [tagQ, setTagQ] = useState("");

  // Build server params for search/order/filter
  const params = useMemo(() => {
    const p: Record<string, any> = { ordering: "-published_at" };
    if (q.trim()) p.search = q.trim();
    if (tagQ.trim()) p.tag = tagQ.trim();
    if (cat !== "all") p.category = cat; // id
    return p;
  }, [q, tagQ, cat]);

  const { data: posts = [], isLoading, refetch, isFetching } = useBlogPosts(params);
  const { mutateAsync: deletePost, isLoading: deleting } = useDeleteBlogPost();

  async function togglePublish(id: number, current: boolean) {
    try {
      await api.patch(`/blog/posts/${id}/`, { is_published: !current });
      toast({ title: "Updated", description: `Post ${!current ? "published" : "unpublished"}.` });
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.response?.data || e?.message, variant: "destructive" });
    }
  }

  async function toggleFeatured(id: number, current: boolean) {
    try {
      await api.patch(`/blog/posts/${id}/`, { featured: !current });
      toast({ title: "Updated", description: `Post ${!current ? "marked featured" : "removed from featured"}.` });
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.response?.data || e?.message, variant: "destructive" });
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deletePost({ id });
      toast({ title: "Deleted", description: "Blog post removed." });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.response?.data || e?.message, variant: "destructive" });
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your articles, publishing, and featured content.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          <Button onClick={() => navigate("/admin/blog/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search title, excerpt, content…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Filter by tag (exact or partial)" value={tagQ} onChange={(e) => setTagQ(e.target.value)} />
          </div>

          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead className="hidden md:table-cell">Published</TableHead>
                <TableHead className="hidden md:table-cell">Featured</TableHead>
                <TableHead className="hidden md:table-cell">Published At</TableHead>
                <TableHead className="w-[1%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="py-10 text-center text-muted-foreground">Loading posts…</div>
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="py-10 text-center text-muted-foreground">No posts found.</div>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.cover_url ? (
                          <img src={p.cover_url} alt={p.title} className="w-12 h-12 rounded object-cover border" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted border" />
                        )}
                        <div>
                          <div className="font-semibold">{p.title}</div>
                          <div className="text-xs text-muted-foreground">/{p.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.category?.name ? <Badge variant="secondary">{p.category.name}</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(p.tags || []).map((t) => (
                          <Badge key={t} variant="outline">{t}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Switch checked={p.is_published} onCheckedChange={() => togglePublish(p.id, p.is_published)} />
                        {p.is_published ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Switch checked={p.featured} onCheckedChange={() => toggleFeatured(p.id, p.featured)} />
                        <Star className={`w-4 h-4 ${p.featured ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.published_at ? dayjs(p.published_at).format("YYYY-MM-DD HH:mm") : "—"}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/admin/blog/${p.id}/edit`}>
                          <Button size="icon" variant="ghost" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(p.id)}
                          disabled={deleting}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
