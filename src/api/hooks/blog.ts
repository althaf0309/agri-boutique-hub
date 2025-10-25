// src/api/hooks/blog.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";

// If you already export postMultipart/patchMultipart helpers from client,
// you can keep using them. Otherwise the plain api.post/patch without
// setting Content-Type is fine for FormData (browser sets boundary).

export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  created_at: string;
};

export type BlogPostVersion = {
  version: number;
  title: string;
  created_at: string;
  editor_name?: string | null;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  content_html?: string;
  cover?: string;        // server write field (file)
  cover_url?: string;    // server read field (url)
  category?: BlogCategory;
  category_id?: number;  // write
  author?: number;
  author_name?: string | null;
  tags?: string[];       // write
  tags_csv?: string;     // read
  featured: boolean;
  is_published: boolean;
  published_at?: string;
  views_count?: number;
  created_at?: string;
  updated_at?: string;
  versions?: BlogPostVersion[];
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

// Utility: normalize DRF list OR simple array
const unwrap = <T,>(d: any): T[] => (Array.isArray(d) ? d : d?.results ?? []);

// ---- FormData builder (tolerant with arrays/booleans) ----
function buildFormData(payload: Partial<BlogPost> & { cover?: File | null }) {
  const fd = new FormData();

  // append helper that skips null/undefined
  const put = (k: string, v: any) => {
    if (v === undefined || v === null) return;
    fd.append(k, v);
  };

  // scalar fields
  if (payload.title != null) put("title", String(payload.title));
  if (payload.excerpt != null) put("excerpt", String(payload.excerpt));
  if (payload.content_markdown != null) put("content_markdown", String(payload.content_markdown));
  if (payload.category_id != null) put("category_id", String(payload.category_id));
  if (payload.published_at) put("published_at", String(payload.published_at));

  // booleans → strings (DRF multipart quirk)
  if (typeof payload.is_published === "boolean") put("is_published", payload.is_published ? "true" : "false");
  if (typeof payload.featured === "boolean") put("featured", payload.featured ? "true" : "false");

  // tags: send csv for simplicity (backend accepts tags[] or tags_csv)
  if (Array.isArray(payload.tags) && payload.tags.length) {
    put("tags_csv", payload.tags.join(", "));
  } else if (payload.tags_csv) {
    put("tags_csv", payload.tags_csv);
  }

  // cover file
  if (payload.cover instanceof File) {
    fd.append("cover", payload.cover);
  }

  return fd;
}

/* =========================
   Categories
   ========================= */
export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogCategory> | BlogCategory[]>("/blog/categories/");
      return unwrap<BlogCategory>(data);
    },
  });
}

/* =========================
   Posts list
   ========================= */
export function useBlogPosts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["blog-posts", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogPost> | BlogPost[]>("/blog/posts/", { params });
      return unwrap<BlogPost>(data);
    },
  });
}

/* =========================
   Single post (by id)
   ========================= */
export function useBlogPost(id?: number) {
  return useQuery({
    enabled: !!id,
    queryKey: ["blog-post", id],
    queryFn: async () => {
      const { data } = await api.get<BlogPost>(`/blog/posts/${id}/`);
      return data;
    },
  });
}

/* =========================
   Single post (by slug)
   ========================= */
export function useBlogPostBySlug(slug?: string) {
  return useQuery({
    enabled: !!slug,
    queryKey: ["blog-post", "slug", slug],
    queryFn: async () => {
      const { data } = await api.get<BlogPost>(`/blog/posts/by-slug/${encodeURIComponent(slug as string)}/`);
      return data;
    },
  });
}

/* =========================
   Create
   ========================= */
export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BlogPost> & { cover?: File | null }) => {
      const hasFile = payload.cover != null && typeof payload.cover === 'object' && payload.cover && 'name' in payload.cover;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (k === "cover" && v instanceof File) fd.append("cover", v);
          else if (v != null) fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
        });
        const { data } = await postMultipart<BlogPost>("/blog/posts/", fd);
        return data;
      }
      // JSON path also works (backend serializer accepts JSON)
      const { data } = await api.post<BlogPost>("/blog/posts/", {
        ...payload,
        // ensure booleans are booleans here
        is_published: !!payload.is_published,
        featured: !!payload.featured,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

/* =========================
   Update
   ========================= */
export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & (Partial<BlogPost> & { cover?: File | null })) => {
      const hasFile = payload.cover != null && typeof payload.cover === 'object' && payload.cover && 'name' in payload.cover;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (k === "cover" && v instanceof File) fd.append("cover", v);
          else if (v != null) fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
        });
        const { data } = await patchMultipart<BlogPost>(`/blog/posts/${id}/`, fd);
        return data;
      }
      const { data } = await api.patch<BlogPost>(`/blog/posts/${id}/`, {
        ...payload,
        is_published: payload.is_published ?? undefined,
        featured: payload.featured ?? undefined,
      });
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-post", vars.id] });
    },
  });
}

/* =========================
   Delete
   ========================= */
export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      await api.delete(`/blog/posts/${id}/`);
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}
