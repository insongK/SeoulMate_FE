'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CourseCard } from '@/components/course/course-card'
import { CourseFilter } from '@/components/course/course-filter'
import { CourseCardSkeleton } from '@/components/ui/skeleton'
import { recommendCourses, toggleSaveCourse } from '@/queries/course.queries'
import type { Course, FilterState, PlaceType } from '@/types/course.types'
import { DEFAULT_FILTER } from '@/types/course.types'

/* ── helpers ─────────────────────────────────────────────────── */

function applyFilters(courses: Course[], filter: FilterState): Course[] {
  let result = [...courses]

  if (filter.placeTypes.length > 0) {
    result = result.filter(c =>
      c.places.some(p => p.category && filter.placeTypes.includes(p.category as PlaceType))
    )
  }

  if (filter.transportation !== 'mixed') {
    result = result.filter(c => c.transportation === filter.transportation)
  }

  if (filter.sort === 'budget') {
    result.sort((a, b) => a.totalBudget - b.totalBudget)
  } else if (filter.sort === 'congestion') {
    const order: Record<string, number> = { low: 0, medium: 1, high: 2, unknown: 3 }
    result.sort((a, b) => (order[a.congestion] ?? 3) - (order[b.congestion] ?? 3))
  }

  return result
}

/* ── chip ──────────────────────────────────────────────────── */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 'var(--radius-pill)',
      background: 'rgba(245,166,35,0.12)', border: '1px solid var(--border-amber)',
      fontSize: 12, fontWeight: 500, color: 'var(--primary)',
      flexShrink: 0,
    }}>
      {label}
      <button
        onClick={onRemove}
        aria-label={`${label} 필터 제거`}
        style={{
          width: 14, height: 14, borderRadius: '50%',
          border: 'none', background: 'rgba(245,166,35,0.25)',
          color: 'var(--primary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 900, padding: 0, lineHeight: 1,
          fontFamily: 'var(--font-sans)',
        }}
      >
        ×
      </button>
    </div>
  )
}

/* ── view toggle ─────────────────────────────────────────────── */

function ViewToggle({ mode, onChange }: { mode: 'grid' | 'list'; onChange: (m: 'grid' | 'list') => void }) {
  return (
    <div style={{
      display: 'flex', borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)', overflow: 'hidden',
    }}>
      {(['grid', 'list'] as const).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-label={m === 'grid' ? '그리드 보기' : '리스트 보기'}
          style={{
            width: 36, height: 36,
            border: 'none',
            borderRight: m === 'grid' ? '1px solid var(--border)' : 'none',
            background: mode === m ? 'rgba(245,166,35,0.12)' : 'transparent',
            outline: mode === m ? '1px solid var(--border-amber)' : 'none',
            outlineOffset: -1,
            color: mode === m ? 'var(--primary)' : 'var(--fg-3)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
            transition: 'all var(--dur-fast) var(--ease-out)',
          }}
        >
          {m === 'grid' ? '⊞' : '☰'}
        </button>
      ))}
    </div>
  )
}

/* ── mobile filter drawer ────────────────────────────────────── */

function FilterDrawer({
  open, filter, onChange, onReset, onClose,
}: {
  open: boolean
  filter: FilterState
  onChange: (f: FilterState) => void
  onReset: () => void
  onClose: () => void
}) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'var(--scrim)', zIndex: 40,
            animation: 'fade-up 0.2s ease both',
          }}
        />
      )}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          boxShadow: 'var(--shadow-sheet)',
          padding: '0 20px 40px',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform var(--dur-slow) var(--ease-out)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{
          width: 40, height: 4, borderRadius: 'var(--radius-pill)',
          background: 'var(--border-strong)', margin: '12px auto 20px',
        }} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>필터</span>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, border: 'none', background: 'transparent',
              color: 'var(--fg-2)', cursor: 'pointer', fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
        <CourseFilter filter={filter} onChange={onChange} onReset={onReset} />
      </div>
    </>
  )
}

/* ── empty state ─────────────────────────────────────────────── */

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', gap: 16, textAlign: 'center',
    }}>
      <div style={{ fontSize: 40 }}>🔍</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>
        조건에 맞는 코스가 없어요
      </div>
      <div style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6 }}>
        필터를 초기화하거나 조건을 바꿔보세요
      </div>
      <button
        onClick={onReset}
        style={{
          marginTop: 8, height: 44, padding: '0 24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-amber)',
          background: 'rgba(245,166,35,0.10)',
          color: 'var(--primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        필터 초기화
      </button>
    </div>
  )
}

