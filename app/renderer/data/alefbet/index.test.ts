import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import { letterCards } from "./index";

const toFilePath = (urlString: string) => {
  const url = new URL(urlString);
  return fileURLToPath(url);
};

describe("letterCards", () => {
  it("resolves SVG assets on disk", () => {
    for (const card of letterCards) {
      const svgPath = toFilePath(card.svg);
      expect(fs.existsSync(svgPath)).toBe(true);
    }
  });
});