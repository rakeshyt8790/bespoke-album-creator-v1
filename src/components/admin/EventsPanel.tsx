import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useEventTypes } from "@/lib/studio";

export function EventsPanel() {
  const { data } = useEventTypes(false);
  const rows = data ?? [];
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const refresh = () => qc.invalidateQueries({ queryKey: ["event_types"] });

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase
      .from("event_types")
      .insert({ name: name.trim(), display_order: rows.length + 1 });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    await refresh();
    toast.success("Event added.");
  };

  const patch = async (
    id: string,
    values: Partial<{ name: string; is_active: boolean; display_order: number }>,
  ) => {
    const { error } = await supabase.from("event_types").update(values).eq("id", id);
    if (error) toast.error(error.message);
    else await refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("event_types").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      await refresh();
      toast.success("Event removed.");
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-64 flex-1">
          <Label className="eyebrow">New event name</Label>
          <Input
            value={name}
            placeholder="Cocktail Night"
            onChange={(e) => setName(e.target.value)}
            className="mt-2 rounded-none border-border bg-transparent"
          />
        </div>
        <Button onClick={add} className="rounded-none text-[11px] tracking-[0.2em]">
          <Plus className="mr-2 size-4" /> ADD EVENT
        </Button>
      </div>

      <div className="divide-y divide-border/60 border border-border/70">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No events yet — the calculator is showing sample events.
          </p>
        ) : (
          rows.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center gap-4 p-4">
              <Input
                defaultValue={e.name}
                onBlur={(ev) => patch(e.id, { name: ev.target.value })}
                className="min-w-48 flex-1 rounded-none border-border bg-transparent"
              />
              <Input
                type="number"
                defaultValue={e.display_order}
                onBlur={(ev) => patch(e.id, { display_order: Number(ev.target.value) })}
                className="w-20 rounded-none border-border bg-transparent"
                aria-label="Order"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={e.is_active}
                  onCheckedChange={(v) => patch(e.id, { is_active: v })}
                />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <button
                type="button"
                aria-label="Delete"
                onClick={() => remove(e.id)}
                className="text-muted-foreground transition-colors hover:text-destructive"
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
