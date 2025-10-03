import { describe, expect, it } from "vitest";
import { loadContentRegistry } from "@lib/content";

const registry = loadContentRegistry();

describe("core content pack", () => {
  it("exposes top-level buckets", () => {
    expect(registry.manifest.id).toBe("core-v1");
    expect(registry.siddur.metadata).toBeTruthy();
    expect(registry.siddur.metadata?.categories.length ?? 0).toBeGreaterThan(0);
    expect(registry.siddur.metadata?.services.length ?? 0).toBeGreaterThan(0);
    expect(registry.siddur.metadata?.items.length ?? 0).toBeGreaterThan(0);
    expect(Object.keys(registry.tanakh).length).toBeGreaterThan(0);
    expect(Object.keys(registry.commentary).length).toBeGreaterThan(0);
    expect(Object.keys(registry.faq).length).toBeGreaterThanOrEqual(5);
    expect(registry.alefbet.length).toBeGreaterThan(0);
  });

  it("validates siddur metadata shape", () => {
    const metadata = registry.siddur.metadata;
    expect(metadata).toBeTruthy();
    if (!metadata) return;
    metadata.categories.forEach((category) => {
      expect(category.id).toBeTruthy();
      expect(category.title).toBeTruthy();
      expect(category.he).toBeDefined();
      expect(category.en).toBeDefined();
      expect(category.status).toBe("placeholder");
    });
    metadata.items.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.categoryId).toBeTruthy();
      expect(item.serviceId).toBeTruthy();
      expect(item.bucketId).toBeTruthy();
      expect(Array.isArray(item.nusach)).toBe(true);
      expect(item.status).toBe("placeholder");
      expect(item.he).toBeDefined();
      expect(item.en).toBeDefined();
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
