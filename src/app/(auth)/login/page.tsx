'use client'

import { useState } from 'react'
import styles from './login.module.css'

/* ── Icons ─────────────────────────────────────────────────── */

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
        stroke="#8888AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="#8888AA" strokeWidth="1.5"/>
      {!open && <line x1="3" y1="3" x2="21" y2="21" stroke="#8888AA" strokeWidth="1.5" strokeLinecap="round"/>}
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.79 2.72v2.26h2.91C16.66 14.25 17.64 11.95 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
      <path d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9.01 9.01 0 000 9c0 1.45.35 2.82.96 4.04l3-2.33z" fill="#FBBC05"/>
      <path d="M9 3.58c1.32 0 2.51.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M10 0C4.477 0 0 3.42 0 7.64c0 2.707 1.714 5.093 4.286 6.493L3.143 17.733c-.086.267.228.467.457.293L7.714 15.2c.743.147 1.515.227 2.286.227C15.523 15.427 20 12.007 20 7.713 20 3.42 15.523 0 10 0z"
        fill="#191919"/>
    </svg>
  )
}

/* ── Data ───────────────────────────────────────────────────── */

const FEATURE_BADGES = [
  { icon: '✦', label: 'AI 코스 추천' },
  { icon: '◎', label: '실시간 혼잡도' },
  { icon: '⊹', label: '맞춤 필터링' },
]

const PARTICLES = [
  { top: '12%', left: '8%',  size: 3, delay: '0s',    dur: '7s',   color: '#FF6B6B' },
  { top: '22%', left: '72%', size: 2, delay: '1.2s',  dur: '9s',   color: '#C850C0' },
  { top: '55%', left: '88%', size: 4, delay: '2.1s',  dur: '6.5s', color: '#4158D0' },
  { top: '78%', left: '18%', size: 2, delay: '0.6s',  dur: '8.5s', color: '#FF8E53' },
  { top: '38%', left: '52%', size: 3, delay: '1.8s',  dur: '7.5s', color: '#C850C0' },
  { top: '82%', left: '62%', size: 2, delay: '3.2s',  dur: '8s',   color: '#FF6B6B' },
  { top: '8%',  left: '42%', size: 2, delay: '2.8s',  dur: '6s',   color: '#4158D0' },
  { top: '65%', left: '35%', size: 3, delay: '0.4s',  dur: '9.5s', color: '#FFD93D' },
]

