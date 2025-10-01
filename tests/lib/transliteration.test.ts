import { describe, expect, it } from "vitest";
import { transliterate } from "@lib/transliteration";

describe("transliteration", () => {
  it("switches between Ashkenazi and Sephardi mappings", () => {
    const word = "שבת";
    expect(transliterate(word, "ashkenazi")).toContain("sh");
    expect(transliterate(word, "sephardi")).toContain("s");
  });
});
