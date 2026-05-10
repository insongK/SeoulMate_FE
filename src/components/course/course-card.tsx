'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadKakaoMaps } from '@/lib/kakao'
import type { Course, CongestionLevel } from '@/types/course.types'
import { skyToEmoji } from '@/components/course/weather-widget'

const CONGESTION: Record<CongestionLevel, { label: string; color: string; bg: string }> = {
  low:     { label: '여유', color: 'var(--success)', bg: 'rgba(52,199,123,0.12)' },
  medium:  { label: '보통', color: 'var(--warning)', bg: 'rgba(245,166,35,0.12)' },
  high:    { label: '혼잡', color: 'var(--danger)',  bg: 'rgba(232,84,122,0.12)' },
  unknown: { label: '정보없음', color: 'var(--fg-3)', bg: 'var(--surface-2)' },
}

/* ── Mini map thumbnail ────────────────────────────────────────── */

function MapThumbnail({ places }: { places: Array<{ lat: number; lng: number }> }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!containerRef.current || places.length === 0) return

    loadKakaoMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return
        const kakao = (window as any).kakao

        const avgLat = places.reduce((s, p) => s + p.lat, 0) / places.length
        const avgLng = places.reduce((s, p) => s + p.lng, 0) / places.length

        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(avgLat, avgLng),
          level: 6,
        })
        map.setDraggable(false)
        map.setZoomable(false)

        places.forEach(place => {
          new kakao.maps.Marker({
            position: new kakao.maps.LatLng(place.lat, place.lng),
            map,
          })
        })

        if (places.length > 1) {
          new kakao.maps.Polyline({
            path: places.map(p => new kakao.maps.LatLng(p.lat, p.lng)),
            strokeWeight: 2,
            strokeColor: '#F5A623',
            strokeOpacity: 0.85,
            strokeStyle: 'solid',
          }).setMap(map)
        }

        setLoaded(true)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        ref={containerRef}
        style={{
          width: '100%', height: '100%',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

/* ── Course card ───────────────────────────────────────────────── */

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
          height: isList ? undefined : 160,
          minHeight: isList ? 96 : undefined,
          flexShrink: 0,
          background: 'var(--grad-amber)',   // 지도 로드 전 fallback
          position: 'relative',
          overflow: 'hidden',
          margin: isList ? 14 : 0,
          borderRadius: isList ? 'var(--radius-md)' : 0,
        }}
      >
        <MapThumbnail places={course.places} />

        {/* 그라디언트 오버레이 (grid 모드만) */}
        {!isList && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(0deg,rgba(13,13,13,0.55) 0%,transparent 55%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* 날씨 뱃지 */}
        {course.weather && (
          <div style={{
            position: 'absolute', top: 8, right: 8, zIndex: 2,
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(13,13,13,0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.10)',
            fontSize: 12, fontWeight: 700, color: '#fff',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 13 }}>{skyToEmoji(course.weather.skyStatus)}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{course.weather.temperature}°</span>
          </div>
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
