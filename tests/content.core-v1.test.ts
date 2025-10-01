import { describe, expect, it } from "vitest";
import { loadContentRegistry } from "@lib/content";

const registry = loadContentRegistry();

describe("core content pack", () => {
  it("exposes top-level buckets", () => {
    expect(registry.manifest.id).toBe("core-v1");
    expect(Object.keys(registry.siddur).length).toBeGreaterThan(0);
    expect(Object.keys(registry.tanakh).length).toBeGreaterThan(0);
    expect(Object.keys(registry.commentary).length).toBeGreaterThan(0);
    expect(Object.keys(registry.faq).length).toBeGreaterThanOrEqual(5);
    expect(registry.alefbet.length).toBeGreaterThan(0);
  });

  it("validates siddur schema", () => {
    const basic = registry.siddur.basic ?? [];
    basic.forEach((prayer) => {
      expect(prayer.id).toBeTruthy();
      expect(["morning", "afternoon", "evening", "bedtime"]).toContain(prayer.section);
      expect(prayer.hebrew).toBeTruthy();
      expect(prayer.translation).toBeTruthy();
    });
  });

  it("ensures faq ids are unique", () => {
    const ids = Object.values(registry.faq).map((entry) => entry.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("checks alef-bet includes finals", () => {
    const finals = ["ך", "ם", "ן", "ף", "ץ"];
    finals.forEach((letter) => {
      expect(registry.alefbet.some((card) => card.letter === letter)).toBe(true);
    });
  });
});
