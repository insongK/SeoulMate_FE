export type Congestion = 'low' | 'medium' | 'high' | 'unknown'
export type CongestionLevel = Congestion
export type SortType = 'recommended' | 'budget' | 'congestion'
export type TransportType = 'walk' | 'transit' | 'mixed'
export type PlaceType = '카페' | '식당' | '전시' | '야외' | '쇼핑'

export interface Weather {
  source: string
  skyStatus: string
  temperature: number
  rainProbability: number
  weatherAlert: string | null
}

export interface Place {
  id: string
  order: number
  name: string
  category?: string
  lat: number
  lng: number
  description?: string
  reason?: string
  duration?: number
  estimatedTime?: number
  cost?: number
  congestion?: Congestion
  imageUrl?: string
}

export interface Course {
  id: string
  title: string
  description: string
  places: Place[]
  totalDuration: string   // formatted: "4시간", "2시간 30분"
  durationMinutes: number // raw minutes from API
  totalBudget: number     // mapped from API totalCost
  totalCost: number
  userBudget: number
  vibes: string[]
  region: string
  transportation: TransportType
  isSaved: boolean
  thumbnail?: string
  congestion: CongestionLevel
  weather?: Weather
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
