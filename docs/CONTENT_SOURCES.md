# Content sources & licensing

Derech ships with lightweight, public-domain-friendly sample data so that the UI and UX can be exercised offline. As we grow the library we will integrate richer sources while respecting licensing requirements.

## Current seed data

| Data | Source | Notes |
| --- | --- | --- |
| Genesis 1 (Heb/Eng) | JPS 1917 translation (public domain) + standard Masoretic text | Stored in `app/renderer/data/tanakh/genesis-1.json`. |
| Rashi excerpt | Public-domain translation compiled from classic sources | `app/renderer/data/commentary/rashi-gen-1.json`. |
| Siddur selections | Simplified educational text drafted in-house | Replace with fully licensed nusach texts later. |
| FAQ entries | Original educational summaries referencing classic sources | Citations included per entry. |
| Holiday summaries | Original prose with widely known practices | Always double-check with community leaders. |
| Audio/SVG assets | Designer-created placeholders | Swap with recorded audio/stroke guides in production. |

## Adding new sources

1. **Review licensing.** Ensure the text is public domain or that we have permission to distribute offline.
2. **Document provenance.** Update this file and include attribution metadata inside the JSON/TypeScript objects (see the `license` field on commentary entries).
3. **Structure data.** Follow interfaces in `app/renderer/types.ts` so the UI understands the new content.
4. **Update seed loaders.** If the data lives on disk, import it through `app/renderer/data/...`. If it comes from an API, add an adapter inside `app/renderer/lib/adapters`.

## Integrating Sefaria later

* Create an implementation of the `SefariaAdapter` interface in `app/renderer/lib/adapters/sefaria.ts` that fetches verses and commentary.
* Respect Sefaria’s licensing: cache only the content that is permitted for offline use, and store attribution strings alongside the text.
* Consider storing API responses in IndexedDB (Dexie) for offline reuse. The `npm run seed` script is the hook for preloading data on first launch.

## Future expansions

* **Audio** – Recordings for Shema and other prayers should include performer credits and explicit reuse permission.
* **Images** – Replace placeholder SVGs with hand-drawn stroke order illustrations licensed for redistribution.
* **Commentary** – Add Rambam/Ibn Ezra excerpts when public-domain translations are identified.
* **Holiday calendar** – Integrate a robust Hebrew calendar library to compute festival dates accurately instead of using manual stubs.
