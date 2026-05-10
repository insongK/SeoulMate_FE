import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증 없이 접근 가능한 경로
const PUBLIC_PREFIXES = ['/login', '/signup', '/auth']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 공개 경로는 통과
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('seoulmate-token')?.value

  if (!token) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    // 로그인 후 원래 페이지로 돌아올 수 있도록 redirect 파라미터 보존
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // 정적 파일, 이미지 최적화, favicon은 제외
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
