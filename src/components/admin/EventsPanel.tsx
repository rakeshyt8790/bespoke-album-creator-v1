import { useQueryClient } from "@tanstack/react-query";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useEventTypes, type EventType } from "@/lib/studio";
import { nextEventOrder, reorderEvents } from "@/lib/event-order";

function SortableEvent({ event, busy, patch, remove }: {
  event: EventType;
  busy: boolean;
  patch: (id: string, values: Partial<EventType>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: event.id, disabled: busy });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex flex-wrap items-center gap-4 bg-background p-4 ${isDragging ? "z-10 shadow-lift opacity-80" : ""}`}>
      <Button type="button" variant="ghost" size="icon" disabled={busy}
        {...attributes} {...listeners} aria-label={`Move ${event.name}`} title={`Move ${event.name}`}
        className="touch-none shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing">
        <GripVertical className="size-5" />
      </Button>
      <Input defaultValue={event.name} disabled={busy}
        onBlur={(ev) => patch(event.id, { name: ev.target.value })}
        className="min-w-0 flex-1 basis-40 rounded-none border-border bg-transparent" />
      <div className="flex items-center gap-2">
        <Switch checked={event.is_active} disabled={busy} aria-label={`${event.name} active`}
          onCheckedChange={(value) => patch(event.id, { is_active: value })} />
        <span className="text-xs text-muted-foreground">Active</span>
      </div>
      <Button type="button" variant="ghost" size="icon" disabled={busy} aria-label={`Delete ${event.name}`}
        title={`Delete ${event.name}`} onClick={() => remove(event.id)}
        className="text-muted-foreground hover:text-destructive">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function EventsPanel() {
  const { data } = useEventTypes(false);
  const rows = data ?? [];
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const refresh = () => qc.invalidateQueries({ queryKey: ["event_types"] });

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase
      .from("event_types")
      .insert({ name: name.trim(), display_order: nextEventOrder(rows) });
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

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (busy || !over || active.id === over.id) return;
    const ordered = reorderEvents(rows, String(active.id), String(over.id));
    if (ordered === rows) return;
    setBusy(true);
    qc.setQueryData(["event_types"], ordered);
    try {
      const results = await Promise.all(ordered.map((event) =>
        supabase.from("event_types").update({ display_order: event.display_order }).eq("id", event.id),
      ));
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      toast.success("Event order saved.");
    } catch {
      toast.error("Couldn't save event order. Please try again.");
    } finally {
      await refresh();
      setBusy(false);
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
        <Button onClick={add} disabled={busy} className="rounded-none text-[11px] tracking-[0.2em]">
          <Plus className="mr-2 size-4" /> ADD EVENT
        </Button>
      </div>

      <div className="divide-y divide-border/60 border border-border/70">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No events yet — the calculator is showing sample events.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={rows.map((event) => event.id)} strategy={verticalListSortingStrategy}>
              {rows.map((event) => (
                <SortableEvent key={event.id} event={event} busy={busy} patch={patch} remove={remove} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
