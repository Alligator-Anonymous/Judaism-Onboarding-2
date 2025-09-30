# Accessibility checklist

Derech is designed to be welcoming for beginners with varied abilities. This document tracks current practices and TODO items.

## Language & directionality

* Hebrew passages are wrapped with `dir="rtl"` and use a dedicated `font-hebrew` stack so glyphs render clearly.
* English copy keeps a friendly, non-judgmental tone.
* Transliteration toggles between Ashkenazi and Sephardi pronunciations.

## Typography

* Global toggles enable large-text mode and a dyslexia-friendly font stack.
* Tailwind focus styles ensure buttons, tabs, and toggles are keyboard-visible.

## Keyboard navigation

* The app includes a skip-to-content link.
* All interactive elements (tabs, word buttons, toggles) can be reached via keyboard.
* Word popups in the Tanakh reader use buttons to remain accessible.

## Color & contrast

* The palette centers around slate neutrals with a pomegranate accent that meets contrast guidelines.
* Dark mode is available to reduce glare; background and text colors were chosen to maintain legibility.

## Screen readers

* Semantic HTML elements (`header`, `section`, `article`, `table`) provide structure.
* Commentary and word insight panels include `aria-live` or descriptive labels for dynamic content.

## Audio & media

* The Shema audio file is a placeholder. Future recordings should include transcripts and descriptions.

## RTL & future work

* Calendar cells include both Gregorian and Hebrew dates. We plan to add ARIA labels that read both values clearly.
* The Trope Coach is a stub; ensure it supports captioned audio when implemented.
* Continue testing with NVDA/VoiceOver once the app has more content.
