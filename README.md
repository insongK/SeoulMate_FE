# SeoulMate — 서울 AI 코스 추천 웹앱

> 분위기·지역·예산을 입력하면 AI가 딱 맞는 서울 데이트 코스를 추천해주는 서비스.
> 모바일 퍼스트, 다크/라이트 테마, 음성 검색 지원.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Language | TypeScript 5.x |
| Runtime | React 19 |
| Package Manager | pnpm |
| Styling | Tailwind CSS 3.4 + CSS Variables (Morning Amber 디자인 시스템) |
| 상태 관리 | Zustand 4.x (UI 상태) + TanStack Query 5.x (서버 데이터) |
| 인증 | next-auth v5 (카카오, 구글 OAuth) |
| 지도 | Kakao Maps SDK |
| 애니메이션 | Framer Motion |
| 아이콘 | Lucide React |
| 폰트 | Pretendard Variable + JetBrains Mono |

---

## 시작하기

### 요구 사항

- Node.js 20 LTS 이상
- pnpm

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local

# 개발 서버 실행
pnpm dev
```

개발 서버: http://localhost:3000

### 주요 명령어

```bash
pnpm dev          # 개발 서버 → localhost:3000 (Turbopack)
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 검사
pnpm test         # Vitest 유닛 테스트
pnpm test:e2e     # Playwright E2E 테스트
pnpm storybook    # 컴포넌트 개발 → localhost:6006
```

단일 테스트 실행:
```bash
pnpm test tests/unit/utils/format.test.ts
pnpm test:e2e tests/e2e/recommend-flow.spec.ts
```

### 환경 변수

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# OAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=                        # openssl rand -base64 32

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Kakao Maps
NEXT_PUBLIC_KAKAO_MAP_API_KEY=
```

---

## 화면 구성

| 라우트 | 화면 | 상태 |
|--------|------|------|
| `/` | 홈 — 히어로 + AI 필터 패널 + 무드 프리셋 | 구현 |
| `/login` | 카카오 / 구글 OAuth 로그인 | 구현 |
| `/signup` | 회원가입 | 구현 |
| `/input` | 상세 입력 — 분위기·지역·예산·시간 선택 | 구현 |
| `/result` | 코스 목록 | 구현 |
| `/result/[id]` | 코스 상세 + 카카오맵 경로 | 구현 |
| `/result/[id]/place/[placeId]` | 장소 상세 정보 | 구현 |
| `/history` | 저장된 코스 히스토리 | 구현 |
| `/profile` | 프로필 + 선호 설정 | 구현 |

---

## 주요 기능

### 홈 (메인 페이지)

- **AI 코스 필터 패널** — 분위기(복수 선택), 지역, 예산 슬라이더(₩10,000 ~ ₩200,000+), 소요 시간, 목적(선택사항) 입력 후 AI 추천 요청
- **음성 검색** — Web Speech API 기반. 마이크 버튼을 눌러 자연어로 코스 검색 ("분위기 있는 한강 야경 카페")
- **퀵 태그** — 한강 야경 · 성수 카페 · 이태원 펍 · 북촌 산책 빠른 선택
- **무드 프리셋** — 한강 야경 데이트 / 성수 카페 투어 / 이태원 펍 크롤 / 북촌 한옥 산책 — 클릭 한 번으로 필터 자동 입력
- **다크/라이트 테마** — 테마 상태 localStorage 유지. `data-theme` 속성으로 CSS 변수 전환

### 입력 흐름

```
홈 히어로 검색바 (자연어 쿼리)
     +
코스 필터 패널 (분위기 · 지역 · 예산 · 시간 · 목적)
     ↓
POST /api/courses/search
     ↓
결과 목록 → 코스 상세 → 장소 상세
```

---

## 아키텍처

### 라우팅

App Router 기반, 두 개의 라우트 그룹으로 분리:

```
app/
├── (auth)/          # 로그인, 회원가입 — 공유 레이아웃 없음
└── (main)/          # 메인 탭 페이지들 — layout.tsx에 하단 탭바
    ├── page.tsx     # 홈
    ├── input/
    ├── result/
    │   └── [id]/
    │       └── place/[placeId]/
    ├── history/
    └── profile/
```

### 상태 관리 — 두 레이어, 절대 혼용 금지

