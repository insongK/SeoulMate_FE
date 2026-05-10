'use client'

import { useRouter } from 'next/navigation'

export default function ProfileEditPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--fg)',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    }}>
      <p style={{ color: 'var(--fg-2)', fontSize: 16 }}>프로필 편집 기능이 곧 추가돼요.</p>
      <button
        onClick={() => router.back()}
        style={{
          padding: '10px 28px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--fg)',
          fontSize: 14, fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        돌아가기
      </button>
    </div>
  )
}
