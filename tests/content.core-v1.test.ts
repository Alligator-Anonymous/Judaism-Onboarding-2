import { describe, expect, it } from "vitest";
import { loadContentRegistry } from "@lib/content";

const registry = loadContentRegistry();

describe("core content pack", () => {
  it("exposes top-level buckets", () => {
    expect(registry.manifest.id).toBe("core-v1");
    expect(registry.siddur.manifest).toBeTruthy();
    expect(Object.keys(registry.siddur.entries).length).toBeGreaterThan(0);
    expect(Object.keys(registry.tanakh).length).toBeGreaterThan(0);
    expect(Object.keys(registry.commentary).length).toBeGreaterThan(0);
    expect(Object.keys(registry.faq).length).toBeGreaterThanOrEqual(5);
    expect(registry.alefbet.length).toBeGreaterThan(0);
  });

  it("validates siddur schema", () => {
    const entries = Object.values(registry.siddur.entries);
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(entry.id).toBeTruthy();
      expect(entry.title).toBeTruthy();
      expect(Array.isArray(entry.variants)).toBe(true);
      expect(entry.variants.length).toBeGreaterThan(0);
      entry.variants.forEach((variant) => {
        expect(variant.id).toBeTruthy();
        expect(variant.label).toBeTruthy();
        expect(variant.body.length).toBeGreaterThan(0);
      });
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
