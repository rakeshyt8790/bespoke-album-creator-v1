import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { inr, useServices } from "@/lib/studio";

const CATS = [
  { value: "camera", label: "Per-event camera / crew" },
  { value: "addon", label: "Deliverable add-on" },
];

export function ServicesPanel() {
  const { data } = useServices(false);
  const rows = data ?? [];
  const qc = useQueryClient();
  const [draft, setDraft] = useState({ name: "", price: "", category: "camera" });

  const refresh = () => qc.invalidateQueries({ queryKey: ["services_cameras"] });

  const add = async () => {
    if (!draft.name.trim()) return;
    const { error } = await supabase.from("services_cameras").insert({
      name: draft.name.trim(),
      unit_price: Number(draft.price) || 0,
      category: draft.category,
      display_order: rows.length + 1,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setDraft({ name: "", price: "", category: "camera" });
    await refresh();
    toast.success("Service added.");
  };

  const patch = async (
    id: string,
    values: Partial<{
      name: string;
      unit_price: number;
      category: string;
      is_active: boolean;
    }>,
  ) => {
    const { error } = await supabase.from("services_cameras").update(values).eq("id", id);
    if (error) toast.error(error.message);
    else await refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("services_cameras").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      await refresh();
      toast.success("Service removed.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <Label className="eyebrow">Service name</Label>
          <Input
            value={draft.name}
            placeholder="FPV Drone"
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <div>
          <Label className="eyebrow">Unit price (INR)</Label>
          <Input
            type="number"
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <div>
          <Label className="eyebrow">Category</Label>
          <Select
            value={draft.category}
            onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}
          >
            <SelectTrigger className="mt-2 rounded-none border-border bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={add} className="w-full rounded-none text-[11px] tracking-[0.2em]">
            <Plus className="mr-2 size-4" /> ADD
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border/60 border border-border/70">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No services yet — the calculator is showing sample rates.
          </p>
        ) : (
          rows.map((s) => (
            <div key={s.id} className="grid gap-4 p-4 md:grid-cols-[2fr_1fr_1.4fr_auto_auto]">
              <Input
                defaultValue={s.name}
                onBlur={(e) => patch(s.id, { name: e.target.value })}
                className="rounded-none border-border bg-transparent"
              />
              <Input
                type="number"
                defaultValue={s.unit_price}
                onBlur={(e) => patch(s.id, { unit_price: Number(e.target.value) })}
                className="rounded-none border-border bg-transparent"
                aria-label={`Price for ${s.name} (currently ${inr(s.unit_price)})`}
              />
              <Select
                defaultValue={s.category === "addon" ? "addon" : "camera"}
                onValueChange={(v) => patch(s.id, { category: v })}
              >
                <SelectTrigger className="rounded-none border-border bg-transparent text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch
                  checked={s.is_active}
                  onCheckedChange={(v) => patch(s.id, { is_active: v })}
                />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <button
                type="button"
                aria-label="Delete"
                onClick={() => remove(s.id)}
                className="self-center text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
