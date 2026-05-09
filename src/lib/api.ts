import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '@/lib/auth'
import type { AuthResponse } from '@/types/user.types'

const AUTH_BASE = 'https://api.seoulmate.my/api/auth'

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

async function doRefresh(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('로그인이 필요해요.')

  const res = await fetch(`${AUTH_BASE}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) {
    clearTokens()
    throw new Error('세션이 만료됐어요. 다시 로그인해주세요.')
  }
  const data: AuthResponse = await res.json()
  saveTokens(data.accessToken, data.refreshToken)
  return data.accessToken
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(input, { ...init, headers })

  if (res.status !== 401) return res

  // 401 → refresh once then retry
  if (!isRefreshing) {
    isRefreshing = true
    try {
      const newToken = await doRefresh()
      refreshQueue.forEach(fn => fn(newToken))
      refreshQueue = []
      isRefreshing = false

      const retryHeaders = new Headers(init.headers)
      retryHeaders.set('Authorization', `Bearer ${newToken}`)
      return fetch(input, { ...init, headers: retryHeaders })
    } catch (e) {
      isRefreshing = false
      refreshQueue = []
      throw e
    }
  }

  // Queue concurrent requests while refresh is in progress
  return new Promise((resolve, reject) => {
    refreshQueue.push((newToken: string) => {
      const retryHeaders = new Headers(init.headers)
      retryHeaders.set('Authorization', `Bearer ${newToken}`)
      fetch(input, { ...init, headers: retryHeaders }).then(resolve).catch(reject)
    })
  })
}
