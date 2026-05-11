'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { getMe, updatePreferences } from '@/queries/user.queries'
import { logout } from '@/lib/auth'
import { VIBES } from '@/constants/vibe'
import type { UserProfile } from '@/types/user.types'
import { Skeleton } from '@/components/ui/skeleton'
import { SiteNav, SITE_NAV_H } from '@/components/layout/site-nav'

/* ── Constants ────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { id: 'preferences',   label: '선호 설정' },
  { id: 'notifications', label: '알림 설정' },
  { id: 'security',      label: '계정 보안' },
  { id: 'logout-section',label: '로그아웃' },
]

/* ── Shared styles ────────────────────────────────────────────── */

const card: React.CSSProperties = {
  background:    'var(--surface)',
  border:        '1px solid var(--border)',
  borderRadius:  'var(--radius-lg)',
  padding:       20,
  boxShadow:     'var(--shadow-card)',
}

const cardTitle: React.CSSProperties = {
  fontSize: 15, fontWeight: 600, marginBottom: 14,
}

/* ── Page component ───────────────────────────────────────────── */

export default function ProfilePage() {
  const router  = useRouter()
  const setUser = useAuthStore(s => s.setUser)

  /* fetch */
  const [fetchKey, setFetchKey] = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [profile,  setProfile]  = useState<UserProfile | null>(null)

  /* preferences form */
  const [vibes,     setVibes]     = useState<string[]>([])
  const [origVibes, setOrigVibes] = useState<string[]>([])

  /* ui */
  const [saving,           setSaving]           = useState(false)
  const [activeSection,    setActiveSection]    = useState('preferences')
  const [toast,            setToast]            = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  /* dirty check */
  const isDirty = JSON.stringify(vibes) !== JSON.stringify(origVibes)

  /* toast */
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  /* fetch profile */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getMe()
      .then(data => {
        if (cancelled) return
        setProfile(data)
        const v = data.vibes ?? []
        setVibes(v)
        setOrigVibes(v)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : '오류가 발생했어요.'
        if (msg.includes('로그인')) {
          showToast('로그인이 필요해요', 'error')
          router.replace('/login')
        } else {
          setError(msg)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [fetchKey, router, showToast])

  /* unsaved changes guard */
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '저장하지 않은 변경사항이 있어요. 나가시겠어요?'
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  /* scroll spy */
  useEffect(() => {
    if (loading) return

    const handleScroll = () => {
      const scrollY = window.scrollY + 120
      let current = NAV_ITEMS[0].id
      for (const { id } of NAV_ITEMS) {
        const el = sectionRefs.current[id]
        if (!el) continue
        if (el.getBoundingClientRect().top + window.scrollY <= scrollY) current = id
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading])

  /* helpers */
  const scrollToSection = (id: string) =>
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  function toggleVibe(v: string) {
    setVibes(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
    )
  }

  async function handleSave() {
    if (!isDirty || saving) return
    setSaving(true)
    try {
      await updatePreferences({ vibes })
      setOrigVibes([...vibes])
      showToast('설정이 저장됐어요')
    } catch {
      showToast('저장에 실패했어요. 다시 시도해주세요', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    setShowLogoutDialog(false)
    await logout()
    setUser(null)
    router.replace('/login')
  }

  const initials = profile?.nickname?.slice(0, 2) ?? '??'

  return (
    <>
      <style>{`
        .profile-layout {
          display: grid;
          grid-template-columns: clamp(200px, 22%, 280px) 1fr;
          gap: 24px;
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(16px, 4vw, 40px);
          min-height: 100vh;
          align-items: start;
        }
        @media (max-width: 767px) {
          .profile-layout { grid-template-columns: 1fr; gap: 16px; }
          .profile-sidebar { position: static !important; }
        }
      `}</style>

      <div style={{ background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-sans)', paddingTop: SITE_NAV_H }}>

        <SiteNav />

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 100, left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            background: toast.type === 'success' ? 'var(--success)' : 'var(--danger)',
            color: '#fff', borderRadius: 'var(--radius-pill)',
            fontSize: 14, fontWeight: 600,
            zIndex: 9999, whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-card)',
            animation: 'fade-up var(--dur-base) var(--ease-out)',
          }}>
            {toast.msg}
          </div>
        )}

        {/* Logout dialog */}
        {showLogoutDialog && (
          <div
            onClick={() => setShowLogoutDialog(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'var(--scrim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9998,
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 28, maxWidth: 320, width: '90%',
              }}
            >
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>로그아웃</p>
              <p style={{ color: 'var(--fg-2)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                정말 로그아웃하시겠어요?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  style={{
                    flex: 1, padding: '11px 0',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--fg)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  }}
                >취소</button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1, padding: '11px 0',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--danger)', border: 'none',
                    color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >로그아웃</button>
              </div>
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="profile-layout">

          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className="profile-sidebar" style={{ position: 'sticky', top: SITE_NAV_H + 16 }}>

            {/* Profile card */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: 24, marginBottom: 12,
              boxShadow: 'var(--shadow-card)',
            }}>
              {loading ? <ProfileSidebarSkeleton /> : (
                <>
                  {/* Avatar */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'var(--grad-amber)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, fontWeight: 700,
                      color: 'var(--fg-on-primary)',
                      letterSpacing: '-0.5px', flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                  </div>

                  {/* Name & email */}
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{profile?.nickname}</p>
                    <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>{profile?.email}</p>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 4, background: 'var(--surface-2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 8px', marginBottom: 16,
                  }}>
                    {[
                      { label: '방문한 곳', value: 0 },
                      { label: '작성 리뷰', value: 0 },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{value}</p>
                        <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => router.push('/profile/edit')}
                    style={{
                      width: '100%', padding: '11px 0',
                      background: 'transparent',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--fg)', fontSize: 14, fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    프로필 편집
                  </button>
                </>
              )}
            </div>

            {/* Nav menu */}
            <nav style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
            }}>
              {NAV_ITEMS.map((item, i) => {
                const isLogout = item.id === 'logout-section'
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => isLogout ? setShowLogoutDialog(true) : scrollToSection(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '14px 20px',
                      background: isActive ? 'var(--surface-2)' : 'transparent',
                      border: 'none',
                      borderBottom: i < NAV_ITEMS.length - 1 ? '1px solid var(--border)' : 'none',
                      color: isLogout ? 'var(--danger)'
                           : isActive ? 'var(--primary)'
                           : 'var(--fg)',
                      fontSize: 14, fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background var(--dur-fast), color var(--dur-fast)',
                    }}
                  >
                    <span>{item.label}</span>
                    {!isLogout && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* ── Main content ──────────────────────────────────── */}
          <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
            {error ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 16, padding: 60, textAlign: 'center',
              }}>
                <p style={{ color: 'var(--fg-2)', fontSize: 15 }}>{error}</p>
                <button
                  onClick={() => { setError(null); setFetchKey(k => k + 1) }}
                  style={{
                    padding: '10px 28px', borderRadius: 'var(--radius-md)',
                    background: 'var(--primary)', border: 'none',
                    color: 'var(--fg-on-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >다시 시도</button>
              </div>
            ) : (
              <>
                {/* 선호 설정 */}
                <section
                  id="preferences"
                  ref={el => { sectionRefs.current['preferences'] = el }}
                >
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>선호 설정</h2>
                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <SettingCardSkeleton />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                      {/* Vibes */}
                      <div style={card}>
                        <p style={cardTitle}>선호 분위기</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {VIBES.map(v => (
                            <Chip key={v} label={v} active={vibes.includes(v)} onClick={() => toggleVibe(v)} />
                          ))}
                        </div>
                      </div>

                      {/* Save button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                        <button
                          onClick={handleSave}
                          disabled={!isDirty || saving}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '13px 36px', borderRadius: 'var(--radius-md)',
                            background: isDirty && !saving ? 'var(--grad-amber)' : 'var(--surface-2)',
                            border: 'none',
                            color: isDirty && !saving ? 'var(--fg-on-primary)' : 'var(--fg-3)',
                            fontSize: 15, fontWeight: 600,
                            cursor: isDirty && !saving ? 'pointer' : 'not-allowed',
                            transition: 'background var(--dur-base), color var(--dur-base)',
                          }}
                        >
                          {saving && (
                            <div style={{
                              width: 16, height: 16,
                              border: '2px solid currentColor',
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              animation: 'spin 0.6s linear infinite',
                              flexShrink: 0,
                            }} />
                          )}
                          설정 저장
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* 알림 설정 */}
                <section
                  id="notifications"
                  ref={el => { sectionRefs.current['notifications'] = el }}
                >
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>알림 설정</h2>
                  <div style={{ ...card, padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
                    알림 설정 기능이 곧 추가돼요.
                  </div>
                </section>

                {/* 계정 보안 */}
                <section
                  id="security"
                  ref={el => { sectionRefs.current['security'] = el }}
                >
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>계정 보안</h2>
                  <div style={{ ...card, padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
                    계정 보안 설정이 곧 추가돼요.
                  </div>
                </section>

                {/* 로그아웃 */}
                <section
                  id="logout-section"
                  ref={el => { sectionRefs.current['logout-section'] = el }}
                  style={{ paddingBottom: 'var(--tab-bar-h)' }}
                >
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>로그아웃</h2>
                  <div style={card}>
                    <p style={{ color: 'var(--fg-2)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                      로그아웃하면 현재 기기의 세션이 종료돼요.
                    </p>
                    <button
                      onClick={() => setShowLogoutDialog(true)}
                      style={{
                        padding: '11px 28px', borderRadius: 'var(--radius-md)',
                        background: 'rgba(232,84,122,0.10)',
                        border: '1px solid rgba(232,84,122,0.24)',
                        color: 'var(--danger)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      로그아웃
                    </button>
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

/* ── Sub-components ───────────────────────────────────────────── */

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 'var(--radius-pill)',
        background: active ? 'rgba(245,166,35,0.14)' : 'var(--surface-2)',
        border: `1px solid ${active ? 'var(--border-amber)' : 'var(--border)'}`,
        color: active ? 'var(--primary)' : 'var(--fg-2)',
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: 'pointer', lineHeight: 1,
        transition: 'all var(--dur-fast)',
      }}
    >
      {label}
    </button>
  )
}

function ProfileSidebarSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <Skeleton width={72} height={72} borderRadius="50%" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
        <Skeleton width={100} height={18} />
        <Skeleton width={150} height={14} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%' }}>
        <Skeleton height={52} />
        <Skeleton height={52} />
        <Skeleton height={52} />
      </div>
      <Skeleton width="100%" height={42} borderRadius="var(--radius-md)" />
    </div>
  )
}

function SettingCardSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
    }}>
      <Skeleton width={80} height={18} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} width={50 + (i % 3) * 20} height={30} borderRadius="var(--radius-pill)" />
        ))}
      </div>
    </div>
  )
}
