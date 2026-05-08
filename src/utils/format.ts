export function formatKRW(n: number): string {
  return `₩${n.toLocaleString('ko-KR')}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m}분`
  if (!m) return `${h}시간`
  return `${h}시간 ${m}분`
}
