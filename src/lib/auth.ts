import type { AuthResponse } from '@/types/user.types'

const BASE = 'https://api.seoulmate.my/api/auth'
const ACCESS_KEY  = 'seoulmate-token'
const REFRESH_KEY = 'seoulmate-refresh-token'

const ACCESS_MAX_AGE  = 60 * 60           // 1h  (액세스 토큰)
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7  // 7d  (리프레시 토큰)

/* ── Cookie helpers ────────────────────────────────────────────── */

function setCookie(name: string, value: string, maxAge: number): void {
  // localhost(HTTP)에서는 Secure 생략, 배포(HTTPS)에서는 추가
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie =
    `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict; Max-Age=${maxAge}${secure}`
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; Max-Age=0`
}

/* ── Token helpers ─────────────────────────────────────────────── */

export function getAccessToken(): string | null  { return getCookie(ACCESS_KEY) }
export function getRefreshToken(): string | null { return getCookie(REFRESH_KEY) }

export function saveTokens(accessToken: string, refreshToken: string): void {
  setCookie(ACCESS_KEY,  accessToken,  ACCESS_MAX_AGE)
  setCookie(REFRESH_KEY, refreshToken, REFRESH_MAX_AGE)
}

export function clearTokens(): void {
  deleteCookie(ACCESS_KEY)
  deleteCookie(REFRESH_KEY)
}

/* ── API helpers ───────────────────────────────────────────────── */

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '오류가 발생했어요.' }))
    throw new Error(err.message ?? '오류가 발생했어요.')
  }
  return res.json() as Promise<T>
}

/* ── Auth API ──────────────────────────────────────────────────── */

export async function login(email: string, password: string): Promise<AuthResponse> {
  return post<AuthResponse>('/login', { email, password })
}

export interface SignupParams {
  email: string
  password: string
  nickname: string
  preferences?: { vibes: string[] }
}

export async function signup(params: SignupParams): Promise<AuthResponse> {
  return post<AuthResponse>('/signup', params)
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  clearTokens()
  if (!refreshToken) return
  fetch(`${BASE}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {})
}

export async function refreshTokens(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('로그인이 필요해요.')
  return post<AuthResponse>('/refresh', { refreshToken })
}

/* ── OAuth ─────────────────────────────────────────────────────── */

export function loginWithKakao(): void {
  window.location.href = 'https://api.seoulmate.my/api/auth/kakao'
}

export function loginWithGoogle(): void {
  window.location.href = 'https://api.seoulmate.my/api/auth/google'
}
