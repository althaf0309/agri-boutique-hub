// src/lib/cart.ts
import { useSyncExternalStore } from "react";

export interface CartLine {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  weight: string; // use "" if no variant/weight
  quantity: number;
  inStock: boolean;
  /** optional: selected variant id (when product has variants) */
  variantId?: number;
}

const KEY = "cart_items_v1";
const EVT = "cart:changed";

/* ------------------------- helpers ------------------------- */
function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}
function save(items: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVT));
}

function sameLine(
  a: Pick<CartLine, "id" | "weight" | "variantId">,
  b: Pick<CartLine, "id" | "weight" | "variantId">
) {
  const aw = a.weight ?? "";
  const bw = b.weight ?? "";
  const av = a.variantId ?? undefined;
  const bv = b.variantId ?? undefined;
  return a.id === b.id && aw === bw && av === bv;
}

/* ------------------------- backend sync (best-effort) ------------------------- */
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function authHeaders() {
  const token = localStorage.getItem("auth_token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Token ${token}` } : {};
}

function toServerLines(items: CartLine[]) {
  return items
    .filter((x) => x.quantity > 0)
    .map((x) => ({
      product_id: x.id,
      variant_id: x.variantId ?? null,
      quantity: x.quantity,
    }));
}

async function postJSON(path: string, body: any) {
  try {
    await fetch(`${API_BASE}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    /* ignore */
  }
}

async function syncAllToServer(mode: "replace" | "merge" = "replace") {
  const lines = toServerLines(read());
  await postJSON("/carts/sync/", { lines, mode });
}

/* ------------------------- public API (non-react) ------------------------- */
export function getItems(): CartLine[] {
  return read();
}

export function addItem(item: CartLine) {
  const items = read();
  const line: CartLine = {
    ...item,
    weight: item.weight ?? "",
    quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    variantId: item.variantId ?? undefined,
  };

  const idx = items.findIndex((x) => sameLine(x, line));
  if (idx >= 0) {
    items[idx].quantity += line.quantity;
  } else {
    items.push(line);
  }
  save(items);

  postJSON("/carts/add_item/", {
    product_id: line.id,
    variant_id: line.variantId ?? null,
    quantity: line.quantity,
  });
}

export function setQuantity(id: number, weight: string, quantity: number, variantId?: number) {
  let items = read();
  const target = { id, weight: weight ?? "", variantId: variantId ?? undefined } as const;

  items = items
    .map((x) => (sameLine(x, target) ? { ...x, quantity } : x))
    .filter((x) => x.quantity > 0);

  save(items);

  if (quantity <= 0) {
    postJSON("/carts/remove_item/", { product_id: id, variant_id: variantId ?? null });
  } else {
    postJSON("/carts/set_quantity/", { product_id: id, variant_id: variantId ?? null, quantity });
  }
}

export function removeItem(id: number, weight: string, variantId?: number) {
  const target = { id, weight: weight ?? "", variantId: variantId ?? undefined } as const;
  const items = read().filter((x) => !sameLine(x, target));
  save(items);

  postJSON("/carts/remove_item/", { product_id: id, variant_id: variantId ?? null });
}

export function clear() {
  save([]);
  syncAllToServer("replace");
}

/* ------- handy computed getters (non-react) ------- */
export function getCount(): number {
  return read().reduce((sum, i) => sum + (i.quantity || 0), 0);
}
export function getTotal(): number {
  return read().reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0);
}

/* ------------------------- React hooks ------------------------- */
function subscribe(callback: () => void) {
  const fn = () => callback();
  window.addEventListener(EVT, fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVT, fn);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshotItems() {
  return read();
}
function getSnapshotCount() {
  return getCount();
}
function getSnapshotTotal() {
  return getTotal();
}

export function useCartItems(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshotItems, getSnapshotItems);
}
export function useCartCount(): number {
  return useSyncExternalStore(subscribe, getSnapshotCount, getSnapshotCount);
}
export function useCartTotal(): number {
  return useSyncExternalStore(subscribe, getSnapshotTotal, getSnapshotTotal);
}
