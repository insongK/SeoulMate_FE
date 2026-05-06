export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
      background: '#0A0A0F',
      fontFamily: 'Pretendard, sans-serif',
      gap: '12px',
    }}>
      <span style={{
        fontWeight: 900, fontSize: '6rem', lineHeight: 1,
        background: 'linear-gradient(135deg, #FF6B6B 0%, #C850C0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>404</span>
      <p style={{ fontSize: '1rem', color: '#8888AA', marginTop: '4px' }}>페이지를 찾을 수 없습니다.</p>
      <a
        href="/"
        style={{
          marginTop: '20px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '12px 28px',
          background: 'linear-gradient(135deg, #FF6B6B, #C850C0)',
          borderRadius: '12px',
          fontWeight: 600, fontSize: '0.9rem',
          color: '#FFFFFF',
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(255,107,107,0.35)',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        홈으로 돌아가기
      </a>
    </div>
  )
}
