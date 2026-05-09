'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadKakaoMaps } from '@/lib/kakao'
import { getMidpoint, totalDistance, walkingMinutes } from '@/utils/map'
import type { Course, Congestion } from '@/types/course.types'

/* ── Mock data ─────────────────────────────────────────────────── */
function mockCourse(id: string): Course {
  return {
    id, title: '한강 야경 로맨틱 데이트',
    description: '해질녘 한강에서 시작해 성수·한남을 거쳐 반포 분수로 마무리하는 4시간 감성 코스',
    totalDuration: '4시간', durationMinutes: 240,
    totalCost: 92000, totalBudget: 92000, userBudget: 100000,
    vibes: ['로맨틱', '야경'], region: '한강',
    transportation: 'transit', congestion: 'mid', isSaved: false,
    places: [
      { id: 'p1', order: 1, name: '뚝섬 한강공원', category: '공원',
        description: '넓은 잔디밭과 한강 뷰가 아름다운 공원',
        reason: '해질녘 노을이 가장 아름다운 포인트예요. 피크닉 매트를 깔고 여유롭게 시작하기 좋고, 자전거 대여도 가능해 활동적인 시간을 보낼 수 있어요.',
        duration: 60, cost: 15000, congestion: 'medium', lat: 37.5271, lng: 127.0652 },
      { id: 'p2', order: 2, name: '성수 감성 카페', category: '카페',
        description: '인더스트리얼 인테리어의 트렌디한 루프탑 카페',
        reason: '성수 특유의 힙한 분위기와 루프탑 뷰가 멋져서 데이트 사진 찍기 최고예요. SNS 핫플로 예약 필수예요.',
        duration: 60, cost: 22000, congestion: 'high', lat: 37.5443, lng: 127.0557 },
      { id: 'p3', order: 3, name: '한남동 파인다이닝', category: '레스토랑',
        description: '야경 뷰 창가 자리가 유명한 이탈리안 레스토랑',
        reason: '야경이 보이는 창가 자리에서 분위기 있는 저녁 식사를 즐길 수 있어요. 와인 페어링 코스를 추천해요.',
        duration: 90, cost: 42000, congestion: 'low', lat: 37.5384, lng: 127.0052 },
      { id: 'p4', order: 4, name: '반포 달빛무지개분수', category: '관광',
        description: '세계 최장 교량 분수, 기네스 기록 보유',
        reason: '밤 9시 분수 쇼는 꼭 봐야 할 서울의 명소예요. 로맨틱한 마무리로 완벽하고 사진도 환상적이에요.',
        duration: 30, cost: 13000, congestion: 'medium', lat: 37.5085, lng: 126.9943 },
    ],
  }
}

/* ── Helpers ───────────────────────────────────────────────────── */
function fmtKRW(n: number) { return `₩${n.toLocaleString('ko-KR')}` }
function fmtDur(m: number) {
  const h = Math.floor(m / 60), r = m % 60
  if (!h) return `${r}분`; if (!r) return `${h}시간`; return `${h}시간 ${r}분`
}

const CONGESTION: Record<Congestion, [string, string]> = {
  low:    ['여유', 'var(--success)'],
  medium: ['보통', 'var(--warning)'],
  high:   ['혼잡', 'var(--danger)'],
}

/* ── Pin DOM ───────────────────────────────────────────────────── */
function makePinEl(idx: number, total: number, active: boolean): HTMLDivElement {
  const isFirst = idx === 0, isLast = idx === total - 1
  const bg   = isFirst ? 'var(--primary)' : isLast ? 'var(--success)' : 'var(--surface-2)'
  const fg   = isFirst ? 'var(--fg-on-primary)' : isLast ? '#fff' : 'var(--primary)'
  const bdr  = isFirst || isLast ? 'none' : '2px solid var(--primary)'
  const size = active ? 38 : 32
  const glow = active ? '0 0 0 6px rgba(245,166,35,0.35), 0 4px 16px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.4)'

  const el = document.createElement('div')
  el.style.cssText = `
    width:${size}px;height:${size}px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    background:${bg};color:${fg};border:${bdr};
    font-size:13px;font-weight:700;cursor:pointer;
    box-shadow:${glow};
    transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    font-family:var(--font-sans);
    transform:${active ? 'scale(1.1)' : 'scale(1)'};
  `
  el.textContent = String(idx + 1)
  return el
}

