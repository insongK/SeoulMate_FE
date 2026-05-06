export default function HomePage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0A0A0F',
      fontFamily: 'Pretendard, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontWeight: 900,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 30%, #C850C0 70%, #4158D0 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
        }}>
          SeoulMate
        </h1>
        <p style={{ color: '#8888AA', fontSize: '1rem' }}>서울의 모든 순간이 특별해지는 곳</p>
      </div>
    </div>
  )
}
