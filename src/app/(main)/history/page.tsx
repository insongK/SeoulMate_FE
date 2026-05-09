'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getMyCourses, getSavedCourses, toggleSaveCourse } from '@/queries/course.queries'
import type { Course, CongestionLevel } from '@/types/course.types'

/* ── Congestion ───────────────────────────────────────────────── */
const CONGESTION: Record<CongestionLevel, { label: string; color: string }> = {
  low:     { label: '여유', color: 'var(--success)' },
  medium:  { label: '보통', color: 'var(--warning)' },
  high:    { label: '혼잡', color: 'var(--danger)' },
  unknown: { label: '정보없음', color: 'var(--fg-3)' },
}

function fmtKRW(n: number) { return `₩${n.toLocaleString('ko-KR')}` }

/* ── CourseRow ────────────────────────────────────────────────── */
function CourseRow({
  course, onSaveToggle,
}: {
  course: Course
  onSaveToggle: (id: string, save: boolean) => void
}) {
  const router = useRouter()
  const cong = CONGESTION[course.congestion] ?? CONGESTION.unknown

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/result/${course.id}`)}
      onKeyDown={e => e.key === 'Enter' && router.push(`/result/${course.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'box-shadow var(--dur-base) var(--ease-out)',
        outline: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--glow-amber)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Thumbnail placeholder */}
      <div style={{
        width: 72, height: 72, flexShrink: 0,
        background: 'var(--grad-amber)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {course.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {course.description || `${course.places.length}개 장소`}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>⏱ {course.totalDuration}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{fmtKRW(course.totalCost)}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: cong.color }}>{cong.label}</span>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={e => { e.stopPropagation(); onSaveToggle(course.id, !course.isSaved) }}
        aria-label={course.isSaved ? '저장 취소' : '저장'}
        style={{
          width: 36, height: 36, flexShrink: 0,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: course.isSaved ? 'rgba(232,84,122,0.10)' : 'transparent',
          color: course.isSaved ? 'var(--accent)' : 'var(--fg-3)',
          cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {course.isSaved ? '♥' : '♡'}
      </button>
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState({ tab }: { tab: 'my' | 'saved' }) {
  const router = useRouter()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', gap: 12, textAlign: 'center',
    }}>
      <div style={{ fontSize: 40 }}>{tab === 'my' ? '🗺️' : '🔖'}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>
        {tab === 'my' ? '아직 추천받은 코스가 없어요' : '저장한 코스가 없어요'}
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>
        {tab === 'my' ? 'AI에게 코스를 추천받아보세요' : '마음에 드는 코스를 저장해보세요'}
      </div>
      <button
        onClick={() => router.push('/input')}
        style={{
          marginTop: 8, height: 44, padding: '0 24px',
          borderRadius: 'var(--radius-md)',
          border: 'none', background: 'var(--grad-amber)',
          color: 'var(--fg-on-primary)', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}
      >
        코스 추천받기
      </button>
    </div>
  )
}

/* ── Skeleton ─────────────────────────────────────────────────── */
function RowSkeleton() {
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '16px 20px',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
      <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', animation: 'pulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        <div style={{ height: 16, width: '60%', borderRadius: 8, background: 'var(--surface-2)', animation: 'pulse 1.6s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '80%', borderRadius: 8, background: 'var(--surface-2)', animation: 'pulse 1.6s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '40%', borderRadius: 8, background: 'var(--surface-2)', animation: 'pulse 1.6s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

/* ── Pagination ───────────────────────────────────────────────── */
function Pagination({ page, total, pageSize, onPage }: {
  page: number; total: number; pageSize: number; onPage: (p: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
      <button
        onClick={() => onPage(page - 1)} disabled={page <= 1}
        style={{
          height: 36, padding: '0 16px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)', background: 'transparent',
          color: page <= 1 ? 'var(--fg-3)' : 'var(--fg)',
          cursor: page <= 1 ? 'default' : 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
        }}
      >이전</button>
      <span style={{ height: 36, padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--fg-2)' }}>
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)} disabled={page >= totalPages}
        style={{
          height: 36, padding: '0 16px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)', background: 'transparent',
          color: page >= totalPages ? 'var(--fg-3)' : 'var(--fg)',
          cursor: page >= totalPages ? 'default' : 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
        }}
      >다음</button>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function HistoryPage() {
  const [tab,      setTab]      = useState<'my' | 'saved'>('my')
  const [courses,  setCourses]  = useState<Course[]>([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const PAGE_SIZE = 10

  const fetchData = useCallback(async (currentTab: 'my' | 'saved', currentPage: number) => {
    setLoading(true)
    try {
      const result = currentTab === 'my'
        ? await getMyCourses(currentPage, PAGE_SIZE)
        : await getSavedCourses(currentPage, PAGE_SIZE)
      setCourses(result.courses)
      setTotal(result.total)
    } catch {
      setCourses([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    fetchData(tab, 1)
  }, [tab, fetchData])

  useEffect(() => {
    fetchData(tab, page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveToggle = useCallback(async (id: string, save: boolean) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isSaved: save } : c))
    try {
      await toggleSaveCourse(id, save)
      // 저장 탭에서 unsave하면 목록에서 제거
      if (tab === 'saved' && !save) {
        setCourses(prev => prev.filter(c => c.id !== id))
        setTotal(t => Math.max(0, t - 1))
      }
    } catch {
      setCourses(prev => prev.map(c => c.id === id ? { ...c, isSaved: !save } : c))
    }
  }, [tab])

  const handlePage = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--overlay)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 var(--content-padding)',
      }}>
        <div style={{
          maxWidth: 'var(--max-content-width)', margin: '0 auto',
          height: 'var(--top-nav-h)',
          display: 'flex', alignItems: 'center',
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg)', margin: 0 }}>내 코스</h1>
        </div>

        {/* Tabs */}
        <div style={{
          maxWidth: 'var(--max-content-width)', margin: '0 auto',
          display: 'flex', gap: 0,
          borderBottom: '1px solid var(--border)',
        }}>
          {(['my', 'saved'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                height: 44, padding: '0 20px',
                border: 'none', background: 'transparent',
                borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                color: tab === t ? 'var(--primary)' : 'var(--fg-3)',
                fontWeight: tab === t ? 700 : 500,
                fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                transition: 'all var(--dur-fast) var(--ease-out)',
              }}
            >
              {t === 'my' ? '추천받은 코스' : '저장한 코스'}
              {!loading && total > 0 && tab === t && (
                <span style={{
                  marginLeft: 6, fontSize: 11, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                  background: 'rgba(245,166,35,0.15)', color: 'var(--primary)',
                }}>{total}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 'var(--max-content-width)', margin: '0 auto',
        padding: '24px var(--content-padding) calc(var(--tab-bar-h) + 32px)',
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16 }}>
              총 {total}개
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {courses.map(course => (
                <CourseRow key={course.id} course={course} onSaveToggle={handleSaveToggle} />
              ))}
            </div>
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPage={handlePage} />
          </>
        )}
      </div>
    </div>
  )
}