/* ── error state ─────────────────────────────────────────────── */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', gap: 16, textAlign: 'center',
    }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>
        코스를 불러오지 못했어요
      </div>
      <div style={{ fontSize: 14, color: 'var(--fg-2)' }}>잠시 후 다시 시도해주세요</div>
      <button
        onClick={onRetry}
        style={{
          marginTop: 8, height: 44, padding: '0 24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
          color: 'var(--fg)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        다시 시도하기
      </button>
    </div>
  )
}

/* ── main ─────────────────────────────────────────────────────── */

function ResultPageInner() {
  const searchParams = useSearchParams()

  const [isDark, setIsDark] = useState(true)
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterOpen, setFilterOpen] = useState(false)

  const [courses, setCourses]   = useState<Course[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  /* read theme from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem('seoulmate-theme')
    if (stored) setIsDark(stored === 'dark')
    else setIsDark(!window.matchMedia('(prefers-color-scheme: light)').matches)
  }, [])

  /* build input chips from URL params */
  const inputChips = useMemo(() => {
    const chips: { label: string; key: string }[] = []
    const region  = searchParams.get('region')
    const budget  = searchParams.get('budget')
    const duration = searchParams.get('duration')
    const vibes   = searchParams.get('vibes')
    if (region)   chips.push({ label: `📍 ${region}`, key: 'region' })
    if (budget)   chips.push({ label: `₩ ${budget}`, key: 'budget' })
    if (duration) chips.push({ label: `⏱ ${duration}`, key: 'duration' })
    if (vibes)    vibes.split(',').forEach(v => chips.push({ label: v.trim(), key: `vibe_${v}` }))
    return chips
  }, [searchParams])

  /* active filter chips */
  const filterChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = []

    if (filter.sort !== 'recommended') {
      const labels = { budget: '비용 낮은순', congestion: '혼잡도 낮은순' }
      chips.push({
        label: labels[filter.sort as keyof typeof labels],
        onRemove: () => setFilter(f => ({ ...f, sort: 'recommended' })),
      })
    }
    filter.placeTypes.forEach(t => {
      chips.push({
        label: t,
        onRemove: () => setFilter(f => ({ ...f, placeTypes: f.placeTypes.filter(x => x !== t) })),
      })
    })
    if (filter.transportation !== 'mixed') {
      const labels = { walk: '도보', transit: '대중교통' }
      chips.push({
        label: labels[filter.transportation as keyof typeof labels],
        onRemove: () => setFilter(f => ({ ...f, transportation: 'mixed' })),
      })
    }
    return chips
  }, [filter])

  /* fetch */
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)

    const cacheKey = `course-cache:${searchParams.toString()}`
    const CACHE_TTL = 5 * 60 * 1000 // 5분

    // 캐시 확인 (재시도 버튼은 fetchKey를 올려 캐시를 건너뜀)
    if (fetchKey === 0) {
      try {
        const raw = sessionStorage.getItem(cacheKey)
        if (raw) {
          const { courses: cached, ts } = JSON.parse(raw)
          if (Date.now() - ts < CACHE_TTL) {
            setCourses(cached)
            setLoading(false)
            return
          }
        }
      } catch { /* sessionStorage 접근 실패는 무시 */ }
    }

    try {
      const vibesRaw = searchParams.get('vibes') ?? ''
      const data = await recommendCourses({
        vibes:    vibesRaw ? vibesRaw.split(',').map(v => v.trim()) : [],
        region:   searchParams.get('region') ?? '',
        budget:   Number(searchParams.get('budget') ?? 80000),
        duration: searchParams.get('duration') ?? 'half-day',
        purpose:  searchParams.get('purpose') ?? undefined,
        query:    searchParams.get('query') ?? undefined,
      })
      setCourses(data.courses)
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ courses: data.courses, ts: Date.now() }))
      } catch { /* 저장 실패는 무시 */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : '코스를 불러오는 데 실패했어요.')
    } finally {
      setLoading(false)
    }
  }, [searchParams, fetchKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchCourses() }, [fetchCourses])

  /* optimistic save toggle */
  const handleSaveToggle = useCallback(async (id: string, save: boolean) => {
    setCourses(prev =>
      prev.map(c => c.id === id ? { ...c, isSaved: save } : c)
    )
    try {
      await toggleSaveCourse(id, save)
    } catch {
      setCourses(prev =>
        prev.map(c => c.id === id ? { ...c, isSaved: !save } : c)
      )
    }
  }, [])

  const displayCourses = useMemo(() => applyFilters(courses, filter), [courses, filter])

  const resetFilter = () => setFilter(DEFAULT_FILTER)
  const allChips = [...inputChips.map(c => ({ label: c.label, onRemove: () => {} })), ...filterChips]

  /* ── render ── */
  return (
    <div
      data-theme={isDark ? 'dark' : 'light'}
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--fg)',
      }}
    >
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .result-card-grid { animation: fade-up 0.4s var(--ease-out) both; }
      `}</style>

      {/* ── Page header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--overlay)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 var(--content-padding)',
      }}>
        <div style={{
          maxWidth: 'var(--max-content-width)', margin: '0 auto',
          height: 'var(--top-nav-h)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <a
            href="/input"
            aria-label="뒤로"
            style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--fg)', cursor: 'pointer', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}
          >
            ←
          </a>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--fg)', margin: 0 }}>
              추천 코스
            </h1>
          </div>
          {/* Mobile filter button */}
          <button
            onClick={() => setFilterOpen(true)}
            style={{
              display: 'flex',
              height: 36, padding: '0 14px', gap: 6,
              alignItems: 'center',
              borderRadius: 'var(--radius-sm)',
              border: filterChips.length > 0 ? '1px solid var(--border-amber)' : '1px solid var(--border)',
              background: filterChips.length > 0 ? 'rgba(245,166,35,0.08)' : 'var(--surface)',
              color: filterChips.length > 0 ? 'var(--primary)' : 'var(--fg-2)',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              fontFamily: 'var(--font-sans)',
            }}
            className="lg:hidden"
          >
            ⚙ 필터{filterChips.length > 0 ? ` (${filterChips.length})` : ''}
          </button>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        maxWidth: 'var(--max-content-width)', margin: '0 auto',
        padding: '0 var(--content-padding)',
        display: 'flex', gap: 32, alignItems: 'flex-start',
      }}>

        {/* ── Sidebar (desktop) ── */}
        <aside
          className="hidden lg:block"
          style={{
            width: 260, flexShrink: 0,
            position: 'sticky', top: 'calc(var(--top-nav-h) + 24px)',
            paddingTop: 24,
          }}
        >
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 20px 4px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>필터</span>
              {filterChips.length > 0 && (
                <button
                  onClick={resetFilter}
                  style={{
                    border: 'none', background: 'none',
                    color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  초기화
                </button>
              )}
            </div>
            <CourseFilter filter={filter} onChange={setFilter} onReset={resetFilter} />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, minWidth: 0, paddingTop: 24, paddingBottom: 'calc(var(--tab-bar-h) + 24px)' }}>

          {/* Result count + chips */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--fg-2)', marginBottom: 10 }}>
              {loading
                ? '코스를 찾고 있어요...'
                : `${displayCourses.length}개의 코스를 찾았어요`
              }
            </div>

            {/* Filter chips row */}
            {allChips.length > 0 && (
              <div style={{
                display: 'flex', gap: 8, flexWrap: 'wrap',
                alignItems: 'center',
              }}>
                {inputChips.map(c => (
                  <div
                    key={c.key}
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '5px 12px', borderRadius: 'var(--radius-pill)',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      fontSize: 12, color: 'var(--fg-2)',
                    }}
                  >
                    {c.label}
                  </div>
                ))}
                {filterChips.map((c, i) => (
                  <FilterChip key={i} label={c.label} onRemove={c.onRemove} />
                ))}
              </div>
            )}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
              gap: 14,
            }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <ErrorState onRetry={() => setFetchKey(k => k + 1)} />
          )}

          {/* Empty */}
          {!loading && !error && displayCourses.length === 0 && (
            <EmptyState onReset={resetFilter} />
          )}

          {/* Course grid/list */}
          {!loading && !error && displayCourses.length > 0 && (
            <div
              className="result-card-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                gap: 14,
              }}
            >
              {displayCourses.map((course, i) => (
                <div
                  key={course.id}
                  style={{ animation: `fade-up 0.4s ${i * 60}ms var(--ease-out) both` }}
                >
                  <CourseCard
                    course={course}
                    viewMode={viewMode}
                    onSaveToggle={handleSaveToggle}
                    href={`/result/${course.id}?budget=${searchParams.get('budget') ?? ''}`}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer
        open={filterOpen}
        filter={filter}
        onChange={setFilter}
        onReset={resetFilter}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultPageInner />
    </Suspense>
  )
}
