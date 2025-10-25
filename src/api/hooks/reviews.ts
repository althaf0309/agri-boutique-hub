// src/api/hooks/reviews.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";

/** Adjust to your backend fields as needed */
export type Review = {
  id: number;
  product?: { id: number; name?: string } | null;
  product_id?: number; // convenience when backend returns plain id
  user?: { id?: number; email?: string; name?: string } | null;
  user_email?: string | null;
  user_name?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  is_approved?: boolean;
  created_at?: string;
};

const KEYS = {
  all: ["reviews"] as const,
  list: () => [...KEYS.all, "list"] as const,
  product: (productId: number | string) => [...KEYS.all, "product", productId] as const,
  detail: (id: number | string) => [...KEYS.all, "detail", id] as const,
};

/** Admin: get all reviews (paginated or array) */
export function useReviews() {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: async (): Promise<Review[]> => {
      const { data } = await api.get("/reviews/");
      return Array.isArray(data) ? data : (data?.results ?? []);
    },
  });
}

/** Product page: reviews for a particular product (only approved by default) */
export function useProductReviews(productId: number | string, opts?: { includeUnapproved?: boolean }) {
  return useQuery({
    enabled: !!productId,
    queryKey: KEYS.product(productId),
    queryFn: async (): Promise<Review[]> => {
      const { data } = await api.get("/reviews/", {
        params: {
          product: productId,
          ordering: "-created_at",
          ...(opts?.includeUnapproved ? {} : { is_approved: true }),
        },
      });
      return Array.isArray(data) ? data : (data?.results ?? []);
    },
  });
}

/** Create */
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      product: number | string;
      rating: number;
      title?: string;
      comment?: string;
      user_email?: string;
      user_name?: string;
    }) => {
      const { data } = await api.post<Review>("/reviews/", payload);
      return data;
    },
    onSuccess: (created) => {
      const pid = (created.product_id ?? created.product?.id) as number | undefined;
      qc.invalidateQueries({ queryKey: KEYS.list() });
      if (pid) qc.invalidateQueries({ queryKey: KEYS.product(pid) });
    },
  });
}

/** Update (approve/unapprove etc.) */
export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: number | string } & Partial<Review>) => {
      const { id, ...payload } = input;
      const { data } = await api.patch<Review>(`/reviews/${id}/`, payload);
      return data;
    },
    onSuccess: (updated) => {
      const pid = (updated.product_id ?? updated.product?.id) as number | undefined;
      qc.invalidateQueries({ queryKey: KEYS.list() });
      qc.invalidateQueries({ queryKey: KEYS.detail(updated.id) });
      if (pid) qc.invalidateQueries({ queryKey: KEYS.product(pid) });
    },
  });
}

/** Delete */
export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number | string }) => {
      await api.delete(`/reviews/${id}/`);
      return id;
    },
    onSuccess: (_id) => {
      qc.invalidateQueries({ queryKey: KEYS.list() });
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
