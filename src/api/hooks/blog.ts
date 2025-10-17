// src/api/hooks/blog.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { postMultipart, patchMultipart } from "@/api/client";

export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  created_at: string;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  content_html: string;
  cover?: string;
  cover_url?: string;
  category?: BlogCategory;
  category_id?: number;
  author?: number;
  author_name?: string | null;
  tags?: string[];
  tags_csv?: string;
  featured: boolean;
  is_published: boolean;
  published_at: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  versions?: Array<{
    version: number;
    title: string;
    created_at: string;
    editor_name?: string | null;
  }>;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };
const toArray = <T,>(d: any): T[] => (Array.isArray(d) ? d : d?.results ?? []);

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogCategory> | BlogCategory[]>("/blog/categories/");
      return toArray<BlogCategory>(data);
    },
  });
}

export function useBlogPosts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["blog-posts", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<BlogPost> | BlogPost[]>("/blog/posts/", { params });
      return toArray<BlogPost>(data);
    },
  });
}

export function useBlogPostBySlug(slug?: string) {
  return useQuery({
    enabled: !!slug,
    queryKey: ["blog-post", "slug", slug],
    queryFn: async () => {
      const { data } = await api.get<BlogPost>(`/blog/posts/by-slug/${encodeURIComponent(slug!)}/`);
      return data;
    },
  });
}

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
      const { data } = await api.post<BlogPost>("/blog/posts/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog-posts"] }),
  });
}

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
      const { data } = await api.patch<BlogPost>(`/blog/posts/${id}/`, payload);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-post", vars.id] });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      await api.delete(`/blog/posts/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog-posts"] }),
  });
}
