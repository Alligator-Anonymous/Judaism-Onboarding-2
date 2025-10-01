import { describe, expect, it } from "vitest";
import { createItem, dueItems, gradeItem } from "@lib/spacedRep";

describe("spacedRep", () => {
  it("returns items due today", () => {
    const item = createItem("shalom", "שלום", "peace");
    const due = dueItems([item], new Date());
    expect(due).toHaveLength(1);
  });

  it("reschedules items after a good grade", () => {
    const item = createItem("shalom", "שלום", "peace");
    const graded = gradeItem(item, 5);
    expect(new Date(graded.due).getTime()).toBeGreaterThan(new Date().getTime());
    expect(graded.interval).toBeGreaterThanOrEqual(1);
  });
});
