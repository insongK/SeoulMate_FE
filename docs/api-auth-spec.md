# 인증 API 명세 (백엔드 구현 가이드)

## 개요

| 항목 | 내용 |
|---|---|
| Base URL | `/auth` |
| 인증 방식 | JWT (Access Token + Refresh Token) |
| 소셜 로그인 | 백엔드 OAuth 리다이렉트 방식 |

---

## 1. 로컬 회원가입

- **Method**: `POST`
- **URL**: `/auth/signup`
- **설명**: 이메일 + 비밀번호로 회원가입합니다. (이메일 인증 없음 — MVP)

### Request

| key | 설명 | 타입 | Nullable | 예시 |
|---|---|---|---|---|
| email | 가입 이메일 | String | X | `"user@email.com"` |
| password | 비밀번호 | String | X | `"password123"` |
| nickname | 닉네임 | String | X | `"지수"` |

### Response

| key | 설명 | 타입 | Nullable | 예시 |
|---|---|---|---|---|
| accessToken | JWT Access Token | String | X | `"eyJhb..."` |
| refreshToken | JWT Refresh Token | String | X | `"eyJhb..."` |
| user.id | 유저 ID | String | X | `"clx1234abc"` |
| user.nickname | 닉네임 | String | X | `"지수"` |
| user.email | 이메일 | String | X | `"user@email.com"` |

### Error

| 상태코드 | 사유 |
|---|---|
| 409 | 이미 가입된 이메일 |
| 400 | 필수 필드 누락 또는 유효하지 않은 이메일 형식 |

### Example

```json
// Request
{
  "email": "user@email.com",
  "password": "password123",
  "nickname": "지수"
}

// Response 200
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "id": "clx1234abc",
    "nickname": "지수",
    "email": "user@email.com"
  }
}
```

---

## 2. 로컬 로그인

- **Method**: `POST`
- **URL**: `/auth/login`
- **설명**: 이메일 + 비밀번호로 로그인합니다.

### Request

| key | 설명 | 타입 | Nullable | 예시 |
|---|---|---|---|---|
| email | 로그인 이메일 | String | X | `"user@email.com"` |
| password | 로그인 비밀번호 | String | X | `"password123"` |

### Response

| key | 설명 | 타입 | Nullable | 예시 |
|---|---|---|---|---|
| accessToken | JWT Access Token | String | X | `"eyJhb..."` |
| refreshToken | JWT Refresh Token | String | X | `"eyJhb..."` |
| user.id | 유저 ID | String | X | `"clx1234abc"` |
| user.nickname | 닉네임 | String | X | `"지수"` |
| user.email | 이메일 | String | X | `"user@email.com"` |

### Error

| 상태코드 | 사유 |
|---|---|
| 401 | 이메일 또는 비밀번호 불일치 |
| 404 | 존재하지 않는 계정 |

### Example

```json
// Request
{
  "email": "user@email.com",
  "password": "password123"
}

// Response 200
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "id": "clx1234abc",
    "nickname": "지수",
    "email": "user@email.com"
  }
}
```

---

## 3. 카카오 로그인

### 3-1. 로그인 시작

- **Method**: `GET`
- **URL**: `/auth/kakao`
- **설명**: 프론트에서 이 URL로 리다이렉트하면 백엔드가 카카오 OAuth 페이지로 넘깁니다.
- **Query Parameter**: 없음
- **동작**: 카카오 OAuth 인증 페이지로 302 리다이렉트

### 3-2. 콜백 (백엔드 내부 처리)

- **Method**: `GET`
- **URL**: `/auth/kakao/callback`
- **설명**: 카카오가 인증 완료 후 자동으로 호출하는 콜백 URL입니다. 프론트에서 직접 호출하지 않습니다.
- **백엔드 처리 순서**:
  1. 카카오로부터 Authorization Code 수신
  2. Code → 카카오 Access Token 교환
  3. 카카오 사용자 정보 조회
  4. DB에서 사용자 조회 (없으면 자동 생성)
  5. 서비스 JWT 발급
  6. 프론트엔드 콜백 페이지로 리다이렉트

