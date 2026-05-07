'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { VIBES } from '@/constants/vibe'
import { REGIONS, QUICK_REGIONS } from '@/constants/region'
import { PRESETS, type Preset } from '@/constants/preset'

/* ── Icons ───────────────────────────────────────────────────── */
function IconSearch({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
    </svg>
  )
}
function IconMic({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <path d="M12 19v3"/>
    </svg>
  )
}
function IconSparkle({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2z"/>
    </svg>
  )
}
function IconPin({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
function IconSun({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}
function IconMoon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function IconRefresh({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  )
}

/* ── Web Speech API (inline hook) ────────────────────────────── */
function useSpeechRecognition(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const recRef = useRef<any>(null)

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.\nChrome 브라우저를 사용해주세요.')
      return
    }
    if (recRef.current) recRef.current.abort()
    const rec = new SR()
    rec.lang = 'ko-KR'
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)
    rec.onresult = (e: any) => {
      const text = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join('')
      onResult(text)
    }
    recRef.current = rec
    try { rec.start() } catch { setIsListening(false) }
  }, [onResult])

  const stopListening = useCallback(() => {
    recRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, startListening, stopListening }
}

/* ── Types & constants ───────────────────────────────────────── */
interface FormState {
  vibes: string[]
  region: string
  budget: number
  duration: string
  purpose: string
}

interface SearchRequest {
  vibes: string[]
  region: string
  budget: number
  duration: string
  purpose?: string
  query?: string
}

const DURATIONS = ['1시간', '2시간', '3시간', '4시간 이상']
const DURATION_API_MAP: Record<string, string> = {
  '1시간': '2h', '2시간': '2h', '3시간': 'half-day', '4시간 이상': 'full-day',
}
const PURPOSES  = ['데이트', '친구', '가족', '혼자', '비즈니스']
const BUDGET_MIN = 10000
const BUDGET_MAX = 200000
const QUICK_TAGS = ['한강 야경', '성수 카페', '이태원 펍', '북촌 산책']

const TONE_GRAD: Record<string, string> = {
  sunset: 'linear-gradient(135deg,#E8651A 0%,#C94F2C 100%)',
  night:  'linear-gradient(135deg,#2C3E6E 0%,#0D0D0D 100%)',
  warm:   'linear-gradient(135deg,#F59060 0%,#E8651A 100%)',
}

