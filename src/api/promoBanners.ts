// src/api/promoBanners.ts
import api, { postMultipart, patchMultipart } from "@/api/client";
import type { PromoBanner } from "@/types/promoBanner";

type CreateUpdate =
  Partial<Omit<PromoBanner,
    "id" | "created_at" | "updated_at" | "image"
  >> & {
    // server accepts either uploaded file or remote URL
    image_file?: File | undefined | null;
    image_url?: string | null;
  };

const prune = (o: Record<string, any>) =>
  Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== undefined));

export async function fetchPromoBanners(): Promise<PromoBanner[]> {
  const { data } = await api.get<PromoBanner[] | { results: PromoBanner[] }>("/promo-banners/");
  return Array.isArray(data) ? data : data?.results ?? [];
}

export async function deletePromoBanner(id: number) {
  await api.delete(`/promo-banners/${id}/`);
  return true;
}

export async function createPromoBanner(payload: CreateUpdate): Promise<PromoBanner> {
  // If an image file is present, send multipart; else JSON.
  if (payload.image_file instanceof File) {
    const fd = new FormData();
    Object.entries(prune(payload)).forEach(([k, v]) => {
      if (k === "image_file" && v instanceof File) fd.append("image", v); // backend usually expects "image"
      else if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    const { data } = await postMultipart<PromoBanner>("/promo-banners/", fd);
    return data;
  }
  const body = prune(payload);
  const { data } = await api.post<PromoBanner>("/promo-banners/", body);
  return data;
}

export async function updatePromoBanner(id: number, payload: CreateUpdate): Promise<PromoBanner> {
  if (payload.image_file instanceof File) {
    const fd = new FormData();
    Object.entries(prune(payload)).forEach(([k, v]) => {
      if (k === "image_file" && v instanceof File) fd.append("image", v);
      else if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    const { data } = await patchMultipart<PromoBanner>(`/promo-banners/${id}/`, fd);
    return data;
  }
  const body = prune(payload);
  const { data } = await api.patch<PromoBanner>(`/promo-banners/${id}/`, body);
  return data;
}
