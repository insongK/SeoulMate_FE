'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'

function IconHistory({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l3.5 2"/>
    </svg>
  )
}
function IconSun({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}
function IconMoon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export const SITE_NAV_H = 64

export function SiteNav() {
  const router   = useRouter()
  const pathname = usePathname()
  const user     = useAuthStore(s => s.user)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('seoulmate-theme')
    if (stored) setIsDark(stored === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('seoulmate-theme', next ? 'dark' : 'light')
  }

  const btnStyle: React.CSSProperties = {
    width: 36, height: 36, borderRadius: '50%',
    border: '1px solid rgba(232,101,26,.25)',
    background: 'rgba(232,101,26,.07)',
    color: 'var(--fg-2)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  const isHistory = pathname === '/history'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: SITE_NAV_H,
      background: 'var(--overlay)',
      backdropFilter: 'blur(10px) saturate(160%)',
      WebkitBackdropFilter: 'blur(10px) saturate(160%)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 1440, margin: '0 auto',
        padding: '0 var(--content-padding)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div
          onClick={() => router.push('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <img src="/favicon-32x32.png" width={26} height={26} alt="" style={{ display: 'block' }} />
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--fg)' }}>
            SeoulMate
          </span>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => router.push('/history')}
            aria-label="내 코스"
            style={{
              ...btnStyle,
              background: isHistory ? 'rgba(232,101,26,.15)' : 'rgba(232,101,26,.07)',
              color: isHistory ? 'var(--primary)' : 'var(--fg-2)',
            }}
          >
            <IconHistory />
          </button>

          <button onClick={toggleTheme} aria-label={isDark ? '라이트 모드' : '다크 모드'} style={btnStyle}>
            {isDark ? <IconSun /> : <IconMoon />}
          </button>

          <button
            onClick={() => router.push('/profile')}
            aria-label="프로필"
            style={{
              ...btnStyle,
              border: 'none',
              background: user ? 'var(--grad-amber)' : 'rgba(232,101,26,.07)',
              color: user ? 'var(--fg-on-primary)' : 'var(--fg-2)',
              fontSize: 13, fontWeight: 700, letterSpacing: '-.5px',
              boxShadow: user ? '0 2px 10px rgba(245,166,35,.35)' : 'none',
            }}
          >
            {user ? user.nickname.slice(0, 2) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