/* ── Component ─────────────────────────────────────────────── */

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail]   = useState('')
  const [pw, setPw]         = useState('')
  const [emailFocus, setEmailFocus] = useState(false)
  const [pwFocus, setPwFocus]       = useState(false)

  const handleSubmit = (e: React.FormEvent) => e.preventDefault()

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
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .anim-logo   { animation: fadeUp .6s .1s  cubic-bezier(.16,1,.3,1) both; }
        .anim-title  { animation: fadeUp .6s .22s cubic-bezier(.16,1,.3,1) both; }
        .anim-form   { animation: fadeUp .6s .34s cubic-bezier(.16,1,.3,1) both; }

        @media (prefers-reduced-motion: reduce) {
          .anim-logo, .anim-title, .anim-form { animation: none !important; }
        }

        .login-cta:hover  { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(255,107,107,.55) !important; }
        .login-cta:active { transform: translateY(0); }
        .login-cta { transition: all .4s cubic-bezier(.34,1.56,.64,1); }

        .kakao-btn:hover  { filter: brightness(.95); transform: translateY(-1px); }
        .kakao-btn:active { transform: translateY(0); }
        .kakao-btn { transition: all .35s cubic-bezier(.16,1,.3,1); }

        .google-btn:hover  { background: rgba(255,255,255,.1) !important; transform: translateY(-1px); }
        .google-btn:active { transform: translateY(0); }
        .google-btn { transition: all .35s cubic-bezier(.16,1,.3,1); }

        .badge:hover { background: rgba(255,255,255,.13) !important; transform: translateY(-2px); }
        .badge { transition: all .35s cubic-bezier(.16,1,.3,1); }

        .eye-btn { transition: opacity .2s; }
        .eye-btn:hover { opacity: .75; }

        .forgot:hover { opacity: 1 !important; }
        .forgot { transition: opacity .2s; }

        .signup-link { transition: opacity .2s; }
        .signup-link:hover { opacity: .8; }

        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* ── Root wrapper ── */}
      <div
        className={styles.wrapper}
        style={{
          minHeight: '100vh',
          display: 'flex',
          background: '#0A0A0F',
          overflowX: 'hidden', /* x-only so mobile can scroll vertically */
        }}
      >

        {/* ═══ LEFT PANEL — Immersive Hero ═══ */}
        <div
          className={styles.leftPanel}
          style={{
            flex: '0 0 60%',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px 72px',
          }}
        >
          {/* Seoul night background */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('/seoul-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            zIndex: 0,
          }}/>

          {/* Dark overlay — left-heavy for text legibility */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,15,.94) 0%, rgba(10,10,15,.55) 65%, rgba(10,10,15,.2) 100%)',
            zIndex: 1,
          }}/>

          {/* Bottom gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,10,15,.9) 0%, transparent 55%)',
            zIndex: 1,
          }}/>

          {/* Noise grain */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.028,
            zIndex: 2,
            pointerEvents: 'none',
          }}/>

          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: p.top, left: p.left,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: p.color,
              animation: `fp ${p.dur} ${p.delay} ease-in-out infinite`,
              zIndex: 2,
            }}/>
          ))}

          {/* Decorative Seoul map grid */}
          <svg
            className={styles.mapGrid}
            style={{
              position: 'absolute', bottom: '-20px', right: '-30px',
              opacity: 0.055, zIndex: 2, pointerEvents: 'none',
            }}
            width="260" height="260" viewBox="0 0 260 260"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <g key={i}>
                <line x1={i * 24} y1="0" x2={i * 24} y2="260" stroke="#C850C0" strokeWidth="0.8"/>
                <line x1="0" y1={i * 24} x2="260" y2={i * 24} stroke="#C850C0" strokeWidth="0.8"/>
              </g>
            ))}
            <circle cx="130" cy="130" r="70"  stroke="#FF6B6B" strokeWidth="0.8" fill="none"/>
            <circle cx="130" cy="130" r="105" stroke="#4158D0" strokeWidth="0.5" fill="none"/>
          </svg>

          {/* ── Brand content block ── */}
          <div
            className={styles.brandBlock}
            style={{ position: 'relative', zIndex: 3, maxWidth: '540px' }}
          >
            {/* Brand name with shimmer */}
            <h1
              className={styles.brandHeading}
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(3.75rem, 6.5vw, 5.75rem)',
                lineHeight: 1.02,
                letterSpacing: '-2.5px',
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 30%, #C850C0 70%, #4158D0 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s infinite linear',
                marginBottom: '14px',
              }}
            >
              SeoulMate
            </h1>

            {/* Tagline */}
            <p
              className={styles.tagline}
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 400,
                fontSize: '1.1rem',
                lineHeight: 1.65,
                letterSpacing: '0.05em',
                color: 'rgba(240,240,245,0.65)',
                marginBottom: '36px',
              }}
            >
              서울의 모든 순간이 특별해지는 곳
            </p>

            {/* Feature badges */}
            <div
              className={styles.badges}
              style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
            >
              {FEATURE_BADGES.map(({ icon, label }) => (
                <div
                  key={label}
                  className="badge"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 20px',
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: '9999px',
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.72rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(240,240,245,0.88)',
                    whiteSpace: 'nowrap',
                    cursor: 'default',
                  }}
                >
                  <span style={{ color: '#FF6B6B', fontSize: '0.9rem', lineHeight: 1 }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL — Login Form ═══ */}
        <div
          className={styles.rightPanel}
          style={{
            flex: '0 0 40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 48px',
            background: '#0A0A0F',
            position: 'relative',
            zIndex: 10,
            borderLeft: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {/* Ambient glows (desktop only) */}
          <div
            className={styles.ambientGlow}
            style={{
              position: 'absolute', top: '15%', right: '-100px',
              width: '320px', height: '320px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200,80,192,0.09) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            className={styles.ambientGlow}
            style={{
              position: 'absolute', bottom: '18%', left: '-60px',
              width: '240px', height: '240px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,107,107,0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Form container */}
          <div
            className={styles.formContainer}
            style={{ width: '100%', maxWidth: '390px', position: 'relative' }}
          >

            {/* ── Logo ── */}
            <div
              className={`${styles.logoArea} anim-logo`}
              style={{ marginBottom: '44px' }}
            >
              <span
                className={styles.logoText}
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #FF6B6B, #C850C0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                SeoulMate
              </span>
            </div>

            {/* ── Greeting ── */}
            <div
              className={`${styles.greetingBlock} anim-title`}
              style={{ marginBottom: '36px' }}
            >
              <h2
                className={styles.greetingTitle}
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.875rem',
                  lineHeight: 1.2,
                  color: '#F0F0F5',
                  marginBottom: '10px',
                }}
              >
                다시 만나서 반가워요 👋
              </h2>
              <p style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 400,
                fontSize: '0.875rem',
                lineHeight: 1.65,
                color: '#8888AA',
              }}>
                서울에서 가장 특별한 순간들이 기다리고 있어요
              </p>
            </div>

            {/* ── Form ── */}
            <form
              className={`${styles.form} anim-form`}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <label
                  className={styles.label}
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.775rem',
                    letterSpacing: '0.05em',
                    color: '#8888AA',
                  }}
                >
                  이메일
                </label>
                <input
                  className={styles.emailInput}
                  type="email"
                  autoComplete="email"
                  placeholder="hello@seoulmate.kr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 18px',
                    background: emailFocus ? 'rgba(255,107,107,0.07)' : 'rgba(255,255,255,0.05)',
                    border: emailFocus ? '1.5px solid #FF6B6B' : '1.5px solid rgba(255,255,255,0.09)',
                    borderRadius: '14px',
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 400,
                    fontSize: '0.95rem',
                    color: '#F0F0F5',
                    outline: 'none',
                    boxShadow: emailFocus ? '0 0 0 4px rgba(255,107,107,0.13)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <label
                  className={styles.label}
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.775rem',
                    letterSpacing: '0.05em',
                    color: '#8888AA',
                  }}
                >
                  비밀번호
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className={styles.pwInput}
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    onFocus={() => setPwFocus(true)}
                    onBlur={() => setPwFocus(false)}
                    style={{
                      width: '100%',
                      height: '52px',
                      padding: '0 52px 0 18px',
                      background: pwFocus ? 'rgba(255,107,107,0.07)' : 'rgba(255,255,255,0.05)',
                      border: pwFocus ? '1.5px solid #FF6B6B' : '1.5px solid rgba(255,255,255,0.09)',
                      borderRadius: '14px',
                      fontFamily: 'Pretendard, sans-serif',
                      fontWeight: 400,
                      fontSize: '0.95rem',
                      color: '#F0F0F5',
                      outline: 'none',
                      boxShadow: pwFocus ? '0 0 0 4px rgba(255,107,107,0.13)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                  <button
                    type="button"
                    className={`${styles.eyeBtn} eye-btn`}
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', padding: '4px',
                      minHeight: '44px', minWidth: '44px', justifyContent: 'center',
                    }}
                  >
                    <EyeIcon open={showPw}/>
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-2px' }}>
                <a
                  href="#"
                  className={`${styles.forgotLink} forgot`}
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 400,
                    fontSize: '0.8rem',
                    color: '#FF6B6B',
                    textDecoration: 'none',
                    opacity: 0.75,
                  }}
                >
                  비밀번호를 잊으셨나요?
                </a>
              </div>

              {/* ── Login CTA ── */}
              <button
                type="submit"
                className={`${styles.loginCta} login-cta`}
                style={{
                  width: '100%',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #C850C0 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '0.03em',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(255,107,107,0.42)',
                  marginTop: '4px',
                }}
              >
                로그인
              </button>

              {/* OR Divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                margin: '2px 0',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }}/>
                <span style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 400,
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em',
                  color: '#44445A',
                  whiteSpace: 'nowrap',
                }}>
                  또는
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }}/>
              </div>

              {/* ── Social Buttons ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Kakao */}
                <button
                  type="button"
                  className={`${styles.kakaoBtn} kakao-btn`}
                  style={{
                    width: '100%', height: '52px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    background: '#FEE500',
                    border: 'none',
                    borderRadius: '14px',
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 600, fontSize: '0.95rem',
                    color: '#191919',
                    cursor: 'pointer',
                  }}
                >
                  <KakaoIcon/>
                  카카오로 계속하기
                </button>

                {/* Google */}
                <button
                  type="button"
                  className={`${styles.googleBtn} google-btn`}
                  style={{
                    width: '100%', height: '52px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.11)',
                    borderRadius: '14px',
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 500, fontSize: '0.95rem',
                    color: '#F0F0F5',
                    cursor: 'pointer',
                  }}
                >
                  <GoogleIcon/>
                  Google로 계속하기
                </button>
              </div>

              {/* Sign-up link */}
              <div
                className={styles.signupRow}
                style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
                  paddingTop: '14px',
                }}
              >
                <span style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 400, fontSize: '0.875rem',
                  color: '#8888AA',
                }}>
                  계정이 없으신가요?
                </span>
                <a
                  href="/signup"
                  className="signup-link"
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 600, fontSize: '0.875rem',
                    background: 'linear-gradient(135deg, #FF6B6B, #C850C0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textDecoration: 'none',
                  }}
                >
                  회원가입
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
