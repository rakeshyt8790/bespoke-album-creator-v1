import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { inr, useSettings, whatsappLink, type Inquiry } from "@/lib/studio";

const STATUSES = ["New", "Contacted", "Booked"];

export function InquiriesPanel() {
  const qc = useQueryClient();
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

  const refresh = () => qc.invalidateQueries({ queryKey: ["quote_inquiries"] });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("quote_inquiries").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else await refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("quote_inquiries").delete().eq("id", id);
    if (error) toast.error(error.message);
    else await refresh();
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading leads…</p>;
  }

  if (inquiries.length === 0) {
    return <p className="text-sm text-muted-foreground">No enquiries yet.</p>;
  }

  return (
    <div className="space-y-5">
      {inquiries.map((lead) => (
        <div key={lead.id} className="border border-border/70 bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="display text-2xl">{lead.client_name}</p>
              <p className="text-sm text-muted-foreground">
                {lead.phone}
                {lead.email ? ` · ${lead.email}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(lead.created_at).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="display text-2xl text-primary">{inr(Number(lead.total_amount))}</p>
              <Select value={lead.status} onValueChange={(v) => setStatus(lead.id, v)}>
                <SelectTrigger className="w-36 rounded-none border-border bg-transparent text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <a
                href={whatsappLink(
                  lead.phone,
                  `Hi ${lead.client_name}, this is ${settings.studio_name}. Thank you for your enquiry — your date looks promising! Shall we talk?`,
                )}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp client"
                className="border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <MessageCircle className="size-4" />
              </a>
              <button
                type="button"
                aria-label="Delete lead"
                onClick={() => remove(lead.id)}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-border/60 pt-4">
            {(lead.event_details ?? []).map((ev, i) => (
              <div key={i} className="text-sm">
                <p className="text-foreground">
                  {ev.event}
                  {ev.date ? ` — ${ev.date}` : ""}
                  {ev.slot ? ` (${ev.slot})` : ""}
                  {ev.venue ? ` @ ${ev.venue}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ev.items?.map((it) => `${it.name} ×${it.qty}`).join(", ") || "—"}
                </p>
              </div>
            ))}
            {lead.notes ? (
              <p className="text-xs text-muted-foreground">Notes: {lead.notes}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