/* ════════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════════ */
export default function ResultDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = params?.id as string

  const [course,     setCourse]     = useState<Course | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [mapReady,   setMapReady]   = useState(false)
  const [mapError,   setMapError]   = useState(false)
  const [activeStop, setActiveStop] = useState(0)
  const [isSaved,    setIsSaved]    = useState(false)
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [toast,      setToast]      = useState<string | null>(null)
  const [barWidth,   setBarWidth]   = useState(0)

  const mapContRef   = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const pinElemsRef  = useRef<HTMLDivElement[]>([])
  const overlaysRef  = useRef<any[]>([])
  const rightRef     = useRef<HTMLDivElement>(null)
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([])
  const syncLock     = useRef(false)

  /* ── Load data ─────────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => {
      const data = mockCourse(id)
      setCourse(data)
      setIsSaved(data.isSaved)
      setLoading(false)
    }, 700)
    return () => clearTimeout(t)
  }, [id])

  /* ── Budget bar animate ────────────────────────────────────── */
  useEffect(() => {
    if (!course) return
    const t = setTimeout(() => {
      const pct = Math.min((course.totalCost / course.userBudget) * 100, 100)
      setBarWidth(pct)
    }, 200)
    return () => clearTimeout(t)
  }, [course])

  /* ── Init Kakao Maps ───────────────────────────────────────── */
  useEffect(() => {
    if (!course || loading) return
    loadKakaoMaps()
      .then(() => { initMap(course); setMapReady(true) })
      .catch(() => setMapError(true))
  }, [course, loading])

  const initMap = useCallback((c: Course) => {
    if (!mapContRef.current || !(window as any).kakao?.maps) return
    const kakao  = (window as any).kakao
    const coords = c.places.map(p => ({ lat: p.lat, lng: p.lng }))
    const mid    = getMidpoint(coords)

    const map = new kakao.maps.Map(mapContRef.current, {
      center: new kakao.maps.LatLng(mid.lat, mid.lng),
      level: 7,
    })
    mapRef.current = map

    /* pins */
    pinElemsRef.current = []
    overlaysRef.current = []
    c.places.forEach((place, i) => {
      const el = makePinEl(i, c.places.length, i === 0)
      el.addEventListener('click', () => handlePinClick(i))
      pinElemsRef.current.push(el)

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(place.lat, place.lng),
        content: el,
        yAnchor: 1.4,
      })
      overlay.setMap(map)
      overlaysRef.current.push(overlay)
    })

    /* polyline */
    new kakao.maps.Polyline({
      path: coords.map(c => new kakao.maps.LatLng(c.lat, c.lng)),
      strokeWeight: 3,
      strokeColor: '#F5A623',
      strokeOpacity: 0.85,
      strokeStyle: 'dashed',
    }).setMap(map)

    /* dark overlay div */
    if (mapContRef.current) {
      const dark = document.createElement('div')
      dark.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.35);pointer-events:none;z-index:1'
      mapContRef.current.style.position = 'relative'
      mapContRef.current.appendChild(dark)
    }
  }, [])

  /* ── Update pin styles when active changes ─────────────────── */
  useEffect(() => {
    if (!course) return
    pinElemsRef.current.forEach((el, i) => {
      const isFirst = i === 0, isLast = i === course.places.length - 1
      const active  = i === activeStop
      const bg   = isFirst ? 'var(--primary)' : isLast ? 'var(--success)' : 'var(--surface-2)'
      const fg   = isFirst ? 'var(--fg-on-primary)' : isLast ? '#fff' : 'var(--primary)'
      const bdr  = isFirst || isLast ? 'none' : '2px solid var(--primary)'
      const size = active ? 38 : 32
      const glow = active
        ? '0 0 0 6px rgba(245,166,35,0.35), 0 4px 16px rgba(0,0,0,0.5)'
        : '0 2px 8px rgba(0,0,0,0.4)'
      Object.assign(el.style, {
        width: `${size}px`, height: `${size}px`,
        background: bg, color: fg, border: bdr,
        boxShadow: glow,
        transform: active ? 'scale(1.1)' : 'scale(1)',
      })
    })
  }, [activeStop, course])

  /* ── Intersection observer — scroll sync ───────────────────── */
  useEffect(() => {
    if (!course || !rightRef.current) return
    const root = rightRef.current
    const obs  = new IntersectionObserver(
      entries => {
        if (syncLock.current) return
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.findIndex(r => r === entry.target)
            if (idx !== -1) setActiveStop(idx)
          }
        })
      },
      { root, threshold: 0.5 },
    )
    cardRefs.current.forEach(r => r && obs.observe(r))
    return () => obs.disconnect()
  }, [course])

  /* ── Handlers ──────────────────────────────────────────────── */
  function handleTabClick(idx: number) {
    setActiveStop(idx)
    if (mapRef.current && course) {
      const p = course.places[idx]
      const kakao = (window as any).kakao
      mapRef.current.panTo(new kakao.maps.LatLng(p.lat, p.lng))
    }
    syncLock.current = true
    cardRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { syncLock.current = false }, 800)
  }

  function handlePinClick(idx: number) {
    setActiveStop(idx)
    syncLock.current = true
    cardRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { syncLock.current = false }, 800)
  }

  function handleSave() {
    const next = !isSaved
    setIsSaved(next)
    showToast(next ? '코스를 저장했어요' : '저장을 취소했어요')
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share && course) {
      try {
        await navigator.share({ title: course.title, text: course.description, url })
        return
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(url).catch(() => {})
    showToast('링크가 복사됐어요')
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  /* ── Map stats pill ────────────────────────────────────────── */
  function DistancePill() {
    if (!course) return null
    const coords  = course.places.map(p => ({ lat: p.lat, lng: p.lng }))
    const dist    = totalDistance(coords)
    const walkMin = walkingMinutes(dist)
    const km      = (dist / 1000).toFixed(1)
    return (
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(13,13,13,0.88)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 'var(--radius-pill)',
        padding: '6px 14px',
        display: 'flex', gap: 12, alignItems: 'center',
        fontSize: 12, fontWeight: 600, color: 'var(--fg-2)',
        whiteSpace: 'nowrap',
        boxShadow: 'var(--shadow-card)',
      }}>
        <span style={{ color: 'var(--primary)' }}>📍 {km}km</span>
        <span style={{ width: 1, height: 12, background: 'var(--border)' }}/>
        <span>도보 약 {walkMin}분</span>
      </div>
    )
  }

  /* ── Loading skeleton ──────────────────────────────────────── */
  if (loading) return <LoadingSkeleton />

  /* ── 404 handled by mock (would redirect in real impl) ─────── */
  if (!course) return null

  const overBudget = course.totalCost > course.userBudget

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn {
          from{opacity:0;transform:translateX(-50%) translateY(12px)}
          to{opacity:1;transform:translateX(-50%) translateY(0)}
        }
        .stop-tab { transition: all .2s var(--ease-out); }
        .stop-tab:hover { background: var(--surface-2) !important; }
        .card-expand { transition: max-height .35s var(--ease-out), opacity .25s; overflow:hidden; }
        @media (max-width: 900px) {
          .detail-layout { flex-direction: column !important; height: auto !important; overflow: visible !important; }
          .detail-left  { width: 100% !important; height: auto !important; position: relative !important; }
          .detail-map   { height: 42vh !important; }
          .detail-right { height: auto !important; overflow-y: visible !important; }
        }
      `}</style>

      {/* ── Layout ─────────────────────────────────────────────── */}
      <div className="detail-layout" style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: 'var(--bg)', fontFamily: 'var(--font-sans)',
      }}>

        {/* ══ LEFT PANEL ══════════════════════════════════════ */}
        <div className="detail-left" style={{
          width: '55%', height: '100vh', display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--border)',
          position: 'sticky', top: 0,
        }}>

          {/* Map area */}
          <div className="detail-map" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {mapError ? (
              <MapErrorState />
            ) : (
              <>
                <div ref={mapContRef} style={{ width: '100%', height: '100%' }}/>
                {!mapReady && <MapLoadingSkeleton />}
                {mapReady && <DistancePill />}
              </>
            )}
          </div>

          {/* Stop tabs */}
          <div style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '12px 16px',
            display: 'flex', gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            flexShrink: 0,
          }}>
            {course.places.map((place, i) => {
              const isActive  = i === activeStop
              const isFirst   = i === 0
              const isLast    = i === course.places.length - 1
              const accentClr = isFirst ? 'var(--primary)' : isLast ? 'var(--success)' : 'var(--primary)'
              return (
                <button
                  key={place.id}
                  className="stop-tab"
                  onClick={() => handleTabClick(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', borderRadius: 'var(--radius-md)',
                    border: isActive ? `1.5px solid ${accentClr}` : '1.5px solid var(--border)',
                    background: isActive ? `${accentClr}18` : 'transparent',
                    color: isActive ? accentClr : 'var(--fg-2)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    transition: 'all .2s var(--ease-out)',
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? accentClr : 'var(--surface-3)',
                    color: isActive ? (isFirst ? 'var(--fg-on-primary)' : '#fff') : 'var(--fg-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }}>{place.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════════════ */}
        <div className="detail-right" ref={rightRef} style={{
          flex: 1, height: '100vh', overflowY: 'auto',
          background: 'var(--bg)',
        }}>
          <div style={{ padding: '24px 28px 80px' }}>

            {/* Back */}
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--fg-3)', fontSize: 13, fontFamily: 'inherit',
                marginBottom: 20, padding: '4px 0',
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              결과 목록으로
            </button>

            {/* ── Course header ────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              {/* Vibe chips */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {course.vibes.map(v => (
                  <span key={v} style={{
                    padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                    background: 'rgba(245,166,35,0.12)', color: 'var(--primary)',
                    fontSize: 11, fontWeight: 600,
                  }}>{v}</span>
                ))}
                <span style={{
                  padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                  background: 'var(--surface-2)', color: 'var(--fg-3)',
                  fontSize: 11, fontWeight: 500,
                }}>📍 {course.region}</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 800,
                color: 'var(--fg)', letterSpacing: '-.02em', lineHeight: 1.25,
                marginBottom: 8,
              }}>{course.title}</h1>

              <p style={{
                fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.65,
                marginBottom: 20,
              }}>{course.description}</p>

              {/* Stats row */}
              <div style={{
                display: 'flex', gap: 0, flexWrap: 'wrap',
                background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)', overflow: 'hidden',
                marginBottom: 16,
              }}>
                {[
                  ['장소', `${course.places.length}곳`],
                  ['소요시간', fmtDur(course.durationMinutes)],
                  ['총비용', fmtKRW(course.totalCost)],
                ].map(([label, value], i) => (
                  <div key={label} style={{
                    flex: 1, padding: '14px 16px', minWidth: 80,
                    borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', fontFamily: label === '총비용' ? 'var(--font-mono)' : 'inherit' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {/* Save */}
                <button onClick={handleSave} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${isSaved ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSaved ? 'rgba(232,84,122,0.08)' : 'transparent',
                  color: isSaved ? 'var(--accent)' : 'var(--fg-2)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  transition: 'all .2s var(--ease-out)',
                }}>
                  <svg width={15} height={15} viewBox="0 0 24 24"
                    fill={isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  저장
                </button>
                {/* Share */}
                <button onClick={handleShare} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)',
                  background: 'transparent', color: 'var(--fg-2)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                }}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  공유
                </button>
                {/* Navigate */}
                <button
                  onClick={() => router.push(`/result/${id}/navigate`)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 'var(--radius-md)',
                    border: 'none', background: 'var(--grad-amber)',
                    color: 'var(--fg-on-primary)',
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
                    transition: 'all .2s var(--ease-out)',
                  }}
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  코스 시작
                </button>
              </div>
            </div>

            {/* ── Timeline ────────────────────────────────── */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{
                fontSize: 13, fontWeight: 700, color: 'var(--fg-3)',
                letterSpacing: '.10em', textTransform: 'uppercase',
                marginBottom: 16,
              }}>코스 일정</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {course.places.map((place, i) => {
                  const isActive   = i === activeStop
                  const isExpanded = expanded === place.id
                  const isLast     = i === course.places.length - 1
                  const [cLabel, cColor] = CONGESTION[place.congestion ?? 'medium']

                  return (
                    <div key={place.id} style={{ display: 'flex', gap: 0 }}>
                      {/* Timeline line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 14, flexShrink: 0 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: i === 0 ? 'var(--primary)' : isLast ? 'var(--success)' : (isActive ? 'rgba(245,166,35,0.15)' : 'var(--surface-2)'),
                          border: i === 0 || isLast ? 'none' : `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                          color: i === 0 ? 'var(--fg-on-primary)' : isLast ? '#fff' : (isActive ? 'var(--primary)' : 'var(--fg-3)'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, marginTop: 4,
                          transition: 'all .25s',
                        }}>{i + 1}</div>
                        {!isLast && (
                          <div style={{
                            flex: 1, width: 2, minHeight: 24,
                            background: isActive ? 'var(--primary)' : 'var(--border)',
                            borderRadius: 1, marginTop: 4,
                            transition: 'background .25s',
                          }}/>
                        )}
                      </div>

                      {/* Card */}
                      <div
                        ref={el => { cardRefs.current[i] = el }}
                        id={`stop-${place.id}`}
                        onClick={() => {
                          setExpanded(isExpanded ? null : place.id)
                          if (!isActive) handleTabClick(i)
                        }}
                        style={{
                          flex: 1, marginBottom: isLast ? 0 : 4,
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-lg)',
                          border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                          borderLeft: isActive ? '3px solid var(--primary)' : '1px solid var(--border)',
                          background: isActive ? 'rgba(245,166,35,0.04)' : 'var(--surface)',
                          cursor: 'pointer',
                          transition: 'all .25s var(--ease-out)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <span style={{
                                fontSize: 15, fontWeight: 700, color: 'var(--fg)',
                              }}>{place.name}</span>
                              <span style={{
                                padding: '1px 7px', borderRadius: 'var(--radius-pill)',
                                background: 'var(--surface-3)', color: 'var(--fg-3)',
                                fontSize: 11, fontWeight: 500,
                              }}>{place.category}</span>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>{place.description}</p>
                          </div>
                          <svg
                            width={16} height={16} viewBox="0 0 24 24" fill="none"
                            stroke="var(--fg-3)" strokeWidth={2} strokeLinecap="round"
                            style={{ flexShrink: 0, marginLeft: 8, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .25s' }}
                          >
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>

                        {/* Meta row */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {fmtDur(place.duration ?? 0)}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
                            {fmtKRW(place.cost ?? 0)}
                          </span>
                          <span style={{
                            padding: '2px 7px', borderRadius: 'var(--radius-pill)',
                            background: `${cColor}18`, color: cColor,
                            fontSize: 11, fontWeight: 600,
                          }}>{cLabel}</span>
                        </div>

                        {/* Expandable reason */}
                        <div className="card-expand" style={{
                          maxHeight: isExpanded ? 200 : 0,
                          opacity: isExpanded ? 1 : 0,
                        }}>
                          <div style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: '1px solid var(--border)',
                            fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.7,
                          }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginRight: 6 }}>AI 추천 이유</span>
                            {place.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Budget bar ──────────────────────────────── */}
            <div style={{
              padding: '20px', background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>예산 사용</span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: overBudget ? 'var(--danger)' : 'var(--primary)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {fmtKRW(course.totalCost)} / {fmtKRW(course.userBudget)}
                  {overBudget && (
                    <span style={{ fontSize: 11, marginLeft: 6 }}>
                      초과 +{fmtKRW(course.totalCost - course.userBudget)}
                    </span>
                  )}
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 'var(--radius-pill)',
                  width: `${barWidth}%`,
                  background: overBudget ? 'var(--danger)' : 'var(--grad-amber)',
                  transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)',
                }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--fg-3)' }}>
                <span>₩0</span><span>{fmtKRW(course.userBudget)}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Toast ────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 88, left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-pill)',
          padding: '10px 20px',
          fontSize: 13, fontWeight: 600, color: 'var(--fg)',
          boxShadow: 'var(--shadow-card)',
          zIndex: 100,
          animation: 'toastIn .25s var(--ease-out) both',
          whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}
    </>
  )
}

