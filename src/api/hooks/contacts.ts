import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import type { ContactSubmission, ID } from "@/types";

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data } = await api.get<ContactSubmission[] | { results: ContactSubmission[] }>("/contact-submissions/");
      return Array.isArray(data) ? data : (data.results ?? []);
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: ID } & Partial<ContactSubmission>) => {
      const { data } = await api.patch<ContactSubmission>(`/contact-submissions/${id}/`, payload);
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["contact", id] });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      await api.delete(`/contact-submissions/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}
