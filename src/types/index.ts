export type ID = number;

export interface Category {
  id: ID;
  name: string;
  slug: string;
  parent?: ID | null;
  icon?: string;
  image?: string | null;
}

export interface ProductImage {
  id: ID;
  product: ID;
  image: string;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: ID;
  product: ID;
  sku: string;
  attributes: Record<string, string>;
  price_override?: string | null;
  discount_override?: number | null;
  quantity: number;
  is_active: boolean;
  weight_value?: string | null;
  weight_unit?: "G" | "KG" | "ML" | "L" | null;
  weight_label?: string | null;
  color?: { id: ID; name: string; slug: string; hex?: string } | null;
  color_id?: ID | null;
  mrp?: string | null;
  barcode?: string;
  min_order_qty: number;
  step_qty: number;
  unit_price: string;
  images: { id: ID; image: string; is_primary: boolean }[];
  created_at: string;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  category: Category;
  category_id: ID;
  vendor?: any;
  vendor_id?: ID | null;
  store?: any;
  store_id?: ID | null;
  quantity: number;
  price_inr?: string;
  price_usd?: string;
  aed_pricing_mode: "STATIC" | "GOLD";
  price_aed_static?: string | null;
  gold_weight_g?: string | null;
  gold_making_charge?: string | null;
  gold_markup_percent?: string | null;
  discount_percent: number;
  price: string;
  discounted_price: string;
  currency: "INR" | "USD" | "AED";
  in_stock: boolean;
  featured: boolean;
  new_arrival: boolean;
  limited_stock: boolean;
  views_count: number;
  carts_count: number;
  sold_count: number;
  reviews_count: number;
  rating_avg: string;
  wishes_count: number;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: ID;
  user_email: string;
  status: "pending" | "confirmed" | "cancelled";
  country: string;
  currency: string;
  created_at: string;
  items: {
    id: ID;
    product: Product;
    variant?: ProductVariant;
    quantity: number;
    unit_price: string;
    line_total: string;
  }[];
  total: string;
}

export interface Review {
  id: ID;
  product: Product;
  user_email: string;
  rating: number;
  title: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface ContactSubmission {
  id: ID;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  created_at: string;
}

export interface KpiData {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  totalSold: number;
  ordersToday: number;
  revenueToday: string;
  ordersThisMonth: number;
  revenueThisMonth: string;
  averageRating: string;
  wishlistItems: number;
}