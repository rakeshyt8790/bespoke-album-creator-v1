import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";


export type SiteSettings = {
  id: string;
  studio_name: string;
  tagline: string;
  bio: string | null;
  logo_url: string | null;
  whatsapp_number: string | null;
  phone_number: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  studio_address: string | null;
};

export type PortfolioMedia = {
  id: string;
  title: string;
  category: string;
  media_url: string;
  media_type: string;
  is_hero: boolean;
  display_order: number;
  created_at: string;
  storage_path?: string;
};

export type EventType = {
  id: string;
  name: string;
  is_active: boolean;
  display_order: number;
};

export type ServiceItem = {
  id: string;
  name: string;
  category: string;
  unit_price: number;
  is_active: boolean;
  display_order: number;
};

export type Inquiry = {
  id: string;
  client_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  event_details: QuotedEvent[];
  total_amount: number;
  status: string;
  created_at: string;
};

export type QuotedEvent = {
  event: string;
  date: string;
  slot: string;
  venue: string;
  items: { name: string; qty: number; price: number }[];
};

export const CATEGORIES = ["Weddings", "Pre-Weddings", "Films"] as const;
export const SLOTS = ["Morning", "Evening", "Full Day"] as const;

export const FALLBACK_SETTINGS: SiteSettings = {
  id: "fallback",
  studio_name: "Parinaya Wedding Films",
  tagline: "Wedding stories told with quiet elegance",
  bio: "We are a boutique wedding studio documenting Indian weddings with an editorial, unhurried eye. Every frame is crafted to feel like a memory, not a pose.",
  logo_url: null,
  whatsapp_number: "919000000000",
  phone_number: "+91 90000 00000",
  instagram_url: "https://instagram.com",
  youtube_url: "https://youtube.com",
  studio_address: "Jubilee Hills, Hyderabad, India",
};

export const FALLBACK_MEDIA: PortfolioMedia[] = [];

export const FALLBACK_EVENTS: EventType[] = [
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Muhurtham / Wedding",
  "Reception",
  "Engagement",
].map((name, i) => ({ id: `fe-${i}`, name, is_active: true, display_order: i }));

export const FALLBACK_SERVICES: ServiceItem[] = [
  ["Candid Photographer", "camera", 25000],
  ["Traditional Photographer", "camera", 15000],
  ["Cinematic Video", "camera", 30000],
  ["Traditional Video", "camera", 15000],
  ["Drone", "camera", 20000],
  ["Crane / Jib", "camera", 18000],
  ["Luxury Handcrafted Album", "addon", 35000],
  ["Raw Footage SSD/HDD", "addon", 8000],
  ["Pre-Wedding Session", "addon", 60000],
].map(([name, category, unit_price], i) => ({
  id: `fs-${i}`,
  name: name as string,
  category: category as string,
  unit_price: unit_price as number,
  is_active: true,
  display_order: i,
}));

export function inr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function isExternalUrl(value: string): boolean {
  return /^(https?:|data:|blob:|\/)/.test(value);
}

export function youtubeEmbed(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function whatsappLink(number: string | null | undefined, text: string): string {
  const digits = (number ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/* ---------------- data hooks (public, read-only) ---------------- */

export function useSettings() {
  const query = useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings | null> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as SiteSettings | null) ?? null;
    },
    staleTime: 30_000,
  });
  return { ...query, settings: query.data ?? FALLBACK_SETTINGS };
}

export function useMedia() {
  const query = useQuery({
    queryKey: ["portfolio_media"],
    queryFn: async (): Promise<PortfolioMedia[]> => {
      const { data, error } = await supabase
        .from("portfolio_media")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as PortfolioMedia[];
      // Sign all stored paths in one request so photos load fast.
      const paths = rows.map((r) => r.media_url).filter((u) => u && !isExternalUrl(u));
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage
          .from("portfolio")
          .createSignedUrls(paths, 60 * 60 * 24 * 7);
        const map = new Map((signed ?? []).map((x) => [x.path, x.signedUrl]));
        return rows.map((r) => ({ ...r, storage_path: r.media_url, media_url: map.get(r.media_url) || r.media_url }));
      }
      return rows;
    },
    staleTime: 1000 * 60 * 30,
  });
  const list = query.data ?? [];
  return { ...query, media: list };
}

export function useEventTypes(onlyActive = true) {
  const query = useQuery({
    queryKey: ["event_types"],
    queryFn: async (): Promise<EventType[]> => {
      const { data, error } = await supabase
        .from("event_types")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EventType[];
    },
    staleTime: 30_000,
  });
  const raw = query.data && query.data.length > 0 ? query.data : FALLBACK_EVENTS;
  return { ...query, eventTypes: onlyActive ? raw.filter((e) => e.is_active) : raw };
}

export function useServices(onlyActive = true) {
  const query = useQuery({
    queryKey: ["services_cameras"],
    queryFn: async (): Promise<ServiceItem[]> => {
      const { data, error } = await supabase
        .from("services_cameras")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ServiceItem[];
    },
    staleTime: 30_000,
  });
  const raw = query.data && query.data.length > 0 ? query.data : FALLBACK_SERVICES;
  const list = onlyActive ? raw.filter((s) => s.is_active) : raw;
  return {
    ...query,
    services: list,
    cameras: list.filter((s) => s.category !== "addon"),
    addons: list.filter((s) => s.category === "addon"),
  };
}

/** Resolves a stored media reference (storage path or full URL) to a usable src. */
export function useMediaSrc(reference: string | null | undefined) {
  const { data } = useQuery({
    queryKey: ["media-src", reference],
    enabled: !!reference && !isExternalUrl(reference),
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("portfolio")
        .createSignedUrl(reference as string, 60 * 60 * 24 * 7);
      if (error) throw error;
      return data?.signedUrl ?? "";
    },
  });
  if (!reference) return "";
  if (isExternalUrl(reference)) return reference;
  return data ?? "";
}
