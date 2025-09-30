# Architecture

Derech uses a lightweight Electron shell to host a React + Vite renderer. State lives in small, focused Zustand stores, and data is stored as JSON that can later be synced into IndexedDB.

## High-level modules

| Module | Responsibility |
| --- | --- |
| `app/electron` | Electron main & preload processes. Preload exposes a narrow IPC bridge for app metadata. |
| `app/renderer/App.tsx` | Root React component with tab-based navigation for Today, Texts, and Practice. |
| `app/renderer/stores` | Zustand stores for settings, calendar data, and learning progress. |
| `app/renderer/lib` | Pure utilities: Hebrew calendar math, zmanim calculations, transliteration, spaced repetition, text indexing, and future Sefaria adapters. |
| `app/renderer/data` | Seed JSON + TypeScript shims for Tanakh, Siddur, commentary, FAQ, holidays, and Alef-Bet assets. |
| `app/renderer/components` | UI building blocks grouped by feature (Today, TanakhReader, Siddur, Practice, shared UI). |
| `assets/` | Local SVG/MP3 placeholders so the app works offline. |
| `tests/` | Vitest unit/component tests. |
| `playwright/` | Playwright runner (`run-e2e.ts`) that performs the Today screen smoke check. |

## Data flow

1. On startup, `App.tsx` reads from the settings store to configure dark mode, typography preferences, and transliteration mode.
2. `Today.tsx` calls `useCalendar.refresh()` which uses the Hebrew calendar and zmanim utilities along with holiday data to compute the daily snapshot.
3. `TanakhReader` loads the Genesis 1 sample and commentary, allowing users to toggle transliteration, explore word roots, and read Rashi excerpts. Future adapters (e.g., Sefaria) will plug into the same interface defined in `types.ts`.
4. The Siddur view filters the shared prayer data by section and applies transliteration choices from settings.
5. Practice tools draw from Alef-Bet data and the spaced repetition store to provide immediate feedback. The FAQ list reads from static JSON.
6. IndexedDB integration will be added later via Dexie. The seed script currently logs its intent; the structure makes it easy to populate local storage when ready.

## Extension points

* **Sefaria adapter (`app/renderer/lib/adapters/sefaria.ts`)** – define the interface for fetching texts/commentaries. The UI already expects `Verse` and `Commentary` objects, so the adapter should hydrate those shapes.
* **Trope Coach (`Practice/TropeCoach.tsx`)** – reserved for a future interactive chanting trainer with audio.
* **Minhag profile (settings)** – `useSettings` includes a placeholder field so future releases can customize nusach/zmanim offsets.
* **Holiday engine** – the current implementation uses seed data; hooking in a full Hebrew calendar library will allow precise festival detection.

## Theming & accessibility

Tailwind provides utility classes for layout, dark mode, and focus states. Hebrew text uses a dedicated font stack and `dir="rtl"` attributes to ensure right-to-left rendering. Dyslexia-friendly and large-text toggles update the global typography at runtime.

## Desktop shell

`electron/main.ts` launches a browser window and loads the Vite dev server in development or the compiled `dist` output in production. The preload script exports a tiny API surface (`getVersion`) to avoid exposing Node APIs directly to the renderer.
