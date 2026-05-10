'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getMyCourses, unsaveCourse } from '@/queries/course.queries'
import { formatKRW } from '@/utils/format'
import type { Course, CongestionLevel } from '@/types/course.types'

/* ── Constants ──────────────────────────────────────────────────── */

const CONGESTION: Record<CongestionLevel, { label: string; color: string; bg: string }> = {
  low:     { label: '여유로워요', color: 'var(--success)', bg: 'rgba(52,199,123,0.12)' },
  medium:  { label: '조금 붐벼요', color: 'var(--warning)', bg: 'rgba(245,166,35,0.12)' },
  high:    { label: '많이 붐벼요', color: 'var(--danger)',  bg: 'rgba(232,84,122,0.12)' },
  unknown: { label: '정보없음',   color: 'var(--fg-3)',    bg: 'rgba(255,255,255,0.06)' },
}

type TabId  = 'all' | 'saved' | 'visited'
type SortId = 'newest' | 'oldest' | 'cost-asc' | 'cost-desc'
type ViewId = 'grid' | 'list'

const PAGE_SIZE = 50

const SORT_OPTIONS: { value: SortId; label: string }[] = [
  { value: 'newest',    label: '최근 저장순' },
  { value: 'oldest',    label: '오래된순' },
  { value: 'cost-asc',  label: '비용 낮은순' },
  { value: 'cost-desc', label: '비용 높은순' },
]

/* ── Congestion Badge ───────────────────────────────────────────── */

function CongestionBadge({ level }: { level: CongestionLevel }) {
  const c = CONGESTION[level] ?? CONGESTION.unknown
  return (
    <span style={{
      fontSize: 10, fontWeight: 700,
      padding: '2px 7px', borderRadius: 'var(--radius-pill)',
      background: c.bg, color: c.color,
      whiteSpace: 'nowrap',
    }}>{c.label}</span>
  )
}

/* ── Grid Card ──────────────────────────────────────────────────── */

function GridCard({
  course, isVisited, onUnsave, onVisitToggle,
}: {
  course: Course
  isVisited: boolean
  onUnsave: (id: string) => void
  onVisitToggle: (id: string) => void
}) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/result/${course.id}`)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        transition: `transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = 'var(--glow-amber)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
    >
      {/* Thumbnail */}
      <div style={{
        height: 108, flexShrink: 0, position: 'relative',
        background: 'var(--grad-amber)', overflow: 'hidden',
      }}>
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--grad-skyline)',
        }} />
        <div style={{
          position: 'absolute', top: 8, left: 8, right: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700,
            padding: '2px 7px', borderRadius: 'var(--radius-pill)',
            background: 'rgba(0,0,0,0.50)',
            backdropFilter: 'blur(6px)',
            color: isVisited ? 'var(--success)' : 'var(--primary)',
          }}>
            {isVisited ? '방문함' : '저장됨'}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onUnsave(course.id) }}
            aria-label="저장 취소"
            style={{
              width: 26, height: 26,
              borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'rgba(0,0,0,0.50)',
              backdropFilter: 'blur(6px)',
              color: 'var(--accent)', cursor: 'pointer', fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >♥</button>
        </div>
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          fontSize: 10, color: 'rgba(255,255,255,0.70)',
        }}>
          {course.places.length}개 장소
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 8px', flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 6,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{course.title}</div>
        <div style={{ marginBottom: 6 }}>
          <CongestionBadge level={course.congestion} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{course.totalDuration}</span>
          <span style={{
            fontSize: 12, fontFamily: 'var(--font-mono)',
            color: 'var(--primary)', fontWeight: 600,
          }}>{formatKRW(course.totalCost)}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '7px 12px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          onClick={e => { e.stopPropagation(); onVisitToggle(course.id) }}
          style={{
            fontSize: 10, padding: 0, background: 'none', border: 'none',
            color: isVisited ? 'var(--success)' : 'var(--fg-3)',
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >{isVisited ? '✓ 방문함' : '+ 방문 표시'}</button>
        <span style={{ fontSize: 11, color: 'var(--fg-2)', pointerEvents: 'none' }}>
          다시 보기 →
        </span>
      </div>
    </div>
  )
}

