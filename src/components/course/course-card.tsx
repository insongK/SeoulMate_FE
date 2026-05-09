'use client'

import { useRouter } from 'next/navigation'
import type { Course, CongestionLevel } from '@/types/course.types'

const CONGESTION: Record<CongestionLevel, { label: string; color: string; bg: string }> = {
  low:     { label: '여유', color: 'var(--success)', bg: 'rgba(52,199,123,0.12)' },
  medium:  { label: '보통', color: 'var(--warning)', bg: 'rgba(245,166,35,0.12)' },
  high:    { label: '혼잡', color: 'var(--danger)',  bg: 'rgba(232,84,122,0.12)' },
  unknown: { label: '정보없음', color: 'var(--fg-3)', bg: 'var(--surface-2)' },
}

interface CourseCardProps {
  course: Course
  viewMode: 'grid' | 'list'
  onSaveToggle: (id: string, saved: boolean) => void
  href?: string
}

export function CourseCard({ course, viewMode, onSaveToggle, href }: CourseCardProps) {
  const router = useRouter()
  const isList = viewMode === 'list'
  const cong = CONGESTION[course.congestion] ?? CONGESTION.unknown

  const navigate = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    router.push(href ?? `/result/${course.id}`)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate()}
      onKeyDown={e => e.key === 'Enter' && navigate()}
      style={{
        display: 'flex',
        flexDirection: isList ? 'row' : 'column',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: `transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)`,
        outline: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--glow-amber)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: isList ? 96 : '100%',
          height: isList ? '100%' : 160,
          minHeight: isList ? 96 : undefined,
          flexShrink: 0,
          background: 'var(--grad-amber)',
          position: 'relative',
          overflow: 'hidden',
          margin: isList ? 14 : 0,
          borderRadius: isList ? 'var(--radius-md)' : 0,
        }}
      >
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
          />
        )}
        {!isList && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(13,13,13,0.5) 0%,transparent 60%)' }} />
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: isList ? '14px 14px 14px 0' : '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          minWidth: 0,
        }}
      >
        {/* AI tag + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 'var(--radius-pill)',
            background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.25)',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--primary)',
          }}>
            ✦ AI
          </span>
          <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>⏱ {course.totalDuration}</span>
          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>· {course.places.length}곳</span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--fg)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {course.title}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: isList ? 1 : 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {course.description}
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>
              ₩{course.totalBudget.toLocaleString()}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: 'var(--radius-pill)',
              fontSize: 11, fontWeight: 600,
              color: cong.color, background: cong.bg,
            }}>
              {cong.label}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={e => { e.stopPropagation(); onSaveToggle(course.id, !course.isSaved) }}
              aria-label={course.isSaved ? '저장 취소' : '저장'}
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: course.isSaved ? 'rgba(232,84,122,0.10)' : 'rgba(255,255,255,0.04)',
                color: course.isSaved ? 'var(--accent)' : 'var(--fg-3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, flexShrink: 0,
                transition: `all var(--dur-fast) var(--ease-out)`,
              }}
            >
              {course.isSaved ? '♥' : '♡'}
            </button>
            <button
              onClick={e => navigate(e)}
              style={{
                height: 36, padding: '0 14px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-amber)',
                background: 'rgba(245,166,35,0.08)', color: 'var(--primary)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                transition: `all var(--dur-fast) var(--ease-out)`,
              }}
            >
              자세히 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
