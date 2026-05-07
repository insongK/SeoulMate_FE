# SeoulMate Design System

> 서울 데이트 코스 추천 웹앱. 다크 테마 기반, 서울 야경의 무드를 유지하면서 모닝 옐로우/앰버 포인트 컬러로 따뜻함을 더한 감성적인 UI.

SeoulMate is an AI-driven date-course recommender for Seoul. The user enters a vibe (분위기), neighborhood (지역), and budget; the app proposes a sequence of places — café, walk, dinner, night view — with a Kakao Maps route. Mobile-first PWA, dark always.

This pack contains the design tokens, brand assets, content guidelines, and a click-through web-app UI kit needed to produce on-brand SeoulMate work.

## Sources

- **Codebase**: `insongK/SeoulMate_FE` (Next.js 15 + Tailwind 3 + Pretendard). The README, `tailwind.config.ts`, `src/app/globals.css`, `src/app/(auth)/login/page.tsx`, and the home/error/not-found routes were the highest-signal files. Most of `src/components/*` was 0-byte stubs at import time.
- **Brand spec**: provided directly by the project owner — Morning Amber `#F5A623`, Blush Pink `#E8547A`, deep dark `#0D0D0D`, surface `#1A1A1A`, Pretendard Variable.

## Index

- `colors_and_type.css` — every token (color, type, radius, spacing, motion) as CSS custom properties + semantic helpers.
- `assets/` — `seoul-bg.jpg` (Seoul night skyline, primary hero photo) and `darkMain.png` (alternate dark hero).
- `preview/` — registered design-system cards (one HTML file per concept).
- `ui_kits/web/` — 5-screen click-through prototype of the mobile webapp.
- `SKILL.md` — agent skill manifest.

---

## Content Fundamentals

### Voice

- **Korean-first.** All UI strings are Korean (한국어). English appears only for the wordmark, error labels, and dev surfaces.
- **2nd-person warm, polite-formal (해요체).** "다시 만나서 반가워요 👋", "어떤 분위기를 찾고 있나요?", "저장됨". The product feels like a friend with good taste, not a concierge.
- **Sentence-case, never ALL CAPS.** The only uppercase strings are micro labels (`AI 추천`, `STEP 1`) with `letter-spacing: .06–.10em`.
- **Numbers always in Latin/mono.** `₩82,500`, `4시간 30분`. Use `font-feature-settings: "tnum" 1` so prices align in lists.
- **Emoji are rare.** A single 👋 in the login greeting; otherwise use small unicode symbols (`●` for busy-level, `·` as a separator) or stroke icons. **Don't decorate copy with emoji.**
- **No marketing slop.** Concrete sensory phrasing wins: "해 질 무렵", "조용한 오후", "저녁 식사 · 야외 테라스" — not "Discover incredible experiences".

### Microcopy patterns

| Surface | Pattern | Example |
|---|---|---|
| CTA primary | verb + 받기/하기 | `코스 추천 받기` · `이 코스로 시작하기` |
| Section header | noun phrase | `오늘의 무드` · `이번 주 인기 코스` |
| Step label | `STEP n · 단어` | `STEP 1 · 분위기` |
| Empty state | warm and concrete | `서울에서 가장 특별한 순간들이 기다리고 있어요` |
| Place meta | dot-separated facts | `반포 → 한남 → 이태원 · 3 곳` |

---

## Visual Foundations

### Color & mood

The palette is **deep night + warm sunrise**. Every screen sits on `#0D0D0D` to `#1A1A1A`, and the only saturated color you'll see is the amber→pink gradient on CTAs, the wordmark, and key data points (busy level, AI tag, focus rings). No purple/coral gradient from the older codebase — the user-provided spec wins.

- **Primary** `#F5A623` Morning Amber. Used for CTA fills (gradient with pink), focus rings, active tab tint, AI-recommendation tag.
- **Accent** `#E8547A` Blush Pink. Pairs with amber in gradients; also signals 혼잡 (high busyness) and "saved" hearts.
- Surfaces step up in 5 even shades from `#0D0D0D` (page) → `#2E2E2E` (active/pressed). No tinted surfaces.
- **Image scrim is left-heavy on the desktop hero**, bottom-heavy on cards — see the login page and `preview/hero-image.html`.

### Typography

