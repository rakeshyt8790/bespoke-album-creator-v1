/**
 * Sample fetch functions for the project's Supabase (Lovable Cloud) database.
 *
 * The client is already configured in `@/integrations/supabase/client` and
 * reads VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY from the environment.
 * Copy any of these functions into your own code and adjust the table/columns.
 */

import { supabase } from "@/integrations/supabase/client";
import type { EventType, Inquiry, ServiceItem, SiteSettings } from "@/lib/studio";

/** Fetch the single site_settings row (studio name, contacts, etc.). */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as SiteSettings | null) ?? null;
}

/** Fetch all rows from a table. */
export async function fetchEventTypes(): Promise<EventType[]> {
  const { data, error } = await supabase
    .from("event_types")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EventType[];
}

/** Fetch rows with a filter (only active services). */
export async function fetchServices(): Promise<ServiceItem[]> {
  const { data, error } = await supabase
    .from("services_cameras")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ServiceItem[];
}

/** Fetch rows with ordering (newest inquiries first). */
export async function fetchInquiries(): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from("quote_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Inquiry[];
}

/*
 * Example: using a fetch function inside a React component.
 *
 * import { useEffect, useState } from "react";
 * import { fetchEventTypes } from "@/lib/supabase-examples";
 * import type { EventType } from "@/lib/studio";
 *
 * function EventsList() {
 *   const [events, setEvents] = useState<EventType[]>([]);
 *   const [loading, setLoading] = useState(true);
 *
 *   useEffect(() => {
 *     fetchEventTypes()
 *       .then(setEvents)
 *       .catch(console.error)
 *       .finally(() => setLoading(false));
 *   }, []);
 *
 *   if (loading) return <p>Loading…</p>;
 *   return (
 *     <ul>
 *       {events.map((e) => (
 *         <li key={e.id}>{e.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */
