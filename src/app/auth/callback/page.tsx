'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveTokens } from '@/lib/auth'
import { useAuthStore } from '@/stores/auth.store'
import { getMe } from '@/queries/user.queries'

function CallbackInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const setUser      = useAuthStore(s => s.setUser)

  useEffect(() => {
    const accessToken  = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (!accessToken || !refreshToken) {
      router.replace('/login')
      return
    }

    saveTokens(accessToken, refreshToken)

    getMe()
      .then(profile => {
        setUser(profile)
        router.replace('/')
      })
      .catch(() => {
        // 토큰은 저장됐으므로 일단 메인으로 이동 (user는 null 상태)
        router.replace('/')
      })
  }, [router, searchParams, setUser])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg)',
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  )
}