- **Pretendard Variable** for everything (Korean + Latin in one file). Loaded from the orioncactus CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css`.
- Display & wordmark: weight 900, letter-spacing `-2px`, with the amber→pink gradient clipped to text and an optional shimmer animation on the marquee.
- Headings (32 / 24 / 20 / 18) are weight 700/600 with `letter-spacing: -.01em`.
- Body 16/regular at `line-height: 1.5`. Prefer `text-wrap: pretty` on Korean paragraphs.
- Numbers use **JetBrains Mono** (`--font-mono`) with tabular figures.
- **No alternative font families.** No Playfair/serif. The codebase had `display: 'Playfair Display'` but it's never actually used; we drop it.

> If the project owner wants to ship the variable font locally instead of the CDN, drop `PretendardVariable.woff2` into `fonts/` and replace the `@import` in `colors_and_type.css` with a `@font-face` declaration. **No font-file substitution was made — the CDN serves the real Pretendard.**

### Spacing & layout

- 8pt grid with 4pt half-step. Card padding 20–28; section gaps 24; tap targets ≥ 44.
- Mobile content max width 430px; tablet 768; desktop 1280. The webapp is mobile-first; desktop usually splits into a 60/40 hero + form pattern (see login).
- The bottom nav bar is 64px + safe-area, with a 56px circular FAB protruding 22px above for `코스 추천 받기`.

### Backgrounds & imagery

- **Real night photography** of Seoul as the dominant background medium. `assets/seoul-bg.jpg` is the canonical hero. Always paired with a dark scrim.
- Cards use the photo as a tinted thumbnail (`mix-blend-mode: overlay`, `opacity: .5–.85`) over an amber→pink gradient base — gives every card a warm halo even when the source photo is cool.
- **No hand-drawn illustrations, no patterns, no repeating textures.** The only ornamental motif is a thin SVG grid + concentric circles inset on the desktop login (representing a Seoul map) at ~5% opacity.
- A subtle SVG noise grain (~3% opacity) sits on top of large photo areas to keep dark gradients from banding.

### Effects: shadow / glow / blur

- **Outer shadows are dim**, never lifted (the page is already dark). Cards: `0 8px 24px rgba(0,0,0,.40), 0 2px 6px rgba(0,0,0,.30)`.
- **Glow** is reserved: amber glow on the primary CTA, the FAB, and the wordmark. Pink glow only on saved-state hearts and danger toasts.
- **Blur** appears on the top nav (sticky) and bottom nav (`backdrop-filter: blur(20px) saturate(180%)`) for a glass effect over scrolling content. Modals use `blur(28px) saturate(180%)` over the photo background.
- Pressed state uses an inner shadow `inset 0 1px 2px rgba(0,0,0,.4)` plus a 1px translateY.

### Borders & strokes

- Default border is `rgba(255,255,255,.08)`; strong border is `.16`; amber outline is `rgba(245,166,35,.40)`. Never solid white borders.
- Inputs are 1.5px borders; everything else 1px.

### Corner radius

- Inputs/buttons: 14
- Cards: 20
- Sheets, hero, large surfaces: 28
- Chips, toggles, avatars, busy badges: pill (9999)
- Decorative dots: 6

### Motion

- Default ease: `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-out`). Use 240ms for state changes, 360ms for entry, 160ms for hover.
- Spring `cubic-bezier(0.34, 1.56, 0.64, 1)` only on CTA press-release for a subtle bounce.
- Entry animations: 16px translateY + opacity 0→1, staggered ~120ms. The login page is the canonical example.
- The wordmark has an infinite 3s linear shimmer on its background-position.
- Decorative particles drift up–down in 6–9s loops on hero surfaces (see login). Background only — never around interactive content.
- Honor `prefers-reduced-motion`.

### Hover & press

- **Hover**: lift 1–2px (`translateY(-1px)`) + 5% brighter (filter or shadow grows). Never use opacity dimming on hover for buttons.
- **Press**: snap back to baseline + inner shadow.
- **Focus**: 4px amber halo (`box-shadow: 0 0 0 4px rgba(245,166,35,.13)`) + 1.5px amber border + tinted background (`rgba(245,166,35,.07)`).

### Transparency rules

- Page chrome (top/bottom nav) sits on `rgba(13,13,13,.85–.92)` + blur. Card surfaces are solid `#1A1A1A` — no alpha. Modals over photos: `rgba(10,10,15,.88)` + blur(28).
- Avoid layering three glass surfaces. One at a time.

---

## Iconography

- **Lucide React** is the canonical icon set, per the codebase. We don't import Lucide directly here; the UI kit ships an inline-SVG mirror in `ui_kits/web/Icons.jsx` matching Lucide's 1.5–1.8 stroke weight, round line caps, and 24×24 viewBox. **For production, install `lucide-react` and use it instead of these stubs.**
- Stroke is `currentColor` so an icon adopts the parent's text color (default `--fg-2`). Active tab icons go `--primary`; "saved" hearts get a pink fill.
- **Emoji** is allowed only in long-form copy bubbles (a single 👋 in the login greeting). Don't decorate buttons, headings, or labels with emoji.
- **Unicode glyphs** (`●`, `·`, `→`, `+`) appear as inline copy decoration where a stroke icon would feel heavy: bullet marks for busy levels, route arrows in subtitles, the FAB's `+`.
- Brand glyph: a monogram tile **S** on a gradient (see `preview/logo.html`) for favicons and small placements.
- The login page uses a hand-crafted Google + Kakao SVG; copy those into `assets/social/` if you need them in production.

---

## UI Kits

- [`ui_kits/web/`](ui_kits/web/) — mobile webapp click-through covering Home → Input → Result list → Course detail → Profile. Open `ui_kits/web/index.html`.

There is only one product (the mobile-first webapp). No marketing site or separate dashboard exists in the codebase.

---

## Caveats & open questions

- The source codebase had **most components as 0-byte stubs**; we reconstructed visuals from the README, `globals.css`, the login page, and the brand spec. Real components may diverge.
- **Kakao Maps** is mocked as an SVG. The real surface uses `react-kakao-maps-sdk`.
- **STT** (mic button) is decorative; not wired to Web Speech API.
- The codebase uses a coral / purple / indigo / gold gradient palette; we replaced it with the user-provided amber + pink palette per the brief. If the prior palette is meant to coexist (e.g. for a brand campaign), let us know.
