# Derech

Derech is a welcoming, offline-friendly desktop study companion for people exploring Judaism. It is built with Electron, React, and TypeScript so that learners can review daily highlights, study sacred texts, and practice Hebrew reading without relying on the internet.

> **Ethical guardrail:** This app is for learning, not for halachic rulings. Practices vary by community; consult your rabbi.

## Getting started

```bash
npm install
npm run dev
```

The development command runs Vite (renderer) and Electron (main) side-by-side. When the Vite server becomes available, Electron opens the desktop window automatically.

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite and Electron in development mode. |
| `npm run build` | Build the renderer bundle and the Electron main/preload files. |
| `npm run test` | Execute unit and component tests via Vitest. |
| `npm run e2e` | Launch a Vite preview server and run a Playwright smoke check. |
| `npm run seed` | Placeholder script for populating IndexedDB on first run. |
| `npm run lint` | Lint TypeScript/React files. |

## Repository layout

```
app/
  electron/        # Electron main & preload processes
  renderer/        # React UI, Zustand stores, data, and utilities
assets/            # Local SVG and audio placeholders
  playwright/        # Playwright smoke runner script
scripts/           # Seed scripts and tooling
tests/             # Vitest unit/component tests
docs/              # Documentation (architecture, accessibility, content)
```

## Seed content & licensing

* Hebrew/English Tanakh snippets use public-domain text (JPS 1917). Commentary excerpts rely on public-domain Rashi notes.
* Siddur samples are simplified learning texts prepared for educational use—confirm nusach and translation with a rabbi for personal practice.
* Audio and SVG files are placeholders so that designers can wire the UI before shipping licensed media.

See [`docs/CONTENT_SOURCES.md`](./CONTENT_SOURCES.md) for details on how to plug in Sefaria or other sources later on.

## Adding new texts or practices

1. Place structured JSON or YAML inside `app/renderer/data` with TypeScript interfaces defined in `app/renderer/types.ts`.
2. Update the appropriate store/component to read the new data.
3. Write tests that cover the new logic (see `tests/`).
4. Update documentation if licensing or UX expectations change.

## Contributing

Pull requests are welcome! Please keep the tone of copy friendly and non-judgmental, and always include the halachic guardrail when adding new surfaces.
