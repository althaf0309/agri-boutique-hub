import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import type { Review, ID } from "@/types";

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await api.get<Review[] | { results: Review[] }>("/reviews/");
      return Array.isArray(data) ? data : (data.results ?? []);
    },
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: ID } & Partial<Review>) => {
      const { data } = await api.patch<Review>(`/reviews/${id}/`, payload);
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["review", id] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      await api.delete(`/reviews/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
