'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveTokens } from '@/lib/auth'
import { useAuthStore } from '@/stores/auth.store'
import type { AuthResponse } from '@/types/user.types'

export function useAuthSubmit() {
  const router  = useRouter()
  const setUser = useAuthStore(s => s.setUser)

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
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackMsg)
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, submit }
}
