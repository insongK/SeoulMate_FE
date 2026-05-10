import { apiFetch } from '@/lib/api'
import type { UserProfile, UpdatePreferencesParams, UpdatePreferencesResult } from '@/types/user.types'

const USER_BASE = 'https://api.seoulmate.my/api/users'

async function throwOnError(res: Response): Promise<void> {
  if (res.ok) return
  const body = await res.json().catch(() => ({ message: undefined }))
  const msg = body?.message
  if (res.status === 401) throw new Error('로그인이 필요해요.')
  throw new Error(msg ?? '요청에 실패했어요.')
}

export async function getMe(): Promise<UserProfile> {
  const res = await apiFetch(`${USER_BASE}/me`)
  await throwOnError(res)
  return res.json()
}

export async function updatePreferences(params: UpdatePreferencesParams): Promise<UpdatePreferencesResult> {
  const res = await apiFetch(`${USER_BASE}/me/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  await throwOnError(res)
  return res.json()
}
