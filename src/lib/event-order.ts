import type { EventType } from "./studio";

export function reorderEvents(rows: EventType[], activeId: string, overId: string): EventType[] {
  const from = rows.findIndex((row) => row.id === activeId);
  const to = rows.findIndex((row) => row.id === overId);
  if (from < 0 || to < 0 || from === to) return rows;
  const ordered = [...rows];
  const [moved] = ordered.splice(from, 1);
  if (!moved) return rows;
  ordered.splice(to, 0, moved);
  return ordered.map((row, index) => ({ ...row, display_order: index }));
}

export function nextEventOrder(rows: EventType[]): number {
  return Math.max(-1, ...rows.map((row) => row.display_order)) + 1;
}