| 레이어 | 도구 | 역할 |
|--------|------|------|
| UI 상태 | **Zustand** (`src/stores/`) | 폼 입력값, STT 활성 플래그, 인증 유저 정보. 비동기 로직 없음 |
| 서버 데이터 | **TanStack Query** (`src/queries/`) | 페칭, 캐싱, 뮤테이션. 쿼리 키는 같은 파일에 위치 |

### API & 인증

- `src/lib/api.ts` — axios 인스턴스. baseURL + 인터셉터(토큰 주입, 401 처리)
- `src/lib/auth.ts` — next-auth v5 설정 (카카오 + 구글 프로바이더)
- `src/lib/kakao.ts` — 카카오맵 SDK lazy 로더

### 컴포넌트 레이어

```
components/
├── ui/          # 헤드리스, 비즈니스 로직 없음. 어디서나 재사용 가능
├── layout/      # 구조 쉘 (하단 탭바, 상단 네비게이션)
├── course/      # 코스 카드, 타임라인, 예산 바, 필터
├── place/       # 장소 카드, 정보 그리드
├── map/         # 카카오맵 관련 (SSR 비활성화 필수)
├── input/       # 추천 입력 관련 (분위기 칩, 지역 입력, 예산 슬라이더 등)
└── stt/         # 음성 입력 (마이크 버튼, 바텀시트, 파형 시각화)
```

### 카카오맵

맵 컴포넌트는 반드시 클라이언트에서만 렌더링:

```tsx
const CourseMap = dynamic(() => import('@/components/map/course-map'), { ssr: false })
```

SDK는 `use-kakao-map.ts`에서 한 번만 로드.

### STT (음성 입력)

`use-stt.ts`가 Web Speech API를 래핑. 활성 상태는 `stt.store.ts`에 보관. STT 버튼이 쓰고, `stt-sheet.tsx`(바텀시트 오버레이)가 읽음.

---

## 디렉토리 구조

```
SeoulMate_FE/
├── public/
│   ├── main-bg-dark.jpg         # 다크 테마 히어로 배경
│   ├── main-bg-bright.jpg       # 라이트 테마 히어로 배경
│   ├── seoul-bg.jpg             # 프리셋 카드 배경
│   ├── favicon-32x32.png
│   └── manifest.json
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # 홈 — 히어로 + AI 필터 + 프리셋
│   │   │   ├── input/page.tsx
│   │   │   ├── result/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── place/[placeId]/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── globals.css               # 디자인 토큰 (CSS 변수) + 글로벌 스타일
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/                   # 위 아키텍처 참고
│   ├── hooks/
│   │   ├── use-stt.ts                # Web Speech API
│   │   ├── use-kakao-map.ts          # 카카오맵 초기화
│   │   ├── use-bottom-sheet.ts       # 바텀시트 open/close 상태
│   │   ├── use-scroll-lock.ts        # 모달 오픈 시 스크롤 잠금
│   │   └── use-safe-area.ts          # env(safe-area-inset-*) 계산
│   │
│   ├── stores/                       # Zustand (UI 상태만)
│   │   ├── input.store.ts
│   │   ├── stt.store.ts
│   │   └── auth.store.ts
│   │
│   ├── queries/                      # TanStack Query (서버 데이터)
│   │   ├── course.queries.ts
│   │   ├── place.queries.ts
│   │   └── user.queries.ts
│   │
│   ├── lib/
│   │   ├── api.ts                    # axios 인스턴스 + 인터셉터
│   │   ├── auth.ts                   # next-auth 설정
│   │   └── kakao.ts                  # 카카오맵 SDK 로더
│   │
│   ├── constants/
│   │   ├── vibe.ts                   # 분위기 옵션 12종
│   │   ├── region.ts                 # 서울 지역 목록 + 퀵 지역 4종
│   │   └── preset.ts                 # 무드 프리셋 4종
│   │
│   ├── types/
│   │   ├── course.types.ts
│   │   ├── place.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   └── utils/
│       ├── cn.ts                     # clsx + tailwind-merge
│       ├── format.ts                 # 가격(₩), 시간 포맷터
│       └── map.ts                    # 좌표 계산
│
├── tests/
│   ├── unit/utils/format.test.ts
│   └── e2e/recommend-flow.spec.ts
│
├── .storybook/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 디자인 시스템 — Morning Amber

다크 모드 기본, 라이트 모드 오버라이드. `data-theme="light"` 속성으로 전환.
전체 토큰은 [src/app/globals.css](src/app/globals.css) 참고.

### 브랜드 컬러

| 토큰 | 다크 | 라이트 | 용도 |
|------|------|--------|------|
| `--primary` | `#F5A623` | `#E8651A` | 주요 액션, 강조 |
| `--primary-soft` | `#FFC56B` | `#F59060` | 호버, 소프트 강조 |
| `--primary-deep` | `#C8830F` | `#C94F2C` | 프레스, 딥 강조 |
| `--accent` | `#E8547A` | `#2C5F8A` | 보조 액션 |
| `--grad-amber` | `135deg, #F5A623→#E8547A` | `135deg, #E8651A→#C94F2C` | CTA 버튼 그라디언트 |

