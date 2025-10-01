# Derech – Jewish learning companion

Derech is an Electron + React desktop app that offers a gentle, offline-first way to explore Judaism. The MVP includes a Today dashboard with zmanim, a Tanakh + Siddur reader, and a Practice lab for Hebrew and FAQs.

* Friendly, non-judgmental copy for beginners and conversion candidates
* Seed data for Genesis 1, daily siddur essentials, and a 15-question FAQ
* Ethical guardrail: **This app is for learning, not for halachic rulings. Practices vary by community; consult your rabbi.**

## Quick start

```bash
npm install
npm run dev
```

Core learning content now lives in `app/renderer/data/packs/core-v1`; add or extend JSON files there to grow the curriculum without touching code.

See [`docs/README.md`](docs/README.md) for full instructions, architecture notes, accessibility commitments, and content licensing details.

Windows Setup Notes

“npm is not recognized” → Install Node.js LTS, then open a new terminal. Verify: node -v and npm -v.

PowerShell blocks npm.ps1 → Use Command Prompt, or in PowerShell run:

Temporary: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Per-user: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

Reinstall after pulling fixes:

Delete node_modules and package-lock.json

npm install

npm run dev
