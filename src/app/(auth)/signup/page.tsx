'use client'

import { useState, useEffect } from 'react'
import styles from './signup.module.css'

/* ── Icons ─────────────────────────────────────────────────── */

function CheckIcon({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function EyeIcon({ open, stroke = '#555' }: { open: boolean; stroke?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
        stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth="1.5"/>
      {!open && <line x1="3" y1="3" x2="21" y2="21" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>}
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

/* ── Themes ─────────────────────────────────────────────────── */

const DARK = {
  rightPanelBg:    '#111111',
  rightBorder:     '1px solid rgba(255,255,255,0.04)',
  heading:         '#FFFFFF',
  subtext:         '#666666',
  vibeLabel:       '#FFFFFF',
  vibeSub:         '#555555',
  inputBg:         '#1C1C1C',
  inputBorder:     '#2A2A2A',
  inputText:       '#FFFFFF',
  placeholder:     '#555',
  eyeStroke:       '#555',
  chipBg:          'rgba(255,255,255,0.05)',
  chipBorder:      '#2A2A2A',
  chipText:        '#888888',
  checkboxBg:      '#1C1C1C',
  checkboxBorder:  '#2A2A2A',
  termsText:       '#888888',
  ctaDisabledBg:   '#2A2A2A',
  ctaDisabledText: '#444444',
  loginText:       '#555555',
  navText:         '#A0A0A0',
  toggleBg:        'rgba(255,255,255,0.08)',
  toggleBorder:    'rgba(255,255,255,0.15)',
  toggleColor:     'rgba(240,240,245,0.7)',
}

const LIGHT = {
  rightPanelBg:    '#FFFFFF',
  rightBorder:     '1px solid rgba(0,0,0,0.07)',
  heading:         '#1A1A2E',
  subtext:         '#555577',
  vibeLabel:       '#1A1A2E',
  vibeSub:         '#999999',
  inputBg:         '#F5F5FA',
  inputBorder:     'rgba(0,0,0,0.1)',
  inputText:       '#1A1A2E',
  placeholder:     '#999',
  eyeStroke:       '#AAAAAA',
  chipBg:          '#EFEFEF',
  chipBorder:      '#DEDEDE',
  chipText:        '#333333',
  checkboxBg:      '#F0F0F0',
  checkboxBorder:  'rgba(0,0,0,0.15)',
  termsText:       '#555555',
  ctaDisabledBg:   '#E8E8E8',
  ctaDisabledText: '#AAAAAA',
  loginText:       '#888888',
  navText:         '#888888',
  toggleBg:        'rgba(0,0,0,0.06)',
  toggleBorder:    'rgba(0,0,0,0.12)',
  toggleColor:     'rgba(30,30,40,0.55)',
}

/* ── Data ───────────────────────────────────────────────────── */

const VIBES = ['조용한', '설레는', '활기찬', '감성적인', '고즈넉한', '힙한', '럭셔리한', '자연친화적']

const FEATURE_BADGES = [
  { icon: '✦', label: 'AI 코스 추천' },
  { icon: '◎', label: '실시간 혼잡도' },
  { icon: '⊹', label: '맞춤 필터링' },
]

const PARTICLES = [
  { top: '14%', left: '9%',  size: 3, delay: '0s',   dur: '7.2s', color: '#F5A623' },
  { top: '28%', left: '74%', size: 2, delay: '1.1s', dur: '9s',   color: '#E8547A' },
  { top: '52%', left: '83%', size: 3, delay: '2.3s', dur: '6.8s', color: '#F5A623' },
  { top: '76%', left: '20%', size: 2, delay: '0.7s', dur: '8.4s', color: '#E8954A' },
  { top: '40%', left: '54%', size: 2, delay: '1.9s', dur: '7.6s', color: '#F5A623' },
  { top: '84%', left: '62%', size: 3, delay: '3.0s', dur: '8.1s', color: '#E8547A' },
  { top: '9%',  left: '44%', size: 2, delay: '2.6s', dur: '6.2s', color: '#E8954A' },
  { top: '63%', left: '37%', size: 2, delay: '0.3s', dur: '9.4s', color: '#F5A623' },
]

/* ── Component ─────────────────────────────────────────────── */

export default function SignupPage() {
  const [nickname, setNickname]             = useState('')
  const [email, setEmail]                   = useState('')
  const [emailTouched, setEmailTouched]     = useState(false)
  const [pw, setPw]                         = useState('')
  const [confirmPw, setConfirmPw]           = useState('')
  const [showPw, setShowPw]                 = useState(false)
  const [showConfirmPw, setShowConfirmPw]   = useState(false)
  const [selectedVibes, setSelectedVibes]   = useState<string[]>([])
  const [agreed, setAgreed]                 = useState(false)

  const [nickFocus, setNickFocus]           = useState(false)
  const [emailFocus, setEmailFocus]         = useState(false)
  const [pwFocus, setPwFocus]               = useState(false)
  const [confirmFocus, setConfirmFocus]     = useState(false)

  const [isDark, setIsDark]                 = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('seoulmate-theme')
    if (stored) setIsDark(stored === 'dark')
    else setIsDark(!window.matchMedia('(prefers-color-scheme: light)').matches)
  }, [])

  const toggleTheme = () => {
    setIsDark(v => {
      const next = !v
      localStorage.setItem('seoulmate-theme', next ? 'dark' : 'light')
      return next
    })
  }

  const t = isDark ? DARK : LIGHT

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailError = emailTouched && email.length > 0 && !emailValid
  const pwOk       = pw.length >= 8
  const pwMatch    = pw === confirmPw && confirmPw.length > 0
  const canSubmit  = nickname.trim().length >= 2 && emailValid && pwOk && pwMatch && agreed

  const toggleVibe = (v: string) =>
    setSelectedVibes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!canSubmit) return
  }

  const inputStyle = (focused: boolean, valid?: boolean, error?: boolean): React.CSSProperties => ({
    width: '100%',
    height: '52px',
    background: t.inputBg,
    border: error
      ? '1px solid #E24B4A'
      : valid
        ? '1px solid #1D9E75'
        : focused
          ? '1px solid #F5A623'
          : `1px solid ${t.inputBorder}`,
    borderRadius: '10px',
    fontFamily: 'Pretendard, sans-serif',
    fontSize: '15px',
    color: t.inputText,
    outline: 'none',
    boxShadow: error
      ? '0 0 0 3px rgba(226,75,74,0.12)'
      : focused
        ? '0 0 0 3px rgba(245,166,35,0.15)'
        : 'none',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  })

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes fp {
          0%, 100% { transform: translateY(0) scale(1);    opacity: .18; }
          50%       { transform: translateY(-22px) scale(1.25); opacity: .5;  }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .su-a1 { animation: fadeUp .55s .05s cubic-bezier(.16,1,.3,1) both; }
        .su-a2 { animation: fadeUp .55s .18s cubic-bezier(.16,1,.3,1) both; }
        .su-a3 { animation: fadeUp .55s .31s cubic-bezier(.16,1,.3,1) both; }

        @media (prefers-reduced-motion: reduce) {
          .su-a1, .su-a2, .su-a3 { animation: none !important; }
        }

        .su-cta:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: scale(1.01) translateY(-1px);
          box-shadow: 0 8px 28px rgba(245,166,35,0.45) !important;
        }
        .su-cta:active:not(:disabled) { transform: scale(0.99); }
        .su-cta { transition: all .35s cubic-bezier(.34,1.56,.64,1); }

        .su-chip { transition: all .22s cubic-bezier(.16,1,.3,1); }
        .su-chip:hover { transform: translateY(-1px); }

        .su-nav-link:hover { color: #F5A623 !important; }
        .su-nav-link { transition: color .2s; }

        .su-login-link:hover { opacity: .8; }
        .su-login-link { transition: opacity .2s; }

        .su-eye { transition: opacity .2s; }
        .su-eye:hover { opacity: .7; }

        .su-toggle { transition: all .3s cubic-bezier(.16,1,.3,1); }
        .su-toggle:hover { transform: scale(1.1); }
        .su-toggle:active { transform: scale(0.95); }

        input::placeholder { color: ${t.placeholder}; opacity: 1; }
      `}</style>

      <div
        className={styles.wrapper}
        data-theme={isDark ? 'dark' : 'light'}
        style={{ minHeight: '100vh', display: 'flex', background: '#0D0D0D', overflowX: 'hidden' }}
      >

        {/* ═══ LEFT PANEL ═══ */}
        <div
          className={styles.leftPanel}
          style={{
            flex: '0 0 45%',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 56px',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, #0D0D0D 0%, #1A1215 60%, #0F0A08 100%)',
            zIndex: 0,
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: isDark ? "url('/seoul-bg.jpg')" : "url('/seoul_bg-bright.png')",
            backgroundSize: 'cover', backgroundPosition: 'center 40%',
            opacity: 0.2, zIndex: 0,
          }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,166,35,0.06)', zIndex: 1 }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(13,13,13,.65) 0%, transparent 100%)',
            zIndex: 1,
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(13,13,13,.85) 0%, transparent 60%)',
            zIndex: 1,
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.028, zIndex: 2, pointerEvents: 'none',
          }}/>

          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', top: p.top, left: p.left,
              width: p.size, height: p.size, borderRadius: '50%',
              background: p.color,
              animation: `fp ${p.dur} ${p.delay} ease-in-out infinite`,
              zIndex: 2,
            }}/>
          ))}

          <svg
            className={styles.mapGrid}
            style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.045, zIndex: 2, pointerEvents: 'none' }}
            width="240" height="240" viewBox="0 0 240 240"
          >
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i}>
                <line x1={i * 24} y1="0" x2={i * 24} y2="240" stroke="#F5A623" strokeWidth="0.8"/>
                <line x1="0" y1={i * 24} x2="240" y2={i * 24} stroke="#F5A623" strokeWidth="0.8"/>
              </g>
            ))}
            <circle cx="120" cy="120" r="65"  stroke="#E8547A" strokeWidth="0.8" fill="none"/>
            <circle cx="120" cy="120" r="98"  stroke="#F5A623" strokeWidth="0.5" fill="none"/>
          </svg>

          <div
            className={styles.brandBlock}
            style={{ position: 'relative', zIndex: 3, textAlign: 'center', maxWidth: '380px' }}
          >
            <h1 style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 700, fontSize: '40px',
              lineHeight: 1.1, letterSpacing: '-1.5px',
              background: 'linear-gradient(135deg, #F5A623 0%, #E8547A 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: 'shimmer 4s infinite linear',
              marginBottom: '12px',
            }}>
              SeoulMate
            </h1>
            <p style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 400, fontSize: '16px',
              color: '#A0A0A0', lineHeight: 1.6, marginBottom: '28px',
            }}>
              서울의 모든 순간이 특별해지는 곳
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {FEATURE_BADGES.map(({ icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  height: '34px', padding: '0 14px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '9999px',
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 500, fontSize: '13px', color: '#D0D0D0', whiteSpace: 'nowrap',
                }}>
                  <span style={{ color: '#F5A623', fontSize: '12px', lineHeight: 1 }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div
          className={styles.rightPanel}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: t.rightPanelBg,
            borderLeft: t.rightBorder,
            overflowY: 'auto',
            padding: '48px 60px',
            position: 'relative',
            transition: 'background 0.4s ease, border-color 0.4s ease',
          }}
        >

          {/* Top nav */}
          <div className="su-a1" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '48px',
          }}>
            <span style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 700, fontSize: '16px', color: '#F5A623',
            }}>
              SeoulMate
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Theme toggle */}
              <button
                type="button"
                className="su-toggle"
                onClick={toggleTheme}
                aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                style={{
                  width: '34px', height: '34px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: t.toggleBg,
                  border: `1px solid ${t.toggleBorder}`,
                  borderRadius: '9999px',
                  color: t.toggleColor,
                  cursor: 'pointer',
                }}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>

              <a href="/login" className="su-nav-link" style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 400, fontSize: '14px',
                color: t.navText, textDecoration: 'none',
                transition: 'color 0.2s',
              }}>
                로그인
              </a>
            </div>
          </div>

          {/* Form container */}
          <div
            className={`${styles.formContainer} su-a2`}
            style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}
          >
            <h2 style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 700, fontSize: '24px',
              color: t.heading, marginBottom: '6px',
              transition: 'color 0.3s ease',
            }}>
              SeoulMate 시작하기
            </h2>
            <p style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 400, fontSize: '14px',
              color: t.subtext, marginBottom: '32px',
              transition: 'color 0.3s ease',
            }}>
              서울에서 가장 특별한 순간들이 기다리고 있어요
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

              {/* Nickname */}
              <input
                className={styles.input}
                type="text"
                placeholder="닉네임 (2~10자)"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                onFocus={() => setNickFocus(true)}
                onBlur={() => setNickFocus(false)}
                maxLength={10}
                style={{ ...inputStyle(nickFocus), padding: '0 18px' }}
              />

              {/* Email */}
              <div style={{ marginTop: '14px', position: 'relative' }}>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => { setEmailFocus(false); setEmailTouched(true) }}
                  style={{
                    ...inputStyle(emailFocus, emailValid && email.length > 0, emailError),
                    padding: '0 44px 0 18px',
                  }}
                />
                {emailValid && email && (
                  <div style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none',
                  }}>
                    <CheckIcon size={16} color="#1D9E75"/>
                  </div>
                )}
                {emailError && (
                  <p style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontSize: '12px', color: '#E24B4A', marginTop: '6px',
                  }}>
                    올바른 이메일 형식이 아닙니다
                  </p>
                )}
              </div>

              {/* Password row */}
              <div style={{ display: 'flex', gap: '14px', marginTop: '14px' }}>

                {/* Password */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      className={styles.input}
                      type={showPw ? 'text' : 'password'}
                      placeholder="비밀번호 (8자 이상)"
                      value={pw}
                      onChange={e => setPw(e.target.value)}
                      onFocus={() => setPwFocus(true)}
                      onBlur={() => setPwFocus(false)}
                      style={{ ...inputStyle(pwFocus, pwOk && pw.length > 0), padding: '0 44px 0 18px' }}
                    />
                    <button
                      type="button"
                      className="su-eye"
                      onClick={() => setShowPw(v => !v)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '4px', minWidth: '32px', minHeight: '32px',
                      }}
                    >
                      <EyeIcon open={showPw} stroke={t.eyeStroke}/>
                    </button>
                  </div>
                  {pw.length > 0 && !pwOk && (
                    <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: '#E24B4A' }}>
                      8자 이상 입력해주세요
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      className={styles.input}
                      type={showConfirmPw ? 'text' : 'password'}
                      placeholder="비밀번호 확인"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      onFocus={() => setConfirmFocus(true)}
                      onBlur={() => setConfirmFocus(false)}
                      style={{ ...inputStyle(confirmFocus, pwMatch, confirmPw.length > 0 && pw !== confirmPw), padding: '0 44px 0 18px' }}
                    />
                  {pwMatch ? (
                    <div style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', pointerEvents: 'none',
                    }}>
                      <CheckIcon size={14} color="#1D9E75"/>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="su-eye"
                      onClick={() => setShowConfirmPw(v => !v)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '4px', minWidth: '32px', minHeight: '32px',
                      }}
                    >
                      <EyeIcon open={showConfirmPw} stroke={t.eyeStroke}/>
                    </button>
                  )}
                  </div>
                  {confirmPw.length > 0 && !pwMatch && (
                    <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: '#E24B4A' }}>
                      비밀번호가 일치하지 않습니다
                    </p>
                  )}
                </div>
              </div>

              {/* Preferred vibe */}
              <div style={{ marginTop: '32px' }}>
                <p style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 600, fontSize: '15px',
                  color: t.vibeLabel, transition: 'color 0.3s ease',
                }}>
                  선호하는 분위기
                </p>
                <p style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 400, fontSize: '12px',
                  color: t.vibeSub, marginTop: '4px', transition: 'color 0.3s ease',
                }}>
                  선택사항 · 나중에 바꿀 수 있어요
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                  {VIBES.map(vibe => {
                    const on = selectedVibes.includes(vibe)
                    return (
                      <button
                        key={vibe}
                        type="button"
                        className="su-chip"
                        onClick={() => toggleVibe(vibe)}
                        style={{
                          height: '34px', padding: '0 14px',
                          borderRadius: '9999px', cursor: 'pointer',
                          background: on ? 'rgba(245,166,35,0.15)' : t.chipBg,
                          border: on ? '1px solid #F5A623' : `1px solid ${t.chipBorder}`,
                          fontFamily: 'Pretendard, sans-serif',
                          fontWeight: on ? 500 : 400,
                          fontSize: '13px',
                          color: on ? '#F5A623' : t.chipText,
                          transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                        }}
                      >
                        {vibe}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Terms — 전체 행 클릭으로 동의 토글 */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setAgreed(v => !v)}
                onKeyDown={e => e.key === ' ' && setAgreed(v => !v)}
                style={{
                  marginTop: '28px', display: 'flex', alignItems: 'flex-start',
                  gap: '10px', cursor: 'pointer', userSelect: 'none',
                }}
              >
                <div style={{
                  width: '18px', height: '18px', minWidth: '18px',
                  borderRadius: '4px',
                  background: agreed ? '#F5A623' : t.checkboxBg,
                  border: agreed ? '1px solid #F5A623' : `1px solid ${t.checkboxBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '2px', flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}>
                  {agreed && <CheckIcon size={11} color="#000000"/>}
                </div>
                <p style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 400, fontSize: '13px',
                  color: t.termsText, lineHeight: 1.6,
                  transition: 'color 0.3s ease',
                }}>
                  서비스 이용약관 및 개인정보처리방침에 동의합니다{' '}
                  <a
                    href="#"
                    onClick={e => e.stopPropagation()}
                    style={{ color: '#F5A623', textDecoration: 'underline' }}
                  >
                    내용 보기
                  </a>
                </p>
              </div>

              {/* CTA */}
              <button
                type="submit"
                className="su-cta"
                disabled={!canSubmit}
                style={{
                  width: '100%', height: '52px',
                  marginTop: '28px', borderRadius: '12px', border: 'none',
                  background: canSubmit
                    ? 'linear-gradient(135deg, #F5A623 0%, #E8954A 100%)'
                    : t.ctaDisabledBg,
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 700, fontSize: '16px',
                  color: canSubmit ? '#000000' : t.ctaDisabledText,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  boxShadow: canSubmit ? '0 4px 20px rgba(245,166,35,0.35)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                회원가입
              </button>

              {/* Login link */}
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: '5px', marginTop: '20px', marginBottom: '8px',
              }}>
                <span style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 400, fontSize: '13px',
                  color: t.loginText, transition: 'color 0.3s ease',
                }}>
                  이미 계정이 있으신가요?
                </span>
                <a href="/login" className="su-login-link" style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 600, fontSize: '13px',
                  color: '#F5A623', textDecoration: 'none',
                }}>
                  로그인
                </a>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  )
}
