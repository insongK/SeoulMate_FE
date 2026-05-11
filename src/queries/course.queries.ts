import type { Course, Weather } from '@/types/course.types'
import { apiFetch } from '@/lib/api'
import { formatDuration } from '@/utils/format'

const COURSE_BASE = 'https://api.seoulmate.my/api/courses'

/* ── Request / Response types ─────────────────────────────────── */

export interface RecommendParams {
  region: string
  budget: number
  duration: string  // "2h" | "half-day" | "full-day"
  vibes: string[]
  query?: string
  purpose?: string
  dateTime?: string // ISO 8601
}

interface ApiPlaceSummary {
  id: string
  name: string
  lat: number
  lng: number
  order: number
}

interface ApiPlaceDetail extends ApiPlaceSummary {
  stayDuration?: number
  priceMin?: number
  priceMax?: number
  reason?: string
}

interface ApiCourse {
  id: string
  title: string
  description: string
  totalCost: number
  duration: number     // minutes
  congestion: string   // "low" | "medium" | "high" | "unknown"
  weather?: Weather
  places: ApiPlaceSummary[]
  isRecommended?: boolean
  recommendationRank?: number
  recommendationType?: string
}

interface ApiCourseDetail {
  id: string
  title: string
  description: string
  totalCost: number
  duration: number
  congestion: string
  weather?: Weather
  places: ApiPlaceDetail[]
}

interface ApiRecommendResponse {
  recommendedCourseId?: string
  courses: ApiCourse[]
  warnings?: string[]
}

interface ApiListResponse {
  data: ApiCourse[]
  total: number
  page: number
  page_size: number
}

export interface RecommendResult {
  recommendedCourseId?: string
  courses: Course[]
  warnings?: string[]
}

export interface CourseListResult {
  courses: Course[]
  total: number
  page: number
  pageSize: number
}

/* ── Mapper ───────────────────────────────────────────────────── */

function mapCongestion(raw: string): Course['congestion'] {
  if (raw === 'low' || raw === 'medium' || raw === 'high') return raw
  return 'unknown'
}

function mapApiCourse(raw: ApiCourse, isSaved = false): Course {
  return {
    id:                 raw.id,
    title:              raw.title,
    description:        raw.description ?? '',
    places:             raw.places.map(p => ({
      id:    p.id,
      name:  p.name,
      lat:   p.lat,
      lng:   p.lng,
      order: p.order,
    })),
    totalDuration:      formatDuration(raw.duration),
    durationMinutes:    raw.duration,
    totalBudget:        raw.totalCost,
    totalCost:          raw.totalCost,
    userBudget:         raw.totalCost,
    vibes:              [],
    region:             '',
    transportation:     'mixed',
    isSaved,
    congestion:         mapCongestion(raw.congestion),
    weather:            raw.weather,
    isRecommended:      raw.isRecommended,
    recommendationRank: raw.recommendationRank,
    recommendationType: raw.recommendationType as Course['recommendationType'],
  }
}

function mapApiCourseDetail(raw: ApiCourseDetail): Course {
  return {
    id:              raw.id,
    title:           raw.title,
    description:     raw.description ?? '',
    places:          raw.places.map(p => ({
      id:          p.id,
      name:        p.name,
      lat:         p.lat,
      lng:         p.lng,
      order:       p.order,
      duration:    p.stayDuration,
      cost:        p.priceMin != null && p.priceMax != null
                     ? Math.round((p.priceMin + p.priceMax) / 2)
                     : undefined,
      reason:      p.reason,
    })),
    totalDuration:   formatDuration(raw.duration),
    durationMinutes: raw.duration,
    totalBudget:     raw.totalCost,
    totalCost:       raw.totalCost,
    userBudget:      raw.totalCost,
    vibes:           [],
    region:          '',
    transportation:  'mixed',
    isSaved:         false,
    congestion:      mapCongestion(raw.congestion),
    weather:         raw.weather,
  }
}

/* ── API helpers ──────────────────────────────────────────────── */

function numericId(id: string): string {
  return id.startsWith('crs_') ? id.slice(4) : id
}

async function throwOnError(res: Response): Promise<void> {
  if (res.ok) return
  const body = await res.json().catch(() => ({ message: undefined }))
  const msg = body?.message
  if (res.status === 401) throw new Error('로그인이 필요해요.')
  if (res.status === 404) throw new Error('코스를 찾을 수 없어요.')
  throw new Error(msg ?? '요청에 실패했어요.')
}

/* ── API calls ────────────────────────────────────────────────── */

export async function recommendCourses(params: RecommendParams): Promise<RecommendResult> {
  const res = await apiFetch(`${COURSE_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  await throwOnError(res)

  const json: ApiRecommendResponse = await res.json()
  return {
    recommendedCourseId: json.recommendedCourseId,
    courses:             json.courses.map(c => mapApiCourse(c)),
    warnings:            json.warnings,
  }
}

export async function getCourse(id: string): Promise<Course> {
  const res = await apiFetch(`${COURSE_BASE}/${id}`)
  await throwOnError(res)

  const json: ApiCourseDetail = await res.json()
  return mapApiCourseDetail(json)
}

export async function getMyCourses(page = 1, pageSize = 10): Promise<CourseListResult> {
  const res = await apiFetch(`${COURSE_BASE}/?page=${page}&page_size=${pageSize}`)
  await throwOnError(res)

  const json: ApiListResponse = await res.json()
  return {
    courses:  json.data.map(c => mapApiCourse(c)),
    total:    json.total,
    page:     json.page,
    pageSize: json.page_size,
  }
}

export async function getSavedCourses(page = 1, pageSize = 10): Promise<CourseListResult> {
  const res = await apiFetch(`${COURSE_BASE}/saved?page=${page}&page_size=${pageSize}`)
  await throwOnError(res)

  const json: ApiListResponse = await res.json()
  return {
    courses:  json.data.map(c => mapApiCourse(c, true)),
    total:    json.total,
    page:     json.page,
    pageSize: json.page_size,
  }
}

export async function saveCourse(id: string, notes?: string): Promise<void> {
  const res = await apiFetch(`${COURSE_BASE}/${numericId(id)}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notes ? { notes } : {}),
  })
  if (res.status === 409) return  // 이미 저장됨 → 성공으로 처리
  await throwOnError(res)
}

export async function unsaveCourse(id: string): Promise<void> {
  const res = await apiFetch(`${COURSE_BASE}/${numericId(id)}/save`, { method: 'DELETE' })
  if (res.status === 404 || res.status === 204) return
  await throwOnError(res)
}

export async function toggleSaveCourse(id: string, save: boolean): Promise<void> {
  return save ? saveCourse(id) : unsaveCourse(id)
}
