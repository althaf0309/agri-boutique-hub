import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { postMultipart, patchMultipart } from "@/api/client";

export type ID = number | string;

export type Testimonial = {
  id: number;
  name: string;
  location?: string;
  rating: number;
  testimonial: string;
  product?: string;
  avatar?: string | null;
  avatar_url?: string | null;
  verified: boolean;
  is_active: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
};

export type VideoTestimonial = {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  video_file?: string | null;
  video_url?: string | null;
  duration?: string;
  is_active: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
};

export type Award = {
  id: number;
  title: string;
  organization?: string;
  year?: string;
  description?: string;
  category:
    | "Industry Recognition"
    | "Sustainability"
    | "Social Impact"
    | "Customer Excellence"
    | "Innovation"
    | "Quality";
  emblem?: string | null;
  emblem_url?: string | null;
  is_active: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
};

export type Certification = {
  id: number;
  name: string;
  authority?: string;
  valid_until?: string;
  description?: string;
  is_active: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
};

export type GalleryItem = {
  id: number;
  category:
    | "Farming & Agriculture"
    | "Events & Workshops"
    | "Certifications"
    | "Community Impact";
  image?: string | null;
  image_url?: string | null;
  title: string;
  location?: string;
  date_label?: string;
  description?: string;
  attendees?: string;
  is_active: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };
const toArray = <T,>(d: any): T[] => (Array.isArray(d) ? d : d?.results ?? []);

// ---------- Testimonials ----------
export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Testimonial> | Testimonial[]>("/testimonials/");
      return toArray<Testimonial>(data);
    },
  });
}
export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Testimonial> & { avatar?: File | null }) => {
      // multipart only if file present
      const hasFile = payload.avatar != null && typeof payload.avatar === 'object' && payload.avatar && 'name' in payload.avatar;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]: any) => {
          if (k === "avatar" && v instanceof File) fd.append("avatar", v);
          else if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        const { data } = await postMultipart<Testimonial>("/testimonials/", fd);
        return data;
      }
      const { data } = await api.post<Testimonial>("/testimonials/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}
export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: ID } & (Partial<Testimonial> & { avatar?: File | null })) => {
      const hasFile = payload.avatar != null && typeof payload.avatar === 'object' && payload.avatar && 'name' in payload.avatar;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]: any) => {
          if (k === "avatar" && v instanceof File) fd.append("avatar", v);
          else if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        const { data } = await patchMultipart<Testimonial>(`/testimonials/${id}/`, fd);
        return data;
      }
      const { data } = await api.patch<Testimonial>(`/testimonials/${id}/`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}
export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      await api.delete(`/testimonials/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
}

// ---------- Video Testimonials ----------
export function useVideoTestimonials() {
  return useQuery({
    queryKey: ["video-testimonials"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<VideoTestimonial> | VideoTestimonial[]>("/video-testimonials/");
      return toArray<VideoTestimonial>(data);
    },
  });
}
export function useCreateVideoTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<VideoTestimonial> & { thumbnail?: File | null; video_file?: File | null }) => {
      const hasThumbnail = payload.thumbnail != null && typeof payload.thumbnail === 'object' && payload.thumbnail && 'name' in payload.thumbnail;
      const hasVideo = payload.video_file != null && typeof payload.video_file === 'object' && payload.video_file && 'name' in payload.video_file;
      if (hasThumbnail || hasVideo) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]: any) => {
          if ((k === "thumbnail" || k === "video_file") && v instanceof File) fd.append(k, v);
          else if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        const { data } = await postMultipart<VideoTestimonial>("/video-testimonials/", fd);
        return data;
      }
      const { data } = await api.post<VideoTestimonial>("/video-testimonials/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["video-testimonials"] }),
  });
}
export function useUpdateVideoTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: ID } & (Partial<VideoTestimonial> & { thumbnail?: File | null; video_file?: File | null })) => {
      const hasThumbnail = payload.thumbnail != null && typeof payload.thumbnail === 'object' && payload.thumbnail && 'name' in payload.thumbnail;
      const hasVideo = payload.video_file != null && typeof payload.video_file === 'object' && payload.video_file && 'name' in payload.video_file;
      if (hasThumbnail || hasVideo) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]: any) => {
          if ((k === "thumbnail" || k === "video_file") && v instanceof File) fd.append(k, v);
          else if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        const { data } = await patchMultipart<VideoTestimonial>(`/video-testimonials/${id}/`, fd);
        return data;
      }
      const { data } = await api.patch<VideoTestimonial>(`/video-testimonials/${id}/`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["video-testimonials"] }),
  });
}
export function useDeleteVideoTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      await api.delete(`/video-testimonials/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["video-testimonials"] }),
  });
}

