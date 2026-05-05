# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev           # dev server → localhost:3000
pnpm build         # production build
pnpm lint          # ESLint
pnpm test          # Vitest unit tests
pnpm test:e2e      # Playwright E2E
pnpm storybook     # component dev → localhost:6006
```

Run a single unit test file:
```bash
pnpm test tests/unit/utils/format.test.ts
```

Run a single E2E spec:
```bash
pnpm test:e2e tests/e2e/recommend-flow.spec.ts
```

## Architecture

### Routing

Two App Router route groups:
- `(auth)/` — login, signup; no shared layout
- `(main)/` — all tabbed pages; `layout.tsx` renders the bottom nav

Dynamic segments: `/result/[id]` (course detail) → `/result/[id]/place/[placeId]` (place detail).

### State management — two layers, never mixed

- **Zustand** (`src/stores/`) — client-only UI state: form inputs, STT active flag, auth user info. Zero async logic.
- **TanStack Query** (`src/queries/`) — all server data: fetching, caching, mutations. Query keys live in the same file as the query/mutation.

### API & Auth

- `src/lib/api.ts` — axios instance with base URL + interceptors (attach token, handle 401).
- `src/lib/auth.ts` — next-auth v5 config (Kakao + Google providers).
- `src/lib/kakao.ts` — lazy SDK loader for Kakao Maps; call before rendering any map component.

### Styling conventions

- Design tokens defined as CSS variables in `src/app/globals.css`, extended into Tailwind in `tailwind.config.ts`. Always use Tailwind token names (`text-primary`, `bg-accent-light`) — never raw hex values.
- Use `src/utils/cn.ts` (clsx + tailwind-merge) for all conditional class merging.

### Component layers

- `components/ui/` — headless, no business logic, reusable anywhere.
- `components/layout/` — structural shells (nav, header).
- Feature folders (`course/`, `place/`, `map/`, `input/`, `stt/`) — domain-specific, may import from `ui/` and call queries/stores directly.

### Kakao Maps

Map components (`components/map/`) must be rendered client-side only. Wrap with `dynamic(() => import(...), { ssr: false })` at the page level. The SDK is loaded once via `use-kakao-map.ts`.

### STT (Voice input)

`use-stt.ts` wraps Web Speech API. Active state lives in `stt.store.ts`. The sheet overlay (`stt-sheet.tsx`) reads from the store; STT button writes to it.

### Mobile-first constraints

- Touch targets minimum 44×44px.
- Safe area insets via `env(safe-area-inset-*)` — use `use-safe-area.ts` hook.
- Bottom sheet drag/snap implemented with Framer Motion in `components/ui/bottom-sheet.tsx`; use `use-bottom-sheet.ts` for open/close state.
- Max content width: 430px on mobile, 1280px on desktop.