### 서피스 / 텍스트

| 토큰 | 다크 | 라이트 |
|------|------|--------|
| `--bg` | `#0D0D0D` | `#FDF6EE` |
| `--surface` | `#1A1A1A` | `#FFFFFF` |
| `--fg` | `#FFFFFF` | `#1A1208` |
| `--fg-2` | `#A0A0A0` | `#7A6A58` |
| `--border` | `rgba(255,255,255,.08)` | `#E8D5C0` |

### 레이아웃 토큰

| 토큰 | 값 |
|------|----|
| `--content-padding` | `clamp(24px, 5vw, 80px)` |
| `--hero-title-size` | `clamp(2.5rem, 4vw, 4.5rem)` |
| `--tab-bar-h` | `72px` |
| `--top-nav-h` | `64px` |

### 반응형 브레이크포인트

| 브레이크포인트 | 레이아웃 변화 |
|----------------|--------------|
| `> 1100px` | 히어로 2컬럼 (1fr + 420px), content-padding 최대 80px |
| `≤ 1100px` | 히어로 2컬럼 (1fr + 360px), gap 24px |
| `≤ 900px` | 히어로 단일 컬럼, 필터 패널 중앙 정렬 (max-width 480px) |
| `≤ 520px` | content-padding 16px, 필터 패널 전체 너비 |

### 모바일 퍼스트 제약

- 터치 타겟 최소 44×44px
- Safe Area 인셋: `env(safe-area-inset-*)` — `use-safe-area.ts` 훅 사용
- 바텀시트 드래그/스냅: Framer Motion (`components/ui/bottom-sheet.tsx`)
- 최대 콘텐츠 너비: 모바일 430px / 데스크톱 1280px

### 스타일링 컨벤션

```tsx
// 항상 Tailwind 토큰명 사용 (raw hex 절대 금지)
<div className="bg-primary text-fg-on-primary" />

// 조건부 클래스 머지
import { cn } from '@/utils/cn'
<div className={cn('base-class', isActive && 'active-class')} />
```

---

## 분위기 옵션 (VIBES)

`로맨틱` · `감성` · `활동적` · `조용한` · `야경` · `분위기` · `맛집` · `산책` · `힙한` · `럭셔리` · `자연` · `고즈넉한`

## 무드 프리셋 (PRESETS)

| 프리셋 | 분위기 | 지역 | 예산 | 시간 |
|--------|--------|------|------|------|
| 한강 야경 데이트 | 로맨틱, 야경 | 한강 | ₩80,000 | 4시간 이상 |
| 성수 카페 투어 | 감성, 힙한 | 성수 | ₩50,000 | 3시간 |
| 이태원 펍 크롤 | 분위기, 활동적 | 이태원 | ₩100,000 | 4시간 이상 |
| 북촌 한옥 산책 | 조용한, 산책, 감성 | 북촌 | ₩40,000 | 2시간 |

---

## 개발 현황

- **완료** — 프로젝트 초기화, 디자인 토큰(Morning Amber), 공통 UI 컴포넌트, OAuth 인증
- **완료** — 홈 히어로 페이지 (AI 필터 패널, 음성 검색, 무드 프리셋, 다크/라이트 테마)
- **완료** — 핵심 화면 (입력, 결과 목록/상세, 장소 상세, 히스토리, 프로필)
- **진행 중** — 카카오맵 연동, STT 음성 입력, AI API 연동
