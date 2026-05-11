import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SeoulMate — 서울의 모든 순간이 특별해지는 곳',
  description: 'AI 코스 추천 · 실시간 혼잡도 · 맞춤 필터링. 서울에서 가장 특별한 순간들을 SeoulMate와 함께하세요.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('seoulmate-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