/* ── Sub-components ────────────────────────────────────────────── */
function MapLoadingSkeleton() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function MapErrorState() {
  const [retrying, setRetrying] = useState(false)
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--surface)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
    }}>
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth={1.5} strokeLinecap="round">
        <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 1 1 16 0z"/>
        <circle cx="12" cy="10" r="3"/>
        <line x1="4" y1="4" x2="20" y2="20" stroke="var(--danger)"/>
      </svg>
      <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>지도를 불러올 수 없어요</span>
      <button
        onClick={() => { setRetrying(true); window.location.reload() }}
        style={{
          padding: '8px 18px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--fg-2)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
        }}
      >{retrying ? '다시 시도 중…' : '다시 시도'}</button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>

      {/* Left skeleton */}
      <div style={{ width: '55%', height: '100vh', borderRight: '1px solid var(--border)' }}>
        <div style={{
          flex: 1, height: 'calc(100% - 80px)',
          background: 'var(--surface)',
          animation: 'pulse 1.6s ease-in-out infinite',
        }}/>
        <div style={{ height: 80, padding: '14px 16px', display: 'flex', gap: 8, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 40, width: 100, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', animation: 'pulse 1.6s ease-in-out infinite' }}/>
          ))}
        </div>
      </div>

      {/* Right skeleton */}
      <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ height: 16, width: 120, borderRadius: 8, background: 'var(--surface-2)', animation: 'pulse 1.6s ease-in-out infinite' }}/>
        <div style={{ height: 28, width: '80%', borderRadius: 8, background: 'var(--surface-2)', animation: 'pulse 1.6s ease-in-out infinite' }}/>
        <div style={{ height: 14, width: '60%', borderRadius: 8, background: 'var(--surface-2)', animation: 'pulse 1.6s ease-in-out infinite' }}/>
        <div style={{ height: 80, borderRadius: 'var(--radius-lg)', background: 'var(--surface)', animation: 'pulse 1.6s ease-in-out infinite' }}/>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: 90, borderRadius: 'var(--radius-lg)', background: 'var(--surface)', animation: 'pulse 1.6s ease-in-out infinite' }}/>
        ))}
      </div>
    </div>
  )
}
