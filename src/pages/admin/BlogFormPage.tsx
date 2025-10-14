import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useBlogCategories,
  useCreateBlogPost,
  useUpdateBlogPost,
  type BlogPost,
} from "@/api/hooks/blog";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar as CalendarIcon, ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import dayjs from "dayjs";

function readFilePreview(file?: File | null): Promise<string | null> {
  if (!(file instanceof File)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => resolve(null);
    fr.readAsDataURL(file);
  });
}

export default function BlogFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: categories = [] } = useBlogCategories();
  const { mutateAsync: createPost, isLoading: creating } = useCreateBlogPost();
  const { mutateAsync: updatePost, isLoading: updating } = useUpdateBlogPost();

  const [loading, setLoading] = useState<boolean>(!!isEdit);
  const [initial, setInitial] = useState<Partial<BlogPost> | null>(null);

  // form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagsStr, setTagsStr] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string>(dayjs().format("YYYY-MM-DDTHH:mm"));

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [markdown, setMarkdown] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // load existing for edit
  useEffect(() => {
    let active = true;
    async function load() {
      if (!isEdit || !id) return;
      try {
        setLoading(true);
        const { data } = await api.get<BlogPost>(`/blog/posts/${id}/`);
        if (!active) return;
        setInitial(data);
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setExcerpt(data.excerpt || "");
        setCategoryId(data.category?.id ? String(data.category.id) : "");
        setTagsStr((data.tags || []).join(", "));
        setIsPublished(!!data.is_published);
        setFeatured(!!data.featured);
        setPublishedAt(data.published_at ? dayjs(data.published_at).format("YYYY-MM-DDTHH:mm") : dayjs().format("YYYY-MM-DDTHH:mm"));
        setMarkdown(data.content_markdown || "");
        setCoverPreview(data.cover_url || null);
      } catch (e: any) {
        toast({ title: "Load failed", description: e?.response?.data || e?.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [isEdit, id]);

  // handle file preview
  useEffect(() => {
    readFilePreview(coverFile).then((p) => p && setCoverPreview(p));
  }, [coverFile]);

  const saving = creating || updating;

  const payload = useMemo(() => {
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const base: Partial<BlogPost> & { cover?: File | null } = {
      title,
      excerpt,
      content_markdown: markdown,
      category_id: categoryId ? Number(categoryId) : undefined,
      tags,
      is_published: isPublished,
      featured,
      published_at: dayjs(publishedAt).toISOString(),
      cover: coverFile || undefined,
    };
    return base;
  }, [title, excerpt, markdown, categoryId, tagsStr, isPublished, featured, publishedAt, coverFile]);

  async function onSubmit() {
    try {
      if (!title.trim()) {
        toast({ title: "Title required", description: "Please provide a post title.", variant: "destructive" });
        return;
      }
      if (!categoryId) {
        toast({ title: "Category required", description: "Please select a category.", variant: "destructive" });
        return;
      }

      if (isEdit && id) {
        await updatePost({ id: Number(id), ...payload });
        toast({ title: "Post updated", description: "Your changes were saved." });
      } else {
        const created = await createPost(payload);
        toast({ title: "Post created", description: "New article published to your blog." });
        // go to edit page of the new post
        if (created?.id) navigate(`/admin/blog/${created.id}/edit`);
        else navigate("/admin/blog");
      }
    } catch (e: any) {
      const msg = e?.response?.data || e?.message;
      toast({ title: "Save failed", description: typeof msg === "string" ? msg : "Please check your inputs.", variant: "destructive" });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/blog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? "Edit Post" : "New Post"}</h1>
            <p className="text-muted-foreground">Write in Markdown — we render HTML server-side.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onSubmit} disabled={saving || loading}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isEdit ? "Save Changes" : "Create Post"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="Amazing organic insights…" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label>Slug (read-only)</Label>
              <Input value={slug} readOnly />
            </div>
          )}

          <div className="space-y-2">
            <Label>Excerpt</Label>
            <Textarea placeholder="Short summary shown in lists and cards…" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Content (Markdown)</Label>
            <Textarea
              placeholder="Write your article in Markdown…"
              rows={16}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="font-mono"
            />
          </div>
        </Card>

        {/* Side panel */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input placeholder="organic, farming, sustainability" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Published At
              </Label>
              <Input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="published" checked={isPublished} onCheckedChange={(v) => setIsPublished(Boolean(v))} />
              <Label htmlFor="published">Published</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="featured" checked={featured} onCheckedChange={(v) => setFeatured(Boolean(v))} />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <Label>Cover Image</Label>
            <div className="flex gap-4">
              <div className="w-28 h-28 border rounded bg-muted overflow-hidden flex items-center justify-center">
                {coverPreview ? (
                  <img src={coverPreview} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
