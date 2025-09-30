export type TransliterationMap = Record<string, { ashkenazi: string; sephardi: string }>;

export const defaultTransliterationMap: TransliterationMap = {
  "ש": { ashkenazi: "sh", sephardi: "s" },
  "ת": { ashkenazi: "s", sephardi: "t" }
};

export function transliterate(
  hebrew: string,
  mode: "ashkenazi" | "sephardi",
  map: TransliterationMap = defaultTransliterationMap
): string {
  return hebrew
    .split("")
    .map((char) => {
      const entry = map[char];
      if (!entry) return char;
      return entry[mode];
    })
    .join("");
}
