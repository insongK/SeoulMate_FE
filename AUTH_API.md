# 인증 API 명세

**Base URL:** `https://api.seoulmate.my/api/auth`

모든 에러 응답 형식:

```json
{ "status": 400, "message": "에러 메시지" }
```

---

## 이메일 회원가입

```
POST /signup
```

### Request

```json
{
  "email": "user@example.com",
  "password": "Test1234!",
  "nickname": "닉네임",
  "preferences": {
    "vibes": ["조용한", "힙한"]
  }
}
```

> `preferences` 생략 가능
>
> `vibes` 허용값: `조용한` `힙한` `낭만적인` `활기찬` `고즈넉한` `현대적인` `감성적인` `자연친화적`

### Response `201`

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "닉네임"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### 에러

| 상태코드 | 메시지 |
| --- | --- |
| 409 | 이미 사용 중인 이메일입니다. |
| 409 | 이미 사용 중인 닉네임입니다. |

---

## 이메일 로그인

```
POST /login
```

### Request

```json
{
  "email": "user@example.com",
  "password": "Test1234!"
}
```

### Response `200`

회원가입 응답과 동일한 구조

### 에러

| 상태코드 | 메시지 |
| --- | --- |
| 400 | email과 password가 필요합니다. |
| 401 | 이메일 또는 비밀번호가 올바르지 않습니다. |

---

## 토큰 갱신

```
POST /refresh
```

### Request

```json
{
  "refreshToken": "eyJhbG..."
}
```

### Response `200`

새 `accessToken` + `refreshToken` 포함, 회원가입 응답과 동일한 구조

### 에러

| 상태코드 | 메시지 |
| --- | --- |
| 400 | refreshToken이 필요합니다. |
| 401 | 이미 로그아웃된 토큰입니다. |
| 401 | 유효하지 않은 refresh token입니다. |

---

## 로그아웃

```
POST /logout
```

### Request

```json
{
  "refreshToken": "eyJhbG..."
}
```

### Response `204 No Content`

---

## 카카오 / 구글 OAuth

OAuth는 fetch가 아닌 **브라우저 이동**으로 시작해야 합니다.

```typescript
// 카카오
window.location.href = 'https://api.seoulmate.my/api/auth/kakao'

// 구글
window.location.href = 'https://api.seoulmate.my/api/auth/google'
```

### 전체 흐름

1. 프론트 → 위 URL로 브라우저 이동
2. 카카오/구글 로그인 페이지로 리다이렉트
3. 로그인 완료 → 백엔드 콜백으로 인가 코드 전달
4. 백엔드에서 처리 후 아래 URL로 리다이렉트:

```
https://www.seoulmate.my/auth/callback?accessToken=...&refreshToken=...
```

5. 프론트에서 URL 파라미터로 토큰 꺼내 저장

```typescript
const params = new URLSearchParams(window.location.search)
const accessToken = params.get('accessToken')
const refreshToken = params.get('refreshToken')
```

### 에러 (리다이렉트 없이 JSON 반환)

| 상태코드 | 메시지 |
| --- | --- |
| 400 | 인가 코드가 없습니다. |
| 400 | 카카오 계정에서 이메일을 가져올 수 없습니다. 이메일 제공에 동의해주세요. |
| 409 | 이미 kakao(으)로 가입된 계정입니다. |
| 409 | 이미 google(으)로 가입된 계정입니다. |
| 502 | 카카오 로그인 처리 중 오류가 발생했습니다. |
| 502 | 구글 로그인 처리 중 오류가 발생했습니다. |

---

## 인증이 필요한 API 호출 방법

모든 인증 필요 API는 요청 헤더에 `accessToken`을 포함해야 합니다.

```
Authorization: Bearer <accessToken>
```

`accessToken` 만료 시 (`401` 응답) → `/refresh`로 새 토큰 발급 후 재요청
