// src/api/hooks/cart.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";

export type CartItem = {
  id: number;
  quantity: number;
  product?: { id: number; name: string; slug?: string; primary_image_url?: string };
  variant?: { id: number; sku: string; attributes?: Record<string, string> };
};
export type Cart = { id: number | null; checked_out: boolean; items: CartItem[] };

export function useActiveCart() {
  return useQuery({
    queryKey: ["cart", "active"],
    queryFn: async (): Promise<Cart> => {
      const { data } = await api.get<Cart>("/carts/"); // list() returns a single object
      return data ?? { id: null, checked_out: false, items: [] };
    },
  });
}
