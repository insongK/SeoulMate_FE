export type Congestion = 'low' | 'medium' | 'high'
export type SortType = 'recommended' | 'budget' | 'congestion'
export type TransportType = 'walk' | 'transit' | 'mixed'
export type PlaceType = '카페' | '식당' | '전시' | '야외' | '쇼핑'
export type CongestionLevel = 'low' | 'mid' | 'high'

export interface Place {
  id: string
  order: number
  name: string
  category: string
  description: string
  reason: string
  duration: number
  cost: number
  congestion: Congestion
  lat: number
  lng: number
  imageUrl?: string
}

export interface Course {
  id: string
  title: string
  description: string
  places: CoursePlace[]
  totalDuration: string   // formatted: "4시간", "2시간 30분"
  durationMinutes: number // raw minutes from API
  /*중복 부분 */
  totalBudget: number     // mapped from API totalCost
  totalCost: number
  userBudget: number
  /* 중복 부분 */
  vibes: string[]
  region: string
  transportation: TransportType
  isSaved: boolean
  thumbnail?: string
  congestion: CongestionLevel
}

export interface CoursePlace {
  id: string
  name: string
  lat: number
  lng: number
  order: number
  category?: string
  estimatedTime?: number
}

export interface FilterState {
  sort: SortType
  placeTypes: PlaceType[]
  transportation: TransportType
}

export const DEFAULT_FILTER: FilterState = {
  sort: 'recommended',
  placeTypes: [],
  transportation: 'mixed',
}
