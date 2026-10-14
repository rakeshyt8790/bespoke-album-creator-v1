import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  SLOTS,
  inr,
  useEventTypes,
  useServices,
  useSettings,
  whatsappLink,
  type QuotedEvent,
} from "@/lib/studio";

type EventRow = {
  key: string;
  eventTypeId: string;
  date: string;
  slot: string;
  venue: string;
  quantities: Record<string, number>;
};

function newRow(eventTypeId: string): EventRow {
  return {
    key: Math.random().toString(36).slice(2),
    eventTypeId,
    date: "",
    slot: "Full Day",
    venue: "",
    quantities: {},
  };
}

function Counter({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-6 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
        className="border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function QuoteBuilder() {
  const { settings } = useSettings();
  const { eventTypes } = useEventTypes();
  const { cameras, addons, services } = useServices();

  const [rows, setRows] = useState<EventRow[]>([]);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  const priceOf = (id: string) => services.find((s) => s.id === id)?.unit_price ?? 0;
  const nameOf = (id: string) => services.find((s) => s.id === id)?.name ?? "";

  const total = useMemo(() => {
    const eventsTotal = rows.reduce(
      (sum, row) =>
        sum +
        Object.entries(row.quantities).reduce((s, [id, qty]) => s + qty * priceOf(id), 0),
      0,
    );
    const addonsTotal = Object.entries(addonQty).reduce(
      (s, [id, qty]) => s + qty * priceOf(id),
      0,
    );
    return eventsTotal + addonsTotal;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, addonQty, services]);

  const addEvent = () => {
    const first = eventTypes[0];
    if (!first) return;
    setRows((r) => [...r, newRow(first.id)]);
  };

  const update = (key: string, patch: Partial<EventRow>) =>
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const buildDetails = (): QuotedEvent[] => {
    const eventDetails: QuotedEvent[] = rows.map((row) => ({
      event: eventTypes.find((e) => e.id === row.eventTypeId)?.name ?? "Event",
      date: row.date,
      slot: row.slot,
      venue: row.venue,
      items: Object.entries(row.quantities)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ name: nameOf(id), qty, price: priceOf(id) })),
    }));
    const chosenAddons = Object.entries(addonQty).filter(([, qty]) => qty > 0);
    if (chosenAddons.length > 0) {
      eventDetails.push({
        event: "Add-ons & Deliverables",
        date: "",
        slot: "",
        venue: "",
        items: chosenAddons.map(([id, qty]) => ({ name: nameOf(id), qty, price: priceOf(id) })),
      });
    }
    return eventDetails;
  };

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please add your name and WhatsApp number.");
      return;
    }
    setSaving(true);
    const details = buildDetails();
    const { error } = await supabase.from("quote_inquiries").insert({
      client_name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
      event_details: details,
      total_amount: total,
      status: "New",
    });
    setSaving(false);

    if (error) {
      toast.error("We couldn't save your enquiry. Please try again.");
      return;
    }

    const lines = details.map(
      (d) =>
        `• ${d.event}${d.date ? ` — ${d.date}` : ""}${d.slot ? ` (${d.slot})` : ""}${
          d.venue ? ` @ ${d.venue}` : ""
        }\n   ${d.items.map((i) => `${i.name} x${i.qty}`).join(", ") || "—"}`,
    );
    const message = `Hi ${settings.studio_name}! I'd like to check availability.\n\nName: ${form.name}\nPhone: ${form.phone}\n\n${lines.join("\n")}\n\nEstimated investment: ${inr(total)}${
      form.notes ? `\n\nNotes: ${form.notes}` : ""
    }`;

    toast.success("Enquiry sent. Opening WhatsApp…");
    window.open(whatsappLink(settings.whatsapp_number, message), "_blank", "noopener");
    setOpen(false);
  };

  return (
    <div className="pb-32">
      {/* Events */}
      <div className="space-y-6">
        {rows.map((row, idx) => (
          <div key={row.key} className="border border-border/70 bg-surface p-5 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">Event {String(idx + 1).padStart(2, "0")}</p>
              <button
                type="button"
                aria-label="Remove event"
                onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="eyebrow">Event type</Label>
                <Select
                  value={row.eventTypeId}
                  onValueChange={(v) => update(row.key, { eventTypeId: v })}
                >
                  <SelectTrigger className="rounded-none border-border bg-transparent">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="eyebrow">Date</Label>
                <Input
                  type="date"
                  value={row.date}
                  onChange={(e) => update(row.key, { date: e.target.value })}
                  className="rounded-none border-border bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label className="eyebrow">Slot</Label>
                <Select value={row.slot} onValueChange={(v) => update(row.key, { slot: v })}>
                  <SelectTrigger className="rounded-none border-border bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SLOTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="eyebrow">Venue</Label>
                <Input
                  value={row.venue}
                  placeholder="Hotel / city"
                  onChange={(e) => update(row.key, { venue: e.target.value })}
                  className="rounded-none border-border bg-transparent"
                />
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <p className="eyebrow">Cameras &amp; crew</p>
              <div className="grid gap-x-10 gap-y-3 md:grid-cols-2">
                {cameras.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-4 border-b border-border/50 pb-3"
                  >
                    <div>
                      <p className="text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{inr(c.unit_price)} / event</p>
                    </div>
                    <Counter
                      value={row.quantities[c.id] ?? 0}
                      onChange={(next) =>
                        update(row.key, {
                          quantities: { ...row.quantities, [c.id]: next },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={addEvent}
        variant="outline"
        className="mt-6 w-full rounded-none border-dashed border-border bg-transparent py-6 text-[11px] tracking-[0.22em] hover:border-primary hover:bg-transparent hover:text-primary"
      >
        <Plus className="mr-2 size-4" /> ADD EVENT
      </Button>

      {/* Add-ons */}
      <div className="mt-14">
        <h2 className="display text-3xl">Add-ons &amp; deliverables</h2>
        <div className="hairline my-6" />
        <div className="grid gap-x-10 gap-y-3 md:grid-cols-2">
          {addons.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-4 border-b border-border/50 pb-3"
            >
              <div>
                <p className="text-sm">{a.name}</p>
                <p className="text-xs text-muted-foreground">{inr(a.unit_price)}</p>
              </div>
              <Counter
                value={addonQty[a.id] ?? 0}
                onChange={(next) => setAddonQty((q) => ({ ...q, [a.id]: next }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sticky summary */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ink/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-10">
          <div>
            <p className="eyebrow">Estimated investment</p>
            <p className="display text-3xl text-primary">{inr(total)}</p>
            <p className="text-xs text-muted-foreground">
              {rows.length} event{rows.length === 1 ? "" : "s"} selected
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            className="rounded-none px-8 text-[11px] tracking-[0.22em]"
          >
            SUBMIT &amp; CHECK AVAILABILITY
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full border-border bg-surface sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="display text-2xl">Check your date</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4 px-4 pb-8">
            <div className="space-y-2">
              <Label className="eyebrow">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-none border-border bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label className="eyebrow">Phone (WhatsApp)</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="rounded-none border-border bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label className="eyebrow">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="rounded-none border-border bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label className="eyebrow">Notes</Label>
              <Textarea
                value={form.notes}
                rows={4}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="rounded-none border-border bg-transparent"
              />
            </div>

            <div className="border border-border/70 p-4">
              <p className="eyebrow">Total</p>
              <p className="display text-2xl text-primary">{inr(total)}</p>
            </div>

            <Button
              onClick={submit}
              disabled={saving}
              size="lg"
              className="w-full rounded-none text-[11px] tracking-[0.22em]"
            >
              {saving ? "SENDING…" : "SUBMIT & CHECK AVAILABILITY"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
