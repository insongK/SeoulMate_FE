'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
      background: '#0A0A0F',
      fontFamily: 'Pretendard, sans-serif',
      gap: '16px',
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'rgba(255,107,107,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.75rem',
      }}>
        ⚠️
      </div>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#F0F0F5' }}>
        오류가 발생했습니다
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#8888AA', maxWidth: '280px', textAlign: 'center' }}>
        {error.message || '일시적인 오류입니다. 잠시 후 다시 시도해주세요.'}
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: '8px',
          padding: '12px 28px',
          background: 'linear-gradient(135deg, #FF6B6B, #C850C0)',
          border: 'none', borderRadius: '12px',
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 600, fontSize: '0.9rem',
          color: '#FFFFFF', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255,107,107,0.35)',
        }}
      >
        다시 시도
      </button>
    </div>
  )
}
