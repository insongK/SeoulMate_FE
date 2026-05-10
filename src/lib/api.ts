import { getAccessToken, saveAccessToken, clearTokens } from '@/lib/auth'

const AUTH_BASE = 'https://api.seoulmate.my/api/auth'

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

async function doRefresh(): Promise<string> {
  // refreshToken은 HttpOnly 쿠키로 관리되므로 credentials: 'include'로 자동 전송
  const res = await fetch(`${AUTH_BASE}/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    clearTokens()
    throw new Error('세션이 만료됐어요. 다시 로그인해주세요.')
  }
  const data = await res.json() as { accessToken: string }
  saveAccessToken(data.accessToken)
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
