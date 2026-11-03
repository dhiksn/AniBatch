# AniBatch Hallmark Darkroom Restyle — Handoff Note

## Font Slot
- `--font-display` is reserved for **Momo Trust Display** (commercial/paid font)
- Free stand-in used: **Sofia Sans Extra Condensed** (Google Fonts, weight 700/900)
  - Same condensed-caps dramatic voice, close substitute
  - Loaded via: `https://fonts.googleapis.com/css2?family=Sofia+Sans+Extra+Condensed:wght@700;900&display=swap`
- To activate Momo Trust Display: replace `"Sofia Sans Extra Condensed"` in `tokens.css` `--font-display` and `globals.css` `@theme static --font-display`, and replace the Google Fonts `<link>` in `layout.tsx` with your Momo Trust Display `@font-face` or CDN import

## Theme Applied
- Hallmark v2.0.0 · Darkroom · atmospheric · colourway: orange
- Accent colour: `oklch(68% 0.19 48)` (orange safelight — hue shifted from amber 45° to orange 48°)
- Ground: `oklch(12% 0.014 40)` warm print-black
- Radius: zero (all `rounded-*` → `rounded-none`)
- Type: uppercase condensed display headings via `--font-display`

## What Changed
- `tokens.css`: full Darkroom token replacement, orange accent, zero radius, Sofia Sans Extra Condensed display font
- `base.css`: uppercase + condensed h1/h2/h3, zero line-height tightening, Darkroom motion/focus rules
- `globals.css`: updated `@theme static` block to match new tokens, added `.font-display` and `.font-serif` overrides in utilities
- `layout.tsx`: swapped Fontshare Boska → Google Fonts Sofia Sans Extra Condensed
- `AnimeCard.tsx`: zero radius, accent-outline hover
- `Navbar.tsx`: zero radius throughout, `font-display` on brand wordmark
- `Sidebar.tsx`: zero radius, `font-display` on widget headings
- `Skeletons.tsx`: zero radius
- `ErrorState.tsx`: zero radius on retry button
- `page.tsx`: fixed raw `stone-800/stone-900` → token classes

## What Was Preserved
- All data-fetching logic (fetchApi calls, useEffect hooks, state management)
- All routes, props, IDs, API endpoints
- All navigation links and handlers
- All animation code (motion/react)
- All aria attributes
- No new content invented

## Sloplint Results
Before restyle: 0 FAIL, 2 WARN across 38 file(s)
- WARN 28a :367 lazy-loaded first image (likely LCP) — Navbar.tsx
- WARN 28a :26 lazy-loaded first image (likely LCP) — AnimeCard.tsx
(These are pre-existing warnings, not introduced by this restyle)
