import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { isRead } from "@/lib/notifications";

/** ---- /auth/me ---- */
export type Me = {
  id: number; email: string; first_name: string; last_name: string;
  is_active: boolean; is_staff: boolean; is_superuser: boolean; is_vendor?: boolean;
};
export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<Me> => (await api.get("/auth/me/")).data,
    staleTime: 30_000,
  });
}

/** one flat item we can render + mark read */
export type NotifFlatItem = {
  key: string;           // "order:123" | "review:45" | "contact:67"
  kind: "order" | "review" | "contact";
  id: number;
  title: string;         // “Order #123 is pending”
  href: string;          // route to open when clicked
  read: boolean;
  created_at?: string;   // best-effort
};

async function fetchPendingOrders(): Promise<NotifFlatItem[]> {
  try {
    const { data } = await api.get<any>("/orders/", { params: { limit: 50 } });
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    return (list || [])
      .filter((o: any) => String(o?.status || "").toLowerCase() === "pending")
      .map((o: any) => {
        const id = Number(o.id);
        const key = `order:${id}`;
        return {
          key,
          kind: "order" as const,
          id,
          title: `Order #${id} is pending`,
          href: `/admin/orders/${id}`,
          read: isRead(key),
          created_at: o?.created_at,
        };
      });
  } catch {
    return [];
  }
}

async function fetchUnapprovedReviews(): Promise<NotifFlatItem[]> {
  try {
    const { data } = await api.get<any>("/reviews/", { params: { is_approved: false, limit: 50, ordering: "-created_at" } });
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    return (list || []).map((r: any) => {
      const id = Number(r.id);
      const key = `review:${id}`;
      const pid = r?.product_id ?? r?.product?.id;
      return {
        key,
        kind: "review" as const,
        id,
        title: `Review #${id} awaiting approval`,
        href: `/admin/reviews${pid ? `?product=${pid}` : ""}`,
        read: isRead(key),
        created_at: r?.created_at,
      };
    });
  } catch {
    return [];
  }
}

async function fetchUnhandledContacts(): Promise<NotifFlatItem[]> {
  try {
    const { data } = await api.get<any>("/contacts/", { params: { handled: false, limit: 50, ordering: "-created_at" } });
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    return (list || []).map((c: any) => {
      const id = Number(c.id);
      const key = `contact:${id}`;
      return {
        key,
        kind: "contact" as const,
        id,
        title: `New contact: ${c?.name || c?.email || `#${id}`}`,
        href: `/admin/contact`,
        read: isRead(key),
        created_at: c?.created_at,
      };
    });
  } catch {
    return [];
  }
}

/** master hook */
export function useAdminNotifications() {
  return useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: async () => {
      const [orders, reviews, contacts] = await Promise.all([
        fetchPendingOrders(),
        fetchUnapprovedReviews(),
        fetchUnhandledContacts(),
      ]);
      const flat = [...orders, ...reviews, ...contacts]
        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

      const unseen = flat.filter((i) => !i.read).length;

      const buckets = [
        { key: "orders",   label: "Pending Orders",       href: "/admin/orders",   count: orders.length },
        { key: "reviews",  label: "Reviews to Approve",   href: "/admin/reviews",  count: reviews.length },
        { key: "contacts", label: "New Contact Messages", href: "/admin/contact",  count: contacts.length },
      ];
      const total = buckets.reduce((s, b) => s + b.count, 0);

      return { total, unseen, buckets, flat };
    },
    refetchInterval: 15_000,
  });
}
