import type { Course } from '@/types/course.types'
import { DUMMY_COURSES } from '@/data/dummy-courses'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''
const USE_DUMMY = !BASE

/* ── Auth ─────────────────────────────────────────────────────── */
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('seoulmate-token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/* ── Duration formatter ───────────────────────────────────────── */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

/* ── Request / Response types ─────────────────────────────────── */
export interface RecommendParams {
  vibes: string[]
  region: string
  budget: number
  duration: string  // "2h" | "half-day" | "full-day"
  purpose?: string
  query?: string
}

interface ApiPlace {
  id: string
  name: string
  lat: number
  lng: number
  order: number
}

interface ApiCourse {
  id: string
  title: string
  totalCost: number
  duration: number     // minutes
  congestion: string
  places: ApiPlace[]
}

interface ApiRecommendResponse {
  courses: ApiCourse[]
}

export interface RecommendResult {
  courses: Course[]
}

/* ── Mapper ───────────────────────────────────────────────────── */
function mapApiCourse(raw: ApiCourse): Course {
  return {
    id:              raw.id,
    title:           raw.title,
    description:     '',
    places:          raw.places.map(p => ({
      id:    p.id,
      name:  p.name,
      lat:   p.lat,
      lng:   p.lng,
      order: p.order,
    })),
    totalDuration:   formatDuration(raw.duration),
    durationMinutes: raw.duration,
    totalBudget:     raw.totalCost,
    vibes:           [],
    region:          '',
    transportation:  'mixed',
    isSaved:         false,
    congestion:      raw.congestion as Course['congestion'],
  }
}

/* ── API calls ────────────────────────────────────────────────── */
export async function recommendCourses(params: RecommendParams): Promise<RecommendResult> {
  if (USE_DUMMY) {
    await new Promise(r => setTimeout(r, 600))
    return { courses: DUMMY_COURSES }
  }

  const res = await fetch(`${BASE}/courses/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('로그인이 필요해요.')
    if (res.status === 400) throw new Error('요청 파라미터를 확인해주세요.')
    throw new Error('AI 추천에 실패했어요. 잠시 후 다시 시도해주세요.')
  }

  const json: ApiRecommendResponse = await res.json()
  return { courses: json.courses.map(mapApiCourse) }
}

export async function toggleSaveCourse(id: string, save: boolean): Promise<void> {
  if (USE_DUMMY) return

  const res = await fetch(`${BASE}/courses/${id}/${save ? 'save' : 'unsave'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  })
  if (!res.ok) throw new Error('저장 처리에 실패했어요.')
}
