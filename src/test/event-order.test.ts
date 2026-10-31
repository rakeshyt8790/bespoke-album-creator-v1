import { describe, expect, it } from "vitest";
import { nextEventOrder, reorderEvents } from "@/lib/event-order";

const rows = ["Haldi", "Mehendi", "Reception"].map((name, index) => ({
  id: name, name, is_active: true, display_order: index * 10,
}));

describe("Event placement", () => {
  it("saves the dragged upward placement as website display order", () => {
    const result = reorderEvents(rows, "Reception", "Haldi");
    expect(result.map((row) => [row.name, row.display_order])).toEqual([
      ["Reception", 0], ["Haldi", 1], ["Mehendi", 2],
    ]);
  });
  it("saves the dragged downward placement as website display order", () => {
    const result = reorderEvents(rows, "Haldi", "Reception");
    expect(result.map((row) => [row.name, row.display_order])).toEqual([
      ["Mehendi", 0], ["Reception", 1], ["Haldi", 2],
    ]);
  });
  it("adds a new event after existing placements even with order gaps", () => {
    expect(nextEventOrder(rows)).toBe(21);
  });
});