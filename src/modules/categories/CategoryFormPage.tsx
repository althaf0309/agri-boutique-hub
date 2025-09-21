import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategories, useCategory, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/api/hooks/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

// ALL OPTIONAL fields schema (per your request)
const categorySchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  parent: z.number().nullable().optional(),
  icon: z.string().optional(),
  // we treat image as File on the client — optional
  image: z.any().optional().nullable(),
});
type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoryFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: categories = [] } = useCategories();
  const { data: existing } = useCategory(isEdit ? Number(id) : undefined);

  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del    = useDeleteCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parent: null,
      icon: "",
      image: null,
    },
  });

  // hydrate when editing
  useEffect(() => {
    if (isEdit && existing) {
      form.reset({
        name: existing.name ?? "",
        slug: existing.slug ?? "",
        parent: (existing as any).parent ?? null,
        icon: (existing as any).icon ?? "",
        image: null, // keep empty; show preview below
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, existing?.id]);

  const [preview, setPreview] = useState<string | null>(null);

  const onImageChange = (file?: File | null) => {
    form.setValue("image", file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const optionsWithoutSelf = useMemo(() => {
    const selfId = isEdit ? Number(id) : null;
    return categories.filter((c: any) => c.id !== selfId);
  }, [categories, isEdit, id]);

  const onSubmit = async (values: CategoryFormData) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: Number(id), ...values });
        toast({ title: "Category updated" });
      } else {
        await create.mutateAsync(values);
        toast({ title: "Category created" });
      }
      navigate("/admin/categories");
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Server error", variant: "destructive" });
    }
  };

  const onDelete = async () => {
    if (!isEdit) return;
    const ok = window.confirm("Delete this category? This cannot be undone.");
    if (!ok) return;
    try {
      await del.mutateAsync({ id: Number(id) });
      toast({ title: "Category deleted" });
      navigate("/admin/categories");
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Server error", variant: "destructive" });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">{isEdit ? "Edit Category" : "Add Category"}</h1>
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
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <Input {...field} placeholder="fruits" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      If empty, backend generates from name.
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
                      value={field.value ? String(field.value) : "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? null : Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="No parent" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No parent</SelectItem>
                        {optionsWithoutSelf.map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (class or name)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., lucide:apple" />
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
                    onChange={(e) => onImageChange(e.target.files?.[0] || null)}
                  />
                  {preview ? (
                    <img src={preview} className="h-16 w-16 object-cover rounded border" />
                  ) : isEdit && (existing as any)?.image ? (
                    <img src={(existing as any).image} className="h-16 w-16 object-cover rounded border" />
                  ) : null}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
