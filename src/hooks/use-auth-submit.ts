'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveTokens } from '@/lib/auth'
import { useAuthStore } from '@/stores/auth.store'
import type { AuthResponse } from '@/types/user.types'

export function useAuthSubmit() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const setUser      = useAuthStore(s => s.setUser)

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function submit(fn: () => Promise<AuthResponse>, fallbackMsg: string) {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const data = await fn()
      saveTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      // 미들웨어가 redirect 파라미터를 붙여서 보냈다면 해당 페이지로 복귀
      const redirect = searchParams.get('redirect') ?? '/'
      router.replace(redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackMsg)
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, submit }
}
