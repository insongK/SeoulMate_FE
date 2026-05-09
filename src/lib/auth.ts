import type { AuthResponse } from '@/types/user.types'

const BASE = 'https://api.seoulmate.my/api/auth'
const ACCESS_KEY  = 'seoulmate-token'
const REFRESH_KEY = 'seoulmate-refresh-token'

/* ── Token helpers ─────────────────────────────────────────────── */

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_KEY)
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
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
