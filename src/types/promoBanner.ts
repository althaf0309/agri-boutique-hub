// src/types/promoBanner.ts
export type PromoPlacement = "top" | "bottom";
export type PromoVariant = "default" | "coupon" | "clearance";

export interface PromoBanner {
  id: number;
  placement: PromoPlacement;      // "top" | "bottom"
  variant: PromoVariant;          // "default" | "coupon" | "clearance"
  title: string;
  subtitle: string;
  badge: string;
  button_text: string;
  cta_url: string;
  image: string | null;           // file field URL from backend
  image_url: string;              // optional external URL
  class_name: string;
  overlay_class: string;
  is_wide: boolean;
  coupon_code: string;
  coupon_text: string;
  offer_text: string;
  main_offer: string;
  is_active: boolean;
  starts_at: string | null;       // ISO
  ends_at: string | null;         // ISO
  sort: number;
  created_at?: string;
  updated_at?: string;
}
