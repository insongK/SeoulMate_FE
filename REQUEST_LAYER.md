# 프론트엔드 요청 레이어 명세

## 개요

```
컴포넌트 / 페이지
      ↓
queries/*.ts       ← API별 함수 모음
      ↓
lib/api.ts         ← apiFetch (토큰 주입 + 401 자동 갱신)
      ↓
fetch()            ← 브라우저 네이티브
```

---

## 토큰 저장

`src/lib/auth.ts`에서 `localStorage`로 관리한다.

| 키 | 값 |
|---|---|
| `seoulmate-token` | accessToken |
| `seoulmate-refresh-token` | refreshToken |

```typescript
getAccessToken()   // localStorage에서 읽기
getRefreshToken()  // localStorage에서 읽기
saveTokens(accessToken, refreshToken)
clearTokens()
```

---

## apiFetch

**파일:** `src/lib/api.ts`

인증이 필요한 모든 API 호출의 진입점. 네이티브 `fetch`를 얇게 감싼다.

```typescript
apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response>
```

### 동작 순서

1. `getAccessToken()`으로 토큰을 읽어 `Authorization: Bearer <token>` 헤더 추가
2. 요청 전송
3. 응답이 `401`이면 → `/api/auth/refresh`로 토큰 갱신 후 원래 요청 재전송
4. 갱신 중 다른 요청이 `401`을 받으면 큐에 대기했다가 갱신 완료 후 일괄 재전송
5. 갱신도 실패하면 토큰 삭제 후 에러 throw

```
첫 요청 ──→ 401 ──→ refresh 요청
                       ↓ 성공
               새 토큰 저장 + 원래 요청 재전송
               대기 중인 요청도 일괄 재전송
                       ↓ 실패
               clearTokens() + Error throw
```

> 인증이 필요 없는 엔드포인트(로그인, 회원가입, 토큰 갱신)는 `apiFetch` 대신 네이티브 `fetch`를 직접 사용한다.

---

## 에러 처리 패턴

각 queries 파일 안에서 `throwOnError` 헬퍼로 일관되게 처리한다.

```typescript
async function throwOnError(res: Response): Promise<void> {
  if (res.ok) return
  const body = await res.json().catch(() => ({ message: undefined }))
  if (res.status === 401) throw new Error('로그인이 필요해요.')
  if (res.status === 404) throw new Error('찾을 수 없어요.')
  throw new Error(body?.message ?? '요청에 실패했어요.')
}
```

컴포넌트에서는 `try/catch`로 받아 토스트 또는 에러 UI 표시.

---

## queries 파일 구조

**위치:** `src/queries/`

| 파일 | 담당 |
|---|---|
| `course.queries.ts` | 코스 추천 · 조회 · 저장 |
| `user.queries.ts` | 유저 프로필 · 선호 설정 |
| `place.queries.ts` | 장소 상세 |

### 작성 패턴

```typescript
const BASE = 'https://api.seoulmate.my/api/...'

export async function getSomething(id: string): Promise<SomeType> {
  const res = await apiFetch(`${BASE}/${id}`)
  await throwOnError(res)
  return res.json()
}

export async function patchSomething(body: Params): Promise<Result> {
  const res = await apiFetch(`${BASE}/endpoint`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  await throwOnError(res)
  return res.json()
}
```

---

## 인증 API (토큰 불필요)

`src/lib/auth.ts`에 구현. 네이티브 `fetch` 사용.

| 함수 | 엔드포인트 | 설명 |
|---|---|---|
| `login(email, password)` | `POST /api/auth/login` | 이메일 로그인 |
| `signup(params)` | `POST /api/auth/signup` | 회원가입 |
| `logout()` | `POST /api/auth/logout` | 로그아웃 (토큰 즉시 삭제 후 fire-and-forget) |
| `refreshTokens()` | `POST /api/auth/refresh` | 토큰 갱신 |
| `loginWithKakao()` | — | `window.location.href`로 브라우저 이동 |
| `loginWithGoogle()` | — | `window.location.href`로 브라우저 이동 |

---

## OAuth 콜백 처리

`/auth/callback` 페이지에서 URL 파라미터로 토큰 수신.

```
https://www.seoulmate.my/auth/callback?accessToken=...&refreshToken=...
```

```typescript
const params = new URLSearchParams(window.location.search)
saveTokens(params.get('accessToken'), params.get('refreshToken'))
```