/* ── List Row ───────────────────────────────────────────────────── */

function ListRow({
  course, isVisited, onUnsave, onVisitToggle,
}: {
  course: Course
  isVisited: boolean
  onUnsave: (id: string) => void
  onVisitToggle: (id: string) => void
}) {
  const router = useRouter()

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => router.push(`/result/${course.id}`)}
      onKeyDown={e => e.key === 'Enter' && router.push(`/result/${course.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', cursor: 'pointer', outline: 'none',
        transition: 'box-shadow var(--dur-base) var(--ease-out)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--glow-amber)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '' }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 72, height: 72, flexShrink: 0,
        background: 'var(--grad-amber)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
      }}>
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{course.title}</div>
        <div style={{
          fontSize: 12, color: 'var(--fg-2)', marginBottom: 6,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {course.description || `${course.places.length}개 장소`}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>⏱ {course.totalDuration}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--primary)', fontWeight: 600,
          }}>{formatKRW(course.totalCost)}</span>
          <CongestionBadge level={course.congestion} />
        </div>
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onVisitToggle(course.id)}
            aria-label={isVisited ? '방문 취소' : '방문 표시'}
            style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: isVisited ? 'rgba(52,199,123,0.10)' : 'transparent',
              color: isVisited ? 'var(--success)' : 'var(--fg-3)',
              cursor: 'pointer', fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✓</button>
          <button
            onClick={() => onUnsave(course.id)}
            aria-label="저장 취소"
            style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'rgba(232,84,122,0.10)',
              color: 'var(--accent)', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >♥</button>
        </div>
        <span style={{ fontSize: 11, color: 'var(--fg-3)', pointerEvents: 'none' }}>
          다시 보기 →
        </span>
      </div>
    </div>
  )
}

/* ── Skeleton (grid shape) ──────────────────────────────────────── */

function GridSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    }}>
      <div style={{
        height: 108, background: 'var(--surface-2)',
        animation: 'pulse 1.6s ease-in-out infinite',
      }} />
      <div style={{ padding: '10px 12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {([70, 50, 40] as const).map((w, i) => (
          <div key={i} style={{
            height: i === 0 ? 14 : 11, width: `${w}%`,
            borderRadius: 6, background: 'var(--surface-2)',
            animation: 'pulse 1.6s ease-in-out infinite',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ── Empty State ────────────────────────────────────────────────── */

function EmptyState({ tab, onNav }: { tab: TabId; onNav: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '80px 24px', gap: 12, textAlign: 'center',
    }}>
      <div style={{ fontSize: 44 }}>
        {tab === 'all' ? '🗺️' : tab === 'saved' ? '🔖' : '📍'}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>
        {tab === 'all' ? '저장한 코스가 없어요' : '아직 해당 코스가 없어요'}
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>
        AI에게 서울 코스를 추천받아보세요
      </div>
      <button
        onClick={onNav}
        style={{
          marginTop: 8, height: 44, padding: '0 24px',
          borderRadius: 'var(--radius-md)', border: 'none',
          background: 'var(--grad-amber)',
          color: 'var(--fg-on-primary)', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}
      >추천받으러 가기</button>
    </div>
  )
}

/* ── Toast ──────────────────────────────────────────────────────── */

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--tab-bar-h) + 16px)',
      left: '50%', transform: 'translateX(-50%)',
      padding: '10px 20px',
      background: 'var(--surface-3)', borderRadius: 'var(--radius-pill)',
      fontSize: 13, color: 'var(--fg)',
      boxShadow: 'var(--shadow-card)',
      zIndex: 100, whiteSpace: 'nowrap',
      animation: 'fadeUp var(--dur-base) var(--ease-out)',
    }}>{message}</div>
  )
}

/* ── Main Page ──────────────────────────────────────────────────── */

export default function HistoryPage() {
  const router     = useRouter()
  const fetchedRef = useRef(false)
  const coursesRef = useRef<Course[]>([])

  const [allCourses,  setAllCourses]  = useState<Course[]>([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [tab,         setTab]         = useState<TabId>('all')
  const [sort,        setSort]        = useState<SortId>('newest')
  const [view,        setView]        = useState<ViewId>('list')
  const [visited,     setVisited]     = useState<Set<string>>(new Set())
  const [toast,       setToast]       = useState<string | null>(null)

  /* Keep ref in sync for optimistic-revert without stale closures */
  useEffect(() => { coursesRef.current = allCourses }, [allCourses])

  /* ── Fetch ──────────────────────────────────────────────────── */
  const fetchPage = useCallback(async (pg: number, append = false) => {
    if (pg === 1) setLoading(true)
    else          setLoadingMore(true)
    setError(null)
    try {
      const result = await getMyCourses(pg, PAGE_SIZE)
      const mapped = result.courses.map(c => ({ ...c, isSaved: true }))
      if (append) {
        setAllCourses(prev => [...prev, ...mapped])
      } else {
        setAllCourses(mapped)
        setTotal(result.total)
        setPage(1)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '오류가 발생했어요'
      if (msg.includes('로그인')) {
        setToast('로그인이 필요해요')
        setTimeout(() => router.push('/login'), 1500)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [router])

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchPage(1)
  }, [fetchPage])

  /* ── Derived state ──────────────────────────────────────────── */
  const tabCounts = useMemo(() => {
    const visitedInList = allCourses.filter(c => visited.has(c.id)).length
    return {
      all:     allCourses.length,
      saved:   allCourses.length - visitedInList,
      visited: visitedInList,
    }
  }, [allCourses, visited])

  const filtered = useMemo(() => {
    let list = allCourses
    if (tab === 'saved')   list = list.filter(c => !visited.has(c.id))
    if (tab === 'visited') list = list.filter(c =>  visited.has(c.id))
    const out = [...list]
    switch (sort) {
      case 'oldest':    out.sort((a, b) => a.id.localeCompare(b.id));         break
      case 'cost-asc':  out.sort((a, b) => a.totalCost - b.totalCost);        break
      case 'cost-desc': out.sort((a, b) => b.totalCost - a.totalCost);        break
      default:          out.sort((a, b) => b.id.localeCompare(a.id));         break
    }
    return out
  }, [allCourses, tab, sort, visited])

  const placeCount = useMemo(
    () => allCourses.reduce((s, c) => s + c.places.length, 0),
    [allCourses]
  )

  const hasMore = allCourses.length < total

  const TABS: { id: TabId; label: string }[] = [
    { id: 'all',     label: '전체'  },
    { id: 'saved',   label: '저장됨' },
    { id: 'visited', label: '방문함' },
  ]

  /* ── Handlers ───────────────────────────────────────────────── */
  const handleUnsave = useCallback(async (id: string) => {
    const snapshot = coursesRef.current.find(c => c.id === id)
    setAllCourses(prev => prev.filter(c => c.id !== id))
    setTotal(t => Math.max(0, t - 1))
    try {
      await unsaveCourse(id)
    } catch {
      if (snapshot) setAllCourses(prev => [...prev, snapshot])
      setTotal(t => t + 1)
      setToast('오류가 발생했어요')
    }
  }, [])

  const handleVisitToggle = useCallback((id: string) => {
    setVisited(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else              next.add(id)
      return next
    })
  }, [])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPage(nextPage, true)
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* ── Sticky header ─────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--overlay)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 'var(--max-content-width)', margin: '0 auto',
          padding: '0 var(--content-padding)',
        }}>

          {/* Title + stats */}
          <div style={{
            height: 'var(--top-nav-h)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg)', margin: 0 }}>
              내 코스
            </h1>
            {!loading && allCourses.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                총 {allCourses.length}개 코스 · {placeCount}개 장소 방문
              </span>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  height: 44, padding: '0 20px',
                  border: 'none', background: 'transparent',
                  borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                  color: tab === t.id ? 'var(--primary)' : 'var(--fg-3)',
                  fontWeight: tab === t.id ? 700 : 500,
                  fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  transition: 'all var(--dur-fast) var(--ease-out)',
                }}
              >
                {t.label}
                {!loading && (
                  <span style={{
                    marginLeft: 5, fontSize: 11, fontWeight: 700,
                    padding: '1px 5px', borderRadius: 'var(--radius-pill)',
                    background: tab === t.id ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.06)',
                    color: tab === t.id ? 'var(--primary)' : 'var(--fg-3)',
                  }}>
                    {tabCounts[t.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort + view toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0',
          }}>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortId)}
              style={{
                height: 32, padding: '0 10px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--fg)', fontSize: 12,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                outline: 'none', appearance: 'none',
              }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 4 }}>
              {(['list', 'grid'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-label={v === 'grid' ? '그리드 보기' : '목록 보기'}
                  style={{
                    width: 32, height: 32,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: view === v ? 'var(--surface-2)' : 'transparent',
                    color: view === v ? 'var(--primary)' : 'var(--fg-3)',
                    cursor: 'pointer', fontSize: 15,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {v === 'grid' ? '⊞' : '☰'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div style={{
        maxWidth: 'var(--max-content-width)', margin: '0 auto',
        padding: '24px var(--content-padding) calc(var(--tab-bar-h) + 32px)',
      }}>

        {/* Loading */}
        {loading && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
          }}>
            {Array.from({ length: 6 }).map((_, i) => <GridSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 12, padding: '80px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 44 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>불러오기 실패</div>
            <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>{error}</div>
            <button
              onClick={() => fetchPage(1)}
              style={{
                marginTop: 8, height: 44, padding: '0 24px',
                borderRadius: 'var(--radius-md)', border: 'none',
                background: 'var(--surface-2)',
                color: 'var(--fg)', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >다시 시도하기</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState tab={tab} onNav={() => router.push('/')} />
        )}

        {/* Course list */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Group header */}
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 16,
            }}>
              저장한 코스
              <span style={{
                marginLeft: 8, fontSize: 12, color: 'var(--fg-3)', fontWeight: 400,
              }}>{filtered.length}개</span>
            </div>

            {/* Cards */}
            {view === 'grid' ? (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
              }}>
                {filtered.map(c => (
                  <GridCard
                    key={c.id} course={c}
                    isVisited={visited.has(c.id)}
                    onUnsave={handleUnsave}
                    onVisitToggle={handleVisitToggle}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(c => (
                  <ListRow
                    key={c.id} course={c}
                    isVisited={visited.has(c.id)}
                    onUnsave={handleUnsave}
                    onVisitToggle={handleVisitToggle}
                  />
                ))}
              </div>
            )}

            {/* 더 보기 */}
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    height: 44, padding: '0 32px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: loadingMore ? 'var(--surface-2)' : 'var(--surface)',
                    color: loadingMore ? 'var(--fg-3)' : 'var(--fg)',
                    fontSize: 14, fontWeight: 600,
                    cursor: loadingMore ? 'default' : 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'background var(--dur-fast) var(--ease-out)',
                  }}
                  onMouseEnter={e => {
                    if (!loadingMore)
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)'
                  }}
                  onMouseLeave={e => {
                    if (!loadingMore)
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'
                  }}
                >
                  {loadingMore ? '불러오는 중…' : `더 보기 (${total - allCourses.length}개 남음)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