// ---------- Awards ----------
export function useAwards() {
  return useQuery({
    queryKey: ["awards"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Award> | Award[]>("/awards/");
      return toArray<Award>(data);
    },
  });
}
export function useCreateAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Award> & { emblem?: File | null }) => {
      const hasFile = payload.emblem != null && typeof payload.emblem === 'object' && payload.emblem && 'name' in payload.emblem;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]: any) => {
          if (k === "emblem" && v instanceof File) fd.append("emblem", v);
          else if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        const { data } = await postMultipart<Award>("/awards/", fd);
        return data;
      }
      const { data } = await api.post<Award>("/awards/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["awards"] }),
  });
}
export function useUpdateAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: ID } & (Partial<Award> & { emblem?: File | null })) => {
      const hasFile = payload.emblem != null && typeof payload.emblem === 'object' && payload.emblem && 'name' in payload.emblem;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]: any) => {
          if (k === "emblem" && v instanceof File) fd.append("emblem", v);
          else if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        const { data } = await patchMultipart<Award>(`/awards/${id}/`, fd);
        return data;
      }
      const { data } = await api.patch<Award>(`/awards/${id}/`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["awards"] }),
  });
}
export function useDeleteAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      await api.delete(`/awards/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["awards"] }),
  });
}

// ---------- Certifications ----------
export function useCertifications() {
  return useQuery({
    queryKey: ["certifications"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Certification> | Certification[]>("/certifications/");
      return toArray<Certification>(data);
    },
  });
}
export function useCreateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Certification>) => {
      const { data } = await api.post<Certification>("/certifications/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certifications"] }),
  });
}
export function useUpdateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: ID } & Partial<Certification>) => {
      const { data } = await api.patch<Certification>(`/certifications/${id}/`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certifications"] }),
  });
}
export function useDeleteCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      await api.delete(`/certifications/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certifications"] }),
  });
}

// ---------- Gallery ----------
export function useGalleryItems(category?: GalleryItem["category"]) {
  return useQuery({
    queryKey: ["gallery", category],
    queryFn: async () => {
      const { data } = await api.get<Paginated<GalleryItem> | GalleryItem[]>("/gallery/", {
        params: category ? { category } : undefined,
      });
      return toArray<GalleryItem>(data);
    },
  });
}
export function useCreateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<GalleryItem> & { image?: File | null }) => {
      const hasFile = payload.image != null && typeof payload.image === 'object' && payload.image && 'name' in payload.image;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]: any) => {
          if (k === "image" && v instanceof File) fd.append("image", v);
          else if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        const { data } = await postMultipart<GalleryItem>("/gallery/", fd);
        return data;
      }
      const { data } = await api.post<GalleryItem>("/gallery/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}
export function useUpdateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: ID } & (Partial<GalleryItem> & { image?: File | null })) => {
      const hasFile = payload.image != null && typeof payload.image === 'object' && payload.image && 'name' in payload.image;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]: any) => {
          if (k === "image" && v instanceof File) fd.append("image", v);
          else if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        const { data } = await patchMultipart<GalleryItem>(`/gallery/${id}/`, fd);
        return data;
      }
      const { data } = await api.patch<GalleryItem>(`/gallery/${id}/`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}
export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      await api.delete(`/gallery/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}
