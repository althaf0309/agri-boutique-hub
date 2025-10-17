// src/utils/image.ts
import type { Product } from "@/types/index";

/**
 * Get the primary product image URL from a product object.
 * Returns the first available image from various possible sources.
 */
export function getPrimaryProductImage(product?: Product | null): string {
  if (!product) return "";
  
  // Try primary_image or image field
  const direct = (product as any)?.primary_image_url || (product as any)?.image_url || (product as any)?.image;
  if (direct && typeof direct === "string") return direct;
  
  // Try images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const primaryImg = product.images.find(img => img.is_primary);
    if (primaryImg?.image) return primaryImg.image;
    if (product.images[0]?.image) return product.images[0].image;
  }
  
  return "";
}

/**
 * Get all product image URLs from a product object.
 */
export function getProductImages(product?: Product | null): string[] {
  if (!product) return [];
  
  const urls: string[] = [];
  
  // Add primary/main image first
  const primary = getPrimaryProductImage(product);
  if (primary) urls.push(primary);
  
  // Add other images from array
  if (Array.isArray(product.images)) {
    product.images.forEach(img => {
      if (img.image && !urls.includes(img.image)) {
        urls.push(img.image);
      }
    });
  }
  
  return urls;
}
