# SeoulMate — 서울 데이트 코스 추천 웹앱

> AI 기반 서울 데이트 코스 추천 서비스. 분위기, 지역, 예산을 입력하면 최적의 코스를 제안합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.x |
| Package Manager | pnpm 9.x |
| Styling | Tailwind CSS 3.x + CSS Variables |
| 상태 관리 | Zustand 4.x + TanStack Query 5.x |
| 폼 | React Hook Form + Zod |
| 애니메이션 | Framer Motion |
| 지도 | Kakao Maps SDK + react-kakao-maps-sdk |
| 인증 | next-auth v5 (카카오, 구글 OAuth) |
| PWA | next-pwa |
| 아이콘 | Lucide React |

---

## 시작하기

### 요구 사항

- Node.js 20 LTS
- pnpm 9.x

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 API 키 입력 (아래 환경 변수 항목 참고)

# 개발 서버 실행
pnpm dev
```

개발 서버: http://localhost:3000

### 환경 변수

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# OAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Map
NEXT_PUBLIC_KAKAO_MAP_API_KEY=
```

---

## 디렉토리 구조

```
SeoulMate_FE/
├── public/
│   ├── fonts/pretendard/          # Pretendard Variable 폰트
│   ├── icons/                     # PWA 아이콘 (192, 512px)
│   ├── manifest.json              # PWA 매니페스트
│   └── favicon.ico
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # 인증 라우트 그룹
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── (main)/                # 메인 라우트 그룹 (하단 탭바 포함)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # 홈 (Main_Default)
│   │   │   ├── input/page.tsx     # Main_Input
│   │   │   ├── result/
│   │   │   │   ├── page.tsx       # Result_List
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Result_Detail
│   │   │   │       └── place/[placeId]/page.tsx  # Result_Place
│   │   │   ├── history/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   ├── layout.tsx             # Root Layout (폰트, 메타데이터)
│   │   ├── globals.css            # 글로벌 스타일 + CSS Variables
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── ui/                    # 범용 기본 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── chip.tsx           # 태그 칩 (선택/미선택)
│   │   │   ├── badge.tsx          # 혼잡도 배지
│   │   │   ├── bottom-sheet.tsx   # 모바일 바텀시트
│   │   │   ├── skeleton.tsx       # 로딩 스켈레톤
│   │   │   ├── slider.tsx         # 예산 슬라이더
│   │   │   └── divider.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── bottom-nav.tsx     # 하단 탭 네비게이션
│   │   │   ├── top-nav.tsx        # 상단 네비게이션
│   │   │   └── page-header.tsx    # 뒤로가기 + 타이틀
│   │   │
│   │   ├── course/                # 코스 관련
│   │   │   ├── course-card.tsx
│   │   │   ├── course-timeline.tsx
│   │   │   ├── budget-bar.tsx
│   │   │   └── course-filter.tsx
│   │   │
│   │   ├── place/                 # 장소 관련
│   │   │   ├── place-card.tsx
│   │   │   └── place-info-grid.tsx
│   │   │
│   │   ├── map/                   # 카카오맵
│   │   │   ├── course-map.tsx     # 코스 경로 지도
│   │   │   ├── route-line.tsx     # 경로 라인
│   │   │   └── place-pin.tsx      # 핀 마커
│   │   │
│   │   ├── input/                 # 추천 입력 관련
│   │   │   ├── vibe-selector.tsx  # 분위기 칩 선택
│   │   │   ├── region-input.tsx   # 지역 입력
│   │   │   ├── budget-slider.tsx  # 예산 슬라이더
│   │   │   ├── time-selector.tsx  # 시간 선택
│   │   │   ├── preset-card.tsx    # 프리셋 템플릿 카드
│   │   │   └── quick-search-bar.tsx
│   │   │
│   │   └── stt/                   # 음성 입력
│   │       ├── stt-button.tsx     # 마이크 버튼
│   │       ├── stt-sheet.tsx      # STT 바텀시트
│   │       └── waveform.tsx       # 음성 파형 시각화
│   │
│   ├── hooks/
│   │   ├── use-stt.ts             # Web Speech API
│   │   ├── use-kakao-map.ts       # 카카오맵 초기화
│   │   ├── use-bottom-sheet.ts    # 바텀시트 상태
│   │   ├── use-scroll-lock.ts     # 모달 오픈 시 스크롤 잠금
│   │   └── use-safe-area.ts       # 모바일 Safe Area 계산
│   │
│   ├── stores/                    # Zustand 전역 상태
│   │   ├── input.store.ts         # 추천 입력 폼 상태
│   │   ├── stt.store.ts           # STT 활성화 상태
│   │   └── auth.store.ts          # 로그인 유저 정보
│   │
│   ├── queries/                   # TanStack Query
│   │   ├── course.queries.ts      # 코스 추천 / 저장
│   │   ├── place.queries.ts       # 장소 상세
│   │   └── user.queries.ts        # 유저 정보 / 선호 설정
│   │
│   ├── lib/
│   │   ├── api.ts                 # axios 인스턴스 + 인터셉터
│   │   ├── auth.ts                # next-auth 설정
│   │   └── kakao.ts               # 카카오맵 SDK 로더
│   │
│   ├── constants/
│   │   ├── vibe.ts                # 분위기 옵션 목록
│   │   ├── region.ts              # 서울 지역 / 지하철역 목록
│   │   └── preset.ts              # 프리셋 템플릿 정의
│   │
│   ├── types/
│   │   ├── course.types.ts
│   │   ├── place.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts           # API 요청 / 응답 타입
│   │
│   └── utils/
│       ├── format.ts              # 가격(₩), 시간(분→시간) 포맷터
│       ├── cn.ts                  # clsx + tailwind-merge 헬퍼
│       └── map.ts                 # 좌표 계산 유틸
│
├── .storybook/
│   ├── main.ts
│   └── preview.ts
│
├── tests/
│   ├── unit/utils/format.test.ts
│   └── e2e/recommend-flow.spec.ts
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## 주요 명령어

```bash
pnpm dev          # 개발 서버 → localhost:3000
pnpm build        # 프로덕션 빌드
pnpm storybook    # 컴포넌트 개발 → localhost:6006
pnpm test         # Vitest 유닛 테스트
pnpm test:e2e     # Playwright E2E 테스트
pnpm lint         # ESLint 검사
```

---

## 화면 구성

| 라우트 | 화면 |
|--------|------|
| `/` | 홈 — 퀵 검색바 + 프리셋 카드 |
| `/input` | 상세 입력 — 분위기·지역·예산·시간 선택 |
| `/result` | 코스 목록 |
| `/result/[id]` | 코스 상세 + 카카오맵 경로 |
| `/result/[id]/place/[placeId]` | 장소 상세 정보 |
| `/history` | 저장된 코스 히스토리 |
| `/profile` | 프로필 + 선호 설정 |
| `/login` | 카카오 / 구글 OAuth 로그인 |

---

## 반응형 브레이크포인트

| 환경 | 너비 | 레이아웃 |
|------|------|---------|
| Mobile | ~ 430px | 메인 타겟, 단일 컬럼 |
| Tablet | ~ 768px | 2-column 전환 |
| Desktop | ~ 1280px | 사이드바 + 맵 패널 |

---

## 디자인 토큰

| 토큰 | 값 |
|------|----|
| `--color-primary` | `#5B4FCF` |
| `--color-accent` | `#E8547A` |
| `--color-route` | `#1D9E75` |
| `--color-neutral-900` | `#1A1A1A` |

전체 토큰은 [src/app/globals.css](src/app/globals.css) 참고.

---

## 개발 로드맵

- **Phase 1** (완료) — 프로젝트 초기화, 디자인 토큰, 공통 UI, 레이아웃, OAuth 연동
- **Phase 2** (완료) — 핵심 화면 (홈, 입력, 결과, 히스토리, 프로필)
- **Phase 3** (진행 중) — 카카오맵 연동, STT 음성 입력, PWA 설정
