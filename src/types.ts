// src/types.ts

export type ID = number | string;
export type OrderStatus = "pending" | "confirmed" | "cancelled";
export type ShipmentStatus = "placed" | "pending" | "processing" | "delivered";

export type OrderLine = {
  product_id: number;
  variant_id: number | null;
  name: string;
  qty: number;             // quantity
  price: string | number;  // unit price from API (string or number)
  image?: string;          // absolute URL (backend serializer builds this)
  weight?: string | null;  // e.g. "1KG"
};

export type OrderTotals = {
  subtotal: string | number;
  shipping: string | number;
  tax: string | number;
  grand_total: string | number;
};

export type OrderCheckoutDetails = {
  full_name: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  notes?: string;
};

export type Order = {
  id: number;
  status: "pending" | "confirmed" | "cancelled";
  shipment_status: "placed" | "pending" | "processing" | "delivered";
  payment_method?: "cash-on-delivery" | "card" | string;
  
  currency?: string; // "INR", etc.
  country_code?: string; // "IN"
  created_at: string;
  updated_at: string;

  // Snapshot data coming from your DRF OrderSerializer:
  checkout_details?: OrderCheckoutDetails | null;
  payment?: {
    method: string;
    provider: string;
    status: string;
    transaction_id: string;
    currency: string;
    amount: string | number;
    raw?: any;
    created_at: string;
    updated_at: string;
  } | null;

  // The important parts for product details:
  lines?: OrderLine[];     // <-- items ready for UI (with image)
  totals?: OrderTotals;    // <-- subtotal/shipping/tax/grand_total
};
