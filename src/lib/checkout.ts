// src/lib/checkout.ts
import { CartLine, getItems } from "@/lib/cart";

export type CheckoutLine = { product_id: number; variant_id?: number; weight?: string; quantity: number };

const CHECKOUT_LINES_KEY = "checkout_lines_v1";
const LAST_ORDER_KEY = "last_order_id";

function mapCartToLines(cart: CartLine[]): CheckoutLine[] {
  return cart
    .filter((x) => x.quantity > 0)
    .map((x) => ({
      product_id: x.id,
      variant_id: x.variantId || undefined,
      weight: x.weight || "",
      quantity: x.quantity,
    }));
}

/**
 * Client-side checkout “begin”: stores the intended lines in sessionStorage
 * and returns a pseudo order id. No backend dependency.
 */
export async function beginCheckout(opts?: { lines?: CheckoutLine[] }): Promise<number> {
  const lines = (opts?.lines && opts.lines.length ? opts.lines : mapCartToLines(getItems())).filter(
    (l) => l.quantity > 0
  );
  const orderId = Date.now(); // simple, unique enough id for client flow

  try {
    sessionStorage.setItem(CHECKOUT_LINES_KEY, JSON.stringify(lines));
    sessionStorage.setItem(LAST_ORDER_KEY, String(orderId));
  } catch {}

  return orderId;
}

/** Read the stored checkout lines (if any). */
export function getCheckoutLines(): CheckoutLine[] {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_LINES_KEY);
    return raw ? (JSON.parse(raw) as CheckoutLine[]) : [];
  } catch {
    return [];
  }
}

/** Clear the stored checkout lines after successful place order. */
export function clearCheckoutLines() {
  try {
    sessionStorage.removeItem(CHECKOUT_LINES_KEY);
  } catch {}
}