- **최종 리다이렉트**:
```
{FRONT_URL}/auth/callback?accessToken={JWT}&refreshToken={JWT}
```

### Error 리다이렉트

```
{FRONT_URL}/auth/callback?error=kakao_auth_failed
```

---

## 4. 구글 로그인

### 4-1. 로그인 시작

- **Method**: `GET`
- **URL**: `/auth/google`
- **설명**: 프론트에서 이 URL로 리다이렉트하면 백엔드가 구글 OAuth 페이지로 넘깁니다.
- **Query Parameter**: 없음
- **동작**: 구글 OAuth 인증 페이지로 302 리다이렉트

### 4-2. 콜백 (백엔드 내부 처리)

- **Method**: `GET`
- **URL**: `/auth/google/callback`
- **설명**: 구글이 인증 완료 후 자동으로 호출하는 콜백 URL입니다. 프론트에서 직접 호출하지 않습니다.
- **백엔드 처리 순서**:
  1. 구글로부터 Authorization Code 수신
  2. Code → 구글 Access Token 교환
  3. 구글 사용자 정보 조회
  4. DB에서 사용자 조회 (없으면 자동 생성)
  5. 서비스 JWT 발급
  6. 프론트엔드 콜백 페이지로 리다이렉트

- **최종 리다이렉트**:
```
{FRONT_URL}/auth/callback?accessToken={JWT}&refreshToken={JWT}
```

### Error 리다이렉트

```
{FRONT_URL}/auth/callback?error=google_auth_failed
```

---

## 5. 토큰 재발급

- **Method**: `POST`
- **URL**: `/auth/refresh`
- **설명**: Access Token 만료 시 Refresh Token으로 재발급합니다.

### Request

| key | 설명 | 타입 | Nullable | 예시 |
|---|---|---|---|---|
| refreshToken | JWT Refresh Token | String | X | `"eyJhb..."` |

### Response

| key | 설명 | 타입 | Nullable | 예시 |
|---|---|---|---|---|
| accessToken | 새 JWT Access Token | String | X | `"eyJhb..."` |
| refreshToken | 새 JWT Refresh Token | String | X | `"eyJhb..."` |

### Error

| 상태코드 | 사유 |
|---|---|
| 401 | Refresh Token 만료 또는 유효하지 않음 → 재로그인 필요 |

---

## 6. 로그아웃

- **Method**: `POST`
- **URL**: `/auth/logout`
- **설명**: Refresh Token을 무효화합니다.
- **Headers**: `Authorization: Bearer {accessToken}`

### Request

| key | 설명 | 타입 | Nullable | 예시 |
|---|---|---|---|---|
| refreshToken | 무효화할 Refresh Token | String | X | `"eyJhb..."` |

### Response

```json
{ "message": "로그아웃 되었습니다." }
```

---

## 전체 흐름 요약

### 로컬 로그인/회원가입
```
프론트                         백엔드
  │── POST /auth/signup ──────→ │  회원 생성
  │── POST /auth/login  ──────→ │  JWT 발급
  │←── { accessToken, refreshToken, user } ──│
```

### 소셜 로그인 (카카오/구글 동일)
```
프론트                         백엔드                    카카오/구글
  │── redirect /auth/kakao ──→ │── redirect ──────────→ │
  │                            │←── callback(code) ──── │
  │                            │── token 교환, 유저 조회/생성
  │←── redirect /auth/callback?accessToken=...&refreshToken=... ──│
```

### 토큰 갱신
```
프론트                         백엔드
  │── POST /auth/refresh ────→ │  refreshToken 검증
  │←── { accessToken, refreshToken } ──│
```

---

## 백엔드 환경변수 필요 목록

```env
# 카카오
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=https://{백엔드URL}/auth/kakao/callback

# 구글
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://{백엔드URL}/auth/google/callback

# JWT
JWT_SECRET=
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=14d

# 프론트엔드
FRONTEND_URL=https://{프론트URL}
```
