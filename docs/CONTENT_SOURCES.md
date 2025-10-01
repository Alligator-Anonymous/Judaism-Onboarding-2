# Content sources & licensing

Derech ships with lightweight, public-domain-friendly sample data so that the UI and UX can be exercised offline. As we grow the library we will integrate richer sources while respecting licensing requirements.

## Core Pack (`core-v1`)

All core content now resides under `app/renderer/data/packs/core-v1`. The manifest `pack.json` tracks version, licensing, and file membership so future packs can live alongside it.

| File | Source & License | Notes |
| --- | --- | --- |
| `siddur/basic.json` | Hebrew: traditional nusach (public domain). English summaries: © Derech team (CC BY-SA 4.0). | Includes Modeh Ani, Netilat Yadayim, Birkot HaShachar highlights, Shema, Amidah structure, and Bedtime Shema notes. |
| `tanakh/genesis-1.json` | Masoretic Hebrew (public domain) + JPS 1917 translation (public domain). | Verses 1:1–1:5 with word-level metadata and commentary refs. |
| `commentary/rashi-gen-1.json` | Rashi on Genesis (public domain). | Short educational summaries linking to verses above. |
| `holidays/shabbat.json` | Original prose © Derech team (CC BY-SA 4.0). | Includes guardrail reminder to consult a rabbi. |
| `holidays/rosh-chodesh.json` | Original prose © Derech team (CC BY-SA 4.0). | Highlights monthly renewal themes. |
| `faq/*.json` | Original responses © Derech team (CC BY-SA 4.0) with classic sources cited. | Ten entries covering core beginner questions. |
| `alefbet/letters.json` | Educational notes © Derech team (CC BY-SA 4.0). | 22 letters plus 5 finals with pronunciation tips. |

Legacy placeholder assets (SVG strokes, audio demos) remain under `assets/` until we produce licensed replacements.

## Adding new sources

1. **Review licensing.** Ensure the text is public domain or that we have permission to distribute offline.
2. **Copy template.** Add a JSON file inside an existing pack (or create a new pack folder + manifest) with fields that match interfaces in `app/renderer/types.ts`.
3. **Document provenance.** Include `license` and `source` metadata inside each JSON file and add a row to the table above.
4. **Register file.** Update the pack’s `files` list if you create a new category/file so the loader can track it.
5. **Run tests.** `npm test` ensures the schema validator in `tests/content.core-v1.test.ts` still passes.

## Integrating Sefaria later

* Create an implementation of the `SefariaAdapter` interface in `app/renderer/lib/adapters/sefaria.ts` that fetches verses and commentary.
* Respect Sefaria’s licensing: cache only the content that is permitted for offline use, and store attribution strings alongside the text.
* Consider storing API responses in IndexedDB (Dexie) for offline reuse. The `npm run seed` script is the hook for preloading data on first launch.

## Future expansions

* **Audio** – Recordings for Shema and other prayers should include performer credits and explicit reuse permission.
* **Images** – Replace placeholder SVGs with hand-drawn stroke order illustrations licensed for redistribution.
* **Commentary** – Add Rambam/Ibn Ezra excerpts when public-domain translations are identified.
* **Holiday calendar** – Integrate a robust Hebrew calendar library to compute festival dates accurately instead of using manual stubs.
