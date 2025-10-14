// src/api/hooks/contacts.ts  (bonus: fixes `contacts.map is not a function`)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";

type Contact = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  handled: boolean;
  created_at: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };
const toArray = <T,>(d: any): T[] => (Array.isArray(d) ? d : d?.results ?? []);

export function useContacts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Contact> | Contact[]>("/contacts/", { params });
      return toArray<Contact>(data); // ALWAYS array
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Contact, "id" | "handled" | "created_at">) => {
      const { data } = await api.post<Contact>("/contacts/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Partial<Contact>) => {
      const { data } = await api.patch<Contact>(`/contacts/${id}/`, payload);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["contact", vars.id] });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      await api.delete(`/contacts/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}
