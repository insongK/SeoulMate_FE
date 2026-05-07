# SeoulMate · Web App UI Kit

A high-fidelity recreation of the SeoulMate mobile-first webapp (`/`, `/input`, `/result`, `/result/[id]`, `/profile`). Built as a click-through prototype, not production code.

## Files
- `index.html` — entry point; loads all JSX files in order.
- `Icons.jsx` — Lucide-style stroke icons exposed on `window.I`.
- `Primitives.jsx` — Button / Chip / Input / Badge primitives → `window.SM`.
- `Nav.jsx` — TopNav, BottomNav (5-tab + center FAB) → `window.SMNav`.
- `Course.jsx` — PresetCard, CourseCard, Timeline, MapStub → `window.SMCourse`.
- `App.jsx` — top-level state machine wiring 5 screens together.

## Screens
1. **Home** — Hero with Seoul-night photo, quick search, mood presets, trending courses.
2. **Input** — 3-step picker (vibe / region / budget) with chip multi-select and dual-thumb slider.
3. **Result list** — AI-tagged filter pills + course cards.
4. **Course detail** — image header, stats grid, Kakao Maps stub with route, timeline.
5. **Profile** — avatar, stats, settings list.

## Cross-references with the codebase
- Color tokens (Morning Amber `#F5A623`, Blush Pink `#E8547A`, deep dark `#0D0D0D`, surface `#1A1A1A`) come from the user-provided spec — they replace the codebase's coral/purple gradient palette.
- Component naming mirrors `src/components/{ui,layout,course,place,input}/` from `insongK/SeoulMate_FE`.
- Korean copy and routing match `src/app/(main)/page.tsx` and the README.

## Caveats
- Most files in the source `src/components/*` were 0-byte stubs at import time, so visuals are reconstructed from the README + `globals.css` + the login page.
- Kakao Maps is mocked with an SVG placeholder.
- STT (mic) is decorative — Web Speech API not wired up.
