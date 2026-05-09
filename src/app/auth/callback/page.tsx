'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveTokens } from '@/lib/auth'

function CallbackInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const accessToken  = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (accessToken && refreshToken) {
      saveTokens(accessToken, refreshToken)
      router.replace('/')
    } else {
      router.replace('/login')
    }
  }, [router, searchParams])

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
