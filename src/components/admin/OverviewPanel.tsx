import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MessageCircle } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { inr, useSettings, whatsappLink, type Inquiry } from "@/lib/studio";

type Counts = {
  mediaTotal: number;
  mediaVideos: number;
  heroCount: number;
  eventsActive: number;
  eventsTotal: number;
  servicesActive: number;
  servicesTotal: number;
};

type CountResult = { count: number | null; error: { message: string } | null };

function unwrap({ count, error }: CountResult): number {
  if (error) throw new Error(error.message);
  return count ?? 0;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-border/70 bg-surface p-5">
      <p className="eyebrow">{label}</p>
      <p className="display mt-3 text-3xl text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  New: "text-primary",
  Contacted: "text-foreground",
  Booked: "text-foreground",
};

export function OverviewPanel() {
  const { settings } = useSettings();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["quote_inquiries"],
    queryFn: async (): Promise<Inquiry[]> => {
      const { data, error } = await supabase
        .from("quote_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Inquiry[];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["overview-counts"],
    queryFn: async (): Promise<Counts> => {
      const [m, mv, mh, ev, evt, sv, svt] = await Promise.all([
        supabase.from("portfolio_media").select("*", { count: "exact", head: true }),
        supabase.from("portfolio_media").select("*", { count: "exact", head: true }).eq("media_type", "video"),
        supabase.from("portfolio_media").select("*", { count: "exact", head: true }).eq("is_hero", true),
        supabase.from("event_types").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("event_types").select("*", { count: "exact", head: true }),
        supabase.from("services_cameras").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("services_cameras").select("*", { count: "exact", head: true }),
      ]);
      return {
        mediaTotal: unwrap(m),
        mediaVideos: unwrap(mv),
        heroCount: unwrap(mh),
        eventsActive: unwrap(ev),
        eventsTotal: unwrap(evt),
        servicesActive: unwrap(sv),
        servicesTotal: unwrap(svt),
      };
    },
  });

  const leads = inquiries;
  const booked = leads.filter((l) => l.status === "Booked");
  const open = leads.filter((l) => l.status !== "Booked");
  const bookedValue = booked.reduce((sum, l) => sum + Number(l.total_amount || 0), 0);
  const pipelineValue = open.reduce((sum, l) => sum + Number(l.total_amount || 0), 0);
  const recent = leads.slice(0, 5);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = leads
    .flatMap((lead) =>
      (lead.event_details ?? []).map((ev) => ({ lead, ev, when: new Date(ev.date) })),
    )
    .filter((x) => !Number.isNaN(x.when.getTime()) && x.when >= startOfToday)
    .sort((a, b) => a.when.getTime() - b.when.getTime())
    .slice(0, 6);

  const contactRows: [string, string][] = [
    ["Phone", settings.phone_number],
    ["WhatsApp", settings.whatsapp_number],
    ["Instagram", settings.instagram_url],
    ["Address", settings.studio_address],
  ].filter(([, v]) => !!v) as [string, string][];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total enquiries"
          value={String(leads.length)}
          hint={`${booked.length} booked · ${open.length} open`}
        />
        <StatCard label="Booked value" value={inr(bookedValue)} hint={`${booked.length} confirmed`} />
        <StatCard label="Open pipeline" value={inr(pipelineValue)} hint="Value of leads not yet booked" />
        <StatCard
          label="Gallery"
          value={String(counts?.mediaTotal ?? "—")}
          hint={`${counts?.mediaVideos ?? 0} films · ${counts?.heroCount ?? 0} on homepage`}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="hairline mb-5" />
          <p className="eyebrow">Upcoming dates</p>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No upcoming event dates saved yet — dates appear here once leads share them.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-border/60 border border-border/70">
              {upcoming.map(({ lead, ev, when }, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm text-foreground">
                      {ev.event} — {lead.client_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{ev.venue || "Venue to be decided"}</p>
                  </div>
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    {when.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="hairline mb-5" />
          <p className="eyebrow">Library & pricing</p>
          <div className="mt-4 divide-y divide-border/60 border border-border/70 text-sm">
            <div className="flex items-center justify-between p-4">
              <span className="text-muted-foreground">Events on the calculator</span>
              <span>
                {counts ? `${counts.eventsActive} active / ${counts.eventsTotal}` : "…"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-muted-foreground">Cameras & add-ons</span>
              <span>
                {counts ? `${counts.servicesActive} active / ${counts.servicesTotal}` : "…"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-muted-foreground">Studio phone</span>
              <span>{settings.phone_number || "—"}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-muted-foreground">Studio address</span>
              <span className="text-right">{settings.studio_address || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="hairline mb-5" />
        <p className="eyebrow">Latest enquiries</p>
        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading enquiries…</p>
        ) : recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No enquiries yet — new ones from the quote builder land here and in the Leads tab.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border/60 border border-border/70">
            {recent.map((lead) => (
              <div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm text-foreground">{lead.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.phone} · {new Date(lead.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="display text-xl">{inr(Number(lead.total_amount))}</p>
                  <span className={`text-[11px] uppercase tracking-[0.2em] ${STATUS_TONE[lead.status] ?? ""}`}>
                    {lead.status}
                  </span>
                  <a
                    href={whatsappLink(
                      lead.phone,
                      `Hi ${lead.client_name}, this is ${settings.studio_name}. Thank you for your enquiry — shall we talk?`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp client"
                    className="border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {contactRows.length > 0 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          Contact details shown on the site come from the Branding tab.
        </p>
      ) : null}
    </div>
  );
}