function formatBudget(v: number) {
  return v >= BUDGET_MAX ? '₩200,000+' : `₩${v.toLocaleString()}`
}

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */
export default function HomePage() {

  /* ── Theme (light mode default) ─────────────────────────── */
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const stored = localStorage.getItem('seoulmate-theme')
    if (stored) setIsDark(stored === 'dark')
  }, [])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  /* ── Scroll → nav style ──────────────────────────────────── */
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* ── Form state ──────────────────────────────────────────── */
  const [form, setForm] = useState<FormState>({
    vibes: [], region: '', budget: 80000, duration: '', purpose: '',
  })
  const [regionQuery, setRegionQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  /*
   * heroSearch is COMPLETELY INDEPENDENT from form.region / regionQuery.
   * Hero search = natural-language free text (e.g. "분위기 있는 한강 야경 카페").
   * Form region  = specific region name (e.g. "강남", "홍대").
   * These two fields NEVER share or copy state.
   */
  const [heroSearch, setHeroSearch] = useState('')

  /* ── Refs ────────────────────────────────────────────────── */
  const formSectionRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLInputElement>(null)

  /* ── Voice recognition → fills heroSearch only ───────────── */
  const handleVoiceResult = useCallback((text: string) => {
    setHeroSearch(text)
    // Does NOT touch form.region or regionQuery
  }, [])
  const { isListening, startListening, stopListening } = useSpeechRecognition(handleVoiceResult)

  /* ── Scroll to top (filter is now in hero-right) ────────── */
  const scrollToForm = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /* ── Hero search submit ──────────────────────────────────── */
  const handleHeroSearch = (e?: { preventDefault(): void }) => {
    e?.preventDefault()
    // Future: navigate to /search?q=heroSearch
  }

  /* ── Form submit → API ───────────────────────────────────── */
  const handleSubmit = async () => {
    if (!canSubmit) return
    const payload: SearchRequest = {
      vibes: form.vibes,
      region: form.region,
      budget: form.budget,
      duration: DURATION_API_MAP[form.duration] ?? form.duration,
      purpose: form.purpose || undefined,
      query: heroSearch || undefined,
    }
    try {
      const res = await fetch('/api/courses/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      // TODO: navigate to results page with res data
      console.log('search payload', payload, res.status)
    } catch (err) {
      console.error(err)
    }
  }

  /* ── Preset click ────────────────────────────────────────── */
  const applyPreset = (preset: Preset) => {
    setForm(f => ({
      ...f,
      vibes:    preset.vibes,
      region:   preset.region,
      budget:   preset.budget,
      duration: preset.duration,
    }))
    setRegionQuery(preset.region)
    setActivePreset(preset.id)
    scrollToForm()
  }

  /* ── Reset form ──────────────────────────────────────────── */
  const resetForm = () => {
    setForm({ vibes: [], region: '', budget: 80000, duration: '', purpose: '' })
    setRegionQuery('')
    setActivePreset(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Form field handlers ─────────────────────────────────── */
  const toggleVibe = (v: string) =>
    setForm(f => ({
      ...f,
      vibes: f.vibes.includes(v) ? f.vibes.filter(x => x !== v) : [...f.vibes, v],
    }))

  const setRegion = (r: string) => {
    setForm(f => ({ ...f, region: r }))
    setRegionQuery(r)
    setShowDropdown(false)
  }

  /* ── Derived ─────────────────────────────────────────────── */
  const filledCount = [
    form.vibes.length > 0,
    form.region.length > 0,
    form.budget > 0,
    form.duration.length > 0,
  ].filter(Boolean).length

  const canSubmit = form.vibes.length > 0 && form.region.length > 0 && form.duration.length > 0

  const regionSuggestions = regionQuery.length > 0
    ? REGIONS.filter(r => r.includes(regionQuery) && r !== form.region)
    : []

  const sliderPct = ((form.budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100

  /* ── Nav colors (scroll + theme aware) ──────────────────── */
  const navBg = scrolled
    ? (isDark ? 'rgba(13,13,13,.92)' : 'rgba(253,246,238,.92)')
    : 'transparent'
  const navBorder = scrolled
    ? (isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(232,101,26,.12)')
    : 'none'
  const navLogoColor = scrolled ? 'var(--fg)' : '#FFFFFF'
  const navIconColor = scrolled ? 'var(--fg-2)' : 'rgba(255,255,255,.85)'

  /* ════════════════════════════════════════════════════════
     Render
     ════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes fp {
          0%,100% { transform:translateY(0) scale(1); opacity:.22; }
          50% { transform:translateY(-20px) scale(1.25); opacity:.55; }
        }
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:.25; }
        }
        @keyframes mic-ring {
          0%,100% { box-shadow:0 0 0 0 rgba(232,101,26,.6); }
          50% { box-shadow:0 0 0 10px rgba(232,101,26,0); }
        }
        .h-e1 { animation:fade-up .5s .05s var(--ease-out) both; }
        .h-e2 { animation:fade-up .5s .12s var(--ease-out) both; }
        .h-e3 { animation:fade-up .5s .22s var(--ease-out) both; }
        .h-e4 { animation:fade-up .5s .32s var(--ease-out) both; }
        .h-e5 { animation:fade-up .5s .42s var(--ease-out) both; }

        /* Search bar (glassmorphism on dark hero bg) */
        .hero-search-bar {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(232,101,26,0.3);
          border-radius: 16px;
          color: #1A1208;
          font-family: inherit;
          font-size: 15px;
          height: 56px;
          width: 100%;
          padding: 0 62px 0 48px;
          outline: none;
          transition: border-color .25s, box-shadow .25s;
          box-shadow: 0 8px 32px rgba(120,60,20,0.15);
        }
        .hero-search-bar::placeholder { color: #B09A82; }
        .hero-search-bar:focus {
          border-color: #E8651A;
          box-shadow: 0 8px 32px rgba(120,60,20,0.2), 0 0 0 3px rgba(232,101,26,0.12);
        }

        /* Quick search tags (on hero) */
        .q-tag {
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(232,101,26,0.25);
          border-radius: 20px;
          color: #5A4030;
          font-size: 12px;
          padding: 5px 13px;
          font-family: inherit;
          cursor: pointer;
          transition: all .18s;
          white-space: nowrap;
        }
        .q-tag:hover {
          background: #FFF0E0;
          border-color: #E8651A;
          color: #C94F2C;
        }

        /* Preset card (hero) */
        .preset-card {
          transition: transform .3s ease, box-shadow .3s;
          cursor: pointer;
        }
        .preset-card:hover {
          transform: scale(1.03);
          box-shadow: 0 20px 60px rgba(0,0,0,.55) !important;
        }

        /* Vibe/purpose chips (form section) */
        .chip-btn { transition: all .18s var(--ease-out); }
        .chip-btn:hover:not(.chip-on) {
          background: #FFF0E0 !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
          transform: translateY(-1px);
        }

        /* Duration cards */
        .dur-card { transition: all .2s var(--ease-out); cursor: pointer; }
        .dur-card:hover:not(.dur-on) {
          background: #FFF0E0 !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
          transform: translateY(-1px);
        }

        /* Region dropdown */
        .drop-item { transition: background .15s; cursor: pointer; }
        .drop-item:hover { background: var(--surface-2); }

        /* CTA */
        .cta-btn { transition: all .35s var(--ease-spring); }
        .cta-btn:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 12px 40px rgba(232,101,26,.5) !important;
          transform: translateY(-2px);
        }
        .cta-btn:active:not(:disabled) { transform: translateY(0); }

        /* Nav transition */
        .site-nav { transition: background .35s, border-color .35s, backdrop-filter .35s; }

        /* "직접 입력하기" button */
        .cta-hero {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #E8651A 0%, #C94F2C 100%);
          border: none; border-radius: 12px; color: #fff;
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(232,101,26,0.4);
          transition: all .25s var(--ease-spring);
        }
        .cta-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(232,101,26,0.5);
        }
        .cta-hero:active { transform: translateY(0); }

        /* Preset grid (standalone section, 4-col → 2-col → 1-col) */
        .preset-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }

        /* Hero overlay: theme-aware (95deg → alpha 0 at right edge, no white-bar artifact) */
        .hero-overlay { position: absolute; inset: 0; }
        [data-theme="dark"] .hero-overlay,
        html:not([data-theme]) .hero-overlay {
          background: linear-gradient(95deg, rgba(13,13,13,.88) 0%, rgba(13,13,13,.55) 45%, rgba(13,13,13,.00) 100%);
        }
        [data-theme="light"] .hero-overlay {
          background: linear-gradient(95deg, rgba(253,246,238,.90) 0%, rgba(253,246,238,.60) 45%, rgba(253,246,238,.00) 100%);
        }

        /* Hero text: theme-aware */
        .hero-eyebrow { color: #F5A623; }
        [data-theme="light"] .hero-eyebrow { color: #C94F2C; }
        .hero-title-text { color: #FFFFFF; text-shadow: 0 2px 20px rgba(0,0,0,.4); }
        [data-theme="light"] .hero-title-text { color: #1A1208; text-shadow: 0 2px 12px rgba(0,0,0,.08); }
        .hero-sub-text { color: rgba(255,255,255,.82); }
        [data-theme="light"] .hero-sub-text { color: rgba(26,18,8,.75); }

        /* Responsive */
        @media (max-width: 1100px) {
          .hero-grid { grid-template-columns: 1fr 360px !important; gap: 24px !important; }
          .preset-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .form-grid  { grid-template-columns: 1fr !important; }
          .hero-right { display: block !important; margin-top: 32px; max-height: 60vh; overflow-y: auto; }
          .preset-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 520px) {
          .hero-grid { min-height: auto !important; }
          .preset-grid { grid-template-columns: repeat(2,1fr) !important; }
        }

        /* Vibe chips — horizontal scroll, no wrap */
        .vibe-scroll {
          display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 5px;
          scrollbar-width: none; -ms-overflow-style: none;
          padding-bottom: 2px;
        }
        .vibe-scroll::-webkit-scrollbar { display: none; }
        .vibe-scroll button { flex-shrink: 0; }
        @media (prefers-reduced-motion: reduce) {
          .h-e1,.h-e2,.h-e3,.h-e4,.h-e5 { animation: none !important; }
          .preset-card,.chip-btn,.dur-card,.cta-btn,.cta-hero { transition: none !important; }
        }
      `}</style>

      {/* ══ PAGE WRAPPER ══════════════════════════════════════════ */}
      <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>

        {/* ══ FIXED NAV ══════════════════════════════════════════ */}
        <nav
          className="site-nav"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            height: 64,
            background: navBg,
            backdropFilter: scrolled ? 'blur(10px) saturate(160%)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(10px) saturate(160%)' : 'none',
            borderBottom: navBorder,
            display: 'flex', alignItems: 'center',
          }}
        >
          <div style={{
            width: '100%', maxWidth: 1440, margin: '0 auto',
            padding: '0 var(--content-padding)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/favicon-32x32.png" width={26} height={26} alt="" style={{ display: 'block' }}/>
              <span style={{
                fontSize: 18, fontWeight: 800, letterSpacing: '-.02em',
                color: navLogoColor,
                transition: 'color .35s',
              }}>SeoulMate</span>
            </div>
            {/* Theme toggle */}
            <button
              onClick={() => {
                const next = !isDark
                setIsDark(next)
                localStorage.setItem('seoulmate-theme', next ? 'dark' : 'light')
              }}
              aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: scrolled
                  ? '1px solid rgba(232,101,26,.25)'
                  : '1px solid rgba(255,255,255,.28)',
                background: scrolled
                  ? 'rgba(232,101,26,.07)'
                  : 'rgba(255,255,255,.10)',
                color: navIconColor,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .35s',
              }}
            >
              {isDark ? <IconSun size={15}/> : <IconMoon size={14}/>}
            </button>
          </div>
        </nav>

        {/* ══ HERO SECTION (100vh) ═══════════════════════════════ */}
        <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

          {/* Background image — theme-aware */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: isDark ? "url('/main-bg-dark.jpg')" : "url('/main-bg-bright.jpg')",
            backgroundSize: 'cover', backgroundPosition: 'center 40%',
          }}/>
          {/* Overlay — theme-aware via .hero-overlay CSS class */}
          <div className="hero-overlay"/>
          {/* Bottom fade into page bg */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, zIndex: 1,
            background: 'linear-gradient(0deg, var(--bg) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}/>
          {/* Floating particles */}
          {[
            { top:'16%', left:'6%',  s:3, d:'0s',   dur:'7s',   c:'#F5A623' },
            { top:'30%', left:'60%', s:2, d:'1.2s', dur:'9s',   c:'#E8651A' },
            { top:'62%', left:'88%', s:3, d:'2.1s', dur:'6.5s', c:'#F5A623' },
            { top:'42%', left:'46%', s:2, d:'1.8s', dur:'7.5s', c:'#C94F2C' },
            { top:'75%', left:'24%', s:2, d:'0.5s', dur:'8s',   c:'#FFC56B' },
            { top:'20%', left:'80%', s:3, d:'3s',   dur:'7s',   c:'#E8651A' },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute', top: p.top, left: p.left,
              width: p.s, height: p.s, borderRadius: '50%', background: p.c,
              animation: `fp ${p.dur} ${p.d} ease-in-out infinite`,
              pointerEvents: 'none', zIndex: 1,
            }}/>
          ))}

          {/* Hero content grid */}
          <div
            className="hero-grid"
            style={{
              position: 'relative', zIndex: 2,
              maxWidth: 1440, margin: '0 auto',
              padding: 'clamp(80px,10vh,120px) var(--content-padding) clamp(40px,5vh,80px)',
              display: 'grid',
              gridTemplateColumns: '1fr 420px',
              gap: 40,
              alignItems: 'center',
              minHeight: '100vh',
            }}
          >
            {/* ── Left: headline + search ── */}
            <div>
              <div className="h-e1 hero-eyebrow" style={{
                fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase',
                marginBottom: 14, fontWeight: 600,
              }}>
                오늘 저녁 · AI 추천
              </div>
              <h1 className="h-e2 hero-title-text" style={{
                fontSize: 'var(--hero-title-size)',
                fontWeight: 900, lineHeight: 1.05, letterSpacing: '-.03em', marginBottom: 16,
              }}>
                오늘은<br/>어떤 코스로?
              </h1>
              <p className="h-e3 hero-sub-text" style={{
                fontSize: 'clamp(.9rem,1.2vw,1.05rem)',
                marginBottom: 28, lineHeight: 1.7,
              }}>
                분위기 · 지역 · 예산을 알려주세요.<br/>AI가 딱 맞는 서울 코스를 만들어드려요.
              </p>

              {/* ── Hero search bar (INDEPENDENT from form) ── */}
              <form className="h-e4" onSubmit={handleHeroSearch} noValidate>
                {/* Wrapper div with fixed height — ensures icons center against input */}
                <div style={{ position: 'relative', height: 56 }}>
                  {/* Search icon (left) */}
                  <button
                    type="submit"
                    aria-label="검색"
                    style={{
                      position: 'absolute',
                      left: 16, top: '50%', transform: 'translateY(-50%)',
                      width: 20, height: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: 'none', padding: 0,
                      color: '#B09A82', cursor: 'pointer', zIndex: 3,
                      transition: 'color .2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E8651A')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#B09A82')}
                  >
                    <IconSearch size={19}/>
                  </button>

                  {/* Input — heroSearch state only, never touches form state */}
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={e => setHeroSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleHeroSearch() } }}
                    placeholder="장소 · 분위기 · 예산으로 검색"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="hero-search-bar"
                    style={{ pointerEvents: 'auto' }}
                  />

                  {/* Mic button (right) */}
                  <button
                    type="button"
                    aria-label={isListening ? '음성 인식 중지' : '음성 검색'}
                    onClick={isListening ? stopListening : startListening}
                    style={{
                      position: 'absolute',
                      right: 14, top: '50%', transform: 'translateY(-50%)',
                      width: 40, height: 40,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isListening ? 'rgba(232,101,26,.25)' : 'rgba(255,255,255,.15)',
                      border: 'none', borderRadius: 12,
                      color: isListening ? '#E8651A' : (isDark ? 'rgba(255,255,255,.8)' : 'rgba(26,18,8,.60)'),
                      cursor: 'pointer', zIndex: 3,
                      animation: isListening ? 'mic-ring 1.1s ease-in-out infinite' : 'none',
                      transition: 'background .2s, color .2s',
                    }}
                  >
                    <IconMic size={18}/>
                  </button>
                </div>

                {/* Listening indicator */}
                {isListening && (
                  <div style={{
                    marginTop: 8, display: 'flex', alignItems: 'center', gap: 7,
                    fontSize: 12, color: '#F59060', fontWeight: 600,
                  }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#E8651A',
                      display: 'inline-block',
                      animation: 'blink .75s ease-in-out infinite',
                    }}/>
                    듣는 중... 말씀해주세요
                  </div>
                )}

                {/* Quick search tags */}
                {!isListening && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {QUICK_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className="q-tag"
                        onClick={() => {
                          setHeroSearch(tag)
                          scrollToForm()
                          // Does NOT set regionQuery or form.region
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </form>

            </div>

            {/* ── Right: filter panel (glassmorphism) ── */}
            <div ref={formSectionRef} className="hero-right h-e5" style={{ alignSelf: 'center' }}>
              <div style={{
                background: isDark ? 'rgba(13,13,13,0.80)' : 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 20,
                border: `1px solid ${isDark ? 'rgba(255,255,255,.10)' : 'rgba(232,101,26,.18)'}`,
                padding: '20px 20px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}>

                {/* Panel header */}
                <div style={{
                  fontSize: 14, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-.01em',
                  paddingBottom: 12, borderBottom: '1px solid var(--border)',
                }}>코스 필터</div>

                {/* STEP 1 · 분위기 */}
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600, marginBottom: 6 }}>분위기 · 복수선택</div>
                  <div className="vibe-scroll">
                    {VIBES.map(v => {
                      const on = form.vibes.includes(v)
                      return (
                        <button key={v} className={`chip-btn${on ? ' chip-on' : ''}`} onClick={() => toggleVibe(v)} style={{
                          padding: '5px 11px', borderRadius: 24,
                          border: on ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                          background: on ? 'var(--primary)' : (isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)'),
                          color: on ? 'var(--fg-on-primary)' : 'var(--fg-2)',
                          fontFamily: 'inherit', fontWeight: on ? 700 : 500,
                          fontSize: 12, cursor: 'pointer', boxShadow: on ? '0 2px 8px rgba(232,101,26,.3)' : 'none',
                          whiteSpace: 'nowrap',
                        }}>{v}</button>
                      )
                    })}
                  </div>
                </div>

                {/* STEP 2 · 지역 */}
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600, marginBottom: 6 }}>지역</div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none', zIndex: 1 }}>
                      <IconPin size={13}/>
                    </div>
                    <input
                      ref={regionRef}
                      type="text"
                      value={regionQuery}
                      onChange={e => { const v = e.target.value; setRegionQuery(v); setForm(f => ({ ...f, region: v })); setShowDropdown(true) }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                      placeholder="예: 강남, 홍대"
                      autoComplete="off"
                      style={{
                        width: '100%', height: 40,
                        paddingLeft: 34, paddingRight: 12,
                        background: isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.04)',
                        border: `1.5px solid ${form.region ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 10, fontFamily: 'inherit', fontSize: 13,
                        color: 'var(--fg)', outline: 'none',
                        boxShadow: form.region ? '0 0 0 3px rgba(232,101,26,.1)' : 'none',
                        transition: 'all .2s',
                      }}
                    />
                    {showDropdown && regionSuggestions.length > 0 && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 10, overflow: 'hidden',
                        boxShadow: 'var(--shadow-card)', zIndex: 20,
                      }}>
                        {regionSuggestions.slice(0, 4).map(r => (
                          <div key={r} className="drop-item" onMouseDown={() => setRegion(r)} style={{
                            padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 13, color: 'var(--fg)', borderBottom: '1px solid var(--border)',
                          }}>
                            <span style={{ color: 'var(--primary)' }}><IconPin size={12}/></span>{r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                    {QUICK_REGIONS.map(r => (
                      <button key={r} className="chip-btn" onClick={() => setRegion(r)} style={{
                        padding: '4px 10px', borderRadius: 9999,
                        border: form.region === r ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                        background: form.region === r ? 'var(--surface-2)' : (isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)'),
                        color: form.region === r ? 'var(--primary)' : 'var(--fg-2)',
                        fontFamily: 'inherit', fontWeight: form.region === r ? 600 : 500, fontSize: 12, cursor: 'pointer',
                      }}>{r}</button>
                    ))}
                  </div>
                </div>

                {/* STEP 3 · 예산 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 10, letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>예산 (1인)</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{formatBudget(form.budget)}</div>
                  </div>
                  <div style={{ position: 'relative', height: 20 }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 5, background: 'var(--surface-3)', borderRadius: 9999 }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${sliderPct}%`, background: 'var(--primary)', borderRadius: 9999, transition: 'width .08s' }}/>
                    </div>
                    <input type="range" min={BUDGET_MIN} max={BUDGET_MAX} step={5000} value={form.budget}
                      onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
                      style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', margin: 0, zIndex: 2, height: '100%' }}
                    />
                    <div style={{
                      position: 'absolute', left: `calc(${sliderPct}% - 9px)`, top: '50%', transform: 'translateY(-50%)',
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      border: '2px solid var(--primary)', boxShadow: '0 2px 6px rgba(232,101,26,.4)',
                      pointerEvents: 'none', zIndex: 1, transition: 'left .08s',
                    }}/>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
                    <span>₩10,000</span><span>₩200,000+</span>
                  </div>
                </div>

                {/* STEP 4 · 시간 */}
                {(() => {
                  const durIdx = form.duration ? DURATIONS.indexOf(form.duration) : -1
                  const durPct = durIdx >= 0 ? (durIdx / (DURATIONS.length - 1)) * 100 : 0
                  return (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 10, letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>소요 시간</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>
                          {form.duration || '—'}
                        </div>
                      </div>
                      <div style={{ position: 'relative', height: 20 }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 5, background: 'var(--surface-3)', borderRadius: 9999 }}>
                          {durIdx >= 0 && (
                            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${durPct}%`, background: 'var(--primary)', borderRadius: 9999, transition: 'width .12s' }}/>
                          )}
                        </div>
                        <input
                          type="range" min={0} max={DURATIONS.length - 1} step={1}
                          value={durIdx >= 0 ? durIdx : 0}
                          onChange={e => setForm(f => ({ ...f, duration: DURATIONS[Number(e.target.value)] }))}
                          onMouseDown={() => { if (durIdx < 0) setForm(f => ({ ...f, duration: DURATIONS[0] })) }}
                          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', margin: 0, zIndex: 2, height: '100%' }}
                        />
                        {durIdx >= 0 && (
                          <div style={{
                            position: 'absolute', left: `calc(${durPct}% - 9px)`, top: '50%', transform: 'translateY(-50%)',
                            width: 18, height: 18, borderRadius: '50%', background: '#fff',
                            border: '2px solid var(--primary)', boxShadow: '0 2px 6px rgba(232,101,26,.4)',
                            pointerEvents: 'none', zIndex: 1, transition: 'left .12s',
                          }}/>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--fg-3)' }}>
                        {DURATIONS.map(d => <span key={d}>{d}</span>)}
                      </div>
                    </div>
                  )
                })()}

                {/* STEP 5 · 목적 */}
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600, marginBottom: 6 }}>
                    목적 <span style={{ color: 'var(--fg-3)', textTransform: 'none', letterSpacing: 0 }}>선택사항</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {PURPOSES.map(p => {
                      const on = form.purpose === p
                      return (
                        <button key={p} className={`chip-btn${on ? ' chip-on' : ''}`} onClick={() => setForm(f => ({ ...f, purpose: on ? '' : p }))} style={{
                          padding: '5px 11px', borderRadius: 9999,
                          border: on ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                          background: on ? 'var(--surface-2)' : (isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)'),
                          color: on ? 'var(--primary)' : 'var(--fg-2)',
                          fontFamily: 'inherit', fontWeight: on ? 700 : 500, fontSize: 12, cursor: 'pointer',
                        }}>{p}</button>
                      )
                    })}
                  </div>
                </div>

                {/* Progress + CTA */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 9999,
                        background: i <= filledCount ? 'var(--primary)' : 'var(--border)',
                        transition: 'background .3s',
                      }}/>
                    ))}
                  </div>
                  <button className="cta-btn" disabled={!canSubmit} onClick={handleSubmit} style={{
                    width: '100%', height: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    borderRadius: 12, border: 'none',
                    background: canSubmit ? 'var(--grad-amber)' : 'var(--border)',
                    color: canSubmit ? 'var(--fg-on-primary)' : 'var(--fg-3)',
                    fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    boxShadow: canSubmit ? '0 4px 18px rgba(232,101,26,.4)' : 'none',
                  }}>
                    <IconSparkle size={14}/>
                    {canSubmit ? 'AI 코스 추천받기' : '항목을 채워주세요'}
                  </button>
                  {filledCount > 0 && (
                    <button onClick={resetForm} style={{
                      display: 'flex', alignItems: 'center', gap: 4, margin: '8px auto 0',
                      background: 'none', border: 'none', color: 'var(--fg-3)', fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
                      borderRadius: 8, transition: 'color .2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
                    >
                      <IconRefresh size={12}/> 초기화
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ══ MOOD PRESETS SECTION ════════════════════════════════ */}
        <section style={{
          background: 'var(--bg)',
          paddingTop: 'clamp(48px,6vh,72px)',
          paddingBottom: 'clamp(32px,4vh,52px)',
        }}>
          <div style={{
            maxWidth: 1280, margin: '0 auto',
            padding: '0 var(--content-padding)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'baseline',
              justifyContent: 'space-between', marginBottom: 20,
            }}>
              <span style={{
                fontSize: 20, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-.01em',
              }}>
                오늘의 무드
              </span>
              <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>
                {new Date().toLocaleDateString('ko-KR', { weekday: 'long' })}
              </span>
            </div>
            <div className="preset-grid">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  className="preset-card"
                  onClick={() => applyPreset(preset)}
                  style={{
                    aspectRatio: '4/3',
                    borderRadius: 20,
                    border: activePreset === preset.id
                      ? '2px solid var(--primary)'
                      : '1px solid var(--border)',
                    overflow: 'hidden',
                    background: TONE_GRAD[preset.tone],
                    padding: 16, textAlign: 'left',
                    cursor: 'pointer', fontFamily: 'inherit',
                    position: 'relative',
                    boxShadow: activePreset === preset.id
                      ? '0 0 0 4px rgba(232,101,26,.25)'
                      : '0 8px 24px rgba(0,0,0,.40)',
                  }}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: "url('/seoul-bg.jpg')",
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    opacity: .38, mixBlendMode: 'overlay',
                  }}/>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(0deg,rgba(13,13,13,.78) 0%,rgba(13,13,13,0) 55%)',
                  }}/>
                  <div style={{
                    position: 'relative', height: '100%',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    color: '#fff',
                  }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
                      {preset.vibes.slice(0, 2).map(v => (
                        <span key={v} style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 9999,
                          background: 'rgba(255,255,255,.22)', fontWeight: 600,
                        }}>{v}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, opacity: .72, marginBottom: 3 }}>{preset.sub}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.01em', lineHeight: 1.2 }}>
                      {preset.title}
                    </div>
                    <div style={{
                      marginTop: 6, fontSize: 11, opacity: .62,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {formatBudget(preset.budget)} · {preset.duration}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>


      </div>
    </>
  )
}
