// src/pages/admin/CategoryFormPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/api/hooks/categories";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { ID } from "@/types";

/** All fields optional per your requirement */
const categorySchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(), // optional; if empty, we DON'T send to server
  // parent can be string or number or null
  parent: z.union([z.string(), z.number()]).nullable().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  image: z.any().optional().nullable(), // File | null | undefined
});
type CategoryFormData = z.infer<typeof categorySchema>;

function toFlatCats(data: unknown) {
  if (Array.isArray(data)) return data as any[];
  if (data && typeof data === "object") {
    const o: any = data;
    return o.list ?? o.results ?? o.items ?? [];
  }
  return [];
}

/** Normalize any ID to string or null. */
function toKey(id: unknown): string | null {
  if (id === null || id === undefined) return null;
  if (typeof id === "string" && id.trim() === "") return null;
  return String(id);
}

/** Extract parent id from backend category object, any shape. */
function extractParentId(existing: any): string | null {
  if (!existing) return null;
  const parentField = existing.parent;
  const parentIdField = existing.parent_id;

  if (parentIdField != null) return toKey(parentIdField);

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

export function CategoryFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: catsData } = useCategories();
  const categories = toFlatCats(catsData);
  const { data: existing } = useCategory(isEdit ? (id as ID) : undefined);

  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parent: null,
      icon: "",
      description: "",
      image: null,
    },
    mode: "onBlur",
  });

  // image preview management (safe revoke)
  const [preview, setPreview] = useState<string | null>(null);
  const createdUrlRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (createdUrlRef.current) URL.revokeObjectURL(createdUrlRef.current);
    };
  }, []);

  // hydrate when editing
  useEffect(() => {
    if (isEdit && existing) {
      const parentId = extractParentId(existing);

      form.reset({
        name: (existing as any).name ?? "",
        slug: (existing as any).slug ?? "", // show existing slug but user can clear it
        parent: parentId, // store as string id
        icon: (existing as any).icon ?? "",
        description: (existing as any).description ?? "",
        image: null, // keep empty; we only preview existing.image below
      });
      setPreview((existing as any)?.image || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, (existing as any)?.id]);

  const onImageChange = (file?: File | null) => {
    form.setValue("image", file || null, { shouldDirty: true });

    if (createdUrlRef.current) {
      URL.revokeObjectURL(createdUrlRef.current);
      createdUrlRef.current = null;
    }

    if (file) {
      const url = URL.createObjectURL(file);
      createdUrlRef.current = url;
      setPreview(url);
    } else {
      // if removing new file, fallback to existing image if any
      setPreview((existing as any)?.image || null);
    }
  };

  const optionsWithoutSelf = useMemo(() => {
    const selfId = isEdit ? toKey(id) : null;
    return (categories as any[]).filter((c) => toKey(c.id) !== selfId);
  }, [categories, isEdit, id]);

  const onSubmit = async (values: CategoryFormData) => {
    try {
      const nameTrim = (values.name || "").trim();
      const slugTrim = (values.slug || "").trim(); // may be empty → we omit slug in payload

      // Map UI field -> API field expected by your backend
      const payload: any = {
        name: nameTrim || undefined,
        // NOTE: parent is string/number or null; send as-is
        parent: values.parent ?? null,
        icon: (values.icon || "").trim() || undefined,
        description: (values.description || "").trim() || undefined,
        image: values.image ?? null, // File | null is handled by hooks (multipart)
      };

      // Only send slug if user actually entered something.
      // If left empty, backend auto-slug logic will run.
      if (slugTrim) {
        payload.slug = slugTrim;
      }

      if (isEdit) {
        await update.mutateAsync({ id: id as ID, ...payload });
        toast({ title: "Category updated" });
      } else {
        await create.mutateAsync(payload);
        toast({ title: "Category created" });
      }
      navigate("/admin/categories");
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message || "Server error",
        variant: "destructive",
      });
    }
  };

  const onDelete = async () => {
    if (!isEdit) return;
    const ok = window.confirm("Delete this category? This cannot be undone.");
    if (!ok) return;
    try {
      await del.mutateAsync({ id: id as ID });
      toast({ title: "Category deleted" });
      navigate("/admin/categories");
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">
            {isEdit ? "Edit Category" : "Add Category"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
          <Button size="sm" onClick={form.handleSubmit(onSubmit)}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Fruits" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="leave empty for auto" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Leave empty to let the server auto-generate the slug from
                      the name.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) =>
                        field.onChange(v === "none" ? null : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No parent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No parent</SelectItem>
                        {optionsWithoutSelf.map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Short description…"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image upload */}
              <div className="md:col-span-2">
                <FormLabel>Image</FormLabel>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      onImageChange(e.target.files?.[0] || null)
                    }
                  />
                  {preview ? (
                    <img
                      src={preview}
                      className="h-16 w-16 object-cover rounded border"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded border bg-muted/30" />
                  )}
                  {form.getValues("image") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onImageChange(null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {isEdit &&
                  (existing as any)?.image &&
                  !form.getValues("image") && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Using existing image. Uploading a new file will replace
                      it.
                    </p>
                  )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
